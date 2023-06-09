# 
# 一、释放锁的核心代码
```java
String getReadWriteTimeoutNamePrefix(long threadId) {
    return suffixName(this.getName(), this.getLockName(threadId)) + ":rwlock_timeout";
}

protected String getKeyPrefix(long threadId, String timeoutPrefix) {
    return timeoutPrefix.split(":" + this.getLockName(threadId))[0];
}

@Override
protected RFuture<Boolean> unlockInnerAsync(long threadId) {
    String timeoutPrefix = getReadWriteTimeoutNamePrefix(threadId);
    String keyPrefix = getKeyPrefix(threadId, timeoutPrefix);
    return commandExecutor.evalWriteAsync(getName(), LongCodec.INSTANCE, RedisCommands.EVAL_BOOLEAN,
        "local mode = redis.call('hget', KEYS[1], 'mode'); " +
        "if (mode == false) then " +
            "redis.call('publish', KEYS[2], ARGV[1]); " +
            "return 1; " +
        "end; " +
        "local lockExists = redis.call('hexists', KEYS[1], ARGV[2]); " +
        "if (lockExists == 0) then " +
            "return nil;" +
        "end; " +
        "local counter = redis.call('hincrby', KEYS[1], ARGV[2], -1); " + 
        "if (counter == 0) then " +
            "redis.call('hdel', KEYS[1], ARGV[2]); " + 
        "end;" +	
        "redis.call('del', KEYS[3] .. ':' .. (counter+1)); " +
        "if (redis.call('hlen', KEYS[1]) > 1) then " +
            "local maxRemainTime = -3; " + 
            "local keys = redis.call('hkeys', KEYS[1]); " + 
            "for n, key in ipairs(keys) do " + 
                "counter = tonumber(redis.call('hget', KEYS[1], key)); " + 
                "if type(counter) == 'number' then " + 
                    "for i=counter, 1, -1 do " + 
                        "local remainTime = redis.call('pttl', KEYS[4] .. ':' .. key .. ':rwlock_timeout:' .. i); " + 
                        "maxRemainTime = math.max(remainTime, maxRemainTime);" + 
                    "end; " + 
                "end; " + 
            "end; " +
            "if maxRemainTime > 0 then " +
                "redis.call('pexpire', KEYS[1], maxRemainTime); " +
                "return 0; " +
            "end;" + 
            "if mode == 'write' then " + 
                "return 0;" + 
            "end; " +
        "end; " +
        "redis.call('del', KEYS[1]); " +
        "redis.call('publish', KEYS[2], ARGV[1]); " +
        "return 1; ",
        Arrays.<Object>asList(getName(), getChannelName(), timeoutPrefix, keyPrefix), 
        LockPubSub.unlockMessage, getLockName(threadId));
}
```

# 二、不同客户端加了读锁 / 同一个客户端/线程多次可重入加了读锁怎么释放？
```java
anyLock: {
   "mode ":  "read ",
   "UUID_01:threadId_01 ": 2,
   "UUID_02:threadId_02 ": 1
}
	
{anyLock}:UUID_01:threadId_01:rwlock_timeout:1		1
{anyLock}:UUID_01:threadId_01:rwlock_timeout:2		1
{anyLock}:UUID_02:threadId_02:rwlock_timeout:1		1
```
分析我们的客户端A（UUID_01:threadId_01）在此次解锁的参数说明
```java
KEYS[1] = anyLock
KEYS[2] = redisson_rwlock:{anyLock}
KEYS[3] = {anyLock}:UUID_01:threadId_01:rwlock_timeout
KEYS[4] = {anyLock}

ARGV[1] = 0
ARGV[2] = UUID_01:threadId_01
```
此时开始我们分析解锁Lua脚本逻辑
```java
"local mode = redis.call('hget', KEYS[1], 'mode'); " +
"if (mode == false) then " +
    "redis.call('publish', KEYS[2], ARGV[1]); " +
    "return 1; " +
"end; " +
"local lockExists = redis.call('hexists', KEYS[1], ARGV[2]); " +
"if (lockExists == 0) then " +
    "return nil;" +
"end; " +
```
hget anyLock mode，mode = read 通过hget
hexists anyLock UUID_01:threadId_01，肯定是存在的，因为这个客户端A加过读锁
```java
"local counter = redis.call('hincrby', KEYS[1], ARGV[2], -1); " + 
"if (counter == 0) then " +
    "redis.call('hdel', KEYS[1], ARGV[2]); " + 
"end;" +	
"redis.call('del', KEYS[3] .. ':' .. (counter+1)); " +
```
hincrby anyLock UUID_01:threadId_01 -1，将这个客户端对应的加锁次数递减1，现在就是变成1，counter = 1
del {anyLock}:UUID_01:threadId_01:rwlock_timeout:2，删除了一个timeout key。此时再看看Redis里的数据结构
```java
anyLock: {
  "mode": "read",
  "UUID_01:threadId_01": 1,
  "UUID_02:threadId_02": 1
}
{anyLock}:UUID_01:threadId_01:rwlock_timeout:1		1
{anyLock}:UUID_02:threadId_02:rwlock_timeout:1		1
```
```java
"if (redis.call('hlen', KEYS[1]) > 1) then " +
    "local maxRemainTime = -3; " + 
    "local keys = redis.call('hkeys', KEYS[1]); " + 
    "for n, key in ipairs(keys) do " + 
        "counter = tonumber(redis.call('hget', KEYS[1], key)); " + 
        "if type(counter) == 'number' then " + 
            "for i=counter, 1, -1 do " + 
                "local remainTime = redis.call('pttl', KEYS[4] .. ':' .. key .. ':rwlock_timeout:' .. i); " + 
                "maxRemainTime = math.max(remainTime, maxRemainTime);" + 
            "end; " + 
        "end; " + 
    "end; " +
    "if maxRemainTime > 0 then " +
        "redis.call('pexpire', KEYS[1], maxRemainTime); " +
        "return 0; " +
    "end;" + 
    "if mode == 'write' then " + 
        "return 0;" + 
    "end; " +
"end; " +
```
hlen anyLock > 1，就是判断hash里面的元素超过1个，紧接着就是for循环去找到最大的剩余时间

pttl {anyLock}:UUID_01:threadId_01:rwlock_timeout:1，此时获取那个timeout key的剩余生存时间还有多少毫秒，比如说此时这个key的剩余生存时间是20000毫秒
```java
"if maxRemainTime > 0 then " +
    "redis.call('pexpire', KEYS[1], maxRemainTime); " +
    "return 0; " +
"end;" + 
"if mode == 'write' then " + 
    "return 0;" + 
"end; " +
```
其实是获取到了所有的timeout key的最大的一个剩余生存时间，假设最大的剩余生存时间是25000毫秒，pexpire anyLock 25000，结束

此时若是客户端A再来释放一次读锁，那么按照刚刚lua脚本进行处理
```java
"local counter = redis.call('hincrby', KEYS[1], ARGV[2], -1); " + 
"if (counter == 0) then " +
    "redis.call('hdel', KEYS[1], ARGV[2]); " + 
"end;" +	
"redis.call('del', KEYS[3] .. ':' .. (counter+1)); " +
```
hincrby anyLock UUID_01:threadId_01，将这个客户端对应的加锁次数递减1，现在就是变成0，counter = 0
hdel anyLock UUID_01:threadId_01，此时就是从hash数据结构中删除客户端A这个加锁的记录
del {anyLock}:UUID_01:threadId_01:rwlock_timeout:1，删除了一个timeout key。此时再看看Redis里的数据结构
```java
anyLock: {
  "mode": "read",
  "UUID_02:threadId_02": 1
}

{anyLock}:UUID_02:threadId_02:rwlock_timeout:1		1

```

此时客户端B来释放一次读锁
```java
"local mode = redis.call('hget', KEYS[1], 'mode'); " +
"if (mode == false) then " +
    "redis.call('publish', KEYS[2], ARGV[1]); " +
    "return 1; " +
"end; " +
"local lockExists = redis.call('hexists', KEYS[1], ARGV[2]); " +
"if (lockExists == 0) then " +
    "return nil;" +
"end; " +
```
hincrby anyLock UUID_02:threadId_02 -1，将这个客户端对应的加锁次数递减1，现在就是变成1，counter = 0
hdel anyLock UUID_02:threadId_02，此时就是从hash数据结构中删除客户端A这个加锁的记录
del {anyLock}:UUID_02:threadId_02:rwlock_timeout:1，删除了一个timeout key
```java
anyLock: {
  "mode": "read"
}
```
此时hlen anyLock = 1，再来一个往下走的时候就会if (redis.call('hlen', KEYS[1]) > 1) then不满足，进入到del 和publish
del anyLock，当没有人再持有这个锁的读锁的时候，此时会识别出来，就会彻底删除这个读锁
# 三、同一个客户端/线程先加写锁再加读锁怎么释放？
```java
anyLock: {
  "mode": "write",
  "UUID_01:threadId_01:write": 1,
  "UUID_01:threadId_01": 1
}

{anyLock}:UUID_01:threadId_01:rwlock_timeout:1	
```
若是同一个客户端进行释放锁的话，那就很好理解了，按照我们之前的lua脚本进行操作
```java
"local mode = redis.call('hget', KEYS[1], 'mode'); " +
"if (mode == false) then " +
    "redis.call('publish', KEYS[2], ARGV[1]); " +
    "return 1; " +
"end; " +
"local lockExists = redis.call('hexists', KEYS[1], ARGV[2]); " +
"if (lockExists == 0) then " +
    "return nil;" +
"end; " +
```
hincrby anyLock UUID_01:threadId_01 -1，将这个客户端对应的加锁次数递减1，现在就是变成1，counter = 0
hdel anyLock UUID_01:threadId_01，此时就是从hash数据结构中删除客户端A这个加锁的记录
del {anyLock}:UUID_01:threadId_01:rwlock_timeout:1，删除了一个timeout key
```java
anyLock: {
  "mode": "write",
  "UUID_01:threadId_01:write": 1,
}
```
此时mode是write的话，若是再进入到解锁逻辑，那么就会判断hlen anyLock >1 逻辑就是我们之前说的，接着往下判断返回是0就可以了
```java
"if (redis.call('hlen', KEYS[1]) > 1) then " +
    "local maxRemainTime = -3; " + 
    "local keys = redis.call('hkeys', KEYS[1]); " + 
    "for n, key in ipairs(keys) do " + 
        "counter = tonumber(redis.call('hget', KEYS[1], key)); " + 
        "if type(counter) == 'number' then " + 
            "for i=counter, 1, -1 do " + 
                "local remainTime = redis.call('pttl', KEYS[4] .. ':' .. key .. ':rwlock_timeout:' .. i); " + 
                "maxRemainTime = math.max(remainTime, maxRemainTime);" + 
            "end; " + 
        "end; " + 
    "end; " +
    "if maxRemainTime > 0 then " +
        "redis.call('pexpire', KEYS[1], maxRemainTime); " +
        "return 0; " +
    "end;" + 
    "if mode == 'write' then " + 
        "return 0;" + 
    "end; " +
"end; " +
```

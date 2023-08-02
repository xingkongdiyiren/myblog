

# 一、释放锁的核心代码
```java
protected RFuture<Boolean> unlockInnerAsync(long threadId) {
    return evalWriteAsync(getRawName(), LongCodec.INSTANCE, RedisCommands.EVAL_BOOLEAN,
        // 利用 hget 命令获取锁的模式  hget rwLock mode
        "local mode = redis.call('hget', KEYS[1], 'mode'); " +
        "if (mode == false) then " +
            // publish redisson_rwlock:{rwLock} 0
            "redis.call('publish', KEYS[2], ARGV[1]); " +
            "return 1; " +
        "end;" +
        "if (mode == 'write') then " +
            "local lockExists = redis.call('hexists', KEYS[1], ARGV[3]); " +
            "if (lockExists == 0) then " +
                "return nil;" +
            "else " +
                "local counter = redis.call('hincrby', KEYS[1], ARGV[3], -1); " +
                "if (counter > 0) then " +
                    "redis.call('pexpire', KEYS[1], ARGV[2]); " +
                    "return 0; " +
                "else " +
                    "redis.call('hdel', KEYS[1], ARGV[3]); " +
                    "if (redis.call('hlen', KEYS[1]) == 1) then " +
                        "redis.call('del', KEYS[1]); " +
                        "redis.call('publish', KEYS[2], ARGV[1]); " + 
                    "else " +
                        // hset rwLock mode read
                        "redis.call('hset', KEYS[1], 'mode', 'read'); " +
                    "end; " +
                    "return 1; "+
                "end; " +
            "end; " +
        "end; " +
        "return nil;",
    Arrays.<Object>asList(getRawName(), getChannelName()),
    LockPubSub.READ_UNLOCK_MESSAGE, internalLockLeaseTime, getLockName(threadId));
}
```



# 二、同一个客户端多次可重入加写锁 / 同一个客户端先加写锁再加读锁

比如说现在拥有一个客户端A（UUID_01:threadId_01）进行释放锁
```java
anyLock: {
  "mode": "write",
  "UUID_01:threadId_01:write": 2,
  "UUID_01:threadId_01": 1
}
{anyLock}:UUID_01:threadId_01:rwlock_timeout:1		1
```
## 参数说明
```java
KEYS[1] = anyLock
KEYS[2] = redisson_rwlock:{anyLock}

ARGV[1] = 0
ARGV[2] = 30000
ARGV[3] = UUID_01:threadId_01:write
```
因为客户端是拥有锁的，所以hget是不为空的，如果为空，往对应的channel发送释放锁的消息，我们的mode 为write，所以直接走下面的lua脚本
```java
"if (mode == 'write') then " +
    "local lockExists = redis.call('hexists', KEYS[1], ARGV[3]); " +
    "if (lockExists == 0) then " +
        "return nil;" +
    "else " +
        "local counter = redis.call('hincrby', KEYS[1], ARGV[3], -1); " +
        "if (counter > 0) then " +
            "redis.call('pexpire', KEYS[1], ARGV[2]); " +
            "return 0; " +
        "else " +
            "redis.call('hdel', KEYS[1], ARGV[3]); " +
            "if (redis.call('hlen', KEYS[1]) == 1) then " +
                "redis.call('del', KEYS[1]); " +
                "redis.call('publish', KEYS[2], ARGV[1]); " + 
            "else " +
                // hset rwLock mode read
                "redis.call('hset', KEYS[1], 'mode', 'read'); " +
            "end; " +
            "return 1; "+
        "end; " +
    "end; " +
"end; " +
```
此时锁存在，需要判断当前前线程没有持有锁，执行的lua脚本如下，如果不存在直接返回null，表示释放锁失败
```java
"local lockExists = redis.call('hexists', KEYS[1], ARGV[3]); " +
"if (lockExists == 0) then " +"return nil;"
```
当前线程持有锁，并且持有锁数量大于1则进行扣减持有锁数量，并且直接利用 pexpire 命令重新刷新锁过期时间
```java
"local counter = redis.call('hincrby', KEYS[1], ARGV[3], -1); " +
"if (counter > 0) then " +
    "redis.call('pexpire', KEYS[1], ARGV[2]); " +
"return 0; "
```
当前线程持有写锁，且持有数量等于1，则利用 del 命令删除写锁记录
```java
"redis.call('hdel', KEYS[1], ARGV[3]); " +
"if (redis.call('hlen', KEYS[1]) == 1) then " +
    "redis.call('del', KEYS[1]); " +
    "redis.call('publish', KEYS[2], ARGV[1]); " + 
"else " +
    // hset rwLock mode read
    "redis.call('hset', KEYS[1], 'mode', 'read'); " +
"end; " +
"return 1; "+
```
此时我们的Redis里的数据结构就是如下：
```java
anyLock: {
  "mode": "write",
  "UUID_01:threadId_01": 1
}

{anyLock}:UUID_01:threadId_01:rwlock_timeout:1		1
```
利用 hlen 判断锁map里还存在多少个key。如果 key 数量等于1，证明当前线程不再持有任何锁，利用 del 命令删除锁map，利用 publish 命令发布释放锁消息。如果 key 数量大于1，证明当前线程还持有读锁，利用 hset 命令将锁模式设置为读锁。hset anyLock mode read，将写锁转换为读锁
```java
anyLock: {
  "mode": "read",
  "UUID_01:threadId_01": 1
}

{anyLock}:UUID_01:threadId_01:rwlock_timeout:1    
```
 最后返回1，释放锁成功，终止lua脚本执行。如果上面的判断都不满足，证明当前线程并没有持有写锁，直接返回null即可


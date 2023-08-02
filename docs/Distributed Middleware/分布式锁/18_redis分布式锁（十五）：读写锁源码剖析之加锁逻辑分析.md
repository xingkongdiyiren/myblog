# 一、读写锁（ReadWriteLock）介绍

基于Redis的Redisson分布式可重入读写锁RReadWriteLock Java对象实现了java.util.concurrent.locks.ReadWriteLock接口。其中读锁和写锁都继承了RLock接口。分布式可重入读写锁允许同时有多个读锁和一个写锁处于加锁状态
```java
RReadWriteLock rwlock = redisson.getReadWriteLock("anyRWLock");
// 最常见的使用方法
rwlock.readLock().lock();
// 或
rwlock.writeLock().lock();
```

当多个客户端同时加读锁，是不会互斥的，多个客户端可以同时加这个读锁，读锁和读锁是不互斥的。如果有人加了读锁，此时就不能加写锁，任何人都不能加写锁了，读锁和写锁是互斥的，如果有人加了写锁，此时任何人都不能加写锁了，写锁和写锁也是互斥的
# 二、源码分析

RedissonReadLock是RedissonLock的子类，那么就进去到这个子类里去看看做了些什么事情
```java
public class RedissonReadWriteLock extends RedissonExpirable implements RReadWriteLock {
    
    public RedissonReadWriteLock(CommandAsyncExecutor commandExecutor, String name) {
        super(commandExecutor, name);
    }

    public RLock readLock() {
        return new RedissonReadLock(this.commandExecutor, this.getName());
    }

    public RLock writeLock() {
        return new RedissonWriteLock(this.commandExecutor, this.getName());
    }
}
```
可以看到读锁是RedissonReadLock、写锁是RedissonWriteLock

# 三、readLock源码分析

我们先来看看读锁，RedissonReadLock ，其实我们大概现在都知道了，加锁源码基本和之前的可重入锁加锁无区别，唯一的差异就是在 Lua 脚本我们要研究 加锁 释放锁，所以下面着重分析 Lua 脚本，tryLockInnerAsync充血加锁逻辑
```java
@Override
<T> RFuture<T> tryLockInnerAsync(long leaseTime, TimeUnit unit, long threadId, RedisStrictCommand<T> command) {
    internalLockLeaseTime = unit.toMillis(leaseTime);
    	return commandExecutor.evalWriteAsync(getName(), LongCodec.INSTANCE, command,
            "local mode = redis.call('hget', KEYS[1], 'mode'); " +
            "if (mode == false) then " +
              "redis.call('hset', KEYS[1], 'mode', 'read'); " +
              "redis.call('hset', KEYS[1], ARGV[2], 1); " +
              "redis.call('set', KEYS[2] .. ':1', 1); " +
              "redis.call('pexpire', KEYS[2] .. ':1', ARGV[1]); " +
              "redis.call('pexpire', KEYS[1], ARGV[1]); " +
              "return nil; " +
            "end; " +
            "if (mode == 'read') or (mode == 'write' and redis.call('hexists', KEYS[1], ARGV[3]) == 1) then " +
				"local ind = redis.call('hincrby', KEYS[1], ARGV[2], 1); " +      
              	"local key = KEYS[2] .. ':' .. ind;" +
              	"redis.call('set', key, 1); " +
              	"redis.call('pexpire', key, ARGV[1]); " +
              	"redis.call('pexpire', KEYS[1], ARGV[1]); " +
              	"return nil; " +
            "end;" +
            "return redis.call('pttl', KEYS[1]);",
        Arrays.<Object>asList(getName(), getReadWriteTimeoutNamePrefix(threadId)), 
        internalLockLeaseTime, getLockName(threadId), getWriteLockName(threadId));
}
```
## 参数说明

1. KEYS[1]：锁名字 anyRWLock
2. KEYS[2]：锁超时 key {锁名字}:UUID:ThreadId:rwlock_timeout 组成的字符串，{anyRWLock}:e70b1307-9ddd-43de-ac9d-9c42b5c99a0d:1:rwlock_timeout
3. ARGV[1]：锁时间，默认 30s
4. ARGV[2]：当前线程，UUID:ThreadId 组成的字符串，e70b1307-9ddd-43de-ac9d-9c42b5c99a0d:1
5. ARGV[3]：写锁名字，getWriteLockName(threadId) 写锁名字，UUID:ThreadId:write 组成的字符串， e70b1307-9ddd-43de-ac9d-9c42b5c99a0d:1:write

## 首次加锁处理分析
```java
"local mode = redis.call('hget', KEYS[1], 'mode'); " +
"if (mode == false) then " +
  "redis.call('hset', KEYS[1], 'mode', 'read'); " +
  "redis.call('hset', KEYS[1], ARGV[2], 1); " +
  "redis.call('set', KEYS[2] .. ':1', 1); " +
  "redis.call('pexpire', KEYS[2] .. ':1', ARGV[1]); " +
  "redis.call('pexpire', KEYS[1], ARGV[1]); " +
  "return nil; " +
"end; " +
```
通过hget获取锁，当锁不存在，继续执行下面的逻辑：

1. hset设置锁 anyRWLock 的 hash里kv值，key = mode ，value = read，表示这是个读锁
2. hset设置锁 anyRWLock 的 hash里kv值，key = e70b1307-9ddd-43de-ac9d-9c42b5c99a0d:1，value= 1
3. set设置锁，key字符串： {anyRWLock}:e70b1307-9ddd-43de-ac9d-9c42b5c99a0d:1:rwlock_timeout:1 ，value =  1
4. pexpire设置两个 RedisKey 的过期时间


读锁重入处理分析
```java
"if (mode == 'read') or (mode == 'write' and redis.call('hexists', KEYS[1], ARGV[3]) == 1) then " +
    "local ind = redis.call('hincrby', KEYS[1], ARGV[2], 1); " +      
    "local key = KEYS[2] .. ':' .. ind;" +
    "redis.call('set', key, 1); " +
    "redis.call('pexpire', key, ARGV[1]); " +
    "redis.call('pexpire', KEYS[1], ARGV[1]); " +
    "return nil; " +
"end;" +
```
通过hget获取锁，当锁存在，且是读锁，说明已经加过读锁，则进行读锁重入，执行下面的逻辑：

1. 对锁 anyRWLock 的 e70b1307-9ddd-43de-ac9d-9c42b5c99a0d:1（当前线程）值自增 1 表是重入
2. 再创建 {anyRWLock}:e70b1307-9ddd-43de-ac9d-9c42b5c99a0d:1:rwlock_timeout:2的key，ind 为hincrby结果，hincrby返回是2
3. set 字符串key{anyRWLock}:e70b1307-9ddd-43de-ac9d-9c42b5c99a0d:1:rwlock_timeout:2 值为1
4. expire设置两个 RedisKey 的过期时间

Reids存储数据结构为：
```java
anyLock: {
  "mode": "read",
  "e70b1307-9ddd-43de-ac9d-9c42b5c99a0d:1": 2
}
{anyLock}:UUID_01:threadId_01:rwlock_timeout:1: 1
{anyLock}:UUID_01:threadId_01:rwlock_timeout:2: 1
```
## 写读互斥处理分析
已经加了读锁了，此时写锁进来，不满足第一部分，也不满足第二部分，所以直接返回当前锁的剩余时间。然后再 Java 代码中进行 while (true) 自旋等待
```java
"if (mode == 'read') or (mode == 'write' and redis.call('hexists', KEYS[1], ARGV[3]) == 1) then " +
    "local ind = redis.call('hincrby', KEYS[1], ARGV[2], 1); " +      
    "local key = KEYS[2] .. ':' .. ind;" +
    "redis.call('set', key, 1); " +
    "redis.call('pexpire', key, ARGV[1]); " +
    "redis.call('pexpire', KEYS[1], ARGV[1]); " +
    "return nil; " +
"end;" +
"return redis.call('pttl', KEYS[1]);",
```
通过上面可以看出，在读锁的时候：

1. 锁 anyRWLock 是哈希表结构的
2. 加锁时，会对哈希表设置 mode 字段来表示这个锁是读锁还是写锁，mode = read 表示读锁
3. 加锁时，会对哈希表设置当前线程 anyRWLock 的 UUID:ThreadId 字段，值表示重入次数
4. 每次加锁，会额外维护一个 key 表示这次锁的超时时间，这个 key 的结构是 {锁名字}:UUID:ThreadId:rwlock_timeout:重入次数

同时不要忘了，我们还有一个watchdog看门狗，会每隔10秒钟去执行一段lua脚本，判断一下当前这个线程是否还持有着这个锁，如果还持有锁，更新一下锁key的生存时间为30000毫秒，保持redis的锁key和java代码中持有的锁是保持同步的

# 四、writeLock源码分析
```java
@Override
<T> RFuture<T> tryLockInnerAsync(long leaseTime, TimeUnit unit, long threadId, RedisStrictCommand<T> command) {
    internalLockLeaseTime = unit.toMillis(leaseTime);
        return commandExecutor.evalWriteAsync(getName(), LongCodec.INSTANCE, command,
            "local mode = redis.call('hget', KEYS[1], 'mode'); " +
            "if (mode == false) then " +
                  "redis.call('hset', KEYS[1], 'mode', 'write'); " +
                  "redis.call('hset', KEYS[1], ARGV[2], 1); " +
                  "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                  "return nil; " +
              "end; " +
              "if (mode == 'write') then " +
                  "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
                      "redis.call('hincrby', KEYS[1], ARGV[2], 1); " + 
                      "local currentExpire = redis.call('pttl', KEYS[1]); " +
                      "redis.call('pexpire', KEYS[1], currentExpire + ARGV[1]); " +
                      "return nil; " +
                  "end; " +
                "end;" +
                "return redis.call('pttl', KEYS[1]);",
            Arrays.<Object>asList(getName()), 
        internalLockLeaseTime, getLockName(threadId));
}
```
## 参数说明

1. KEYS[1]：当前锁 anyRWLock
2. ARGV[1]：锁时间，默认 30s
3. ARGV[2]：写锁名字，UUID:ThreadId:write 组成的字符串，c69a9ed4-5c30-4952-814e-c0b94ad03a7f:1:write
## 首次加锁处理分析
```java
"local mode = redis.call('hget', KEYS[1], 'mode'); " +
"if (mode == false) then " +
      "redis.call('hset', KEYS[1], 'mode', 'write'); " +
      "redis.call('hset', KEYS[1], ARGV[2], 1); " +
      "redis.call('pexpire', KEYS[1], ARGV[1]); " +
      "return nil; " +
  "end; " +
```
通过hget获取锁，当锁不存在，继续执行下面的逻辑：

1. hset设置锁 anyRWLock 的 hash里kv值，key = mode ，value = write，表示这是个读锁
2. hset设置锁 anyRWLock 的 hash里kv值，key = e70b1307-9ddd-43de-ac9d-9c42b5c99a0d:1，value= 1
3. pexpire设置两个 RedisKey 的过期时间

Reids存储数据结构为：
```java
anyLock: {
    "mode": "write",
    "e70b1307-9ddd-43de-ac9d-9c42b5c99a0d:1": 1
}
```
## 再次请求加写锁处理分析
```java
"if (mode == 'write') then " +
  "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
      "redis.call('hincrby', KEYS[1], ARGV[2], 1); " + 
      "local currentExpire = redis.call('pttl', KEYS[1]); " +
      "redis.call('pexpire', KEYS[1], currentExpire + ARGV[1]); " +
      "return nil; " +
  "end; " +
"end;" +
```
此时再次来加写锁，直接到另一个if语句中，如果当前是同一个线程则进入重入逻辑

1. hincrby anyLock UUID_01:threadId_01:write 1
2. pexpire anyLock pttl + 30000

通过上面可以看出，在写锁的时候：

1. 锁 anyRWLock 是哈希表结构
2. 加锁时，会对哈希表设置 mode 字段来表示这个锁是读锁还是写锁，mode = write 表示写锁
3. 在 anyRWLock 中再额外维护一个字段 UUID:ThreadId:write 表示重入次数


# 五、读锁与读锁非互斥

读锁与读锁是非互斥。比如说客户端A，客户端B，两个客户端部署在不同的机器上，都要对anyLock这个锁加读锁，此时是不会互斥的，他们的加锁都可以成功，我们可以根据读锁的lua脚本进行分析

假设，客户端A（UUID_01:threadId_01），先加了一个读锁
```java
hset anyLock mode read
hset anyLock UUID_01:threadId_01 1
set {anyLock}:UUID_01:threadId_01:rwlock_timeout:1 1
pexpire {anyLock}:UUID_01:threadId_01:rwlock_timeout:1 30000
pexpire anyLock 30000
```
此时的Redis里的数据结构则：
```java
anyLock: {
	"mode": "read",
  "UUID_01:threadId_01": 1
}

{anyLock}:UUID_01:threadId_01:rwlock_timeout:1	1
```
然后此时客户端B在另外一台机器上的，同时也要来加读锁（UUID_02:threadId_02），也要加读锁
```java
KEYS[1] = anyLock
KEYS[2] = {anyLock}:UUID_02:threadId_02:rwlock_timeout 

ARGV[1] = 30000毫秒
ARGV[2] = UUID_02:threadId_02
ARGV[3] = UUID_02:threadId_02:write
```
hget anyLock mode，获取到mode = read，此时已经有人加了一把读锁，所以走的是第二部分的lua脚本
```java
"if (mode == 'read') or (mode == 'write' and redis.call('hexists', KEYS[1], ARGV[3]) == 1) then " +
    "local ind = redis.call('hincrby', KEYS[1], ARGV[2], 1); " +      
    "local key = KEYS[2] .. ':' .. ind;" +
    "redis.call('set', key, 1); " +
    "redis.call('pexpire', key, ARGV[1]); " +
    "redis.call('pexpire', KEYS[1], ARGV[1]); " +
    "return nil; " +
"end;" +

//代入参数执行lua脚本
//hincrby anyLock UUID_02:threadId_02 1
//set {anyLock}:UUID_02:threadId_02:rwlock_timeout:1 1
//pexpire anyLock 30000
//pexpire {anyLock}:UUID_02:threadId_02:rwlock_timeout:1 30000
```
ind其实就是累加了1之后的一个值，ind = 1，{anyLock}:UUID_02:threadId_02:rwlock_timeout:1。此时的Redis里的数据结构则：
```java
anyLock: {
  “mode”: “read”,
  “UUID_01:threadId_01”: 1,
  “UUID_02:threadId_02”: 1
}

{anyLock}:UUID_01:threadId_01:rwlock_timeout:1		1
{anyLock}:UUID_02:threadId_02:rwlock_timeout:1		1
```
### 小结

多个客户端，同时加读锁，读锁与读锁是不互斥的，只会让你不断的在hash里加入哪个客户端也加了一个读锁。每个客户端都会维持一个watchdog，不断的刷新anyLock的生存时间，同时也会刷新那个客户端自己对应的timeout key的生存时间

# 六、先读后写如何互斥

按照我们上面的客户端A（UUID_01:threadId_01）和客户端B（UUID_02:threadId_02），安排客户端C（UUID_03:threadId_03）来加写锁
执行lua脚本如下：
```java
"local mode = redis.call('hget', KEYS[1], 'mode'); " +
"if (mode == false) then " +
      "redis.call('hset', KEYS[1], 'mode', 'write'); " +
      "redis.call('hset', KEYS[1], ARGV[2], 1); " +
      "redis.call('pexpire', KEYS[1], ARGV[1]); " +
      "return nil; " +
  "end; " +
"if (mode == 'write') then " +
  "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
      "redis.call('hincrby', KEYS[1], ARGV[2], 1); " + 
      "local currentExpire = redis.call('pttl', KEYS[1]); " +
      "redis.call('pexpire', KEYS[1], currentExpire + ARGV[1]); " +
      "return nil; " +
  "end; " +
"end;" +
"return redis.call('pttl', KEYS[1]);",
```
hget anyLock mode，mode = read，已经有人加了读锁，不是写锁，此时会直接执行：pttl anyLock，返回一个anyLock的剩余生存时间。会导致客户端C加锁失败，就会不断的尝试重试去加锁，陷入一个死循环。除非是你原先加读锁的人释放了读锁，他这个写锁才能够重构加上去

# 七、如果先有写锁再有人加读锁是如何互斥的？

假设客户端A先加了一个写锁，按照我们执行的lua脚本逻辑，在redis中的数据格式就如下：
```java
anyLock: {
    "mode": "write",
    "UUID_01:threadId_01:write": 1
}
```
假设此时客户端B来加读锁，按照lua脚本的参数如下：
```java
"if (mode == 'read') or (mode == 'write' and redis.call('hexists', KEYS[1], ARGV[3]) == 1) then " +
    "local ind = redis.call('hincrby', KEYS[1], ARGV[2], 1); " +      
    "local key = KEYS[2] .. ':' .. ind;" +
    "redis.call('set', key, 1); " +
    "redis.call('pexpire', key, ARGV[1]); " +
    "redis.call('pexpire', KEYS[1], ARGV[1]); " +
    "return nil; " +
"end;" +
"return redis.call('pttl', KEYS[1]);",

//KEYS[1] = anyLock
//KEYS[2] = {anyLock}:UUID_02:threadId_02:rwlock_timeout 

//ARGV[1] = 30000毫秒
//ARGV[2] = UUID_02:threadId_02
//ARGV[3] = UUID_02:threadId_02:write
```
hget anyLock mode，mode = write，发现经有人加了一个写锁了

hexists anyLock UUID_02:threadId_02:write，存在的话，如果客户端B自己之前加过写锁的话，此时才能进入这个分支，但是不幸的是，加写锁的是客户端A，所以这里的条件会全部失败，不会成立

返回pttl anyLock，导致加锁失败，不断的陷入死循环不断的重试。导致写锁和读锁，无论如何都会是失败的，互斥的

# 八、写锁和写锁互斥

还是分两个客户端A和客户端B，客户端A先加了一个写锁，执行的Redis格式如下：
```java
KEYS[1] = anyLock
ARGV[1] = 30000
ARGV[2] = UUID_01:threadId_01:write

anyLock: {
	"mode": "write",
	"UUID_01:threadId_01:write": 1
}
```

此时客户端B也来尝试加写锁，执行lua脚本如下：
```java
"if (mode == 'write') then " +
  "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
      "redis.call('hincrby', KEYS[1], ARGV[2], 1); " + 
      "local currentExpire = redis.call('pttl', KEYS[1]); " +
      "redis.call('pexpire', KEYS[1], currentExpire + ARGV[1]); " +
      "return nil; " +
  "end; " +
"end;" +

//KEYS[1] = anyLock

//ARGV[1] = 30000
//ARGV[2] = UUID_02:threadId_02:writ
```
hget anyLock mode，mode = write，已经有人加了一把写锁
hexists anyLock UUID_02:threadId_02:write，如果之前是客户端B自己加的写锁的话，才能进入下面的分支，但是实际上写锁并不是他加的，是客户端A加的，所以这个分支是不会进入的

直接返回一个ttl时间，导致加锁失败。不同的客户端之间加写锁，是会互斥的。不同的客户端/线程之间，读锁与读锁不互斥，读锁与写锁互斥，写锁与写锁互斥

# 九、多种可重入加锁分析

分析多种情况：若同一个客户端同一个线程，先加读锁，再加一次读锁；先加读锁，再加一次写锁；先加写锁，再加一次读锁；先加写锁，再加一次写锁，会分别产生什么结果
## 读锁+读锁

我们先客户端A执行一次读锁，看到lua脚本、参数、redis执行结果
```java
"local mode = redis.call('hget', KEYS[1], 'mode'); " +
"if (mode == false) then " +
  "redis.call('hset', KEYS[1], 'mode', 'read'); " +
  "redis.call('hset', KEYS[1], ARGV[2], 1); " +
  "redis.call('set', KEYS[2] .. ':1', 1); " +
  "redis.call('pexpire', KEYS[2] .. ':1', ARGV[1]); " +
  "redis.call('pexpire', KEYS[1], ARGV[1]); " +
  "return nil; " +
"end; " +

KEYS[1] = anyLock
KEYS[2] = {anyLock}:UUID_01:threadId_01:rwlock_timeout 

ARGV[1] = 30000毫秒
ARGV[2] = UUID_01:threadId_01
ARGV[3] = UUID_01:threadId_01:write

anyLock: {
    "mode": "read",
    "UUID_01:threadId_01": 1
}

{anyLock}:UUID_01:threadId_01:rwlock_timeout:1     1
```
此时再来一次读锁
```java
hget anyLock mode，mode = read //此时已经加过读锁

hincrby anyLock UUID_01:threadId_01 1
set {anyLock}:UUID_01:threadId_01:rwlock_timeout:2 1
pexpire anyLock 30000
pexpire {anyLock}:UUID_01:threadId_01:rwlock_timeout:2 30000

anyLock: {
    "mode": "read",
    "UUID_01:threadId_01": 2
}

{anyLock}:UUID_01:threadId_01:rwlock_timeout:1     1
{anyLock}:UUID_01:threadId_01:rwlock_timeout:2     1
```
## 读锁+写锁

我们先客户端A执行一次读锁，看到lua脚本、参数、redis执行结果
```java
"local mode = redis.call('hget', KEYS[1], 'mode'); " +
"if (mode == false) then " +
  "redis.call('hset', KEYS[1], 'mode', 'read'); " +
  "redis.call('hset', KEYS[1], ARGV[2], 1); " +
  "redis.call('set', KEYS[2] .. ':1', 1); " +
  "redis.call('pexpire', KEYS[2] .. ':1', ARGV[1]); " +
  "redis.call('pexpire', KEYS[1], ARGV[1]); " +
  "return nil; " +
"end; " +

KEYS[1] = anyLock
KEYS[2] = {anyLock}:UUID_01:threadId_01:rwlock_timeout 

ARGV[1] = 30000毫秒
ARGV[2] = UUID_01:threadId_01
ARGV[3] = UUID_01:threadId_01:write

anyLock: {
    "mode": "read",
    "UUID_01:threadId_01": 1
}

{anyLock}:UUID_01:threadId_01:rwlock_timeout:1     1
```
此时再来一次写锁
```java
"local mode = redis.call('hget', KEYS[1], 'mode'); " +
"if (mode == false) then " +
  "redis.call('hset', KEYS[1], 'mode', 'write'); " +
  "redis.call('hset', KEYS[1], ARGV[2], 1); " +
  "redis.call('pexpire', KEYS[1], ARGV[1]); " +
  "return nil; " +
"end; " +
"if (mode == 'write') then " +
  "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
      "redis.call('hincrby', KEYS[1], ARGV[2], 1); " + 
      "local currentExpire = redis.call('pttl', KEYS[1]); " +
      "redis.call('pexpire', KEYS[1], currentExpire + ARGV[1]); " +
      "return nil; " +
  "end; " +
"end;" +
"return redis.call('pttl', KEYS[1]);",
```
我们此时hget anyLock mode，mode = read，不符合条件，此时同一个客户端同一个线程，先读锁再写锁，是互斥的，会导致加锁失败

## 写锁+读锁

我们先客户端A执行一次写锁，看到lua脚本、参数、redis执行结果
```java
"local mode = redis.call('hget', KEYS[1], 'mode'); " +
"if (mode == false) then " +
  "redis.call('hset', KEYS[1], 'mode', 'write'); " +
  "redis.call('hset', KEYS[1], ARGV[2], 1); " +
  "redis.call('pexpire', KEYS[1], ARGV[1]); " +
  "return nil; " +
"end; " +

KEYS[1] = anyLock

ARGV[1] = 30000
ARGV[2] = UUID_01:threadId_01:write

anyLock: {
  "mode": "write",
  "UUID_01:threadId_01:write": 1
}
```
再来加一次读锁

```java
"if (mode == 'read') or (mode == 'write' and redis.call('hexists', KEYS[1], ARGV[3]) == 1) then " +
    "local ind = redis.call('hincrby', KEYS[1], ARGV[2], 1); " +      
    "local key = KEYS[2] .. ':' .. ind;" +
    "redis.call('set', key, 1); " +
    "redis.call('pexpire', key, ARGV[1]); " +
    "redis.call('pexpire', KEYS[1], ARGV[1]); " +
    "return nil; " +
"end;" +
"return redis.call('pttl', KEYS[1]);",

hincrby anyLock UUID_01:threadId_01 1 //也就是说此时，加了一个读锁
set {anyLock}:UUID_01:threadId_01:rwlock_timeout:1 1,
pexpire anyLock 30000
pexpire {anyLock}:UUID_01:threadId_01:rwlock_timeout:1 30000

anyLock: {
  "mode": "write",
  "UUID_01:threadId_01:write": 1,
  "UUID_01:threadId_01": 1
}

{anyLock}:UUID_01:threadId_01:rwlock_timeout:1	
```
hexists anyLock UUID_01:threadId_01:write，判断一下之前是否是自己加过一次写锁，此时是成立的，也就是之前加过一次写锁的，同一个客户端同一个线程，然后加读锁，是可以加的，默认是在同一个线程写锁的期间，可以多次加读锁


## 写锁+写锁

客户端A先加一次写锁，看到lua脚本、参数、redis执行结果
```java
"local mode = redis.call('hget', KEYS[1], 'mode'); " +
"if (mode == false) then " +
  "redis.call('hset', KEYS[1], 'mode', 'write'); " +
  "redis.call('hset', KEYS[1], ARGV[2], 1); " +
  "redis.call('pexpire', KEYS[1], ARGV[1]); " +
  "return nil; " +
"end; " +

KEYS[1] = anyLock

ARGV[1] = 30000
ARGV[2] = UUID_01:threadId_01:write

anyLock: {
  "mode": "write",
  "UUID_01:threadId_01:write": 1
}

```
再来加一次写锁
```java
"if (mode == 'write') then " +
  "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
      "redis.call('hincrby', KEYS[1], ARGV[2], 1); " + 
      "local currentExpire = redis.call('pttl', KEYS[1]); " +
      "redis.call('pexpire', KEYS[1], currentExpire + ARGV[1]); " +
      "return nil; " +
  "end; " +
"end;" +
```
hexists anyLock UUID_01:threadId_01:write，是否存在？之前是他自己加的写锁，所以满足==1进入IF操作

```java
hincrby anyLock UUID_01:threadId_01:write 1
pexpire anyLock 50000

anyLock: {
  "mode": "write",
  "UUID_01:threadId_01:write": 2
}
```
所以通过源码可以看到，同一个客户端同一个线程，多次加写锁，是可以重入加锁的读写锁其实也是一种可重入锁

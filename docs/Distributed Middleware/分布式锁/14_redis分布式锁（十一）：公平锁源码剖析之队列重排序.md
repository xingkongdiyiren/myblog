
# 一、前言回顾

前面使用了三个线程去处理加锁，走了一遍五阶段，t1拿到锁，t2、t3等待锁，若是按照时间本来到t2按照队列进行拿锁，但是t2他其实在这之前不知道可能因为网络原因或者是别的什么原因没有拿锁，那么t3、t2怎么处理？

线程t1、t2、t3进行公平排队加锁：[13_redis分布式锁（十）：公平锁源码剖析之排队加锁](13_redis分布式锁（十）：公平锁源码剖析之排队加锁.md)

# 二、队列的重排序

## 线程t3加锁
当前线程t1还持有着fairLock锁，线程t2、t3已经进入等待队列redisson_lock_queue:{fairLock}中，此时线程t3进来获取锁，具体会怎样？

### 执行第一部分：删除过期的等待线程
while true死循环，执行lindex redisson_lock_queue:{fairLock} 0，获取等待队列中的第一个元素d23e0d6b-437c-472c-9c9d-2147907ab8f9:47，代表的是这个t2线程正在队列里排队，进行timeout判断，满足所以等待队列中、超时集合都移除t2、t3
```java
"while true do " +
    "local firstThreadId2 = redis.call('lindex', KEYS[2], 0);" +
    "if firstThreadId2 == false then " +
        "break;" +
    "end;" +
    "local timeout = tonumber(redis.call('zscore', KEYS[3], firstThreadId2));" +
    "if timeout <= tonumber(ARGV[4]) then " +
        // a、通过zrem指令从redisson_lock_timeout:{fairLock}超时集合中删除第一个等待线程ID对应的元素
        "redis.call('zrem', KEYS[3], firstThreadId2);" +
        // b、通过lpop指令从redisson_lock_queue:{fairLock}等待队列中移除第一个等待线程ID对应的元素
        "redis.call('lpop', KEYS[2]);" +
    "else " +
        // 如果超时时间戳 大于 当前时间，说明还没超时，则直接跳出循环
        "break;" +
    "end;" +
"end;" +
```

### 执行第二部分：检查是否可以获取锁
通过exists fairLock，因为t1正在持有fairLock这把锁，所以exists fairLock返回1，锁key已经存在了，说明已经有人加锁了，if条件肯定就不满足了，不会进入if里面，也就是说对于t3线程，第二部分的LUA啥都没做，接着看第三部分
```java
"if (redis.call('exists', KEYS[1]) == 0) " +
    "and ((redis.call('exists', KEYS[2]) == 0) " +
        "or (redis.call('lindex', KEYS[2], 0) == ARGV[2])) then " +

    "redis.call('lpop', KEYS[2]);" +
    "redis.call('zrem', KEYS[3], ARGV[2]);" +
    "local keys = redis.call('zrange', KEYS[3], 0, -1);" +
    "for i = 1, #keys, 1 do " +
        "redis.call('zincrby', KEYS[3], - (ARGV[3]), keys[i]);" +
    "end;" +
    "redis.call('hset', KEYS[1], ARGV[2], 1);" +
    // 默认超时时间：30秒
    "redis.call('pexpire', KEYS[1], ARGV[1]);" +
    // 返回nil，表示获取锁成功，如果执行到这里，就return结束了，不会执行下面的第三、四、五部分
    "return nil;" +
"end;" +
```
### 执行第四部分：检查线程是否已经在等待队列中
检查线程是否已经在等待队列中，如果当前线程本就在等待队列中，返回等待时间，t3不再此所以也不走第四部分
```java
// 利用 zscore 获取当前线程在超时集合中的超时时间
"local timeout = redis.call('zscore', KEYS[3], ARGV[2]);" +
// 不等于false, 说明当前线程在等待队列中才会执行if逻辑
"if timeout ~= false then " +
    "return timeout - tonumber(ARGV[3]) - tonumber(ARGV[4]);" +
"end;"
```
### 执行第五部分：将线程添加到队列末尾
执行lindex redisson_lock_queue:{fairLock} -1获取等待队列中最后一个等待的线程，此时等待队列还是空的，所以计算ttl = pttl fairLock，即ttl = 当前锁fairLock的剩余过期时间 = 18000毫秒（假设）
```java
"local lastThreadId = redis.call('lindex', KEYS[2], -1);" +
"local ttl;" +
"if lastThreadId ~= false and lastThreadId ~= ARGV[2] then " +
    "ttl = tonumber(redis.call('zscore', KEYS[3], lastThreadId)) - tonumber(ARGV[4]);" +
"else " +
    "ttl = redis.call('pttl', KEYS[1]);" +
"end;" +
"local timeout = ttl + tonumber(ARGV[3]) + tonumber(ARGV[4]);" +
"if redis.call('zadd', KEYS[3], timeout, ARGV[2]) == 1 then " +
    "redis.call('rpush', KEYS[2], ARGV[2]);" +
"end;" +
// 返回ttl
"return ttl;",
```
接着执行计算timeout = ttl + 300000毫秒 + 当前时间 = 1663143422976 ，以及zadd redisson_lock_timeout:{fairLock} 往zset集合中插入一个元素，因为是sorted set，有序set集合，会自动根据你插入的元素的分数从小到大来进行排序。

继续执行： rpush redisson_lock_queue:{fairLock} 插入到等待队列的头部，也就是说t3线程进入等待队列中

## 线程t2加锁

假设此时，线程再次尝试来进行加锁，一样走到第五部就可以看到他的逻辑就是

执行lindex redisson_lock_queue:{fairLock} -1，获取等待队列最后一个等待的线程，此时，t3正在等待队列中，于是获取到的lastThreadId = d23e0d6b-437c-472c-9c9d-2147907ab8f9:49
```java
"local lastThreadId = redis.call('lindex', KEYS[2], -1);" +
"local ttl;" +
"if lastThreadId ~= false and lastThreadId ~= ARGV[2] then " +
    "ttl = tonumber(redis.call('zscore', KEYS[3], lastThreadId)) - tonumber(ARGV[4]);" +
"else " +
    "ttl = redis.call('pttl', KEYS[1]);" +
"end;" +
"local timeout = ttl + tonumber(ARGV[3]) + tonumber(ARGV[4]);" +
"if redis.call('zadd', KEYS[3], timeout, ARGV[2]) == 1 then " +
    "redis.call('rpush', KEYS[2], ARGV[2]);" +
"end;" +
// 返回ttl
"return ttl;",
```
接着执行ttl = 所以timeout = ttl + 300000毫秒 + 当前时间 = 1663143428976

接着将t2线程放入到队列和有序集合中：

1. zadd redisson_lock_timeout:{fairLock} 1663143428976 d23e0d6b-437c-472c-9c9d-2147907ab8f9:47
2. rpush redisson_lock_queue:{fairLock} d23e0d6b-437c-472c-9c9d-2147907ab8f9:47

执行到这里，线程t2也成功加入等待队列和zset超时集合中

## 重排小结

从这个里面，我们可以看到，在一个客户端刚刚加锁之后，其他的客户端来争抢这把锁，刚开始在一定时间范围之内，时间不要过长，各个客户端是可以按照公平的节奏，在队列和有序集合里面进行排序

在一定时间范围内，时间不要过长，其实队列里的元素顺序是不会改变的，各个客户端重新尝试加锁，只不过是刷新有序集合中的分数（timeout），各个客户端的timeout不断加长，但是整体顺序大致还是保持一致的

但是如果客户端A持有的锁的时间过长，timeout，这个所谓的排队是有timeout，可能会在while true死循环中将一些等待时间过长的客户端从队列和有序集合中删除，一旦删除过后，就会发生各个客户端随着自己重新尝试加锁的时间次序，重新进行一个队列中的重排，也就是排队的顺序可能会发生变化

注意：客户端跟redis通信的网络的一个问题，延迟，各种情况都可能会发生

客户端释放锁，释放锁之后队列中的排队的客户端是如何依次获取这把锁的，是按照队列里的顺序去获取锁的

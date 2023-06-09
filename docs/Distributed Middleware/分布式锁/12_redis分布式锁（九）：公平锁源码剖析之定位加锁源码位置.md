
# 一、前言回顾

前几篇文章讲的RedissonLock是第一种锁是可重入锁，非公平可重入锁，所谓的非公平可重入锁是什么意思呢？胡乱的争抢，根本没有任何公平性和顺序性可言，接下来讲第二种锁，可重入的公平锁Fair Lock

# 二、公平锁（Fair Lock）介绍

基于Redis的Redisson分布式可重入公平锁也是实现了java.util.concurrent.locks.Lock接口的一种RLock对象。同时还提供了[异步（Async）](http://static.javadoc.io/org.redisson/redisson/3.10.0/org/redisson/api/RLockAsync.html)、反射式（Reactive）和RxJava2标准的接口

它保证了当多个Redisson客户端线程同时请求加锁时，优先分配给先发出请求的线程。所有请求线程会在一个队列中排队，当某个线程出现宕机时，Redisson会等待5秒后继续下一个线程，也就是说如果前面有5个线程都处于等待状态，那么后面的线程会等待至少25秒

通过公平锁，可以保证说，客户端获取锁的顺序，就跟他们请求获取锁的顺序是一样的，公平锁排队，谁先申请获取这把锁，谁就可以先获取到这把锁，这个是按照顺序来的，不是胡乱的争抢的

# 三、和RedissonLock的区别与加锁逻辑

可重入非公平锁、公平锁，他们在整体的技术实现上都是一样的，只不过唯一不同的一点就是在于加锁的逻辑那里

非公平锁，加锁是比计较简单粗暴，争抢；公平锁，在加锁的逻辑里，要加入这个排队的机制，保证说各个客户端排队，按照顺序获取锁，不是胡乱争抢的，可以简单的看看示例代码
```java
RLock fairLock = redisson.getFairLock("fairLock");
// 最常见的使用方法
fairLock.lock();
```
之前RedissonLock是通过getLock去获取的，这里getFairLock方法，可以看到他的构造方法是这样的
```java
public class RedissonFairLock extends RedissonLock implements RLock {

	//省略关键性其他代码....
	private final long threadWaitTime = 5000L;
    private final CommandAsyncExecutor commandExecutor;
    private final String threadsQueueName;
    private final String timeoutSetName;

    protected RedissonFairLock(CommandAsyncExecutor commandExecutor, String name) {
        super(commandExecutor, name);
        this.commandExecutor = commandExecutor;
        this.threadsQueueName = prefixName("redisson_lock_queue", name);
        this.timeoutSetName = prefixName("redisson_lock_timeout", name);
    }
}
public class Redisson implements RedissonClient {

    //省略关键性其他代码....
    public RLock getFairLock(String name) {
    	return new RedissonFairLock(this.connectionManager.getCommandExecutor(), name);
	}
}
```
RedissonFairLock是RedissonLock的子类，整体的锁的技术框架的实现，都是跟之前的RedissonLock是一样的，无非就是重载了一些方法加锁和释放锁的lua脚本的逻辑稍微复杂了一些，别的没什么特别的，来看看他的加锁方式
```java
<T> RFuture<T> tryLockInnerAsync(long leaseTime, TimeUnit unit, long threadId, RedisStrictCommand<T> command) {
	this.internalLockLeaseTime = unit.toMillis(leaseTime);
	long currentTime = System.currentTimeMillis();
    // 根据不同的命令类型执行不同的LUA脚本
	// EVAL_LONG，重点关注这个
    if (command == RedisCommands.EVAL_LONG) {
        return evalWriteAsync(getRawName(), LongCodec.INSTANCE, command,
            /**
             * 第一部分: 死循环的作用主要是用于清理过期的等待线程，主要避免下面场景，避免无效客户端占用等待队列资源
             * 1、获取锁失败，然后进入等待队列，但是网络出现问题，那么后续很有可能就不能继续正常获取锁了。
             * 2、获取锁失败，然后进入等待队列，但是之后客户端所在服务器宕机了。
             */
            // 开启死循环
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
            /**
             * 第二部分: 检查是否可以获取锁
             * 满足下面两个条件之一可以获取锁：
             *  1、当前锁不存在（锁未被获取） and 等待队列不存在
             *  2、当前锁不存在（锁未被获取） and 等待队列存在 and 等待队列中的第一个等待线程就是当前客户端当前线程
             */
            "if (redis.call('exists', KEYS[1]) == 0) " +
                "and ((redis.call('exists', KEYS[2]) == 0) " +
                    "or (redis.call('lindex', KEYS[2], 0) == ARGV[2])) then " +

                "redis.call('lpop', KEYS[2]);" +
                "redis.call('zrem', KEYS[3], ARGV[2]);" +
                "redis.call('hset', KEYS[1], ARGV[2], 1);" +
                // 默认超时时间：30秒
                "redis.call('pexpire', KEYS[1], ARGV[1]);" +
                // 返回nil，表示获取锁成功，如果执行到这里，就return结束了，不会执行下面的第三、四、五部分
                "return nil;" +
            "end;" +

            /**
             * 第三部分: 检查锁是否已经被持有，公平锁重入
             */
            "if redis.call('hexists', KEYS[1], ARGV[2]) == 1 then " +
                "redis.call('hincrby', KEYS[1], ARGV[2], 1);" +
                "redis.call('pexpire', KEYS[1], ARGV[1]);" +
                "return nil;" +
            "end;" +

            /**
             * 第四部分: 检查线程是否已经在等待队列中，如果当前线程本就在等待队列中，返回等待时间
             */
            "local timeout = redis.call('zscore', KEYS[3], ARGV[2]);" +
            "if timeout ~= false then " +
                "return timeout - tonumber(ARGV[3]) - tonumber(ARGV[4]);" +
            "end;" +

            /**
             * 第五部分: 将线程添加到队列末尾，并在timeout set中设置其超时时间为队列中前一个线程的超时时间（如果队列为空则为锁的超时时间）加上threadWaitTime
             */
            // 获取等待队列redisson_lock_queue:{fairLock}最后一个元素，即等待队列中最后一个等待的线程
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
            Arrays.asList(getRawName(), threadsQueueName, timeoutSetName),
            unit.toMillis(leaseTime), getLockName(threadId), wait, currentTime);
    }
    throw new IllegalArgumentException();
}

```
可以看到，Redisson公平锁的加锁LUA脚本比较复杂，但是整体可以拆分为五个部分去分析

# 四、Lua脚本分析

## 第一部分：删除过期的等待线程

### 避免场景
这个死循环的作用主要用于清理过期的等待线程，主要避免下面场景，避免无效客户端占用等待队列资源

1. 获取锁失败，然后进入等待队列，但是网络出现问题，那么后续很有可能就不能继续正常获取锁了
2. 获取锁失败，然后进入等待队列，但是之后客户端所在服务器宕机了

### 主要流程
```java
// 开启死循环
"while true do " +
    // 通过lindex指令获取redisson_lock_queue:{fairLock}等待队列的第一个元素，也就是第一个等待的线程ID，如果存在，直接跳出循环
    // lindex指令：返回List列表中下标为指定索引值的元素。 如果指定索引值不在列表的区间范围内，返回nil
    "local firstThreadId2 = redis.call('lindex', KEYS[2], 0);" +
    // 如果第一个等待的线程ID为空，说明等待队列为空，没有人在排队，则直接跳出死循环
    "if firstThreadId2 == false then " +
        "break;" +
    "end;" +
    // 如果等待队列中第一个元素不为空（例如返回了LockName，即客户端UUID拼接线程ID），
	// 通过zscore指令从zset集合redisson_lock_timeout:{fairLock}中获取第一个等待线程ID对应的分数，其实就是超时时间戳
    // zscore: 返回有序集中成员的分数值
    "local timeout = tonumber(redis.call('zscore', KEYS[3], firstThreadId2));" +
    // 如果超时时间戳 小于等于 当前时间的话，那么首先从超时集合中移除该节点，接着也在等待队列中弹出第一个节点
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




## 第二部分：检查是否可以获取锁

### 检查场景
满足下面两个条件之一可以获取锁：

-  当前锁不存在（锁未被获取） and 等待队列不存在
-  当前锁不存在（锁未被获取） and 等待队列存在 and 等待队列中的第一个等待线程就是当前客户端当前线程

### 主要流程
```java
// 通过exists指令判断当前锁是否存在
// 通过exists指令判断redisson_lock_queue:{fairLock}等待队列是否存在
// 判断redisson_lock_queue:{fairLock}等待队列第一个元素是否就是当前线程（当前线程在队首）
"if (redis.call('exists', KEYS[1]) == 0) " +
    "and ((redis.call('exists', KEYS[2]) == 0) " +
        "or (redis.call('lindex', KEYS[2], 0) == ARGV[2])) then " +

    // 从等待队列和超时集合中移除当前线程
    "redis.call('lpop', KEYS[2]);" +
    "redis.call('zrem', KEYS[3], ARGV[2]);" +

    // 刷新超时集合中，其它等待线程的超时时间，减少300000毫秒超时时间，即更新它们的分数
    // zrange redisson_lock_timeout:{fairLock} 0 -1: 返回整个zset集合所有元素
    "local keys = redis.call('zrange', KEYS[3], 0, -1);" +
    "for i = 1, #keys, 1 do " +
        // 循环遍历，通过zincrby对redisson_lock_timeout:{fairLock}集合中指定成员的分数减去300000
        // 减少等待队列中所有等待线程的超时时间
        // todo:wsh 有客户端可以成功获取锁的时候，为什么要减少其它等待线程的超时时间？
        // todo:wsh 因为这里的客户端都是调用 lock()方法，就是等待直到最后获取到锁；
        // 所以某个客户端可以成功获取锁的时候，要帮其他等待的客户端刷新一下等待时间，不然在分支一的死循环中就被干掉了?
        "redis.call('zincrby', KEYS[3], - (ARGV[3]), keys[i]);" +
    "end;" +

    // 往加锁集合(map) myLock 中加入当前客户端当前线程，加锁次数为1，然后刷新 myLock 的过期时间
    // 加锁同样使用的是hash数据结构，redis key = anyLock, 
    // hash key = 【进程唯一ID + ":" + 线程ID】, hash value = 锁重入次数
    "redis.call('hset', KEYS[1], ARGV[2], 1);" +
    // 默认超时时间：30秒
    "redis.call('pexpire', KEYS[1], ARGV[1]);" +
    // 返回nil，表示获取锁成功，如果执行到这里，就return结束了，不会执行下面的第三、四、五部分
    "return nil;" +
"end;" +

```
## 第三部分：检查锁是否已经被持有，公平锁重入

### 检查场景
通过hexists指令判断当前持有锁的线程是不是自己，如果是自己的锁，则执行重入，增加加锁次数，并且刷新锁的过期时间

### 主要流程
```java
"if redis.call('hexists', KEYS[1], ARGV[2]) == 1 then " +
    // 更新哈希数据结构中重入次数加一
    "redis.call('hincrby', KEYS[1], ARGV[2], 1);" +
    // 重新设置锁过期时间为30秒
    "redis.call('pexpire', KEYS[1], ARGV[1]);" +
    // 返回nil，表示锁重入成功，如果执行到这里，就return结束了，不会执行下面的第四、五部分
    "return nil;" +
"end;" +
```
## 第四部分：检查线程是否已经在等待队列中

### 检查场景
检查线程是否已经在等待队列中，如果当前线程本就在等待队列中，返回等待时间

### 主要流程
```java
// 利用 zscore 获取当前线程在超时集合中的超时时间
"local timeout = redis.call('zscore', KEYS[3], ARGV[2]);" +
// 不等于false, 说明当前线程在等待队列中才会执行if逻辑
"if timeout ~= false then " +
    // 真正的超时是队列中前一个线程的超时，但这大致正确，并且避免了遍历队列
    // 返回实际的等待时间为：超时集合里的时间戳 - 300000毫秒 - 当前时间戳
    // 如果执行到这里，就return结束了，不会执行下面的第五部分
    "return timeout - tonumber(ARGV[3]) - tonumber(ARGV[4]);" +
"end;" +
```
## 第五部分: 将线程添加到队列末尾
### 

### 检查场景
将线程添加到队列末尾，并在timeout set中设置其超时时间为队列中前一个线程的超时时间（如果队列为空则为锁的超时时间）加上threadWaitTime

### 主要流程
```java
// 获取等待队列redisson_lock_queue:{fairLock}最后一个元素，即等待队列中最后一个等待的线程
"local lastThreadId = redis.call('lindex', KEYS[2], -1);" +
"local ttl;" +
// 如果等待队列中最后的线程不为空且不是当前线程
"if lastThreadId ~= false and lastThreadId ~= ARGV[2] then " +
    // ttl = 最后一个等待线程在zset集合的分数 - 当前时间戳。 看最后一个线程还有多久超时
    "ttl = tonumber(redis.call('zscore', KEYS[3], lastThreadId)) - tonumber(ARGV[4]);" +
"else " +
    // 如果等待队列中不存在其他的等待线程，直接返回锁key的过期时间
    "ttl = redis.call('pttl', KEYS[1]);" +
"end;" +
// 计算锁超时时间 = ttl + 300000 + 当前时间戳
"local timeout = ttl + tonumber(ARGV[3]) + tonumber(ARGV[4]);" +
// 将当前线程添加到redisson_lock_timeout:{fairLock} 超时集合中，超时时间戳作为score分数，用来在有序集合中排序
"if redis.call('zadd', KEYS[3], timeout, ARGV[2]) == 1 then " +
    // 通过rpush将当前线程添加到redisson_lock_queue:{fairLock}等待队列中
    "redis.call('rpush', KEYS[2], ARGV[2]);" +
"end;" +
// 返回ttl
"return ttl;",
```
## 参数说明
先对LUA脚本中使用到的一些参数进行说明：

- KEYS[1]: 指定的分布式锁的key，例子中redissonClient.getFairLock("fairLock")的 "fairLock"
- KEYS[2]: 加锁等待队列的名称，redisson_lock_queue:{分布式锁key}。如本例中为： redisson_lock_queue:{fairLock}
- KEYS[3]: 等待队列中线程锁时间的set集合名称，redisson_lock_timeout:{分布式锁key}，是按照锁的时间戳存放到集合中的。如本例中为： redisson_lock_timeout:{fairLock}
- ARGV[1]: 锁的超时时间，本例中为锁默认超时时间：30000毫秒（30秒）
- ARGV[2]:【进程唯一ID + ":" + 线程ID】组合
- ARGV[3]: 线程等待时间，默认为300000毫秒（300秒）
- ARGV[4]: 当前系统时间戳




# 一、前言回顾

前面提到的都是加锁，这篇文章开始说的是解除锁， 公平锁的释放所和可重入锁还是不一样的。公平锁加锁失败之后，会将当前放到等待队列中，通过 Java 代码中的循环不断尝试获得锁

RedissonFairLock继承自RedissonLock，解锁大部分流程还是跟RedissonLock一致，只是unlockInnerAsync()方法实现不同
# 二、unlock方法分析
进入到手动释放锁的源码分析
```java
protected RFuture<Boolean> unlockInnerAsync(long threadId) {
    return this.commandExecutor.evalWriteAsync(
        this.getName(), LongCodec.INSTANCE, RedisCommands.EVAL_BOOLEAN,
           /**
             * 第一部分：开启死循环，移除超时的那些线程
             */
            "while true do "+
                // 获取等待队列中第一个等待的线程
                 "local firstThreadId2 = redis.call('lindex', KEYS[2], 0);" + 
                 "if firstThreadId2 == false then " + 
                     "break;"+ 
                 "end; "+ 
                 "local timeout = tonumber(redis.call('zscore', KEYS[3], firstThreadId2));"+ 
                 "if timeout <= tonumber(ARGV[4]) then "+ 
                     "redis.call('zrem', KEYS[3], firstThreadId2); "+ 
                     "redis.call('lpop', KEYS[2]); "+ 
                 "else "+ 
                    "break;"+ 
                 "end; "+ 
            "end;"+ 
    
            /**
             * 第二部分：锁已经被释放，通知等待队列中第一个线程
             * 场景：
             * 1、成功获取锁线程重复调用释放锁的方法，第二次释放时，锁已不存在，就去通知等待队列中的第一个元素
             * 2、又或者一个极端场景：当前线程未能成功获取锁，但是调用了释放锁的方法，并且刚好此时锁被释放
            */
            "if (redis.call('exists', KEYS[1]) == 0) then " +
                "local nextThreadId = redis.call('lindex', KEYS[2], 0); " + 
                "if nextThreadId ~= false then " +
                    "redis.call('publish', KEYS[4] .. ':' .. nextThreadId, ARGV[1]); " +
                "end; " +
                "return 1; " +
            "end;" +
    
        	/**
             * 第三部分: 释放锁
             */
            // 判断当前释放的锁是不是自己的，如果不是自己的，直接返回nil
            "if (redis.call('hexists', KEYS[1], ARGV[3]) == 0) then " +
                "return nil;" +
            "end; " +
            // 通过hincrby更新hash表中锁的重入次数减一
            "local counter = redis.call('hincrby', KEYS[1], ARGV[3], -1); " +
            "if (counter > 0) then " +
                "redis.call('pexpire', KEYS[1], ARGV[2]); " +
                "return 0; " +
            "end; " +
            "redis.call('del', KEYS[1]); " +
            "local nextThreadId = redis.call('lindex', KEYS[2], 0); " + 
            "if nextThreadId ~= false then " +
                "redis.call('publish', KEYS[4] .. ':' .. nextThreadId, ARGV[1]); " +
            "end; " +
            "return 1; ",
        Arrays.asList(getRawName(), threadsQueueName, timeoutSetName, getChannelName()),
        LockPubSub.UNLOCK_MESSAGE, internalLockLeaseTime, getLockName(threadId), System.currentTimeMillis());
}
```
## 参数说明

- KEYS[1]: 我们指定的分布式锁的key，如本例中redissonClient.getFairLock("fairLock")的 "fairLock"
- KEYS[2]: 加锁等待队列的名称，redisson_lock_queue:{分布式锁key}。如本例中为： redisson_lock_queue:{fairLock}
- KEYS[3]: 等待队列中线程锁时间的set集合名称，redisson_lock_timeout:{分布式锁key}，是按照锁的时间戳存放到集合中的。如本例中为： redisson_lock_timeout:{fairLock}
- KEYS[4]: 释放锁时发布消息的channel通道，redisson_lock__channel:{分布式锁key}，。如本例中为： redisson_lock__channel:{fairLock}
- ARGV[1]: LockPubSub.UNLOCK_MESSAGE，就是常量0L
- ARGV[2]: 锁的超时时间，本例中为锁默认超时时间：30000毫秒（30秒）
- ARGV[3]: 【进程唯一ID + ":" + 线程ID】组合
- ARGV[4]: 当前系统时间戳

# 三、解锁lua脚本分析
## 第一部分：开启死循环，移除超时的那些线程
### 脚本分析
这一段跟公平锁加锁的第一部分一致，都是开启一个死循环，然后移除等待队列中超时的线程。
```java
"while true do "+ 
// 获取等待队列中第一个等待的线程
 "local firstThreadId2 = redis.call('lindex', KEYS[2], 0);"+ 
 "if firstThreadId2 == false then "+ 
    // 第一个等待线程为空，说明此时无人排队，直接跳出循环
     "break;"+ 
 "end; "+ 
// 从超时集合中获取第一个等待线程的分数，也就是超时时间戳
 "local timeout = tonumber(redis.call('zscore', KEYS[3], firstThreadId2));"+ 
// 如果第一个等待线程超时时间戳  小于等于 当前时间戳，说明已经超时了，需要从等待队列和超时集合中移除掉
 "if timeout <= tonumber(ARGV[4]) then "+ 
     "redis.call('zrem', KEYS[3], firstThreadId2); "+ 
     "redis.call('lpop', KEYS[2]); "+ 
 "else "+ 
    // 第一个等待线程尚未超时，直接跳出循环
    "break;"+ 
 "end; "+ 
"end;"+ 
```
### 主要流程：

1. 开启死循环；
2. 利用 lindex 命令判断等待队列中第一个元素是否存在，如果存在，直接跳出循环。核心代码：lidex redisson_lock_queue:{myLock} 0
3. 如果等待队列中第一个元素不为空（例如返回了LockName，即客户端UUID拼接线程ID），利用 zscore 在 超时记录集合(sorted set) 中获取对应的超时时间；核心代码：zscore redisson_lock_timeout:{myLock} UUID:threadId
4. 如果超时时间已经小于当前时间，那么首先从超时集合中移除该节点，接着也在等待队列中弹出第一个节点；
- 核心代码：zrem redisson_lock_timeout:{myLock} UUID:threadId
- 核心代码：lpop redisson_lock_queue:{myLock}
5. 如果等待队列中的第一个元素还未超时，直接退出死循环

## 第二部分：锁已经被释放，通知等待队列中第一个线程
### 场景分析

- 成功获取锁线程重复调用释放锁的方法，第二次释放时，锁已不存在，就去通知等待队列中的第一个元素
- 又或者一个极端场景：当前线程未能成功获取锁，但是调用了释放锁的方法，并且刚好此时锁被释放
```java
"if (redis.call('exists', KEYS[1]) == 0) then " +
    // 如果锁不存在，获取等待队列中第一个等待的线程
    "local nextThreadId = redis.call('lindex', KEYS[2], 0); " + 
    "if nextThreadId ~= false then " +
        // 如果等待队列中第一个等待线程不为空, 则通过publish发布一条消息，通知等待队列中第一个线程，锁已经被释放了
        // 注意，因为要支持公平获取锁，所以每个等待献策候给你订阅的channel通道是不同的。当某个线程释放锁的时候，只会往等待队列中第一个等待的线程对应的channel发送消息，也就是只通知排在最前面的那个线程去尝试获取锁
        "redis.call('publish', KEYS[4] .. ':' .. nextThreadId, ARGV[1]); " +
    "end; " +
    // 返回1
    "return 1; " +
"end;"
```
### 主要流程：

1. 利用 exists 命令判断锁是否存在；核心代码：exists myLock
2. 如果锁不存在，利用 lindex 获取等待队列中的第一个元素；核心代码：lindex redisson_lock_queue:{myLock} 0
3. 如果等待列表中第一个元素不为空，即还存在等待线程，往等待线程的订阅channel发送消息，通知其可以尝试获取锁了；核心代码：publish redisson_lock__channel:{myLock}:UUID:threadId 0

注意，RedissonLock 所有等待线程都是订阅锁的同一个channel：redisson_lock__channel:{myLock}，当有线程释放锁的时候，会往这个通道发送消息，此时所有等待现成都可以订阅消费这条消息，从而从等待状态中释放出来，重新尝试获取锁。

而 RedissonFairLock 不太一样，因为它要支持公平获取锁，即先到先得。所以每个等待线程订阅的都是不同的channel：redisson_lock__channel:{myLock}:UUID:threadId。当某个线程释放锁的时候，只会往等待队列中第一个线程对应订阅的channel发送消息

## 第三部分：释放锁
```java
// 判断当前释放的锁是不是自己的，如果不是自己的，直接返回nil
"if (redis.call('hexists', KEYS[1], ARGV[3]) == 0) then " +
    "return nil;" +
"end; " +
// 通过hincrby更新hash表中锁的重入次数减一
"local counter = redis.call('hincrby', KEYS[1], ARGV[3], -1); " +
// 如果减一后的数大于0，说明还未完全释放掉锁, 则重置超时时间, 返回0
"if (counter > 0) then " +
    "redis.call('pexpire', KEYS[1], ARGV[2]); " +
    "return 0; " +
"end; " +
// 如果减一后的数等于0，说明已经完全释放锁了，则需要删除对应的锁, 并通知等待队列中的第一个线程尝试获取锁即可, 返回1
"redis.call('del', KEYS[1]); " +
"local nextThreadId = redis.call('lindex', KEYS[2], 0); " + 
"if nextThreadId ~= false then " +
    "redis.call('publish', KEYS[4] .. ':' .. nextThreadId, ARGV[1]); " +
"end; " +
"return 1; "
```
### 主要流程

1. 利用 hexists 命令判断加锁记录集合中，是否存在当前客户端当前线程，如果加锁记录不存在当前线程，返回nil；hexists myLock UUID:threadId，主要是兼容当前线程未能成功获取锁，但是调用了释放锁的方法
2. 利用 hincrby 扣减当前线程的加锁次数；核心代码：hincrby myLock UUID:threadId -1
3. 如果扣减后次数还是大于0，证明是重复获取锁，所以此时只需要重新刷新锁的过期时间，然后返回0；核心代码：expire myLock 30000
4. 如果扣减后次数还是等于0，证明当前线程持有锁，并且只加锁一次，则利用 del 命令删除锁对应 redis key；核心代码：del myLock
5. 往等待线程的订阅channel发送消息，通知等待队列中第一个线程可以尝试获取锁了；
   1. 利用 lindex 获取等待队列中的第一个线程，核心代码：lindex redisson_lock_queue:{myLock} 0
   2. 利用订阅channel给等待线程发送通知，核心代码：publish redisson_lock__channel:{myLock}:UUID:threadId 0
6. 跟RedissonLock一致，释放锁之后，还需要执行取消看门狗定时任务等逻辑



# 一、前言

Redisson 除了提供了分布式锁之外，还额外提供了同步组件，Semaphore 和 CountDownLatch

# 二、Semaphore

RSemaphore基于 Redis 的[Semaphore](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/Semaphore.html?is-external=true)开发。使用RSemaphore获取资源的顺序是不可预测的，所以它是一种非公平锁。可以理解为分布式的信号量，它的作用是用来**限制同时访问共享区域的线程数量。**意思就是在分布式场景下，假设只有 3 个凭证，也就意味着同时只会有三个线程执行业务
![image.png](https://cdn.nlark.com/yuque/0/2023/png/34922072/1682046716787-8e7ee5eb-9b20-41e8-bdce-83231cb3b2cc.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_28%2Ctext_5p2O5pyJ5Lm-%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10#averageHue=%23f4f4f4&clientId=u95ca8ec8-d231-4&from=paste&height=475&id=u12ecf802&originHeight=421&originWidth=984&originalType=binary&ratio=2&rotation=0&showTitle=false&size=38955&status=done&style=none&taskId=ufcab31c0-9efd-4e15-9402-ff7d9f71066&title=&width=1110)

## 常见方法总结
| Modifier and Type | Method | Description |
| --- | --- | --- |
| void | acquire() | 获取1个permit. |
| void | acquire(int permits) | 获取定义数量的permits. |
| void | addPermits(int permits) | 按定义的值增加或减少可用许可证的数量 |
| int | availablePermits() | 返回可用许可证的数量 |
| int | drainPermits() | 获取并返回所有立即可用的许可证 |
| void | release() | 释放1个permit. |
| void | release(int permits) | 释放定义数量的permits. |
| boolean | tryAcquire() | 尝试获取当前可用的许可证。 |
| boolean | tryAcquire(int permits) | 尝试获取定义数量的permits。 |
| boolean | tryAcquire(int permits, long waitTime, TimeUnit unit) | 尝试获取定义数量的permits。如果获取不到，就一直等待，直到获取到指定数量的permits。最长等待waitTime时间 |
| boolean | tryAcquire(long waitTime, TimeUnit unit) | 尝试获取1个permit。如果获取不到，就一直等待，直到成功获取1个permit。最长等待waitTime时间 |
| boolean | trySetPermits(int permits) | 尝试设置许可证数量 |


## trySetPermits设置凭证解析
```java
public class RedissonSemaphore extends RedissonExpirable implements RSemaphore {
    @Override
    public boolean trySetPermits(int permits) {
        return get(trySetPermitsAsync(permits));
    }
    
    @Override
    public RFuture<Boolean> trySetPermitsAsync(int permits) {
        return commandExecutor.evalWriteAsync(getName(), LongCodec.INSTANCE, RedisCommands.EVAL_BOOLEAN,
            "local value = redis.call('get', KEYS[1]); " +
            "if (value == false or value == 0) then "
                + "redis.call('set', KEYS[1], ARGV[1]); "
                + "redis.call('publish', KEYS[2], ARGV[1]); "
                + "return 1;"
            + "end;"
            + "return 0;",
            Arrays.<Object>asList(getName(), getChannelName()), permits);
    }
}
```
若我们设置3个信号量，那么执行流程为：

1. get semaphore，获取到semaphore信号量的当前的值
2. 第一次数据若为0， 则使用set semaphore 3，将这个信号量同时能够允许获取锁的客户端的数量设置为3

（注意到，如果之前设置过了信号量，将无法再次设置，直接返回0。想要更改信号量总数可以使用addPermits方法）然后redis发布消息，返回1

 参数说明

1. KEYS[1]：指定的 key 是semaphore
2. KEYS[2]：redisson_sc:{semaphore}
3. ARGV[1]：凭证数 3

## acquire获取凭证解析
```java
public class RedissonSemaphore extends RedissonExpirable implements RSemaphore {
    @Override
    public void acquire(int permits) throws InterruptedException {
        if (tryAcquire(permits)) {
            return;
        }
 
        RFuture<RedissonLockEntry> future = subscribe();
        commandExecutor.syncSubscription(future);
        try {
            while (true) {
                if (tryAcquire(permits)) {
                    return;
                }
 
                getEntry().getLatch().acquire(permits);
            }
        } finally {
            unsubscribe(future);
        }
//        get(acquireAsync(permits));
    }
 
    @Override
    public boolean tryAcquire(int permits) {
        return get(tryAcquireAsync(permits));
    }
 
 
    @Override
    public RFuture<Boolean> tryAcquireAsync() {
        return tryAcquireAsync(1);
    }
    
    @Override
    public RFuture<Boolean> tryAcquireAsync(int permits) {
        if (permits < 0) {
            throw new IllegalArgumentException("Permits amount can't be negative");
        }
        if (permits == 0) {
            return RedissonPromise.newSucceededFuture(true);
        }
 
        return commandExecutor.evalWriteAsync(getName(), LongCodec.INSTANCE, RedisCommands.EVAL_BOOLEAN,
              "local value = redis.call('get', KEYS[1]); " +
              "if (value ~= false and tonumber(value) >= tonumber(ARGV[1])) then " +
                  "local val = redis.call('decrby', KEYS[1], ARGV[1]); " +
                  "return 1; " +
              "end; " +
              "return 0;",
              Collections.<Object>singletonList(getName()), permits);
    }
}
```
执行流程为：

1. get semaphore，获取到一个当前的值
2. decrby semaphore 1，如果值大于等于 1（要获取的凭证数），对值进行递减。成功返回 1，失败返回 0

参数列表：

1. KEYS[1]：指定的 key 这里叫 semaphore
2. ARGV[1]：要获取的凭证数，默认 1

## release释放凭证解析
```java
public class RedissonSemaphore extends RedissonExpirable implements RSemaphore {
    @Override
    public void release(int permits) {
        get(releaseAsync(permits));
    }
    
    @Override
    public RFuture<Void> releaseAsync() {
        return releaseAsync(1);
    }
    
    @Override
    public RFuture<Void> releaseAsync(int permits) {
        if (permits < 0) {
            throw new IllegalArgumentException("Permits amount can't be negative");
        }
        if (permits == 0) {
            return RedissonPromise.newSucceededFuture(null);
        }
 
        return commandExecutor.evalWriteAsync(getName(), StringCodec.INSTANCE, RedisCommands.EVAL_VOID,
            "local value = redis.call('incrby', KEYS[1], ARGV[1]); " +
            "redis.call('publish', KEYS[2], value); ",
            Arrays.<Object>asList(getName(), getChannelName()), permits);
    }
}
```
释放凭证直接对 Redis key 的值进行自增即可，每次一个客户端释放掉这个锁的话，就会将信号量的值累加1，信号量的值就不是0了




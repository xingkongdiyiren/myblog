# 一、可重入锁（Reentrant Lock）介绍

基于Redis的Redisson分布式可重入锁RLock，Java对象实现了java.util.concurrent.locks.Lock接口。同时还提供了异步（Async）、反射式（Reactive）和RxJava2标准的接口，常见使用案例如下：
```java
RLock lock = redisson.getLock("anyLock");
// 最常见的使用方法
lock.lock();
```
Redisson同时还为分布式锁提供了异步执行的相关方法：
```java
RLock lock = redisson.getLock("anyLock");
lock.lockAsync();
lock.lockAsync(10, TimeUnit.SECONDS);
Future<Boolean> res = lock.tryLockAsync(100, 10, TimeUnit.SECONDS);
```
RLock对象完全符合Java的Lock规范。也就是说只有拥有锁的进程才能解锁，其他进程解锁则会抛出IllegalMonitorStateException错误。但是如果遇到需要其他进程也能解锁的情况，则需要使用分布式信号量Semaphore 对象
# 二、大白话理解RedissonLock

分布式系统里面，如果多个机器上的服务要同时对一个共享资源（比如说修改数据库里的一份数据），此时的话，某台机器就需要先获取一个针对那个资源（数据库里的某一行数据）的分布式锁

获取到了分布式锁之后，就可以任由你查询那条数据，修改那条数据，在这个期间，没有任何其他的客户端可以来修改这条数据，获取了一个分布式锁之后，就对某个共享的数据获取了一定时间范围内的独享的操作

其他的客户端如果同时要修改那条数据，尝试去获取分布式锁，就会被卡住，他需要等待第一个客户端先操作完了之后释放锁

而在redisson在客户端里实现了一个看门狗，watchdog，主要是监控持有一把锁的客户端是否还存活着，如果还存活着，那么看门狗会不断的延长这个锁的过期时间

可以指定一个leaseTime，你获取了一把锁之后，可能你在锁定的期间，执行的操作特别的耗时，可能长达10分钟，1个小时。你就可以在获取锁的时候指定一个leaseTime，比如说，指定好，如果我自己1分钟之内没释放这把锁，redisson自动释放这把锁，让别的客户端可以获取锁来做一些操作。
```java
// Acquire lock and release it automatically after 10 seconds
// if unlock method hasn't been invoked
lock.lock(10, TimeUnit.SECONDS);

// Wait for 100 seconds and automatically unlock it after 10 seconds
boolean res = lock.tryLock(100, 10, TimeUnit.SECONDS);
lock.unlock();
```
客户端A已经获取了一把锁，此时客户端B尝试去获取这把锁，默认情况下是无限制的等待，但是这里你在获取锁的时候是可以指定一个时间的，最多等待100秒的时间

如果获取不到锁直接就返回，boolean res，这个res如果是false就代表你加锁失败了，在指定时间范围内，没有获取到锁 如果获取到了锁之后，在10秒之内，没有手动释放锁，那么就自动释放锁
```java

RLock lock = redisson.getLock("anyLock");
lock.lockAsync();
lock.lockAsync(10, TimeUnit.SECONDS);
Future<Boolean> res = lock.tryLockAsync(100, 10, TimeUnit.SECONDS);
```
如果是lock.lock()方法，是属于同步加锁，在这些代码执行的期间，如果等待锁什么的，都会被阻塞住，lock.lockAsync()，异步加锁，用了其他的线程去进行加锁，不会阻塞你当前主线程的执`Future<Boolean> res`，不断的去查询这个feture对象的一些状态，看看异步加锁是否成功

你用哪个线程去加一把分布式锁，就必须用那个线程来对分布式锁进行释放，否则如果用不同的线程，会导致IllegalMonitorStateException

# 三、加锁小结

基本都是基于 lua 脚本来完成的
因为分布式锁肯定是具有比较复杂的判断逻辑，而lua脚本可以保证复杂判断和复杂操作的原子性，加锁主要步骤如下：

1. 处理加锁Lua脚本
2. 根据Key计算出slot，找到执行Lua脚本的节点
3. 若是没有传入过期时间，默认启用看门狗续命持有锁

## 主要的加锁主逻辑源码
```java
private <T> RFuture<Long> tryAcquireAsync(long leaseTime, TimeUnit unit, final long threadId) {
    if (leaseTime != -1L) {
        return this.tryLockInnerAsync(leaseTime, unit, threadId, RedisCommands.EVAL_LONG);
    } else {
    
        RFuture<Long> ttlRemainingFuture = this.tryLockInnerAsync(
            this.commandExecutor.getConnectionManager().getCfg().getLockWatchdogTimeout(),
            TimeUnit.MILLISECONDS, threadId, RedisCommands.EVAL_LONG);
    
        ttlRemainingFuture.addListener(new FutureListener<Long>() {
            public void operationComplete(Future<Long> future) throws Exception {
                if (future.isSuccess()) {
                    Long ttlRemaining = (Long)future.getNow();
                    if (ttlRemaining == null) {
                        RedissonLock.this.scheduleExpirationRenewal(threadId);
                    }

                }
            }
        });
        return ttlRemainingFuture;
    }
}
```
## 主要的加锁动作，执行Lua脚本
```java
<T> RFuture<T> tryLockInnerAsync(long leaseTime, TimeUnit unit, long threadId, RedisStrictCommand<T> command) {
    this.internalLockLeaseTime = unit.toMillis(leaseTime);
    return this.commandExecutor.evalWriteAsync(
        this.getName(), LongCodec.INSTANCE, command,
        "if (redis.call('exists', KEYS[1]) == 0) then " +
              "redis.call('hset', KEYS[1], ARGV[2], 1); " +
              "redis.call('pexpire', KEYS[1], ARGV[1]); " +
              "return nil; " +
          "end; " +
          "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
              "redis.call('hincrby', KEYS[1], ARGV[2], 1); " +
              "redis.call('pexpire', KEYS[1], ARGV[1]); " +
              "return nil; " +
          "end; " +
          "return redis.call('pttl', KEYS[1]);"
        Collections.singletonList(this.getName()),
        new Object[]{this.internalLockLeaseTime, this.getLockName(threadId)});
}
```

- 第一个IF 判断一下，如果“anyLock”这个key不存在，那么就进行加锁
   - 设置一个key value，相当于有一个anyLock的map结构，同时在map里面放着一对kv
   - pexpire KEYS[1] ARGV[1]，其实就是设置一个key的过期时间
- 第二个IF 判断KEYS[1]（anyLock）这个名字的一个map，里面是否存在一个ARGV[2]的一个key
   - 如果是存在的话，hincrby KEYS[1] ARGV[2] 1，将anyLock这个map中的这个key的值累加1
   - pexpire KEYS[1] ARGV[1]，其实就是重新设置key的过期时间
- pttl指令，就是返回anyLock这个key当前还剩下的一个有效的存活期

## 根据锁key计算出 slot，一个slot对应的是redis集群的一个节点
需要先找到当前锁key需要存放到哪个slot，即在集群中哪个节点进行操作，后续不同客户端或不同线程再使用这个锁key进行上锁，也需要到对应的节点的slot中进行加锁操作
```java
@Override
public <T, R> RFuture<R> evalWriteAsync(String key, Codec codec, RedisCommand<T> evalCommandType, String script, List<Object> keys, Object... params) {
    // 根据锁key找到对应的redis节点
    NodeSource source = getNodeSource(key);
    return evalAsync(source, false, codec, evalCommandType, script, keys, params);
}

private NodeSource getNodeSource(String key) {
    // 计算锁key对应的slot
    int slot = connectionManager.calcSlot(key);
    return new NodeSource(slot);
}

public int calcSlot(String key) {
    if (key == null) {
        return 0;
    }

    int start = key.indexOf('{');
    if (start != -1) {
        int end = key.indexOf('}');
        key = key.substring(start+1, end);
    }
    // 使用 CRC16 算法来计算 slot，其中 MAX_SLOT 就是 16384，redis集群规定最多有 16384 个slot。
    int result = CRC16.crc16(key.getBytes()) % MAX_SLOT;
    log.debug("slot {} for {}", result, key);
    return result;
}
```
## watchdog看门狗监听延长锁
加锁完成后给RFuture加了一个监听器，也就是说只要这个lua脚本执行完成，返回了pttl anyLock那个指令返回的一个剩余存活的时间之后，这个RFuture的监听器就会被触发执行的
```java
RFuture<Long> ttlRemainingFuture = 
    			this.tryLockInnerAsync(
                    	this.commandExecutor.getConnectionManager().getCfg().getLockWatchdogTimeout(),
                    	TimeUnit.MILLISECONDS, threadId, RedisCommands.EVAL_LONG);

ttlRemainingFuture.addListener(
    new FutureListener<Long>() {
    public void operationComplete(Future<Long> future) throws Exception {
        if (future.isSuccess()) {
            Long ttlRemaining = (Long)future.getNow();
            if (ttlRemaining == null) {
                RedissonLock.this.scheduleExpirationRenewal(threadId);
            }

        }
    }
});
```
创建了一个定时任务task，也就是10秒左右，当成功加锁之后开启定时调度的任务，初次执行是在10秒以后，这个定时任务会存储在一个ConcurrentHashMap对象expirationRenewalMap中，如果发现expirationRenewalMap中不存在对应当前线程key的话，定时任务就不会跑，这也是后面解锁中的一步重要操作
```java

private void scheduleExpirationRenewal(final long threadId) {
    if (!expirationRenewalMap.containsKey(this.getEntryName())) {
        
        Timeout task = 
            this.commandExecutor.getConnectionManager()
            	.newTimeout(new TimerTask() {
                    
                    public void run(Timeout timeout) throws Exception {
                        RFuture<Boolean> future = 
                        		RedissonLock.this.renewExpirationAsync(threadId);
                        
                        future.addListener(new FutureListener<Boolean>() {
                            public void operationComplete(Future<Boolean> future) throws Exception {
                                RedissonLock.expirationRenewalMap.remove(RedissonLock.this.getEntryName());
                                if (!future.isSuccess()) {
                                    RedissonLock.log.error("Can't update lock " + RedissonLock.this.getName() + " expiration", future.cause());
                                } else {
                                    if ((Boolean)future.getNow()) {
                                        RedissonLock.this.scheduleExpirationRenewal(threadId);
                                    }
        
                                }
                            }
                        });
                    }
        }, this.internalLockLeaseTime / 3L, TimeUnit.MILLISECONDS);
        
        if (expirationRenewalMap.putIfAbsent(this.getEntryName(), new RedissonLock.ExpirationEntry(threadId, task)) != null) {
            task.cancel();
        }
    }
}

//RFuture<Boolean> future = renewExpirationAsync(threadId);
protected RFuture<Boolean> renewExpirationAsync(long threadId) {
    return this.commandExecutor.evalWriteAsync(
    		this.getName(), LongCodec.INSTANCE, 
    			RedisCommands.EVAL_BOOLEAN,
                "if (redis.call('hexists', KEYS[1], ARGV[2]) == 1) then " +
                "redis.call('pexpire', KEYS[1], ARGV[1]); " +
                "return 1; " +
            	"end; " +
            	"return 0;"
	)   
}
```
## 加锁操作流程图
![image.png](https://cdn.nlark.com/yuque/0/2023/png/34922072/1681702031706-5247ba21-da0e-4221-9cf7-6642e5decb7a.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_44%2Ctext_5p2O5pyJ5Lm-%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10#averageHue=%23fbfbfb&clientId=u550b0629-c693-4&from=paste&height=458&id=u16d58eb3&originHeight=700&originWidth=1552&originalType=binary&ratio=2&rotation=0&showTitle=false&size=314170&status=done&style=none&taskId=ue0ab6e29-c019-4e04-a3d5-bdfa20066ea&title=&width=1016)
## 其他的线程或者是其他客户端也加锁处理情况
如果说客户端A已经上锁了，还持有着这把锁，此时客户端B尝试加锁，此时就会直接执行pttl anyLock指令，返回这个key剩余的一个存活时间
![image.png](https://cdn.nlark.com/yuque/0/2023/png/34922072/1681702719072-452a3aa9-2214-40a3-accd-9cdebc4672a6.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_44%2Ctext_5p2O5pyJ5Lm-%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10#averageHue=%23fbfbfb&clientId=u550b0629-c693-4&from=paste&height=450&id=u57b99315&originHeight=702&originWidth=1552&originalType=binary&ratio=2&rotation=0&showTitle=false&size=162037&status=done&style=none&taskId=u71c2d9d2-c006-4426-900e-88918a9a337&title=&width=995)
如果是第一次获取锁的时候就会获取结果Null，ttl一定是null；如果是一个线程多次加锁，可重入锁的概念，此时ttl也一定是null，lua脚本里返回的就是nil；但是如果加锁没成功，锁被其他机器占用了，执行lua脚本直接获取到的是这个key对应的剩余时间
```java
if (ttl != null) {
    RFuture<RedissonLockEntry> future = this.subscribe(threadId);
    this.commandExecutor.syncSubscription(future);

    try {
        while(true) {
            ttl = this.tryAcquire(leaseTime, unit, threadId);
            if (ttl == null) {
                return;
            }

            if (ttl >= 0L) {
                this.getEntry(threadId).getLatch().tryAcquire(ttl, TimeUnit.MILLISECONDS);
            } else {
                this.getEntry(threadId).getLatch().acquire();
            }
        }
    } finally {
        this.unsubscribe(future, threadId);
    }
}
```
如果加锁不成功，直接会进入while(true)就是一个死循环内，在死循环内，再次执行尝试去获取这个分布式的锁，如果获取到了锁，证明ttl是null，此时就会退出死循环，如果ttl大于等于0，说明其他的客户端还是占据着这把锁。如果没有获取到一把分布式锁，可能就是等待那个ttl指定的时间，再次去尝试获取那把锁
# 四、释放锁小结

基本都是基于 lua 脚本来完成的
因为分布式锁肯定是具有比较复杂的判断逻辑，而lua脚本可以保证复杂判断和复杂操作的原子性，解锁主要步骤如下：

1. 处理解锁Lua脚本
2. 根据Key计算出slot，找到执行Lua脚本的节点
3. 解锁成功，取消看门狗任务

## 主要的解锁主逻辑源码
```java
public void unlock() {
    try {
        this.get(this.unlockAsync(Thread.currentThread().getId()));
    } catch (RedisException var2) {
        if (var2.getCause() instanceof IllegalMonitorStateException) {
            throw (IllegalMonitorStateException)var2.getCause();
        } else {
            throw var2;
        }
    }
}
```
## 主要的解锁动作，执行Lua脚本
```java
protected RFuture<Boolean> unlockInnerAsync(long threadId) {
    return this.commandExecutor.evalWriteAsync(
    		this.getName(), LongCodec.INSTANCE, RedisCommands.EVAL_BOOLEAN,
    		"if (redis.call('exists', KEYS[1]) == 0) then " +
                    "redis.call('publish', KEYS[2], ARGV[1]); " +
                    "return 1; " +
            "end;" +
            "if (redis.call('hexists', KEYS[1], ARGV[3]) == 0) then " +
                "return nil;" +
            "end; " +
            "local counter = redis.call('hincrby', KEYS[1], ARGV[3], -1); " +
            "if (counter > 0) then " +
                "redis.call('pexpire', KEYS[1], ARGV[2]); " +
                "return 0; " +
            "else " +
                "redis.call('del', KEYS[1]); " +
                "redis.call('publish', KEYS[2], ARGV[1]); " +
                "return 1; "+
            "end; " +
            "return nil;",
    		Arrays.asList(this.getName(), this.getChannelName()),
    			new Object[]{
                    		LockPubSub.unlockMessage,
                    		this.internalLockLeaseTime,
                    		this.getLockName(threadId)
                }
		);
}
```

- 第一IF 如果anyLock这个key不存在，则进行订阅通知
   - publish 告诉其它订阅了这把锁的线程，我已经释放锁了，可以过来获取
   - 释放锁成功，返回1
- 第二IF 判断一下当前这个锁key对应的hash数据结构中，判断锁是不是自己的
   - 如果不是自己的锁，说明非法释放锁，返回nil
## 取消watchdog任务

当线程完全释放锁后，就会调用cancelExpirationRenewal()方法取消"看门狗"的续时线程，引用expirationRenewalMap中进行取消
```java
void cancelExpirationRenewal(Long threadId) {
    RedissonLock.ExpirationEntry task = (RedissonLock.ExpirationEntry)expirationRenewalMap.get(this.getEntryName());
    if (task != null && (threadId == null || task.getThreadId() == threadId)) {
        expirationRenewalMap.remove(this.getEntryName());
        task.getTimeout().cancel();
    }
}
```

## 释放锁流程图
![image.png](https://cdn.nlark.com/yuque/0/2023/png/34922072/1681703518051-d36387b6-39f8-4d74-9b1a-43805dfcf623.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_20%2Ctext_5p2O5pyJ5Lm-%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10#averageHue=%23f8f8f8&clientId=u550b0629-c693-4&from=paste&height=733&id=u2babd912&originHeight=481&originWidth=700&originalType=binary&ratio=2&rotation=0&showTitle=false&size=35333&status=done&style=none&taskId=u871b080c-b34d-40b6-bc5b-79bd9e27b82&title=&width=1067)



# 五、可重入锁的特征总结
加锁，释放锁，以及lock的方式进行枷锁，tryLock的方式进行加锁，可以接下来做一个总结：
（1）加锁：在redis里设置hash数据结构，生存周期是30000毫秒
（2）维持加锁：代码里一直加锁，redis里的key会一直保持存活，后台每隔10秒的定时任务（watchdog）不断的检查，只要客户端还在加锁，就刷新key的生存周期为30000毫秒
（3）可重入锁：同一个线程可以多次加锁，就是在hash数据结构中将加锁次数累加1
（4）锁互斥：不同客户端，或者不同线程，尝试加锁陷入死循环等待
（5）手动释放锁：可重入锁自动递减加锁次数，全部释放锁之后删除锁key
（6）宕机自动释放锁：如果持有锁的客户端宕机了，那么此时后台的watchdog定时调度任务也没了，不会刷新锁key的生存周期，此时redis里的锁key会自动释放
（7）尝试加锁超时：在指定时间内没有成功加锁就自动退出死循环，标识本次尝试加锁失败
（8）超时锁自动释放：获取锁之后，在一定时间内没有手动释放锁，则redis里的key自动过期，自动释放锁

# 六、结合可重入锁来进行分布式锁隐患问题

redis加锁，本质还是在redis集群中挑选一个master实例来加锁，master -> slave，实现了高可用的机制，如果master宕机，slave会自动切换为master

假设客户端刚刚在master写入一个锁，此时发生了master的宕机，但是master还没来得及将那个锁key异步同步到slave，slave就切换成了新的master。此时别的客户端在新的master上也尝试获取同一个锁，会成功获取锁

此时两个客户端，都会获取同一把分布式锁，可能有的时候就会导致一些数据的问题，redisson的分布式锁，隐患主要就是在这里

# 七、可重入锁细节解析文章
[04_redis分布式锁（一）：可重入锁源码剖析之使用场景介绍](https://www.yuque.com/zhzbaishen/ldbu6i/ccvrudpg97rm6rnv)
[05_redis分布式锁（二）：可重入锁源码剖析之lua脚本加锁逻辑](https://www.yuque.com/zhzbaishen/ldbu6i/ui0qek7gt4dnb9ft)
[06_redis分布式锁（三）：可重入锁源码剖析之watchdog维持加锁](https://www.yuque.com/zhzbaishen/ldbu6i/fycg94qudpatnrn6)
[07_redis分布式锁（四）：可重入锁源码剖析之可重入加锁](https://www.yuque.com/zhzbaishen/ldbu6i/apx46qdrz1l9871h)
[08_redis分布式锁（五）：可重入锁源码剖析之锁的互斥阻塞](https://www.yuque.com/zhzbaishen/ldbu6i/hd8fybenlnyk0i1q)
[09_redis分布式锁（六）：可重入锁源码剖析之释放锁](https://www.yuque.com/zhzbaishen/ldbu6i/xvm6z70qu9z3e8em)
[10_redis分布式锁（七）：可重入锁源码剖析之获取锁超时与自动释放](https://www.yuque.com/zhzbaishen/ldbu6i/xfnegr1t1i32z20v)


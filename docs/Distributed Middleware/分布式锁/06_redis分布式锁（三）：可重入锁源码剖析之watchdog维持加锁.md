# 一、前言回顾
![image.png](https://cdn.nlark.com/yuque/0/2023/png/34922072/1681356251553-d67fdb18-af92-4bb7-87b5-849f02822774.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_47%2Ctext_5p2O5pyJ5Lm-%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10#averageHue=%23fcfcfc&clientId=ueaf1829a-e15a-4&from=paste&height=412&id=u8bd21bc9&originHeight=824&originWidth=1638&originalType=binary&ratio=2&rotation=0&showTitle=false&size=84663&status=done&style=none&taskId=ud96113f3-a2d7-41ca-a483-a28282560c0&title=&width=819)
我们前一篇文章分析出来大概就知道加锁的逻辑是：会执行一段lua脚本，并且将加锁的那段lua脚本，放到redis://localhost:6382这个master实例上去执行，完成加锁的操作

同时会产生出疑问：如果某个客户端上锁了之后，可能过了5分钟，10分钟，都没释放掉这个锁，那么会怎么样呢？锁对应的key刚开始的生存周期其实就是30秒而已，难道是默认情况下30秒后这个锁就自动释放？？？

前篇文章入口：[05_redis分布式锁（二）：可重入锁源码剖析之lua脚本加锁逻辑](https://lyqian.yuque.com/org-wiki-lyqian-zm3pdh/nhmyrc/gm2i82z9guf3i7e9)
# 二、watchdog监听延长锁

从源码的层面，接着往下看一下，如果成功的对某个key加锁了之后，watchdog是如何去延长一下那个key的生存时间的？回到我们加锁的lua脚本
```java
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
```
我们提到过lua脚本最后返回的是当前这个key对应的一个剩余的存活时间，单位是毫秒，pttl anyLock这个命令所返回的，执行完加锁操作后同时给到我们RFuture接受返回值
```java
private <T> RFuture<Long> tryAcquireAsync(long leaseTime, TimeUnit unit, final long threadId) {
    if (leaseTime != -1L) {
        return this.tryLockInnerAsync(leaseTime, unit, threadId, RedisCommands.EVAL_LONG);
    } else {
    
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
        return ttlRemainingFuture;
    }
}
```
这里给那个RFuture加了一个监听器，也就是说只要这个lua脚本执行完成，返回了pttl anyLock那个指令返回的一个剩余存活的时间之后，这个RFuture的监听器就会被触发执行的，看看里面的代码
```java
public void operationComplete(Future<Long> future) throws Exception {
    if (future.isSuccess()) {
        Long ttlRemaining = (Long)future.getNow();
        if (ttlRemaining == null) {
            RedissonLock.this.scheduleExpirationRenewal(threadId);
        }

    }
}
```
如果那段加锁的lua脚本执行失败的话，那么这里就不是success，相当于是基于redis加锁失败了，正常情况下，ttlRemaining，也就是pttl那个指令返回的值

那么为什么ttlRemaining == null？因为加锁成功后返回的是nil，这是lua脚本的返回形式，体现到java代码中当然就是得到null，所以if (ttlRemaining == null)就成立了，往下往scheduleExpirationRenewal走
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
```
可以看到在方法scheduleExpirationRenewal中创建了一个定时任务task，之前我们知道internalLockLeaseTime，默认是30000毫秒，除以3之后，就是10000毫秒，也就是10秒左右，当你成功加锁之后开启定时调度的任务，初次执行是在10秒以后

这个定时任务会存储在一个ConcurrentHashMap对象expirationRenewalMap中，存储的key就为“线程ID:key名称”，如果发现expirationRenewalMap中不存在对应当前线程key的话，定时任务就不会跑，这也是后面解锁中的一步重要操作

那这个定时任务到底在干什么呢？为什么获取锁成功要开启一个定时任务呢？点进去我们继续看：
```java
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
将我们之前分析的key和params数组，带入进去可以知道 hexists anyLock 8e6b27a7-5346-483a-b9b5-0957c690c27f:1，执行这行指令，看下anyLock这个map中，是否存在8e6b27a7-5346-483a-b9b5-0957c690c27f:1这个key

如果存在的话，那么就说明锁还是持有的，还没过期此时就需要去执行一行命令：pexpire anyLock 30000，也就是说将anyLock的生存时间重新设置为30000毫秒，也就是30秒

也就是说此时anyLock这个key已经存在了超过10秒了，30秒，生存时间就剩下20秒了
但是因为他里面的那个8e6b27a7-5346-483a-b9b5-0957c690c27f:1还存在，说明客户端还持有着这把锁，所以他就会延长一下生存时间，anyLock这个key的生存时间重新变为30秒，再次开始

接下来我们就可以得出结论：只要你的anyLock这个锁还被当前的这个客户端的这个线程持有了锁，redis里的那个数据还存在，那么就靠这个定时调度的任务，就可以不断的刷新anyLock的生存时间，保证说，你的客户端只要一直持有这把锁，那么他对应的redis里的key，也会一直保持存在，不会过期的
![image.png](https://cdn.nlark.com/yuque/0/2023/png/34922072/1681359476255-0825698a-53b4-4cba-9868-2f3c7f727278.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_67%2Ctext_5p2O5pyJ5Lm-%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10#averageHue=%23fafaf9&clientId=ueaf1829a-e15a-4&from=paste&height=527&id=u623f0853&originHeight=1054&originWidth=2336&originalType=binary&ratio=2&rotation=0&showTitle=false&size=626397&status=done&style=none&taskId=uaa84d4ad-2366-4ff7-80a5-6834efae41c&title=&width=1168)
同时可以看到代码里对Task又做了一次结果的监听，若失败则日志输出，若成功则继续又进入这个方法里
```java
RFuture<Boolean> future = RedissonLock.this.renewExpirationAsync(threadId);

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
```
 
现在我们算是已经知道了客户端是如何维持加锁的了，就是通过一个后台定时任务、每隔10s定时检查key如果存在，就为它自动续期30s

# 三、如果持有锁的那台机器宕机了呢？

若那台机器如果宕机了以后，就会导致那台机器上的lock wathdog，就是那个每隔10秒执行一次的定时任务，那个任务就不会执行了

不执行以后，那个anyLock那个锁的key自动就会在30秒以内自动过期，释放掉这把锁。此时其他的客户端最多就是再等待30秒就可以获取到这把锁了




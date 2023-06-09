
# 一、Redission分布式锁
Redission提供分布式锁和同步器：
可重入锁（Reentrant Lock）公平锁（Fair Lock）、联锁（MultiLock）、红锁（RedLock）、读写锁（ReadWriteLock）、信号量（Semaphore）、可过期性信号量（PermitExpirableSemaphore）和闭锁（CountDownLatch）

# 二、可重入锁（Reentrant Lock）
基于Redis的Redisson分布式可重入锁RLock，Java对象实现了java.util.concurrent.locks.Lock接口。同时还提供了异步（Async）、反射式（Reactive）和RxJava2标准的接口
```java
RLock lock = redisson.getLock("anyLock");
// 最常见的使用方法
lock.lock();
```
大家都知道，如果负责储存这个分布式锁的Redisson节点宕机以后，而且这个锁正好处于锁住的状态时，这个锁会出现锁死的状态

为了避免这种情况的发生，Redisson内部提供了一个监控锁的看门狗，它的作用是在Redisson实例被关闭前，不断的延长锁的有效期

默认情况下，看门狗的检查锁的超时时间是30秒钟，也可以通过修改Config.lockWatchdogTimeout来另行指定。另外Redisson还通过加锁的方法提供了leaseTime的参数来指定加锁的时间。超过这个时间后锁便自动解开了
```java
// 加锁以后10秒钟自动解锁
// 无需调用unlock方法手动解锁
lock.lock(10, TimeUnit.SECONDS);

// 尝试加锁，最多等待100秒，上锁以后10秒自动解锁
boolean res = lock.tryLock(100, 10, TimeUnit.SECONDS);
if (res) {
    try {
        ...
    } finally {
        lock.unlock();
    }
}
```
Redisson同时还为分布式锁提供了异步执行的相关方法：
```java
RLock lock = redisson.getLock("anyLock");
lock.lockAsync();
lock.lockAsync(10, TimeUnit.SECONDS);
Future<Boolean> res = lock.tryLockAsync(100, 10, TimeUnit.SECONDS);
```
RLock对象完全符合Java的Lock规范。也就是说只有拥有锁的进程才能解锁，其他进程解锁则会抛出IllegalMonitorStateException错误。但是如果遇到需要其他进程也能解锁的情况，请使用分布式信号量Semaphore 对象

# 三、大白话理解
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

如果是lock.lock()方法，是属于同步加锁，在这些代码执行的期间，如果等待锁什么的，都会被阻塞住，lock.lockAsync()，异步加锁，用了其他的线程去进行加锁，不会阻塞你当前主线程的执`Future<Boolean>` res，不断的去查询这个feture对象的一些状态，看看异步加锁是否成功

你用哪个线程去加一把分布式锁，就必须用那个线程来对分布式锁进行释放，否则如果用不同的线程，会导致IllegalMonitorStateException


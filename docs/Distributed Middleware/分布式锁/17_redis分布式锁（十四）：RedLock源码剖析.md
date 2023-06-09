# 一、问题回顾

## 基于reids实现分布式锁 

redis（remote dictionary server）是一个k-v存储中间件，有多种方式加锁：
### SET NX的方式
 (SET key value NX PX milliseconds) - 通过0和1去判断是否获取得到锁

这个的NX的意思就是只有key不存在的时候才会设置成功，PX 30000的意思是30秒后锁自动释放。别人创建的时候如果发现已经有了就不能加锁了
![image.png](https://cdn.nlark.com/yuque/0/2023/png/34922072/1681268851133-4f426296-2f16-452d-ab8b-9912e857f1f6.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_62%2Ctext_5p2O5pyJ5Lm-%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_62%2Ctext_5p2O5pyJ5Lm-%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10#averageHue=%23f9f9f8&clientId=u90d5903a-4e95-4&from=paste&height=457&id=u9066a127&originHeight=914&originWidth=2164&originalType=binary&ratio=2&rotation=0&showTitle=false&size=365332&status=done&style=none&taskId=u70c0be54-f59e-43ed-8748-d9fba31997a&title=&width=1082)
为啥要用随机值呢？因为如果某个客户端获取到了锁，但是阻塞了很长时间超过30秒才执行完，此时可能已经自动释放锁了，此时可能别的客户端已经获取到了这个锁，要是你这个时候直接删除key的话会有问题，所以得用随机值加上面的lua脚本来释放锁

删除Key的Lua脚本：
```lua
if redis.call("get",KEYS[1]) == ARGV[1] then
  return redis.call("del",KEYS[1])
else
  return 0
end
```

但是这样是肯定不行的。因为如果是普通的redis单实例，那就是单点故障。或者是redis普通主从，那redis主从异步复制，如果主节点挂了，key还没同步到从节点，此时从节点切换为主节点，别人就会拿到锁

因为redis主从架构采用的是异步复制，当master节点拿到了锁，但是锁还未同步到slave节点，此时master节点挂了，发生故障转移，slave节点被选举为master节点，丢失了锁。这样其他线程就能够获取到该锁，显然是有问题的

# 二、RedLock 介绍

## RedLock的方式 
正是因为上述redis分布式锁存在的一致性问题，redis作者提出了一个更加高级的基于redis实现的分布式锁——RedLock。原文可参考：[Distributed locks with Redis](https://redis.io/topics/distlock)
Distributed Locks with Redis 中英译文# Distributed Locks with Redis
A distributed lock pattern with Redis
Distributed locks are a very useful primitive in many environments where different processes must operate with shared resources in a mutually exclusive way.
There are a number of libraries and blog posts describing how to implement a DLM (Distributed Lock Manager) with Redis, but every library uses a different approach, and many use a simple approach with lower guarantees compared to what can be achieved with slightly more complex designs.
This page describes a more canonical algorithm to implement distributed locks with Redis. We propose an algorithm, called **Redlock**, which implements a DLM which we believe to be safer than the vanilla single instance approach. We hope that the community will analyze it, provide feedback, and use it as a starting point for the implementations or more complex or alternative designs

Redis分布式锁
Redis的分布式锁模式
分布式锁在许多环境中是非常有用的原语，在这些环境中，不同的进程必须以互斥的方式使用共享资源进行操作。
有很多库和博客文章描述了如何用Redis实现DLM（分布式锁管理器），但每个库都使用不同的方法，许多库使用简单的方法，与稍微复杂的设计相比，保证更低。
本页介绍了一种更规范的算法，用于使用Redis实现分布式锁。我们提出了一种称为Redlock的算法，它实现了DLM，我们认为它比普通的单实例方法更安全。我们希望社区能够对其进行分析，提供反馈，并将其作为实现或更复杂或替代设计的起点。

## RedLock是什么？
RedLock是基于redis实现的分布式锁，它能够保证以下特性：
互斥性：在任何时候，只能有一个客户端能够持有锁；
避免死锁：当客户端拿到锁后，即使发生了网络分区或者客户端宕机，也不会发生死锁；（利用key的存活时间）
容错性：只要多数节点的redis实例正常运行，就能够对外提供服务，加锁或者释放锁；而非redLock是无法满足互斥性的，上面已经阐述过了原因

## RedLock算法
RedLock实现主要是RedLock算法，就是说假设有N个redis的master节点，这些节点是相互独立的（不需要主从或者其他协调的系统）。N推荐为奇数

客户端执行以下步骤获取一把锁：

- 获取当前时间戳，以毫秒为单位
- 使用相同的lockName和lockValue，尝试从N个节点获取锁

（在获取锁时，要求等待获取锁的时间远小于锁的释放时间，如锁的lease_time为10s，那么wait_time应该为5-50毫秒；避免因为redis实例挂掉，客户端需要等待更长的时间才能返回，即需要让客户端能够fast_fail；如果一个redis实例不可用，那么需要继续从下个redis实例获取锁）

- 当从N个节点获取锁结束后，如果客户端能够从多数节点(N/2 + 1)中成功获取锁，比如5个节点就要求是3个节点（n / 2 +1）。且获取锁的时间小于失效时间，那么可认为，客户端成功获得了锁。（获取锁的时间=当前时间戳 - 步骤1的时间戳）
- 客户端成功获得锁后，那么锁的实际有效时间 = 设置锁的有效时间 - 获取锁的时间
- 客户端获取锁失败后，N个节点的redis实例都会释放锁，即使未能加锁成功

# 三、加锁源码分析

## 基本案例示范
```java
RLock lock1 = redissonInstance1.getLock("lock1");
RLock lock2 = redissonInstance2.getLock("lock2");
RLock lock3 = redissonInstance3.getLock("lock3");
RedissonRedLock lock = new RedissonRedLock(lock1, lock2, lock3);
// 同时加锁：lock1 lock2 lock3
// 红锁在大部分节点上加锁成功就算成功。
lock.lock();
...
lock.unlock();
```

## 主要逻辑代码
```java
public class RedissonRedLock extends RedissonMultiLock {
    
    public RedissonRedLock(RLock... locks) {
        super(locks);
    }

    protected int failedLocksLimit() {
        return this.locks.size() - this.minLocksAmount(this.locks);
    }

    protected int minLocksAmount(List<RLock> locks) {
        return locks.size() / 2 + 1;
    }

    protected long calcLockWaitTime(long remainTime) {
        return Math.max(remainTime / (long)this.locks.size(), 1L);
    }

    public void unlock() {
        this.unlockInner(this.locks);
    }
}
```
可以看到RedissonRedLock 完全是 RedissonMultiLock 的子类！只不过是重写 failedLocksLimit 方法。在 MultiLock 中，要所有的锁都锁成功才可以。在 RedLock 中，要一半以上的锁成功

## 重写代码逻辑分析
```java
//比如你有3个lock，那么至少要成功加上3 / 2 + 1 = 2个lock
minLocksAmount(locks)里面就是用的大多数节点的一个算法，n / 2 + 1

//就是failedLocksLimit，默认是0，就是一个锁都不能容忍加失败了
//现在最新的是n - (n / 2 + 1)，3个lock，最多可以容忍1个lock加锁失败
failedLocksLimit，locks.size() - minLocksAmount(locks) = 1

//这个东西算出来的时间，是说在对每个lock进行加锁的时候，有一个尝试获取锁超时的时间
//原来默认的就是remainTime，4500毫秒，4500毫秒 / 3 = 1500毫秒
//每个小lock获取锁超时的时间改成了1500毫秒
alcLockWaitTime

//对每个小lock尝试加锁的时候，能够容忍的最大超时时间，就是1500毫秒，1500毫秒之内必须加成功这个小锁，否则就是加锁失败
waitTime = 1500
```

之前讲解的MultiLock的话，只要你有任何一个锁加锁失败，此次加这个MultiLock就会标记为失败，再重来一次

但是现在的话呢，使用的是RedLock，faildLocksLimit（3个小lock的时候，这个值是1），可以容忍一个锁加锁失败的，此时就会将failedLockLimit--，从1变为了0，也就是说之前可以容忍一次lock加锁失败，若是继续失败，则不能再容忍加锁失败了

也就是说针对多个lock进行加锁，每个lock都有一个1500毫秒的加锁超时时间，如果在4500毫秒内，成功的对n / 2 + 1个lock加锁成功了，就可以认为这个RedLock加锁成功了，不要求所有的lock都加锁成功的

### 小结

RedLock是一个锁，只不过是在各个不同的master实例上进行加锁，但是现在说RedLock合并了多个小lock。也就是说，如果你有3个redis master实例，你就用lock1、lock2、lock3三个锁key，人家本来就是分布在3个不同的redis master实例上的

加这个RedLock，相当于是3个redis master实例上的key，有2个加成功了，就算这个RedLock加锁成功了
此时别人如果要来加锁，用一样的key，人家是无法成功加锁的，锁被你占用了，人家就会卡在那儿，死循环，不断的尝试加锁，直到你释放锁å

红锁其实也并不能解决根本问题，只是降低问题发生的概率。完全相互独立的redis，每一台至少也要保证高可用，还是会有主从节点。既然有主从节点，在持续的高并发下，master还是可能会宕机，从节点可能还没来得及同步锁的数据。很有可能多个主节点也发生这样的情况，那么问题还是回到一开始的问题，红锁只是降低了发生的概率


# 四、题外话

有一个很大的疑问，我加锁 lock1、lock2、lock3，但是 RedissonRedLock 是如何保证这三个 key 是在归属于 Redis 集群中不同的 master 呢？

因为按照 RedLock 的理论，是需要**在半数以上的 master 节点加锁成功**。阅读完源码之后，发现 RedissonRedLock 完全是RedissonMultiLock 的子类，只是重写了 failedLocksLimit 方法，保证半数以上加锁成功即可。所以这三个 key，是需要用户来保证分散在不同的节点上的

在 Redisson 的 issues 也有同样的小伙伴提出这个问题，相关开发者给出的回复是用户来保证 key 分散在不同的 master 上
![image.png](https://cdn.nlark.com/yuque/0/2023/png/34922072/1681876285814-35be7a0b-1d23-4de1-a568-f521c963d3db.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_31%2Ctext_5p2O5pyJ5Lm-%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10#averageHue=%23e3cbb8&clientId=u8a469259-c615-4&from=paste&height=667&id=ud6748632&originHeight=702&originWidth=1080&originalType=binary&ratio=2&rotation=0&showTitle=false&size=133498&status=done&style=none&taskId=u9c36569d-a29e-47fd-a8fc-be2e2f17fe4&title=&width=1026)

当然 DarrenJiang1990 同学应该是怀着打破砂锅问到底的心情，又来了一篇 issue：https://github.com/redisson/redisson/issues/2437
意思就是：不要关闭我的 issues，在 #2436 中说可以“手工定位锁”，但是我要怎么手工定位锁。后来这个 issue 在 10 月才回复
![](https://cdn.nlark.com/yuque/0/2023/png/34922072/1681876371248-5059bb53-59f1-4d5a-a2dd-ad215655363c.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_31%2Ctext_5p2O5pyJ5Lm-%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10#averageHue=%23f1f1f0&clientId=u8a469259-c615-4&from=paste&id=ueb32f646&originHeight=206&originWidth=1080&originalType=url&ratio=2&rotation=0&showTitle=false&status=done&style=none&taskId=u1a1eda7b-077c-46b7-91db-ba0c1ac16f1&title=)

## RedissonRedLock 被弃用

是的，没有看错，现在 RedissonRedLock 已经被弃用了。如果是看的英文文档，就会发现：
![](https://cdn.nlark.com/yuque/0/2023/png/34922072/1681876371178-270c9b17-2414-4b4d-9e68-4df927cb87b7.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_31%2Ctext_5p2O5pyJ5Lm-%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10#averageHue=%23fefefe&clientId=u8a469259-c615-4&from=paste&id=ua7c0a74c&originHeight=148&originWidth=1080&originalType=url&ratio=2&rotation=0&showTitle=false&status=done&style=none&taskId=u74fb8e10-27eb-43a7-928d-7c576730ca4&title=)
而中文文档，应该是没有及时更新。来看看更新记录：
![](https://cdn.nlark.com/yuque/0/2023/png/34922072/1681876371308-ca820f1e-bcce-49c7-b12b-0aab80b0a224.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_31%2Ctext_5p2O5pyJ5Lm-%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10#averageHue=%23e45a4c&clientId=u8a469259-c615-4&from=paste&id=uaa2ae6ce&originHeight=526&originWidth=1080&originalType=url&ratio=2&rotation=0&showTitle=false&status=done&style=none&taskId=u27eb6e89-9f7d-4668-bf3a-46cbb6105f0&title=)
再找一找 issue：https://github.com/redisson/redisson/issues/2669
![](https://cdn.nlark.com/yuque/0/2023/png/34922072/1681876371230-bbf57d8b-4542-434c-8032-e3611298587b.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_31%2Ctext_5p2O5pyJ5Lm-%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10#averageHue=%23fefefe&clientId=u8a469259-c615-4&from=paste&id=u5505eb0c&originHeight=332&originWidth=1080&originalType=url&ratio=2&rotation=0&showTitle=false&status=done&style=none&taskId=ucd980b10-242a-4326-8e1d-8d039c1407e&title=)
Redisson 的开发者认为 Redis 的红锁也存在争议（前文介绍的那个争议），但是为了保证可用性，RLock 对象执行的每个 Redis 命令执行都通过 Redis 3.0 中引入的 WAIT 命令进行同步。

WAIT 命令会阻塞当前客户端，直到所有以前的写命令都成功的传输并被指定数量的副本确认。如果达到以毫秒为单位指定的超时，则即使尚未达到指定数量的副本，该命令也会返回。WAIT 命令同步复制也并不能保证强一致性，不过在主节点宕机之后，只不过会尽可能的选择最佳的副本（slaves）
![](https://cdn.nlark.com/yuque/0/2023/png/34922072/1681876371213-f2f61172-c4f1-4ea2-b1cd-169df27b4544.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_31%2Ctext_5p2O5pyJ5Lm-%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10#averageHue=%232f2b2a&clientId=u8a469259-c615-4&from=paste&id=uadcf4772&originHeight=342&originWidth=1080&originalType=url&ratio=2&rotation=0&showTitle=false&status=done&style=none&taskId=u54cde68a-a677-416a-858c-b026e9c3fca&title=)
源码在这一部分。
![](https://cdn.nlark.com/yuque/0/2023/png/34922072/1681876371823-1a220972-6ef2-4ba2-955a-ab09d01ff2fb.png?x-oss-process=image%2Fwatermark%2Ctype_d3F5LW1pY3JvaGVp%2Csize_31%2Ctext_5p2O5pyJ5Lm-%2Ccolor_FFFFFF%2Cshadow_50%2Ct_80%2Cg_se%2Cx_10%2Cy_10#averageHue=%233b454f&clientId=u8a469259-c615-4&from=paste&id=u78ee4f0d&originHeight=224&originWidth=1080&originalType=url&ratio=2&rotation=0&showTitle=false&status=done&style=none&taskId=u82557da0-8c70-440b-a928-7c87ee1e8fa&title=)
看源码，同时发送了一个 WAIT 1 1000 到 Redis

## 小结
Redisson RedLock 是基于联锁 MultiLock 实现的，但是使用过程中需要自己判断 key 落在哪个节点上，对使用者不是很友好
Redisson RedLock 已经被弃用，直接使用普通的加锁即可，它会基于 wait 机制将锁同步到从节点，但是也并不能保证一致性。仅仅是最大限度的保证一致性

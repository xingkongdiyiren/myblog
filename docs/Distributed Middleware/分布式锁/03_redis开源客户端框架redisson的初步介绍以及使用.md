# 一、Redisson介绍

redisson是在redis基础上实现的一套开源解决方案，不仅提供了一系列的分布式的java常用对象，还提供了许多分布式服务，宗旨是促进使用者对redis的关注分离，更多的关注业务逻辑的处理上

调用开源框架里面封装好的api(lock和unlock)。用Lua脚本实现加锁和解锁。还提供一个watchdoc（看门狗）监控锁的状态，每10s对key进行续约

官方介绍是：
Redisson采用了基于NIO的Netty框架，不仅能作为Redis底层驱动客户端，具备提供对Redis各种组态形式的连接功能，对Redis命令能以同步发送、异步形式发送、异步流形式发送或管道形式发送的功能，LUA脚本执行处理，以及处理返回结果的功能

还在此基础上融入了更高级的应用方案，不但将原生的RedisHash，List，Set，String，Geo，HyperLogLog等数据结构封装为Java里大家最熟悉的映射（Map），列表（List），集（Set），通用对象桶（Object Bucket），地理空间对象桶（Geospatial Bucket），基数估计算法（HyperLogLog）等结构

在这基础上还提供了分布式的多值映射（Multimap），本地缓存映射（LocalCachedMap），有序集（SortedSet），计分排序集（ScoredSortedSet），字典排序集（LexSortedSet），列队（Queue），阻塞队列（Blocking Queue），有界阻塞列队（Bounded Blocking Queue），双端队列（Deque），阻塞双端列队（Blocking Deque），阻塞公平列队（Blocking Fair Queue），延迟列队（Delayed Queue），布隆过滤器（Bloom Filter），原子整长形（AtomicLong），原子双精度浮点数（AtomicDouble），BitSet等Redis原本没有的分布式数据结构

不仅如此，Redisson还实现了Redis文档中提到像分布式锁Lock这样的更高阶应用场景

事实上Redisson并没有不止步于此，在分布式锁的基础上还提供了联锁（MultiLock），读写锁（ReadWriteLock），公平锁（Fair Lock），红锁（RedLock），信号量（Semaphore），可过期性信号量（PermitExpirableSemaphore）和闭锁（CountDownLatch）这些实际当中对多线程高并发应用至关重要的基本部件
# 二、基础配置

Redisson程序化的配置方法是通过构建[Config](https://links.jianshu.com/go?to=https%3A%2F%2Fwww.javadoc.io%2Fdoc%2Forg.redisson%2Fredisson%2F3.10.0%2Forg%2Fredisson%2Fconfig%2FConfig.html)对象实例来实现的，具体配置可参加API。下列基础的连接配置：

- 单机模式
```cpp
// 默认连接地址 127.0.0.1:6379 无密码
RedissonClient redisson = Redisson.create();
// 指定
Config config = new Config();
config.useSingleServer().setAddress("redis://localhost:6379");
RedissonClient redisson = Redisson.create(config);
```

- 集群模拟
```cpp
Config config = new Config();
config.useClusterServers()
    .setScanInterval(2000) // 集群状态扫描间隔时间，单位是毫秒
    //可以用"rediss://"来启用SSL连接
    .addNodeAddress("redis://127.0.0.1:7000", "redis://127.0.0.1:7001")
    .addNodeAddress("redis://127.0.0.1:7002");
RedissonClient redisson = Redisson.create(config);
```

- 哨兵模式
```cpp
Config config = new Config();
config.useSentinelServers()
    .setMasterName("mymaster")
    //可以用"rediss://"来启用SSL连接
    .addSentinelAddress("127.0.0.1:26389", "127.0.0.1:26379")
    .addSentinelAddress("127.0.0.1:26319");
RedissonClient redisson = Redisson.create(config);
```

- 主从模式
```java
Config config = new Config();
config.useMasterSlaveServers()
    //可以用"rediss://"来启用SSL连接
    .setMasterAddress("redis://127.0.0.1:6379")
    .addSlaveAddress("redis://127.0.0.1:6389", "redis://127.0.0.1:6332", "redis://127.0.0.1:6419")
    .addSlaveAddress("redis://127.0.0.1:6399");
RedissonClient redisson = Redisson.create(config);
```
# 三、案例基础使用
先做一个demo工程出来，基于spring boot技术，就最简单的就ok了，整合redisson进去，然后用他的一些分布式锁的功能，看下源码
### （1）在pom.xml里引入依赖
```xml
<dependency>
  <groupId>org.redisson</groupId>
  <artifactId>redisson</artifactId>
  <version>3.8.1</version>
</dependency>  
```
### （2）参照官网构建RedissonClient，同时看看对应的配置
```java
Config config = new Config();
config.useClusterServers()
//可以用"rediss://"来启用SSL连接
.addNodeAddress("redis://127.0.0.1:6382")
.addNodeAddress("redis://127.0.0.1:6384")
.addNodeAddress("redis://127.0.0.1:6385");
RedissonClient redisson = Redisson.create(config);
```
### （4）简单用一下分布式锁的功能
```java
RLock lock = redisson.getLock("anyLock");
lock.lock();

RMap<String, Object> map = redisson.getMap("anyMap");
map.put("foo", "bar");  

map = redisson.getMap("anyMap");

lock.unlock();
System.out.println(map.get("foo"));  
```

         


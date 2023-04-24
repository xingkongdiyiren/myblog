# 1、Java GC日志参数整理与解读

本文来探讨如何分析GC日志。探讨的话题包括：

- JDK 8：
    - GC日志打印相关的JVM参数
    - 如何分析日志
- JDK 11：
    - GC日志打印相关的JVM参数
    - 如何分析日志
- GC日志可视化分析工具

## JDK 8

### GC日志打印相关参数

| 参数                                  | 作用                                                         | 默认值 |
| ------------------------------------- | ------------------------------------------------------------ | ------ |
| -XX:+PrintGC                          | 输出GC日志                                                   | 关闭   |
| -XX:+PrintGCDetails                   | 打印GC的详情                                                 | 关闭   |
| -XX:+PrintGCCause                     | 是否在GC日志中打印造成GC的原因                               | 打开   |
| -XX:+PrintGCID                        | 打印垃圾GC的唯一标识                                         | 关闭   |
| -XX:+PrintGCDateStamps                | 以日期的格式输出GC的时间戳，如 2013-05-04T21:53:59.234+0800  | 关闭   |
| -XX:+PrintGCTimeStamps                | 以基准时间的格式，打印GC的时间戳                             | 关闭   |
| -XX:+PrintGCTaskTimeStamps            | 为每个GC工作线程的任务打印时间戳                             | 关闭   |
| -XX:+PrintHeapAtGC                    | 在GC前后打印堆信息                                           | 关闭   |
| -XX:+PrintHeapAtGCExtended            | 在开启PrintHeapAtGC的前提下，额外打印更多堆相关的信息        | 关闭   |
| -XX:+PrintGCApplicationStoppedTime    | 打印垃圾回收期间程序暂停的时间                               | 关闭   |
| -XX:+PrintGCApplicationConcurrentTime | 打印每次垃圾回收前,程序未中断的执行时间，可与PrintGCApplicationStoppedTime配合使用 | 关闭   |
| -XX:+PrintClassHistogramAfterFullGC   | Full GC之后打印堆直方图                                      | 关闭   |
| -XX:+PrintClassHistogramBeforeFullGC  | Full GC之前打印堆直方图                                      | 关闭   |
| -XX:+PrintReferenceGC                 | 打印处理引用对象的时间消耗，需开启PrintGCDetails才有效       | 关闭   |
| -XX:+PrintTLAB                        | 查看TLAB空间的使用情况                                       | 关闭   |
| -XX:-UseGCLogFileRotation             | 轮换文件，日志文件达到一定大小后，就创建一个新的日志文件。需指定-Xloggc:时才有效。 | 关闭   |
| -XX:GCLogFileSize                     | 设置单个日志文件的大小，需开启UseGCLogFileRotation才有效     | 8KB    |
| -XX:NumberOfGCLogFiles                | 日志轮换时，保留几个日志文件，默认0，保留所有日志            | 0      |
| -Xloggc:文件路径                      | 指定GC日志文件路径                                           | -      |

另外，开启如下参数，可打印GC相关的更多信息，帮助我们更好地分析G1日志：

| 参数                           | 作用                                                         | 默认值 |
| ------------------------------ | ------------------------------------------------------------ | ------ |
| -XX:+PrintAdaptiveSizePolicy   | 某些GC收集器有自适应策略，自适应调整策略会动态调整Eden、Survivor、老年代的大小。使用该标记，可打印自适应调节策略相关的信息。参考文档：[https://www.jianshu.com/p/7414fd6862c5](https://www.jianshu.com/p/7414fd6862c5) | 关闭   |
| -XX:+PrintTenuringDistribution | 查看每次minor GC后新的存活周期的阈值。Desired survivor size 1048576 bytes, new threshold 7 (max 15)。其中，7新的存活周期的阈值为7 | 关闭   |

示例：

> java -XX:+PrintGCDetails -XX:+PrintGCTimeStamps -XX:+PrintGCDateStamps -XX:+UseSerialGC -Xmx50m -Xloggc:/Users/itmuch.com/gc.log xxx.jar

### Young GC日志

> 2020-05-08T11:11:52.823-0800: 0.705: [GC (Allocation Failure) 2020-05-08T11:11:52.823-0800: 0.705: [DefNew: 15289K->1343K(15360K), 0.0036231 secs] 18555K->5065K(49536K), 0.0037065 secs] [Times: user=0.00 sys=0.00, real=0.00 secs]

其中：

- 2020-05-08T11:11:52.823-0800：当前时间戳，由PrintGCDateStamps控制
- 0.705：当前相对时间戳，表示应用启动多久后触发，由PrintGCTimeStamps控制
- GC (Allocation Failure)：造成GC的原因，由PrintGCCause控制
- [DefNew: 15289K->1343K(15360K), 0.0036231 secs]：
    - DefNew：使用不同垃圾收集器，这里的展示不同：
        - 使用Serial收集器：显示DefNew，表示Default New
        - 使用ParNew收集器：显示ParNew
        - 使用Paralle Scavenge收集器：显示PSYoungGen
        - 使用G1：G1格式和这个日志格式不一样，很好区分
    - 15289K：回收前，年轻代使用的大小
    - 1343K：回收后，年轻代使用的大小
    - 15360K：年轻代总大小
    - 0.0036231：花费了多久
- 18555K：回收前，堆使用的大小
- 5065K：回收后，堆使用的大小
- 49536K：堆的总大小
- 0.0037065 secs：花费时间
- user=0.00：用户耗时
- sys=0.00：系统耗时
- real=0.00：实际耗时

### Full GC日志

> 2020-05-08T11:28:16.911-0800: 7.863: [Full GC (Allocation Failure) 2020-05-08T11:28:16.911-0800: 7.863: [Tenured: 6847K->6848K(6848K), 0.0329351 secs] 9914K->9483K(9920K), [Metaspace: 30156K->30156K(1077248K)], 0.0330357 secs] [Times: user=0.03 sys=0.00, real=0.03 secs]

- 2020-05-08T11:28:16.911-0800：当前时间戳，由PrintGCDateStamps控制
- 7.863：当前相对时间戳，表示应用启动多久后触发，由PrintGCTimeStamps控制
- Full GC (Allocation Failure) ：造成GC的原因，由PrintGCCause控制
- [Tenured: 6847K->6848K(6848K), 0.0329351 secs]
    - Tenured：使用不同垃圾收集器，这里的展示不同：
        - 使用Serial Old收集器：显示Tenured
        - 使用Parallel Old收集器：显示ParOldGen
        - 使用CMS收集器：显示CMS
    - 6847K：回收前，老年代使用的大小
    - 6848K：回收后，老年代使用的大小
    - 6848K：老年代总大小
    - 0.0329351：花费时间
- 9914K：回收前，堆使用的大小
- 9483K：回收后，堆使用的大小
- 9920K：堆的总大小
- [Metaspace: 30156K->30156K(1077248K)], 0.0330357 secs]：元空间的使用情况
- [Times: user=0.03 sys=0.00, real=0.03 secs] ：同新生代日志

### G1日志

如使用的是G1垃圾收集器，那么在上面表格的基础上，还有如下参数：

| 参数                                    | 作用                                                         | 默认值 |
| --------------------------------------- | ------------------------------------------------------------ | ------ |
| -XX:G1PrintRegionLivenessInfo           | 标记阶段结束后打印所有region的存活情况，，需开启-XX:+UnlockDiagnosticVMOptions后才能使用 | 关闭   |
| -XX:+G1PrintHeapRegions                 | 打印堆的区域上的分配和释放的信息，需开启-XX:+UnlockDiagnosticVMOptions后才能使用 | 关闭   |
| -XX:+PrintStringDeduplicationStatistics | JDK 8u20开始，使用G1垃圾收集器，可支持用-XX:+UseStringDeduplication开启字符串去重。用rintStringDeduplicationStatistics打印字符串去重的统计信息。参考文档： [https://blog.csdn.net/goldenfish1919/article/details/94555589](https://blog.csdn.net/goldenfish1919/article/details/94555589) | 关闭   |

#### Young GC日志

示例：

> 2020-05-08T14:19:58.598-0800: 5.599: [GC pause (G1 Evacuation Pause) (young), 0.0035900 secs]    
> [Parallel Time: 2.4 ms, GC Workers: 8]       
> [GC Worker Start (ms): Min: 5598.7, Avg: 5599.1, Max: 5600.8, Diff: 2.1]      
> [Ext Root Scanning (ms): Min: 0.0, Avg: 0.3, Max: 0.7, Diff: 0.7, Sum: 2.4]      
> [Update RS (ms): Min: 0.0, Avg: 0.8, Max: 1.8, Diff: 1.8, Sum: 6.4]         
> [Processed Buffers: Min: 0, Avg: 2.2, Max: 6, Diff: 6, Sum: 18]       
> [Scan RS (ms): Min: 0.0, Avg: 0.0, Max: 0.0, Diff: 0.0, Sum: 0.0]       
> [Code Root Scanning (ms): Min: 0.0, Avg: 0.0, Max: 0.0, Diff: 0.0, Sum: 0.0]       
> [Object Copy (ms): Min: 0.0, Avg: 0.2, Max: 0.4, Diff: 0.4, Sum: 1.7]       
> [Termination (ms): Min: 0.0, Avg: 0.5, Max: 0.7, Diff: 0.7, Sum: 3.7]          
> [Termination Attempts: Min: 1, Avg: 2.4, Max: 12, Diff: 11, Sum: 19]       
> [GC Worker Other (ms): Min: 0.0, Avg: 0.1, Max: 0.9, Diff: 0.9, Sum: 0.9]       
> [GC Worker Total (ms): Min: 0.2, Avg: 1.9, Max: 2.3, Diff: 2.2, Sum: 15.3]       
> [GC Worker End (ms): Min: 5601.0, Avg: 5601.0, Max: 5601.0, Diff: 0.0]    
> [Code Root Fixup: 0.0 ms]    
> [Code Root Purge: 0.0 ms]   
> [Clear CT: 0.1 ms]    
> [Other: 1.1 ms]       
> [Choose CSet: 0.0 ms]       
> [Ref Proc: 0.7 ms]       
> [Ref Enq: 0.0 ms]       
> [Redirty Cards: 0.3 ms]       
> [Humongous Register: 0.0 ms]       
> [Humongous Reclaim: 0.0 ms]       
> [Free CSet: 0.0 ms]    
> [Eden: 4096.0K(4096.0K)->0.0B(4096.0K) Survivors: 1024.0K->1024.0K Heap: 24.3M(30.0M)->20.6M(30.0M)]  
>  [Times: user=0.01 sys=0.00, real=0.01 secs]

解读：
```text


# 这是一个年轻代GC，花费了0.0018345。下面的缩进，表示这行日志的子任务

2020-05-08T14:19:58.598-0800: 5.599: [GC pause (G1 Evacuation Pause) (young), 0.0035900 secs]

# 并行任务，并行GC花费2.4毫秒，并行阶段有8个线程    [Parallel Time: 2.4 ms, GC Workers: 8]

# 表示各个GC工作线程在应用启动多久(毫秒)后启动。

# 同时还做了个统计，例如这些GC线程最早启动的那个线程在应用启动后847.9毫秒后启动等

[GC Worker Start (ms): Min: 5598.7, Avg: 5599.1, Max: 5600.8, Diff: 2.1]

# 表示各个GC工作线程扫描跟对象花费的时间的统计

[Ext Root Scanning (ms): Min: 0.0, Avg: 0.3, Max: 0.7, Diff: 0.7, Sum: 2.4]

# 表示各个GC工作线程更新Remembered Sets花费的时间的统计

# Remembered Sets是保存到堆中的区域的跟踪引用。设值方法线程持续改变对象图，自此引指向一个特定的区域。我们保存这些改变的跟踪信息到叫作Update Buffers的更新缓存中。Update RS子任务不能并发的处理更新缓存，更新一致所有区域的Remembered Sets

[Update RS (ms): Min: 0.0, Avg: 0.8, Max: 1.8, Diff: 1.8, Sum: 6.4]          
# 表示每个GC工作线程处理的Update Buffers的数量统计     	[Processed Buffers: Min: 0, Avg: 2.2, Max: 6, Diff: 6, Sum: 18]

# 每个GC工作线程扫描Remembered Sets花费的时间

# 一个区域的Remembered Sets包含指向这个区域的引用的相符合的卡片。这个阶段扫描这些卡片寻找指向所有这些区域的Collection Set的引用

[Scan RS (ms): Min: 0.0, Avg: 0.0, Max: 0.0, Diff: 0.0, Sum: 0.0] # 扫描Code Root耗时统计。Code Root是JIT编译后的代码里引用了heap中的对象       
[Code Root Scanning (ms): Min: 0.0, Avg: 0.0, Max: 0.0, Diff: 0.0, Sum: 0.0]

# 拷贝存活对象到新的Region耗时统计

[Object Copy (ms): Min: 0.0, Avg: 0.2, Max: 0.4, Diff: 0.4, Sum: 1.7]

# 各个GC工作线程完成任务后尝试中断GC线程到真正中断的耗时统计

# 在某个GC线程中断之前，会检查其它线程的工作队列，如果发现依然有任务，会帮助处理，之后再中断

[Termination (ms): Min: 0.0, Avg: 0.5, Max: 0.7, Diff: 0.7, Sum: 3.7]

# 尝试中断次数统计

[Termination Attempts: Min: 1, Avg: 2.4, Max: 12, Diff: 11, Sum: 19]

# GC工作线程花费在其他工作上的时间统计

[GC Worker Other (ms): Min: 0.0, Avg: 0.1, Max: 0.9, Diff: 0.9, Sum: 0.9]

# 各个GC工作线程花费的时间总和统计

[GC Worker Total (ms): Min: 0.2, Avg: 1.9, Max: 2.3, Diff: 2.2, Sum: 15.3]

# 各个GC工作线程线程的结束时间，min|max分别表示第一个|最后一个线程的结束时间。

[GC Worker End (ms): Min: 5601.0, Avg: 5601.0, Max: 5601.0, Diff: 0.0]

# 串行任务，修复GC期间code root指针改变的耗时

[Code Root Fixup: 0.0 ms]

# 串行任务，清除Code Root耗时

[Code Root Purge: 0.0 ms]

# 清除Card Table中的Dirty Card的耗时

[Clear CT: 0.1 ms]

# 其他任务

[Other: 1.1 ms]

# 为Collection Set选择区域所花费的时间

[Choose CSet: 0.0 ms]

# 花费在处理引用对象上的时间

[Ref Proc: 0.7 ms]

# 引用入队到ReferenceQueues花费的时间，可用-XX:+ParallelRefProcEnabled，并行处理这一步

[Ref Enq: 0.0 ms]       
[Redirty Cards: 0.3 ms]

# 处理超大对象

[Humongous Register: 0.0 ms]       
[Humongous Reclaim: 0.0 ms]

# 释放Collection Set数据结构花费的时间

[Free CSet: 0.0 ms]

# 各个区域的内存变化。

# 4096.0K：伊甸园当前占用4096.0K

# (4096.0K)：伊甸园总大小4096.0K

# 0.0B：收集后，伊甸园占用将会变成0

# (4096.0K)：伊甸园的目标大小（如有需要，JVM可能会自动增加伊甸园大小）

[Eden: 4096.0K(4096.0K)->0.0B(4096.0K) Survivors: 1024.0K->1024.0K Heap: 24.3M(30.0M)->20.6M(30.0M)]

# 用户耗时、系统耗时、实际耗时

[Times: user=0.01 sys=0.00, real=0.01 secs]

```
#### 并发回收日志
```text

# 1. 初始标记(stop the world)

> 2020-05-08T14:19:54.076-0800: 1.076: [GC pause (Metadata GC Threshold) (young) (initial-mark), 0.0107606 secs]    
[Parallel Time: 8.2 ms, GC Workers: 8]       
[GC Worker Start (ms): Min: 1076.6, Avg: 1077.1, Max: 1077.5, Diff: 0.9]       
[Ext Root Scanning (ms): Min: 0.1, Avg: 2.9, Max: 4.6, Diff: 4.5, Sum: 23.2]       
[Update RS (ms): Min: 0.0, Avg: 0.4, Max: 1.4, Diff: 1.4, Sum: 3.4]          
[Processed Buffers: Min: 0, Avg: 1.8, Max: 7, Diff: 7, Sum: 14]       
[Scan RS (ms): Min: 0.0, Avg: 0.0, Max: 0.0, Diff: 0.0, Sum: 0.0] [Code Root Scanning (ms): Min: 0.0, Avg: 0.0, Max: 0.1, Diff: 0.1, Sum: 0.1]       
[Object Copy (ms): Min: 0.0, Avg: 0.5, Max: 1.5, Diff: 1.5, Sum: 4.2]       
[Termination (ms): Min: 0.0, Avg: 2.6, Max: 4.3, Diff: 4.3, Sum: 20.9]          
[Termination Attempts: Min: 1, Avg: 2.4, Max: 6, Diff: 5, Sum: 19]       
[GC Worker Other (ms): Min: 0.0, Avg: 0.0, Max: 0.0, Diff: 0.0, Sum: 0.1]       
[GC Worker Total (ms): Min: 4.4, Avg: 6.5, Max: 8.0, Diff: 3.6, Sum: 51.9]       
[GC Worker End (ms): Min: 1082.0, Avg: 1083.6, Max: 1084.7, Diff: 2.7]    
[Code Root Fixup: 0.0 ms]    
[Code Root Purge: 0.0 ms]    
[Clear CT: 0.1 ms]    
[Other: 2.4 ms]       
[Choose CSet: 0.0 ms]       
[Ref Proc: 2.2 ms]       
[Ref Enq: 0.0 ms]       
[Redirty Cards: 0.1 ms]       
[Humongous Register: 0.0 ms]       
[Humongous Reclaim: 0.0 ms]       
[Free CSet: 0.0 ms]    
[Eden: 1024.0K(10.0M)->0.0B(10.0M) Survivors: 2048.0K->2048.0K Heap: 15.3M(30.0M)->14.4M(30.0M)]  
[Times: user=0.01 sys=0.00, real=0.01 secs]

- 开始扫描初始标记阶段Survivor区的Root Region

2020-05-08T14:19:54.087-0800: 1.087: [GC concurrent-root-region-scan-start]

- 扫描完成

2020-05-08T14:19:54.091-0800: 1.092: [GC concurrent-root-region-scan-end, 0.0049225 secs]

# 2. 并发标记，标记线程数可用-XX:ConcGCThreads指定

2020-05-08T14:19:54.092-0800: 1.092: [GC concurrent-mark-start]

# 并发标记结束

2020-05-08T14:19:54.102-0800: 1.103: [GC concurrent-mark-end, 0.0106528 secs]

# 3. 最终标记(stop the world)

2020-05-08T14:19:54.103-0800: 1.104: [GC remark 2020-05-08T14:19:54.103-0800: 1.104: [Finalize Marking, 0.0028699 secs] 2020-05-08T14:19:54.106-0800: 1.107: [GC ref-proc, 0.0001689 secs] 2020-05-08T14:19:54.106-0800: 1.107: [Unloading, 0.0053988 secs], 0.0087250 secs]  [Times: user=0.01 sys=0.00, real=0.01 secs]

# 4. 筛选回收(stop the world)

# 没有存活对象的Old Region和Humongous Region将被释放和清空。

# 为了准备下次GC，在CSets中的Old Regions会根据他们的回收收益的大小排序。

2020-05-08T14:19:54.114-0800: 1.114: [GC cleanup 15M->14M(30M), 0.0006027 secs]  [Times: user=0.00 sys=0.00, real=0.00 secs]

# 并发清理开始

2020-05-08T14:19:54.114-0800: 1.115: [GC concurrent-cleanup-start]

# 并发清理结束

2020-05-08T14:19:54.114-0800: 1.115: [GC concurrent-cleanup-end, 0.0000133 secs]

#### Full GC

2020-05-08T14:19:57.869-0800: 4.869: [Full GC (Allocation Failure)  28M->18M(30M), 0.0789569 secs]    
[Eden: 0.0B(1024.0K)->0.0B(7168.0K) Survivors: 0.0B->0.0B Heap: 28.4M(30.0M)->18.2M(30.0M)], [Metaspace: 44204K->44114K(1089536K)]  
[Times: user=0.11 sys=0.00, real=0.08 secs]

```
#### G1日志官方解读

[https://blogs.oracle.com/poonam/understanding-g1-gc-logs](https://blogs.oracle.com/poonam/understanding-g1-gc-logs)

## JDK 11

### GC日志打印相关参数

从JDK 9开始，GC日志由“统一日志管理”（Xlog）管理。GC日志相关的JVM参数只剩如下两个，并且这两个参数也用Xlog代替。**有关统一日志管理，详见《JDK 11统一日志管理》一文。**

| 参数                | 作用         | 默认值 |
| ------------------- | ------------ | ------ |
| -XX:+PrintGC        | 输出GC日志   | 关闭   |
| -XX:+PrintGCDetails | 打印GC的详情 | 关闭   |

示例：

> -Xmx30m -XX:+UseSerialGC -Xlog:gc*:file=/Users/itmuch.com/gc11.log

### 日志解读
```text

# 打印使用的垃圾收集器

# 0.015s指的是应用启动后过了多久

[0.015s][info][gc] Using Serial

# 打印内存概览，例如堆内存地址、堆内存总大小、压缩指针模式等

[0.015s][info][gc,heap,coops] Heap address: 0x00000007fe200000, size: 30 MB, Compressed Oops mode: Zero based, Oop shift amount: 3

# 发生了年轻代GC，原因是Allocation Failure

# GC(0)中的0，是对垃圾收集的次数统计，从0开始

[0.213s][info][gc,start     ] GC(0) Pause Young (Allocation Failure)

# 年轻代占用情况：回收前占用8181K，回收后占用1023K，年轻代总大小9216K

[0.216s][info][gc,heap      ] GC(0) DefNew: 8181K->1023K(9216K)

# 老年代占用情况：回收前、回收后、总大小

[0.216s][info][gc,heap      ] GC(0) Tenured: 0K->1548K(20480K)

# 元数据占用情况：回收前、回收后、总大小 [0.216s][info][gc,metaspace ] GC(0) Metaspace: 5645K->5645K(1056768K)

# 整个堆的占用情况：回收前、回收后、总大小

[0.216s][info][gc           ] GC(0) Pause Young (Allocation Failure) 7M->2M(29M) 3.642ms

# 用户耗时、系统耗时、实际耗时 [0.217s][info][gc,cpu       ] GC(0) User=0.00s Sys=0.00s Real=0.00s

```
综上，其实和JDK 8的日志打印区别并不大，只是打印的格式更加整齐，输出更加清晰了。同理，其他垃圾收集器也是类似的。

## GC日志可视化分析工具

- GCEasy：[https://www.gceasy.io/](https://www.gceasy.io/)
    - **TIPS**：在线工具，不开源
- GCViewer：[https://github.com/chewiebug/GCViewer](https://github.com/chewiebug/GCViewer)
    - **TIPS**：不完全支持“统一日志管理”打印出的日志。详见 [https://github.com/chewiebug/GCViewer](https://github.com/chewiebug/GCViewer) 中的README说明
- GCPlot：[https://github.com/dmart28/gcplot](https://github.com/dmart28/gcplot)
    - **TIPS**：很久不维护了

# 2、JVM 线程堆栈分析

![1.png](..%2F..%2F..%2Fpublic%2Fjvm%2F%E8%B0%83%E4%BC%98%2F1.png)
JVM 内部线程主要分为以下几种：

• VM 线程：单例的 VMThread 对象，负责执行 VM 操 作;
• 定时任务线程：单例的 WatcherThread 对象， 模拟在 VM 中执行定时操作的计时器中断；
• GC 线程：垃圾收集器中，用于支持并行和并发垃圾回收的线程;
• 编译器线程： 将字节码编译为本地机器代码;
• 信号分发线程：等待进程指示的信号，并将其分配给Java 级别的信号处理方法。

安全点：

1. 方法代码中被植入的安全点检测入口；
2. 线程处于安全点状态：线程暂停执行，这个时候线程栈不再发生改变；
3. JVM 的安全点状态：所有线程都处于安全点状态。

JVM 支持多种方式来进行线程转储：

1. JDK 工具， 包括: jstack 工具， jcmd 工具，jconsole，jvisualvm， Java Mission Control 等；
2. Shell 命令或者系统控制台，比如 Linux 的 kill -3，Windows 的 Ctrl + Break 等；
3. JMX 技术， 主要是使用 ThreadMxBean。

## 参考文章

- [https://blog.csdn.net/zhanggang807/article/details/46011341](https://blog.csdn.net/zhanggang807/article/details/46011341)
- [https://juejin.im/post/5d6fbdac51882559c41624b5](https://juejin.im/post/5d6fbdac51882559c41624b5)
- [https://www.cnblogs.com/redcreen/archive/2011/05/04/2037057.html](https://www.cnblogs.com/redcreen/archive/2011/05/04/2037057.html)
- [https://dzone.com/articles/try-to-avoid-xxusegclogfilerotation](https://dzone.com/articles/try-to-avoid-xxusegclogfilerotation)




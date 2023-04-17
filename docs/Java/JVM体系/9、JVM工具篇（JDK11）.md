JDK 11和JDK 8的差异并不大，绝大多数对JDK 8也可适用。当遇到不适用的命令时，可前往对应命令中的JDK 8的地址查看相关文档即可。
JDK 11下载地址如下：
官方下载地址：[https://www.oracle.com/java/technologies/javase-jdk11-downloads.html](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html)
如果你同时安装了多个版本的JDK，可参考如下文章实现多个JDK版本共存：
macOS：
[https://blog.csdn.net/weixin_30532987/article/details/97463829](https://blog.csdn.net/weixin_30532987/article/details/97463829)
Windows：
[https://blog.csdn.net/FCY12345678/article/details/79563524](https://blog.csdn.net/FCY12345678/article/details/79563524)

# 1、JDK内置工具

## 1.1、监控工具

### 1.1.1、jps

#### 1.1.1.1、作用

- jps全称Java Virtual Machine Process Status Tool，用来查看JVM进程状态

#### 1.1.1.2、使用说明

命令如下：
➜ jps -h
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1648401836684-3f6984dc-96e2-406a-85e5-168ed1064702.png#clientId=ub7c9efc9-ad60-4&from=paste&height=98&id=ucdab9b99&name=image.png&originHeight=216&originWidth=812&originalType=binary&ratio=1&rotation=0&showTitle=false&size=31176&status=done&style=none&taskId=u8bf416bf-2d3b-4197-bc3e-d355aa1b80a&title=&width=369.0909010910793)
参数如下：

| 参数 | 说明                                                         |
| ---- | ------------------------------------------------------------ |
| -q   | 只显示进程号                                                 |
| -m   | 显示传递给main方法的参数                                     |
| -l   | 显示应用main class的完整包名应用的jar文件完整路径名          |
| -v   | 显示传递给JVM的参数                                          |
| -V   | 禁止输出类名、JAR文件名和传递给main方法的参数，仅显示本地JVM标识符的列表。 |

hostid：想要查看的主机的标识符，格式为：[protocol:][[//]hostname][:port][/servername] ，其中：

- protocol：通信协议，默认rmi
- hostname：目标主机的主机名或IP地址
- port：通信端口，对于默认rmi协议，该参数用来指定 rmiregistry远程主机上的端口号。如省略该参数，并且该protocol指示rmi，则使用默认使用1099端口。
- servicename：服务名称，取值取决于实现方式，对于rmi协议，此参数代表远程主机上RMI远程对象的名称

#### 1.1.1.3、使用示例

jps
jps -m
jps -ml
jps -mlv

> 查看remote.domain这台服务器中JVM进程的信息，使用rmi协议，端口1099

```shell
jps -l remote.domain
```

> 查看remote.domain这台服务器中JVM进程的信息，使用rmi协议，端口1231

```powershell
jps -l rmi://remote.comain:1231
```

### 1.1.2、jstat

#### 1.1.2.1、作用

- jstat全称JVM Statistics Monitoring Tool，用于监控JVM的各种运行状态。

#### 1.1.2.2、使用说明

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1648402260045-a6f05b74-8609-4f3e-8942-d7eb639779c3.png#clientId=ub7c9efc9-ad60-4&from=paste&height=297&id=u80e05019&name=image.png&originHeight=654&originWidth=1234&originalType=binary&ratio=1&rotation=0&showTitle=false&size=148842&status=done&style=none&taskId=u2b972c41-4c63-445c-a9fb-20a889680e7&title=&width=560.909078751714)
**option取值如下：**

| 参数             | 说明                                             |
| ---------------- | ------------------------------------------------ |
| class            | 显示类加载器的统计信息                           |
| compiler         | 显示有关Java HotSpot VM即时编译器行为的统计信息  |
| gc               | 显示有关垃圾收集堆行为的统计信息                 |
| gccapacity       | 统计各个分代（新生代，老年代，持久代）的容量情况 |
| gccause          | 显示引起垃圾收集事件的原因                       |
| gcnew            | 显示有关新生代行为的统计信息                     |
| gcnewcapacity    | 显示新生代容量                                   |
| gcold            | 显示老年代、元空间区的统计信息                   |
| gcoldcapacity    | 显示老年代的容量                                 |
| gcmetacapacity   | 显示元空间的容量                                 |
| gcutil           | 显示有关垃圾收集统计信息的摘要                   |
| printcompilation | 显示Java HotSpot VM编译方法统计信息              |

**输出信息**

- class：
    - Loaded：当前加载的类的数量
    - Bytes：当前加载的空间(单位KB)
    - Unloaded：卸载的类的数量Number of classes unloaded.
    - Bytes：当前卸载的空间(单位KB)
    - Time：执行类加载/卸载操作所花费的时间
- compiler：
    - Compiled：执行了多少次编译任务
    - Failed：多少次编译任务执行失败
    - Invalid：无效的编译任务数
    - Time：执行编译任务所花费的时间
    - FailedType：上次失败的编译的编译类型
    - FailedMethod：上次失败的编译的类名和方法
- gc：
    - S0C：第一个存活区(S0)的容量（KB）
    - S1C：第二个存活区(S1)的容量（KB）
    - S0U：第一个存活区(S0)使用的大小（KB）
    - S1U：第二个存活区(S1)使用的大小（KB）
    - EC：伊甸园空间容量（KB）
    - EU：伊甸园使用的大小（KB）
    - OC：老年代容量（KB）
    - OU：老年代使用的大小（KB）
    - MC：元空间的大小（KB）
    - MU：元空间使用的大小（KB）
    - CCSC：压缩的类空间大小（KB）
    - CCSU：压缩类空间使用的大小（KB）
    - YGC：年轻代垃圾收集事件的数量
    - YGCT：年轻代垃圾回收时间
    - FGC：Full GC事件的数量
    - FGCT：Full GC回收时间
    - GCT：垃圾收集总时间
- gccapacity：
    - NGCMN：最小新生代容量（KB）
    - NGCMX：最大新生代容量（KB）
    - NGC：当前的新生代容量（KB）
    - S0C：第一个存活区(S0)的当前容量（KB）
    - S1C：第二个存活区(S1)的当前容量（KB）
    - EC：当前伊甸园容量（KB）
    - OGCMN：最小老年代容量（KB）
    - OGCMX：最大老年代容量（KB）
    - OGC：当前老年代容量（KB）
    - OC：当前old space容量（KB）
    - MCMN：最小元空间容量（KB）
    - MCMX：最大元空间容量（KB）
    - MC：当前元空间的容量（KB）
    - CCSMN：压缩的类空间最小容量（KB）
    - CCSMX：压缩的类空间最大容量（KB）
    - CCSC：当前压缩的类空间大小（KB）
    - YGC：年轻代GC事件的数量
    - FGC：Full GC事件的数量
- gccause：其他展示列和-gcutil一致
    - LGCC：导致GC的原因
    - GCC：导致当前GC的原因
- gcnew：
    - S0C：第一个存活区(S0)的容量（KB）
    - S1C：第二个存活区(S1)的容量（KB）
    - S0U：第一个存活区(S0)的利用率（KB）
    - S1U：第二个存活区(S1)的利用率（KB）
    - TT：老年代阈值
    - MTT：最大老年代阈值
    - DSS：期望的存活区大小（KB）
    - EC：当前伊甸园容量（KB）
    - EU：伊甸园利用率（KB）
    - YGC：年轻代GC事件的数量
    - YGCT：年轻代垃圾回收时间
- gcnewcapacity：
    - NGCMN：最小年轻代容量（KB）NGCMX：最大年轻代容量（KB）NGC：当前年轻代容量（KB）S0CMX：最大S0容量（KB）S0C：当前S0容量（KB）S1CMX：最大S1容量（KB）S1C：当前S1容量（KB）ECMX：最大伊甸园容量（KB）EC：当前伊甸园容量（KB）YGC：年轻代GC事件的数量FGC：Full GC事件的数量
- gcold：
    - MC：当前元空间使用大小（KB）
    - MU：元空间利用率（KB）
    - CCSC：压缩的类的大小（KB）
    - CCSU：使用的压缩类空间（KB）
    - OC：当前的老年代空间容量（KB）
    - OU：来年代空间利用率（KB）
    - YGC：年轻代GC事件的数量
    - FGC：Full GC事件的数量
    - FGCT：Full GC垃圾收集时间
    - GCT：总垃圾收集时间
- gcoldcapacity：
    - OGCMN：最小老年代容量（KB）
    - OGCMX：最大老年代容量（KB）
    - OGC：当前老年代容量（KB）
    - OC：当前old space容量（KB）
    - YGC：年轻代GC事件的数量
    - FGC：Full GC事件的数量
    - FGCT：Full GC垃圾收集时间
    - GCT：总垃圾收集时间
- gcmetacapacity：
    - MCMN：最小元空间容量（KB）
    - MCMX：最大元空间容量（KB）
    - MC：元空间大小（KB）
    - CCSMN：压缩的类空间最小容量（KB）
    - CCSMX：压缩的类空间最大容量（KB）
    - YGC：年轻代GC事件的数量
    - FGC：Full GC事件的数量
    - FGCT：Full GC垃圾收集时间
    - GCT：总垃圾收集时间
- gcutil：
    - S0：第一个存活区(S0)利用率
    - S1：第二个存活区(S1)利用率
    - E：Eden空间利用率
    - O：老年代空间利用率
    - M：元空间利用率
    - CCS：压缩的类空间利用率
    - YGC：年轻代GC事件的数量
    - YGCT：年轻代垃圾回收时间
    - FGC：Full GC事件的数量
    - FGCT：Full GC垃圾收集时间
    - GCT：总垃圾收集时间
- printcompilation：
    - Compiled：由最近编译的方法去执行的编译任务数
    - Size：最近编译的方法的字节码的字节数
    - Type：最近编译的方法的编译类型。
    - Method：标识最近编译的方法的类名和方法名。类名使用 / 代替点 . 作为名称空间分隔符；方法名称是指定类中的方法。这两个字段的格式与HotSpot -XX:+PrintCompilation 选项一致。

#### 1.1.2.3、使用实例

> 示例1：查看21891这个进程的gc相关信息，每隔250ms采样1次，采样7次

```shell
jstat -gcutil 21891 250 7
```

> 示例2：显示有关新生代行为的统计信息，重复列标题：

```shell
jstat -gcnew -h3 21891 250 
```

> 示例3：查看remote.domain机器上的40496这个进程有关垃圾收集统计信息的摘要，每隔1秒采样1次：

```shell
jstat -gcutil 40496@remote.domain 1000
```

## 1.2、故障排查工具

### 1.2.1、jinfo

#### 1.2.1.1、作用

- jinfo全称Java Configuration Info，主要用来查看与调整JVM参数。

#### 1.2.1.2、使用说明

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1648402826460-c17ac6e7-33c2-4b2b-a88a-4937fed9b946.png#clientId=ub7c9efc9-ad60-4&from=paste&height=171&id=ucc2d78e7&name=image.png&originHeight=376&originWidth=1052&originalType=binary&ratio=1&rotation=0&showTitle=false&size=73152&status=done&style=none&taskId=u359f196e-0c20-40b4-8223-d4840239d92&title=&width=478.18180781750664)

| 参数                   | 说明                                                         |
| ---------------------- | ------------------------------------------------------------ |
| -flag <name>           | 打印指定参数的值                                             |
| -flag [+&#124;-]<name> | 启用/关闭指定参数                                            |
| -flag <name>=<value>   | 将指定的参数设置为指定的值                                   |
| -flags                 | 打印VM参数                                                   |
| -sysprops              | 打印系统属性（笔者注：系统属性打印的是System.getProperties()的结果） |
| <no option>            | 打印VM参数及系统属性                                         |

#### 1.2.1.3、使用示例

> 示例1：打印42342这个进程的VM参数及Java系统属性：

```shell
jinfo 42342
```

> 示例2：打印42342这个进程的Java系统属性

```shell
jinfo -sysprops 42342
```

> 示例3：打印42342这个进程的VM参数

```shell
jinfo -flags 42342
```

示例4：打印42342这个进程ConcGCThreads参数的值

```shell
jinfo -flag ConcGCThreads 42342
```

**动态修改参数**

> 示例5：将42342这个进程的PrintClassHistogram设置为false

```shell
jinfo -flag -PrintClassHistogram 42342
```

> 示例6：将42342这个进程的MaxHeapFreeRatio设置为80

```shell
jinfo -flag MaxHeapFreeRatio=80 42342
```

#### 1.2.1.4、提示

虽然可用jinfo动态修改VM参数，但并非所有参数都支持动态修改，如果操作了不支持的修改的参数，将会报类似如下的异常：

> Exception in thread "main" com.sun.tools.attach.AttachOperationFailedException: flag 'xxx' cannot be changed

使用如下命令显示出来的参数，基本上都是支持动态修改的：

> java -XX:+PrintFlagsInitial | grep manageable
>
> - -XX:+PrintFlagsFinal：将JVM参数打印到日志

### 1.2.2、jmap

#### 1.2.2.1、作用

- jmap全称Java Memory Map，用来展示对象内存映射或堆内存详细信息。
- 对于JDK9及更高版本，部分功能可使用 jhsdb代替 jmap ，也可用jcmd代替

#### 1.2.2.2、使用说明

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1648403396961-5bd23f6b-06b4-47ce-ae2d-ac42e298a859.png#clientId=ub7c9efc9-ad60-4&from=paste&height=425&id=ub14ad6d3&name=image.png&originHeight=936&originWidth=1736&originalType=binary&ratio=1&rotation=0&showTitle=false&size=220421&status=done&style=none&taskId=uf7598da6-f515-4ce4-aed5-91098917047&title=&width=789.0908919878246)
**格式：**
jmap [options] pid
**options的可选项如下：**

| 参数               | 说明                                                         |
| ------------------ | ------------------------------------------------------------ |
| -clstats           | 连接到正在运行的进程，并打印Java堆的类加载器统计信息         |
| -finalizerinfo     | 连接到正在运行的进程，并打印等待finalization的对象的信息     |
| -histo[:live]      | 连接到正在运行的进程，并打印Java堆的直方图。如果指定了live子选项，则仅统计活动对象 |
| -dump:dump_options | 连接到正在运行的进程，并转储Java堆。其中，dump_options的取值为： |

- live：指定时，仅Dump活动对象；如果未指定，则转储堆中的所有对象
- format=b：以hprof格式Dump堆
- file=filename：将堆Dump到filename
  |

#### 1.2.2.3、使用示例

> # 展示63120进程的类加载统计信息

```shell
jmap -clstats 63120
```

> # 展示63120进程中等待finalization的对象的信息

```shell
jmap -finalizerinfo 63120
```

> # 展示63120进程中堆的直方图

```shell
jmap -histo 63120
```

> # 展示63120进程堆中存活对象的直方图

```shell
jmap -histo:live 63120
```

> # Dump 63120这个进程中的存货对象的堆到dump.hprof文件

```shell
jmap -dump:live,format=b,file=dump.hprof 63120
```

#### 1.2.2.4、拓展知识

要想获取Java堆Dump，除使用jmap外，还有以下方法：

- 使用-XX:+HeapDumpOnOutOfMemoryError，让虚拟机在OOM异常出现后自动生成堆Dump文件；
- 使用-XX:+HeapDumpOnCtrlBreak，可使用[Ctrl]+[Break]，让虚拟机生成堆Dump文件；
- 在Linux操作系统下，发送 kill -3 pid 命令；
- 对于Spring Boot应用，也可以使用Spring Boot Actuator提供的/actuator/heapdump实现堆Dump。

### 1.2.3、jstack

#### 1.2.3.1、作用

- jstack，全称Stack Trace for Java，用于打印当前虚拟机的线程快照（线程快照也叫Thread Dump或者javacore文件）。
- 部分功能可用 jhsdb jstack 代替。
- 不同版本参数不同(JDK 8有-m、-F参数等，JDK 11都没了)

#### 1.2.3.2、使用说明

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1648403681447-716b4517-dc7a-4f23-9484-366fb6670f3b.png#clientId=ub7c9efc9-ad60-4&from=paste&height=115&id=ua50414bf&name=image.png&originHeight=254&originWidth=1016&originalType=binary&ratio=1&rotation=0&showTitle=false&size=43851&status=done&style=none&taskId=uc8e4a30e-2b12-4e75-9b4c-44094fdf1e6&title=&width=461.8181718085425)
-l  		显示有关锁的额外信息     
-e  		展示有关线程的额外信息（比如分配了多少内存、定义了多少个类等等）     
-? 		-h --help -help to print this help message

#### 1.2.3.3、使用示例

jstack 63120
jstack -l 63120
jstack -l -e 63120

### 1.2.4、jcmd

#### 1.2.4.1、作用

- jcmd全称JVM Command，用于将诊断命令请求发送到正在运行的Java虚拟机，从JDK 7开始提供。

#### 1.2.4.2、使用说明

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1648403887410-f2769149-c572-4231-99d5-4cb0725bcbde.png#clientId=ub7c9efc9-ad60-4&from=paste&height=205&id=ue3914857&name=image.png&originHeight=452&originWidth=1016&originalType=binary&ratio=1&rotation=0&showTitle=false&size=87905&status=done&style=none&taskId=ua7fc09e4-6350-4645-83d1-37bc2d1f244&title=&width=461.8181718085425)
-f  		从文件读取并执行命令   
-l  		列出本机上的所有JVM进程   
-h  		this help

- pid：接收诊断命令请求的进程ID。
- main class ：接收诊断命令请求的进程的main类。jcmd会将诊断命令请求发送给具有指定main class的所有Java进程。
- command：command必须是一个有效的jcmd命令，可使用 jcmd pid help 命令查看可用的命令列表。如果pid是0，那么command将会被发送给所有Java进程。main class会用来去匹配（局部匹配或全量匹配）。如果未指定任何选项，它将会列出正在运行的Java进程标识符以及用于启动该进程的main class和命令行参数（相当于使用了-l参数）
- PerfCounter.print：打印指定Java进程上可用的性能计数器。
- -f filename：从指定文件中读取命令并执行。在file中，每个命令必须写在单独的一行。以"#"开头的行会被忽略。当所有行的命令被调用完毕后，或者读取到含有stop关键字的命令，将会终止对file的处理。
- -l：查看所有的JVM进程。jcmd不使用参数与jcmd -l效果相同。

#### 1.2.4.3、使用示例

> # 查看所有JVM进程

```shell
jcmd -l
```

> # 打印指定进程上可用的性能计数器

```shell
jcmd 26089 PerfCounter.print
```

> # 打印所有启动类为com.imooc.Application的应用上可用的性能计数器

```shell
jcmd com.imooc.Application PerfCounter.print
```

> # 打印指定进程的代码缓存的布局和边界

```shell
jcmd 26089 Compiler.codecache
```

#### 1.2.4.4、支持的命令

1. help [options] [arguments]
    - 作用：查看指定命令的帮助信息
    - arguments：想查看帮助的命令（STRING，无默认值）
    - options：选项，必须使用key或者key=value的预发指定，可用的options如下
        - -all：（可选）查看所有命令的帮助信息（BOOLEAN，false）

使用示例：

> # 获得指定进程可用的命令列表

```shell
jcmd <pid> help
```

> # 获取指定进程、指定命令的帮助信息，如果参数包含空格，需用'或者"引起来

```shell
jcmd <pid> help <command>
```

2. Compiler.codecache
    - 作用：打印code cache（代码缓存）的布局和边界
    - 影响：低
    - 所需权限： java.lang.management.ManagementPermission(monitor)
3. Compiler.codelist
    - 作用：打印代码缓存中所有仍在运行的已编译方法
    - 影响：中
    - 所需权限： java.lang.management.ManagementPermission(monitor)
4. Compiler.queue
    - 作用：打印排队等待编译的方法
    - 影响：低
    - 所需权限： java.lang.management.ManagementPermission(monitor)
5. Compiler.directives_add filename arguments
    - 作用：从文件添加编译器指令
    - 影响：低
    - 所需权限： java.lang.management.ManagementPermission(monitor)
    - filename：指令文件的名称（STRING，无默认值）
6. Compiler.directives_clear
    - 作用：删除所有编译器指令
    - 影响：低
    - 所需权限： java.lang.management.ManagementPermission(monitor)
7. Compiler.directives_print
    - 作用：打印所有活动的编译器指令。
    - 影响：低
    - 所需权限： java.lang.management.ManagementPermission(monitor)
8. Compiler.directives_remove
    - 作用：删除最新添加的编译器指令。
    - 影响：低
    - 所需权限： java.lang.management.ManagementPermission(monitor)
9. GC.class_histogram [options]
    - 作用：提供有关Java堆使用情况的统计信息。
    - 影响：高-取决于Java堆的大小和内容。
    - 所需权限： java.lang.management.ManagementPermission(monitor)
    - options：选项，必须使用key或者key=value的预发指定，可用的options如下：
        - -all：（可选）检查所有对象，包括不可达的对象（BOOLEAN，false）
10. GC.class_stats [options] [arguments]

- 作用：展示有关Java类元数据的统计信息
- 影响：高-取决于Java堆的大小和内容。
- options：选项，必须使用key或者key=value的预发指定，可用的options如下：
    - -all：（可选）显示所有列（BOOLEAN，false）
    - -csv：（可选）以CSV格式打印电子表格（BOOLEAN，false）
    - -help：（可选）显示所有列的含义（BOOLEAN，false）
- arguments：参数，可选参数如下：
    - columns：（可选）要显示的列，以逗号分隔。如果不指定，则显示以下列：
        - InstBytes
        - KlassBytes
        - CpAll
        - annotations
        - MethodCount
        - Bytecodes
        - MethodAll
        - ROAll
        - RWAll
        - Total

使用示例：

> # 展示指定进程类的元数据的所有统计信息

```shell
jcmd 48758 GC.class_stats -all
```

> # InstBytes、KlassBytes等列的含义

```shell
jcmd 48758 GC.class_stats -help
```

> # 显示InstBytes,KlassBytes这两列，并生成csv

```shell
jcmd 48758 GC.class_stats -csv  InstBytes,KlassBytes > t.csv
```

11. GC.finalizer_info

- 作用：展示有关Java finalization queue的信息。
- 影响：中
- 所需权限： java.lang.management.ManagementPermission(monitor)

12. GC.heap_dump [options] [arguments]

- 作用：生成Java堆Dump文件（HPROF格式）
- 影响：高-取决于Java堆的大小和内容。除非指定了 -all 选项，否则将会导致Full GC
- 所需权限： java.lang.management.ManagementPermission(monitor)
- options：选项，必须使用key或者key=value的预发指定，可用的options如下：
    - -all：（可选）转储所有对象，包括不可达的对象（BOOLE AN，false）
- arguments：参数，可用的参数如下：
    - filename：Dump文件的名称（STRING，无默认值）

使用示例：
jcmd 48758 GC.heap_dump -all 1.hprof

13. GC.heap_info

- 作用：展示Java堆信息。
- 影响：中
- 所需权限： java.lang.management.ManagementPermission(monitor)

14. GC.run

- 作用：调用 java.lang.System.gc()
- 影响：中-取决于Java堆的大小和内容

15. GC.run_finalization

- 作用： java.lang.System.runFinalization()
- 影响：中-取决于Java内容。

16. JFR.check [options]

- 请参阅《Java Flight Recorder命令参考》中的JFR.check。

17. JFR.configure [options]

- 请参阅《Java Flight Recorder命令参考》中的JFR.configure。

18. JFR.dump [options]

- 请参阅《Java Flight Recorder命令参考》中的JFR.dump。

19. JFR.start [options]

- 请参阅《Java Flight Recorder命令参考》中的JFR.start。

20. JFR.stop [options]

- 请参阅《Java Flight Recorder命令参考》中的JFR.stop。

21. JVMTI.agent_load [arguments]

- 作用：加载JVMTI本机代理。
- 影响：低
- 所需权限： java.lang.management.ManagementPermission(control)
- arguments：
    - library path：要加载的JVMTI代理的绝对路径（STRING，无默认值）
    - agent option：（可选）用于传递代理的选项字符串（STRING，无默认值）

22. JVMTI.data_dump

- 作用：通知JVM对JVMTI进行数据转储
- 影响：高
- 所需权限： java.lang.management.ManagementPermission(monitor)

23. ManagementAgent.start [options]

- 作用：启动远程管理代理
- 影响：低-无影响
- options：选项，必须使用key或者key=value的预发指定，可用的options如下：
    - config.file：（可选）设置 com.sun.management.config.file（STRING，无默认值）
    - jmxremote.host：（可选）设置com.sun.management.jmxremote.host（STRING，无默认值）
    - jmxremote.port：（可选）设置com.sun.management.jmxremote.port（STRING，无默认值）
    - jmxremote.rmi.port：（可选）设置com.sun.management.jmxremote.rmi.port（STRING，无默认值）
    - jmxremote.ssl：（可选）设置com.sun.management.jmxremote.ssl（STRING，无默认值）
    - jmxremote.registry.ssl：（可选）设置com.sun.management.jmxremote.registry.ssl（STRING，无默认值）
    - jmxremote.authenticate：（可选）设置com.sun.management.jmxremote.authenticate（STRING，无默认值）
    - jmxremote.password.file：（可选）设置com.sun.management.jmxremote.password.file（STRING，无默认值）
    - jmxremote.access.file：（可选）设置com.sun.management.jmxremote.access.file（STRING，无默认值）
    - jmxremote.login.config：（可选）设置com.sun.management.jmxremote.login.config（STRING，无默认值）
    - jmxremote.ssl.enabled.cipher.suites：（可选）集com.sun.management。
    - jmxremote.ssl.enabled.cipher.suite：（STRING，无默认值）
    - jmxremote.ssl.enabled.protocols：（可选）设置com.sun.management.jmxremote.ssl.enabled.protocols（STRING，无默认值）
    - jmxremote.ssl.need.client.auth：（可选）设置com.sun.management.jmxremote.need.client.auth（STRING，无默认值）
    - jmxremote.ssl.config.file：（可选）设置com.sun.management.jmxremote.ssl_config_file（STRING，无默认值）
    - jmxremote.autodiscovery：（可选）设置com.sun.management.jmxremote.autodiscovery（STRING，无默认值）
    - jdp.port：（可选）设置com.sun.management.jdp.port（INT，无默认值）
    - jdp.address：（可选）设置com.sun.management.jdp.address（STRING，无默认值）
    - jdp.source_addr：（可选）设置 com.sun.management.jdp.source_addr（STRING，无默认值）
    - jdp.ttl：（可选）设置com.sun.management.jdp.ttl（INT，无默认值）
    - jdp.pause：（可选）设置com.sun.management.jdp.pause（INT，无默认值）
    - jdp.name：（可选）设置com.sun.management.jdp.name（STRING，无默认值）

24. ManagementAgent.start_local

- 作用：启动本地管理代理
- 影响：低-无影响

25. ManagementAgent.status

- 作用：展示管理代理的状态
- 影响：低-无影响
- 所需权限： java.lang.management.ManagementPermission(monitor)

26. ManagementAgent.stop

- 作用：停止远程管理代理
- 影响：低-无影响

27. Thread.print [options]

- 作用：打印所有带有堆栈跟踪的线程。
- 影响：中-取决于线程数。
- 所需权限： java.lang.management.ManagementPermission(monitor)
- options：选项，必须使用key或者key=value的预发指定，可用的options如下：
    - -l：（可选）打印 java.util.concurrent 锁（BOOLEAN，false）

使用示例：
jcmd 48758 Thread.print -l

28. VM.check_commercial_features

- 作用：显示商业特性的状态
- 影响：低-无影响

29. VM.unlock_commercial_features

- 作用：解锁商业功能
- 影响：低-无影响
- 所需权限： java.lang.management.ManagementPermission(control)

30. VM.classloader_stats

- 作用：打印所有ClassLoader的统计信息。
- 影响：低
- 所需权限： java.lang.management.ManagementPermission(monitor)

31. VM.class_hierarchy [options] [arguments]

- 作用：打印所有已加载类的列表，缩进以显示类层次结构。每个类的名称后跟其ClassLoader的ClassLoaderData* ，如果由bootstrap class loader加载，则为null
- 影响：中-取决于已加载类的数量。
- 所需权限： java.lang.management.ManagementPermission(monitor)
- options：选项，必须使用key或者key=value的预发指定，可用的options如下：
    - -i：（可选）打印继承的接口（BOOLEAN，false）
    - -s：（可选）如果指定了类名，则将打印子类。如果未指定类名，则仅打印超类（BOOLEAN，false）
- arguments：参数，可用项如下：
    - classname：（可选）打印指定类的层次结构，如果未指定，则将打印所有类层次结构（STRING，无默认值）

使用示例：
jcmd 48758 VM.class_hierarchy -i -s javax.servlet.GenericFilter

32. VM.command_line

- 作用：打印用于启动此VM实例的命令行
- 影响：低
- 所需权限： java.lang.management.ManagementPermission(monitor)

33. VM.dynlibs

- 作用：打印加载的动态库
- 影响：低
- 允许： java.lang.management.ManagementPermission(monitor)

34. VM.info

- 作用：打印有关JVM环境和状态的信息
- 影响：低
- 允许： java.lang.management.ManagementPermission(monitor)

35. VM.log [options]

- 作用：列出当前日志配置，启用/禁用/配置日志输出，或轮换所有日志
- 影响：低
- 所需权限：java.lang.management.ManagementPermission(control)
- options：选项，必须使用key或者key=value的预发指定，可用的options如下：
    - output：（可选）要配置的输出的名称或索引。（STRING，无默认值）
    - output_options：（可选）输出的选项。（STRING，无默认值）
    - what：（可选）配置要记录的标签。（STRING，无默认值）
    - decorators：（可选）配置要使用的装饰器。使用’none’或空值删除所有内容。（STRING，无默认值）
    - disable：（可选）关闭所有日志记录并清除日志配置。（布尔值，无默认值）
    - list：（可选）列出当前的日志配置。（布尔值，无默认值）
    - rotate：（可选）轮换所有日志。（布尔值，无默认值）

使用示例：
jcmd 48758 VM.log output what

36. VM.flags [options]

- 作用：打印VM标志及其当前值。
- 影响：低
- 所需权限： java.lang.management.ManagementPermission(monitor)
- options：选项，必须使用key或者key=value的语法指定，可用的options如下：
    - -all：（可选）打印VM支持的所有标志（BOOLEAN，false）

37. VM.native_memory [options]

译者注：该功能叫做“Native Memory Tracking (NMT)”，需开启如下参数，才可打开。

-XX:NativeMemoryTracking=[off | summary | detail]

打开后会带来5-10%的性能损耗。

也可用 -XX:+UnlockDiagnosticVMOptions -XX:+PrintNMTStatistics ，让JVM在退出时打印NMT报告。

- 作用：打印native内存使用情况
- 影响：中
- 允许： java.lang.management.ManagementPermission(monitor)
- options：选项，必须使用key或者key=value的预发指定，可用的options如下：
    - summary：（可选）请求运行时报告当前内存摘要，包括所有保留和提交的内存以及每个子系统的内存使用情况摘要(BOOLEAN, false)
    - detail：（可选）请求运行时报告每个调用站点(callsite) > = 1K的内存分配(BOOLEAN, false)
    - baseline：（可选）请求运行时以当前内存使用情况为基准，以便以后进行比较(BOOLEAN, false)
    - summary.diff：（可选）请求运行时报告与先前基准的内存摘要比较(BOOLEAN, false)
    - detail.diff ：（可选）请求运行时报告与先前基准的内存详情比较，该基准显示了在不同调用站点(callsite)的内存分配活动(BOOLEAN, false)
    - shutdown：（可选）请求运行时关闭自身并释放运行时使用的内存(BOOLEAN, false)
    - statistics：（可选）打印跟踪器统计信息以进行调整(BOOLEAN, false)
    - scale：（可选）以MB，MB或GB为单位的内存使用量(STRING, KB )

38. VM.print_touched_methods

- 作用：打印此JVM生命周期中曾经接触过的所有方法
- 影响：中-取决于Java内容

39. VM.set_flag [arguments]

- 作用：设置VM标志
- 影响：低
- 所需权限： java.lang.management.ManagementPermission(control)
- arguments：
    - 标志名称：您要设置的标志名称（STRING，无默认值）
    - 字符串值：（可选）要设置的值（STRING，无默认值）

40. VM.stringtable [options]

- 作用：转储字符串表(string table)
- 影响：中-取决于Java内容。
- 所需权限： java.lang.management.ManagementPermission(monitor)
- options：选项，必须使用key或者key=value的预发指定，可用的options如下：
    - -verbose：（可选）转储表中每个字符串的内容（BOOLEAN，false）

使用示例：
jcmd 48758 VM.stringtable -verbose

41. VM.symboltable [options]

- 作用：转储符号表
- 影响：中-取决于Java内容
- 所需权限： java.lang.management.ManagementPermission(monitor)
- options：选项，必须使用key或者key=value的预发指定，可用的options如下：
    - -verbose ：（可选）转储表中每个符号的内容（BOOLEAN，false）

使用示例：
jcmd 48758 VM.symboltable -verbose

42. VM.systemdictionary

- 作用：打印字典哈希表大小和存储桶长度的统计信息
- 影响：中
- 所需权限： java.lang.management.ManagementPermission(monitor)
- options：选项，必须使用key或者key=value的预发指定，可用的options如下：
    - verbose ：（可选）为所有class loader转储每个词典条目的内容（BOOLEAN，false）。

使用示例：
jcmd 48758 VM.systemdictionary -verbose

43. VM.system_properties

- 作用：打印系统属性
- 影响：低
- 所需权限： java.util.PropertyPermission(*, read)

44. VM.uptime [options]

- 作用：打印虚拟机的运行时间
- 影响：低
- options：选项，必须使用key或者key=value的预发指定，可用的options如下：
    - -date ：（可选）添加带有当前日期的前缀（BOOLEAN，false）

45. VM.version

- 作用：打印JVM版本信息
- 影响：低
- 所需权限： java.util.PropertyPermission(java.vm.version, read)

### 1.2.5、jhat

#### 1.2.5.1、作用

- jhat（JVM Heap Analysis Tool）用来分析jmap生成的堆Dump。
- jhat功能不是很强，VisualVM、Eclipse Memory Analyzer等都比jhat强大，**建议优先使用jhat的替代工具。**

#### 1.2.5.2、使用说明

命令格式：
jhat [options] heap-dump-file
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1648405291340-2f3f896a-3d49-4754-b6d7-746a67d96a2c.png#clientId=ub7c9efc9-ad60-4&from=paste&height=332&id=ucd6f0cad&name=image.png&originHeight=730&originWidth=1720&originalType=binary&ratio=1&rotation=0&showTitle=false&size=169581&status=done&style=none&taskId=u775b45bb-30e1-49e5-9bea-fbc4b9b5052&title=&width=781.8181648727294)
options的可选项如下：

| 参数                     | 说明                                                         |
| ------------------------ | ------------------------------------------------------------ |
| -stack false &#124; true | 开启或关闭跟踪对象分配调用栈，默认true                       |
| -refs false &#124; true  | 开启或关闭对对象引用的跟踪，默认true                         |
| -port port-number        | 指定jhat HTTP Server的端口，默认7000                         |
| -exclude exclude-file    | 指定一个文件，该文件列出了应从可达对象查询中排除的数据成员。例如，如果文件包含java.lang.String.value，则对于指定对象o，不管对象列表针对o是否可达，都不会考虑涉及java.lang.String.value的引用路径 |
| -baseline exclude-file   | 指定基线堆Dump文件。两个堆Dunmp中，具有相同对象ID的对象都会标记为不是新对象，其他对象被标记为新对象。这对于比较两个不同的堆转储很有用。 |
| -debug intSets           | 指定该工具的debug级别。设置为0，则不会有debug输出。数值越高，日志越详细。 |
| -version                 | 显示版本                                                     |

#### 1.2.5.3、使用示例

> # 分析1.hprof，并开启对象分配调用栈的分析

```shell
jhat -stack true 1.hprof
```

> # 分析1.hprof，开启对象分配调用栈的分析，关闭对象引用的分析

```shell
jhat -stack true -refs false 1.hprof
```

等待片刻之后，访问 [http://localhost:7000/](http://localhost:7000/) 即可查看分析结果。

### 1.2.6、jhsdb

#### 1.2.6.1、作用

- Jhsdb全称Java Hotspot Debugger，Hotspot进程调试器，可用于从崩溃的JVM附加到Java进程或核心转储。
- jhsdb是一款基于Serviceability Agent（可维护性代理，简写为SA）的调试工具。Serviceability Agent是一个JDK组件，用于快照调试、性能分析以及深入了解Hotspot JVM / Hotspot JVM上执行的Java应用程序。
- 它的工作原理有点类似于Linux上的GDB或者Windows上的Windbg。但尽管诸如gdb的本机调试器可用于检查JVM，但这类本机调试器对Hotspot中的数据结构没有内在了解，因此无法对正在执行的Java应用程序进行深入了解。jhsdb了解JVM关键组件（例如Java堆，堆的代，region，代码缓存等）的位置和地址范围。
- 尽管JDK 8及更低版本不直接提供jhsdb命令，但依然其实也是可以使用jhsdb的，只需找到 JAVA_HOME/lib 目录下的sa-jdi.jar文件，然后启动即可。步骤如下：
    - 修改环境变量JAVA_HOME（这里用export临时修改环境变量，当然也可永久修改）
        - export JAVA_HOME="/Library/Java/JavaVirtualMachines/jdk1.8.0_201.jdk/Contents/Home"
    - 为sa-jdi.jar授予执行权限
        - sudo chmod +x $JAVA_HOME/lib/sa-jdi.jar
    - 启动方式1：使用交互式命令行调试器（相当于jhsdb clhsdb）
        - java -cp $JAVA_HOME/lib/sa-jdi.jar sun.jvm.hotspot.CLHSDB
    - 启动方式2：使用交互式GUI调试器启动jhsdb（相当于jhsdb hsdb）
        - java -cp $JAVA_HOME/lib/sa-jdi.jar sun.jvm.hotspot.HSDB

#### 1.2.6.2、使用说明

> # 启动交互式命令行调试器

```shell
jhsdb clhsdb [--pid pid | --exe executable --core coredump]
```

> # 启动远程调试服务器

```shell
jhsdb debugd [options] (pid | executable coredump) [server-id]
```

> # 启动交互式GUI调试器

```shell
jhsdb hsdb [--pid pid | --exe executable --core coredump]
```

> # 打印堆栈并锁定信息

```shell
jhsdb jstack [--pid pid | --exe executable --core coredump] [options]
```

> # 打印堆信息

```shell
jhsdb jmap [--pid pid | --exe executable --core coredump] [options]
```

> # 打印基本的JVM信息

```shell
jhsdb jinfo [--pid pid | --exe executable --core coredump] [options]
```

> # 打印性能计数器信息

```shell
jhsdb jsnap [options] [--pid pid | --exe executable --core coredump] 
```

其中：

- pid：进程号
- server-id：当多个调试服务器在同一远程主机上运行时使用的可选唯一ID
- executable：从中生成核心转储的Java可执行文件
- coredump：jhsdb工具连接到的Dump文件
    - coredump介绍与开启方式：[https://www.cnblogs.com/Anker/p/6079580.html](https://www.cnblogs.com/Anker/p/6079580.html)
- options：命令行选项，和子命令有关。
    - –pid、–exe参数二选一必填

#### 1.2.6.3、使用示例

##### 1.2.6.3.1、jhsdb clhsdb子命令

> # 进入clhsdb

```shell
jhsdb clhsdb --pid 81033
```

进入交互界面后，输入help，查看相关的命令，命令如下：

```shell
Available commands:
  assert true | false turn on/off asserts in SA code
  attach pid | exec core  attach SA to a process or core
  buildreplayjars [all | boot | app] build jars for replay, boot.jar for bootclasses, app.jar for application classes
  class name find a Java class from debuggee and print oop
  classes print all loaded Java classes with Klass*
  detach detach SA from current target
  dis address [ length ]  disassemble (sparc/x86) specified number of instructions from given address
  dissemble address disassemble nmethod
  dumpcfg -a | id Dump the PhaseCFG for every compiler thread that has one live
  dumpclass { address | name } [ directory ] dump .class file for given Klass* or class name
  dumpcodecache dump codecache contents
  dumpheap [ file ] dump heap in hprof binary format
  dumpideal -a | id dump ideal graph like debug flag -XX:+PrintIdeal
  dumpilt -a | id dump inline tree for C2 compilation
  dumpreplaydata 
 | -a |  [>replay.txt] dump replay data into a file
  echo [ true | false ] turn on/off command echo mode
  examine [ address/count ] | [ address,address] show contents of memory from given address
  field [ type [ name fieldtype isStatic offset address ] ] print info about a field of HotSpot type
  findpc address print info. about pointer location
  flags [ flag ] show all -XX flag name value pairs. or just show given flag
  help [ command ] print help message for all commands or just given command
  history show command history. usual !command-number syntax works.
  inspect expression inspect a given oop
  intConstant [ name [ value ] ] print out hotspot integer constant(s)
  jdis address show bytecode disassembly of a given Method*
  jhisto show Java heap histogram
  jseval script evaluate a given string as JavaScript code
  jsload file load and evaluate a JavaScript file
  jstack [-v] show Java stack trace of all Java threads. -v is verbose mode
  livenmethods show all live nmethods
  longConstant [ name [ value ] ] print out hotspot long constant(s)s
  mem address [ length ] show contents of memory -- also shows closest ELF/COFF symbol if found
  pmap show Solaris pmap-like output
  print expression print given Klass*, Method* or arbitrary address
  printas type expression print given address as given HotSpot type. eg. print JavaThread <address>
  printmdo -a | expression print method data oop
  printstatics [ type ] print static fields of given HotSpot type (or all types if none specified)
  pstack [-v] show mixed mode stack trace for all Java, non-Java threads. -v is verbose mode
  quit quit CLHSDB tool
  reattach detach and re-attach SA to current target
  revptrs  find liveness of oops
  scanoops start end [ type ] scan a Oop from given start to end address
  search [ heap | codecache | threads ] value search a value in heap or codecache or threads
  source filename load and execute CLHSDB commands from given file
  symbol name show address of a given ELF/COFF symbol
  sysprops show all Java System properties
  thread id show thread of id
  threads show all Java threads
  tokenize ...
  type [ type [ name super isOop isInteger isUnsigned size ] ] show info. on HotSpot type
  universe print gc universe
  vmstructsdump dump hotspot type library in text
  verbose true | false turn on/off verbose mode
  versioncheck [ true | false ] turn on/off debuggee VM version check
  whatis address print info about any arbitrary address
  where { -a | id } print Java stack trace of given Java thread or all Java threads (-a)
```

2. **jhsdb hsdb子命令**

示例：

> # 图形化模式，和clhsdb功能对标

```shell
jhsdb hsdb --pid 81033
```

##### 1.2.6.3.3、jhsdb jinfo子命令

- –flags：打印VM标志
- –sysprops：打印Java系统属性
- 留空：打印VM标志和Java系统属性

示例：

> # 打印80904进程的VM标志

```shell
jhsdb jinfo --flags --pid 80904 
```

> # 打印80904进程的系统属性

```shell
 jhsdb jinfo --sysprops --pid 80904
```

##### 1.2.6.3.4、jhsdb jmap子命令

- –heap：打印Java堆的概要信息
- –binaryheap：将Java堆以hprof格式Dump出来
- –dumpfile：执行dump文件名
- –histo：打印Java堆的直方图
- –clstats：打印Java堆的类加载器统计信息
- –finalizerinfo：打印等待finalization的对象的信息

> # 打印81033进程Java堆的直方图

```shell
jhsdb jmap --histo --pid 81033
```

> # 将81033进程的Java堆dump到2.hprof

```shell
jmap --binaryheap --dumpfile 2.hprof --pid 81033
```

##### 1.2.6.3.5、jhsdb jstack子命令

- –locks：打印java.util.concurrent锁的信息
- –mixed：尝试打印Java栈与本地方法栈的信息（需操作系统支持）

示例：

> # 打印81033锁的信息，并尝试打印Java栈与本地方法栈的信息

```shell
 jhsdb jstack --locks --mixed --pid 81033
```

##### 1.2.6.3.6、**jhsdb jsnap子命令**

- –all：打印所有性能计数器的信息

示例：

> jhsdb jsnap --all --pid 81033

相当于：

> jcmd 81033 PerfCounter.print

##### 1.2.6.3.7、jhsdb debugd子命令

- server-id：当多个调试服务器在同一远程主机上运行时使用的可选唯一ID

示例：

> jhsdb debugd 81033

**TIPS**
debugd子命令的格式和其他子命令不同，这是个bug，在JDK 13中已经和其他子命令保持一致了。
[https://bugs.openjdk.java.net/browse/JDK-8223666](https://bugs.openjdk.java.net/browse/JDK-8223666)

#### 1.2.6.4、jhsdb和其他工具的对比

| **功能**     | **JHSDB**                                             | **JCMD**                      | **类似**            |
| ------------ | ----------------------------------------------------- | ----------------------------- | ------------------- |
| 展示Java进程 | N/A                                                   | jcmd                          | jps -lm             |
| 堆Dump       | jhsdb jmap --binaryheap                               | jcmd pid GC.heap_dump         | jmap -dump pid      |
| 堆使用直方图 | jhsdb jmap --histo                                    | jcmd pid GC.class_histogram   | jmap -histo pid     |
| 线程Dump     | jhsdb jstack --locks (subset of locked thread frames) | jcmd pid Thread.print         | jstack pid          |
| 展示系统属性 | jhsdb jinfo --sysprops                                | jcmd pid VM.system_properties | jinfo -sysprops pid |
| 列出VM标记   | jhsdb jinfo --flags                                   | jcmd pid VM.flags             | jinfo -flags pid    |

#### 1.2.6.5、macOS下遇到的问题

在macOS下，目前最新的11.0.7中的jhsdb无法正常使用，会报类似如下异常：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1648406495220-41392c89-72d0-41dd-9134-6fc317a48991.png#clientId=ub7c9efc9-ad60-4&from=paste&height=247&id=u63250ab2&name=image.png&originHeight=544&originWidth=2066&originalType=binary&ratio=1&rotation=0&showTitle=false&size=198736&status=done&style=none&taskId=ud6f9787b-79f6-4da6-a297-0f5eecf191d&title=&width=939.0908887366622)
**这是JDK版本的问题（JDK bug，只在macOS下出现），只需将JDK降级至11.0.4即可**，也可在Linux或Windows下测试jhsdb工具。
JDK 11.0.4下载地址：

- [https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html](https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html)

安装完成后，先用JDK 11.0.4启动一个应用，然后即可使用jhsdb工具调试该应用了。

## 1.3、可视化工具

### 1.3.1、jhsdb（可参考上方**1.2.6、jhsdb**来看）

#### 1.3.1.1、作用

- jhsdb hsdb是jhsdb的子命令
- 本文基于JDK 11编写，理论适用于JDK 9及更高版本，对于JDK 8及更低版本

#### 1.3.1.2、使用说明

输入：
jhsdb hsdb [--pid pid | --exe executable --core coredump]
示例：
jhsdb hsdb --pid 81033

##### 1.3.1.2.1、Java Threads

**Java Threads**
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1648406691869-98726e47-cd0f-46f6-ae1d-475d7cc0561a.png#clientId=ub7c9efc9-ad60-4&from=paste&height=537&id=uae988395&name=image.png&originHeight=1182&originWidth=1706&originalType=binary&ratio=1&rotation=0&showTitle=false&size=160829&status=done&style=none&taskId=uf8757da6-0c04-4b2a-a657-5c4f8ace51d&title=&width=775.4545286470212)
进入后，可看到类似如上图的界面：
其中：

- OS Thread ID：线程id
- Java Thread Name：线程名称

**Inspect Thread**

- 选择一个线程，然后点击 Java Thread 对话框中的第一个图标，即可弹出 Inspector 对话框，从中可看到对线程的诊断。
- 其中展示了对象头和指向对象元数据的指针，里面包括了Java类型的名字、继承关系、实现接口关系，字段信息、方法信息、运行时常量池的指针、内嵌的虚方法表（vtable）以及接口方法表（itable）等。其实都是HotSpot VM里记录线程的一些基本信息的C++对象的内容。 如果对C++不熟悉，阅读起来会有一些困难。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1648406770623-cf90f60d-a5f2-4fbe-847e-2f214012b3cf.png#clientId=ub7c9efc9-ad60-4&from=paste&height=388&id=uae6f4303&name=image.png&originHeight=854&originWidth=1548&originalType=binary&ratio=1&rotation=0&showTitle=false&size=206206&status=done&style=none&taskId=u98a70708-c752-4628-97af-1bc455b40e6&title=&width=703.6363483854565)
**Stack Memory**

- 选择一个线程，然后点击 Java Thread 对话框中的第二个图标，即可弹出 Stack Memory 对话框，里面是线程栈的内存数据。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1648406793260-2c5c1622-a12a-45e4-aa56-ddf374f60c10.png#clientId=ub7c9efc9-ad60-4&from=paste&height=817&id=u1788ae1b&name=image.png&originHeight=1798&originWidth=2878&originalType=binary&ratio=1&rotation=0&showTitle=false&size=645798&status=done&style=none&taskId=uc0453fd7-c5ce-4942-a8b1-63f054cf4e4&title=&width=1308.1817898277416)
其中：

- 第一列：内存地址（虚拟地址，非物理内存地址）
- 第二列：该地址上存储的数据，以字宽为单位，本文是在macOS 64-bit上跑64位的HotSpot VM JDK 11，字宽是64位（8字节）
- 第三列是：对数据的注释，竖线表示范围，横线或斜线连接范围与注释文字。

如果想查看某个对象的内容，可如下操作：

- Windows - Console
- 输入inspect 想要查看对象的地址

如下图所示：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1648406832259-ef140fc1-0fd6-4dd8-a6ad-d22d0f3a1186.png#clientId=ub7c9efc9-ad60-4&from=paste&height=166&id=u974a3aa8&name=image.png&originHeight=366&originWidth=1560&originalType=binary&ratio=1&rotation=0&showTitle=false&size=111821&status=done&style=none&taskId=u15c71d33-aca3-489c-a01d-d34642d01e1&title=&width=709.0908937217779)
**Show Java stack trace**

- 选择一个线程，然后点击 Java Thread 对话框中的第三个图标，即可弹出 Show Java stack trace 对话框，里面展示了这个线程的线程栈

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1648406862372-7503374d-1b08-47f3-b7f1-1a8715470c6b.png#clientId=ub7c9efc9-ad60-4&from=paste&height=537&id=u60c59f29&name=image.png&originHeight=1182&originWidth=2574&originalType=binary&ratio=1&rotation=0&showTitle=false&size=307569&status=done&style=none&taskId=ue93f1965-f990-49cf-9617-867f64e76d2&title=&width=1169.9999746409335)
**Show Thread Information**

- 选择一个线程，然后点击 Java Thread 对话框中的第四个图标，即可弹出 Show Thread Information 相关信息，里面展示了这个线程的信息。
  ![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1648406886306-b9c7766e-0d46-4a9f-b84b-352c626c1d2e.png#clientId=ub7c9efc9-ad60-4&from=paste&height=614&id=u7571df32&name=image.png&originHeight=1350&originWidth=1800&originalType=binary&ratio=1&rotation=0&showTitle=false&size=192966&status=done&style=none&taskId=u37a2d07c-6b68-40ce-98d8-540af4f01f6&title=&width=818.1818004482052)

**Find Crashes**

- 选择一个线程，然后点击 Java Thread 对话框中的第五个图标，即可找到该线程崩溃的原因。目前我这边线程没有崩溃，所以展示不出效果。

##### 1.3.1.2.2、Windows Console

- 然后输入诊断命令，输入help可查看所有诊断命令。和jhsdb clhsdb里面的诊断命令一致。

##### 1.3.1.2.3、Tools（部分命令被去除）

提供一系列工具，这些工具其实是诊断命令的一个便捷化，也都可以用诊断命令代替。

- [HSDB(Hotspot Debugger) 使用](https://www.jianshu.com/p/073a9a603d79)
- [借HSDB来探索HotSpot VM的运行时数据](https://www.iteye.com/blog/rednaxelafx-1847971)
- [通过HSDB来查看HotSpot VM的运行时数据](https://www.cnblogs.com/bjlhx/p/10567830.html)

### 1.3.2、jconsole

#### 1.3.2.1、作用

- JConsole（Java Monitoring and Management Console）是一款基于JMX（Java Manage-ment Extensions）的可视化监控、管理工具。它主要通过JMX的MBean（Managed Bean）对系统进行信息收集和参数动态调整。
- JMX是一种开放性的技术，它既可以用在虚拟机本身的管理上，也可以用于运行在虚拟机之上的软件中。目前很多软件都支持基于JMX进行管理与监控。

#### 1.3.2.2、使用说明

**启动：**

> jconsole

![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1648407077228-598e4ddc-17a3-4b32-8d73-dfc85f4915c3.png#clientId=ub7c9efc9-ad60-4&from=paste&height=682&id=u53f1e508&name=image.png&originHeight=1500&originWidth=1800&originalType=binary&ratio=1&rotation=0&showTitle=false&size=165915&status=done&style=none&taskId=ubd332da8-4f48-439e-b773-61ab292a92f&title=&width=818.1818004482052)

- 对于本地JVM进程，jconsole会自动搜索踹，无需用户人工指定；
- 如果想要连接远程进程，请参见《远程连接》相关的内容

**使用**
选择进程后，即可看到jconsole的使用窗口了，如下图所示。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/1738514/1648407117928-844613ae-fcde-4c79-b5bb-f6a7115412af.png#clientId=ub7c9efc9-ad60-4&from=paste&height=583&id=u930c6935&name=image.png&originHeight=1282&originWidth=1832&originalType=binary&ratio=1&rotation=0&showTitle=false&size=193540&status=done&style=none&taskId=u55579f1f-4050-4008-8e41-86e20f9bff1&title=&width=832.7272546783955)

- 概览：展示虚拟机运行数据的概要信息，包括堆内存使用量、线程、类、CPU占用率的曲线图。这些曲线图本质上是内存、线程、类等几个页面的信息汇总。
- 内存：用于监控虚拟机内存的变化趋势，相当于可视化的jstat命令。
- 线程：监控应用线程的个数波动及状态，当遇到线程停顿的时候可以考虑用这个页面的功能进行分析，相当于可视化的jstack命令。
- 类：监控应用加载的类的变化趋势。
- VM概要：展示应用的一些概要信息。
- MBean：展示应用被JMX管理的Bean。

### 1.3.3、VisualVM

#### 1.3.3.1、作用

- 本文基于VisualVM 2.0.1编写
- 不同版本的VisualVM特性有所不同（例如VisualVM 2.0+提供了对JDBC的性能分析），界面甚至也会有一定差异，因此，建议使用和笔者相同的版本测试。
- 官方说VisualVM是一个All-in-One Java Troubleshooting Tool，从JDK 6开始提供，是目前最强大的监控及故障处理程序之一。

#### 1.3.3.2、使用说明

**启动**

> ### JDK 8或更低版本(内置)
>
> jvisualvm
>
> ### JDK 9及更高版本（手动下载）
>
> [https://visualvm.github.io/download.html](https://visualvm.github.io/download.html)
>
> - zip文件：可适用于各种操作系统
> - dmg文件：可适用于macOS
>
> 下载完成后，解压，并按操作系统启动：
>
> - 对于非Windows系统：运行如下命令即可启动${visualvm目录}/bin/visualvm
> - 对于Windows系统：执行如下文件即可。${visualvm目录}/bin/visualvm.exe

**使用**

- Overview：展示应用的概要信息，相当于可视化的jps、jinfo
- Monitor：监控
    - 图表：展示CPU、内存、类、线程等曲线图
    - Perform GC：通知JVM执行垃圾回收
    - Heap Dump：Dump堆，相当于jmap dump命令。点击后，在左侧的heapdump节点上右击另存为，可将其存储为文件。
- Threads：查看线程状态
    - Thread Dump：Dump线程，相当于jstack。点击后，在左侧的threaddump节点上右击另存为，可将其存储为文件。
- Sampler：抽样器，可用于实时性能分析
    - CPU抽样：可展示每个线程花费的CPU时间、分析热点方法等
    - 内存抽样：展示堆直方图、每个线程的内存分配
- Profiler：性能分析，提供了程序运行期方法级的处理器执行时间分析及内存分析
    - CPU性能分析、内存性能分析、JDBC性能分析
    - 还可以配置想检查的范围。
    - 注意点：
        - 执行性能分析，会对程序运行性能有比较大的影响，一般不建议在生产环境使用这项功能。可在开发/测试环境去分析并调优，也可用JMC代替，JMC的性能分析能力更强，而且影响相对小很多
        - 类共享（类共享是一种共享类，从而提升加载速度、节省内存的技术）可能会导致执行Profiler的应用崩溃，建议在执行Profiler的应用上添加-Xshare:off，关闭掉类共享。

#### 1.3.3.3、拓展知识

- OQL语法：[https://blog.csdn.net/pange1991/article/details/82023771](https://blog.csdn.net/pange1991/article/details/82023771)

#### 1.3.3.4、插件

- Tools - Plugins - 安装插件
    - [https://github.com/oracle/visualvm/releases，手动下载插件](https://github.com/oracle/visualvm/releases%EF%BC%8C%E6%89%8B%E5%8A%A8%E4%B8%8B%E8%BD%BD%E6%8F%92%E4%BB%B6)

#### 1.3.3.3、分析堆Dump文件

File -Load - 选择hprof - 打开 - 分析

### 1.3.4、JDK Mission Control

#### 1.3.4.1、作用

- 本文基于JDK Mission Control 7.0.1编写
- 不同版本的JDK Mission Control特性、功能甚至界面都可能不同，**因此建议使用和笔者相同的版本测试**（例如7.0.1版本的界面和JDK 8内置的JMC 5.5界面简直不像是一个软件）
- **有关商业授权的说明**：
    - JMC**曾经**是一款商业授权工具（例如在JDK 8中），需要商业授权才能在生产环境中使用。但根据Oracle Binary Code协议，在个人开发环境中可以免费使用。
    - 现已开源，在JDK 11（哪怕是OpenJDK）中，**任何人都可以使用**JFR + JMC（需遵循 [UPL协议](https://oss.oracle.com/licenses/upl/) ）！
    - 本文只调研了JDK的长期支持版本JDK 8/JDK 11的商业授权规则，没有去细究短期支持版本JDK 9、10等短期支持版本的商业授权规则（主要是生产环境应该没人敢用短期支持的JDK版本）。
- JDK Mission Control也叫Java Mission Control，简称JMC。

JMC的两大功能：

- 作为JMX控制台，监控虚拟机MBean提供的数据
- 可持续收集数据的JFR（Java Flight Recorder），并可作为JFR的可视化分析工具

在正式探讨JMC之前，有必要先聊下JFR。

- JFR（Java Flight Recorder）是一种用于收集有关运行中的Java应用的诊断信息和性能数据的工具。**它几乎没有性能开销，因此，即使在负载很大的生产环境中也可以使用**。JFR主要用于以下场景：
    - 性能分析JFR可连续捕获应用的信息。比如执行概要分析（显示程序花费时间的地方），线程停顿/等待时间概要分析（显示线程为什么不运行的原因），分配概要分析（显示分配压力的位置），垃圾回收详细信息等
    - 黑盒分析由于JFR开销非常低，因此可持续打开Flight Recorder，让JFR将信息保存到缓存区，然后在稍后再去分析这块数据，定位特定异常的原因
    - 支持与调试联系Oracle支持人员寻求帮助时，JFR收集到的数据可能至关重要

#### 1.3.4.2、安装JMC

小于等于JDK10(内置)

```shell
jmc

注意：JDK 8中内置的JMC在macOS下无法正常启动，这是由于JAR包冲突导致的
解决方案：
  1、参考https://stackoverflow.com/questions/48400346/java-mission-control-from-jdk-1-8-0-161-frozen-upon-startup-on-mac-os-x 的说明，替换JAR包并重启。
  2、使用独立运行的JMC（建议）。
```

大于JDK10（独立安装--手动下载）
JMC相关地址：

- 开源地址：[https://jdk.java.net/jmc/](https://jdk.java.net/jmc/)
- 开源的Wiki：[https://wiki.openjdk.java.net/display/jmc/Main](https://wiki.openjdk.java.net/display/jmc/Main)
- Oracle侧有关JMC的官方网站：[https://www.oracle.com/technetwork/java/javaseproducts/mission-control/index.html](https://www.oracle.com/technetwork/java/javaseproducts/mission-control/index.html)TIPS：这里面有个视频介绍资料，讲得挺好的，不过使用的版本有点老了
- Oracle侧有关JMC的官方文档：[https://docs.oracle.com/javacomponents/index.html](https://docs.oracle.com/javacomponents/index.html)

下载：
下载地址：[https://jdk.java.net/jmc/](https://jdk.java.net/jmc/)
安装过程：[https://www.oracle.com/technetwork/java/javase/jmc-install-6415206.html](https://www.oracle.com/technetwork/java/javase/jmc-install-6415206.html)

#### 1.3.4.3、安装JMC+JFR

小于JDK11

- 在启动你想监控的应用时，需添加如下参数：-XX:+UnlockCommercialFeatures -XX:+FlightRecorder 其中：
    - UnlockCommercialFeatures：解锁商业特性
    - FlightRecorder：为应用启用或停用JFR（JDK 8u40开始，省略）
- 然后使用JMC连接该应用即可监控该应用

参数参考：
[https://docs.oracle.com/javacomponents/jmc-5-5/jfr-command-reference/command-line-options.htm](https://docs.oracle.com/javacomponents/jmc-5-5/jfr-command-reference/command-line-options.htm)
大于等于JDK11

- 被监控的应用无需设置JVM参数，直接启动即可。
- 使用JMC连接该应用即可监控该应用

#### 1.3.4.4、功能说明

##### JMX

- 概览：各种概要信息
- MBean浏览器：展示应用被JMX管理的Bean
- 触发器：配置触发规则，当规则满足时，就触发某个操作(在操作一栏配置)
- 系统：查看系统相关信息
- 内存：查看内存相关信息
- 线程：查看线程相关信息
- 诊断命令：可视化使用诊断命令，相当于可视化的jcmd

##### JFR

- 自动分析结果：JMC自动给出的优化提议
- Java应用程序：展示应用的各种执行情况
- JVM内部：展示JVM层面的执行情况
- 环境：展示操作系统层面的执行情况
- 事件：展示录制期间发生的事件

**TIPS**
各项指标的含义详见：JMC - 帮助 - JDK Mission Control帮助

#### 1.3.4.5、JMC特点

优点：JMC的主要优点在于对JFR的支持

- JFR在生产环境中对吞吐量的影响一般不会高于1%
- JFR监控过程是可动态的，无需重启
- JFR监控过程对应用完全透明，无需修改应用的代码，也无需安装额外的插件或代理
- JFR提供的数据质量非常高，对监控、排查的参考价值更大

缺点：

- JFR并不完全向后兼容。比如，在JDK 11里面生成的JFR文件，用早期的JMC(例如JMC 5.5)无法打开；
- JMC 7.0.1无法分析堆dump文件（hprof格式），但 [官方Wiki](https://wiki.openjdk.java.net/display/jmc/Overview) 宣称支持分析堆dump文件

# 2、第三方

## 2.1、Memory Analyzer Tool（MAT）

[https://www.jianshu.com/p/97251691af88](https://www.jianshu.com/p/97251691af88)

## 2.2、JITWatch

[https://zhuanlan.zhihu.com/p/158168592](https://zhuanlan.zhihu.com/p/158168592)

## 2.3、JProfiler

[https://www.jianshu.com/p/784c60d94989](https://www.jianshu.com/p/784c60d94989)

# 3、参考文档

- Java 8 Unix：[https://docs.oracle.com/javase/8/docs/technotes/tools/unix/jinfo.html](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/jinfo.html)
- JDK 8 Windows：[https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jinfo.html](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jinfo.html)
- Java 11：[https://docs.oracle.com/en/java/javase/11/tools/jinfo.html](https://docs.oracle.com/en/java/javase/11/tools/jinfo.html)
- [https://blog.csdn.net/varyall/article/details/86514888](https://blog.csdn.net/varyall/article/details/86514888)
- [https://dzone.com/articles/jhsdb-a-new-tool-for-jdk-9](https://dzone.com/articles/jhsdb-a-new-tool-for-jdk-9)
- [https://blog.csdn.net/localhost01/article/details/83422902](https://blog.csdn.net/localhost01/article/details/83422902)
- [https://jingyan.baidu.com/article/f3e34a12d39fd9f5eb65350e.html](https://jingyan.baidu.com/article/f3e34a12d39fd9f5eb65350e.html)
- [https://www.cnblogs.com/xifengxiaoma/p/9402497.html](https://www.cnblogs.com/xifengxiaoma/p/9402497.html)
- [https://www.pianshen.com/article/644690794/](https://www.pianshen.com/article/644690794/)
- [https://blog.csdn.net/u013970991/article/details/52036253](https://blog.csdn.net/u013970991/article/details/52036253)
- [Java Mission Control白皮书](https://www.oracle.com/technetwork/java/javaseproducts/mission-control/java-mission-control-wp-2008279.pdf)
- [JMC常见问题](https://wiki.openjdk.java.net/display/jmc/JMC+FAQ)
- [https://dzone.com/articles/using-java-flight-recorder-with-openjdk-11-1](
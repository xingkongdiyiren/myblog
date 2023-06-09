# 1、JVM内存结构

![23.png](..%2F..%2Fpublic%2Fjvm%2F23.png)
解释：

- 1、每个线程都只能访问自己的线程栈
- 2、每个线程都不能访问其他线程的变量
- 3、所有原生类型的局部变量都存储在线程栈中，因此对其他线程是不可见的。
- 4、线程可以将一个原生变量值得副本传给另一个线程，但不能共享原生局部变量本身
- 5、堆内存中包含了 Java 代码中创建的所有对象，不管是哪个线程创建的。 其中也涵盖了包装类型（例如 Byte，Integer，Long 等）。
- 6、不管是创建一个对象并将其赋值给局部变量， 还是赋值给另一个对象的成员变量， 创建的对象都会被保存到堆内存中。

![24.png](..%2F..%2Fpublic%2Fjvm%2F24.png)
解释：

- 如果是原生数据类型的局部变量，那么它的内容就全部保留在线程栈上。
- 如果是对象引用，则栈中的局部变量槽位中保存着对象的引用地址，而实际的对象内容保存在堆中。
- 对象的成员变量与对象本身一起存储在堆上, 不管成员变量的类型是原生数值，还是对象引用。
- 类的静态变量则和类定义一样都保存在堆中。

总结：

- 方法中使用的原生数据类型和对象引用地址在栈上存储；对象、对象成员与类定义（类）、静态变量在堆上。
- 堆内存又称为“共享堆”，堆中的所有对象，可以被所有线程访问, 只要他们能拿到对象的引用地址。
- 如果一个线程可以访问某个对象时，也就可以访问该对象的成员变量。
- 如果两个线程同时调用某个对象的同一方法，则它们都可以访问到这个对象的成员变量，但每个线程的局部变量副本是独立的。

# 2、JVM内存整体结构

![25.png](..%2F..%2Fpublic%2Fjvm%2F25.png)
解释：

- 每启动一个线程，JVM 就会在栈空间栈分配对应的 线程栈, 比如 1MB 的空间（-Xss1m）。
- 线程栈也叫做 Java 方法栈。 如果使用了JNI 方法，则会分配一个单独的本地方法栈(Native Stack)。
- 线程执行过程中，一般会有多个方法组成调用栈（Stack Trace）, 比如 A 调用 B，B 调用 C…每执行到一个方法，就会创建对应的 栈帧（Frame）。

# 3、JVM栈内存结构

![26.png](..%2F..%2Fpublic%2Fjvm%2F26.png)
解释：

- 栈帧是一个逻辑上的概念，具体的大小在一个方法编写完成后基本上就能确定。
- 比如返回值需要有一个空间存放，每个局部变量都需要对应的地址空间，此外还有给指令使用的操作数栈，以及 class 指针（标识这个栈帧对应的是哪个类的方法, 指向非堆里面的 Class 对象）。

# 4、JVM 堆内存结构
![27.png](..%2F..%2Fpublic%2Fjvm%2F27.png)

解释：

- 堆内存是所有线程共用的内存空间，JVM 将Heap 内存分为年轻代（Young generation）和 老年代（Old generation, 也叫 Tenured）两部分。
- 年轻代还划分为 3 个内存池，新生代（Eden space）和存活区（Survivor space）, 在大部分GC 算法中有 2 个存活区（S0, S1），在我们可以观察到的任何时刻，S0 和 S1 总有一个是空的, 但一般较小，也不浪费多少空间。
- Non-Heap 本质上还是 Heap，只是一般不归 GC管理，里面划分为 3 个内存池。
- Metaspace, 以前叫持久代（永久代, Permanent generation）, Java8 换了个名字叫 Metaspace。
- CCS, Compressed Class Space, 存放 class 信息的，和 Metaspace 有交叉。
- Code Cache存放 JIT 编译器编译后的本地机器代码。
    - JIT热点代码：一般指的是代码频繁使用的方法，代码块等

# 5、JVM整体结构及内存模型
![28.png](..%2F..%2Fpublic%2Fjvm%2F28.png)
![29.png](..%2F..%2Fpublic%2Fjvm%2F29.png)
解释：

- 线程私有区域
    - 程序计数器：是当前线程所执行的字节码的行号指示器，无OOM
    - 虚拟机栈：是描述java方法执行的内存模型，每个方法在执行的同时都会创建一个栈帧（Stack Frame）用于存储局部变量表、操作数栈、动态链接、方法出口等信息。
        - 栈帧（ Frame）是用来存储数据和部分过程结果的数据结构，同时也被用来处理动态链接(Dynamic Linking)、 方法返回值和异常分派（ Dispatch Exception）。栈帧随着方法调用而创建，随着方法结束而销毁——无论方法是正常完成还是异常完成（抛出了在方法内未被捕获的异常）都算作方法结束。
    - 本地方法栈：和 Java Stack 作用类似, 区别是虚拟机栈为执行 Java 方法服务, 而本地方法栈则为Native 方法服务, 如果一个 VM 实现使用 C-linkage 模型来支持 Native 调用, 那么该栈将会是一个 C 栈，但 HotSpot VM 直接就把本地方法栈和虚拟机栈合二为一。
- 线程共享区域
    - 堆-运行时数据区：

![30.png](..%2F..%2Fpublic%2Fjvm%2F30.png)

      - 是被线程共享的一块内存区域，创建的对象和数组都保存在 Java 堆内存中，也是垃圾收集器进行垃圾收集的最重要的内存区域。由于现代 VM 采用分代收集算法, 因此 Java 堆从 GC 的角度还可以细分为: 新生代(Eden 区、From Survivor 区和 To Survivor 区)和老年代
         - **字符串常量池：**运行时常量池分出的一部分，类加载到内存的时候，字符串会存到字符串常量池里面

- 方法区/永久代（1.8之后元空间）：用于存储被 JVM 加载的类信息、常量、静态变量、即时编译器编译后的代码等数据. HotSpot VM把GC分代收集扩展至方法区, 即使用Java堆的永久代来实现方法区, 这样 HotSpot 的垃圾收集器就可以像管理 Java 堆一样管理这部分内存, 而不必为方法区开发专门的内存管理器(永久带的内存回收的主要目标是针对常量池的回收和类型的卸载, 因此收益一般很小)。
    - 运行时常量池（Runtime Constant Pool）是方法区的一部分。Class 文件中除了有类的版本、字段、方法、接口等描述等信息外，还有一项信息是常量池（Constant Pool Table），用于存放编译期生成的各种字面量和符号引用，这部分内容将在类加载后存放到方法区的运行时常量池中。
- 直接内存
    - jdk1.4后加入NIO（New Input/Output）类，引入了一种基于通道与缓冲区的I/O方式，它可以使用native函数库直接分配堆外内存，然后通过一个存储在java堆中的DirectByteBuffer对象作为这块内存的引用进行操作。可以避免在Java堆和Native堆中来回复制数据。直接内存的分配不会受到Java堆大小的限制.避免大于物理内存的情况。

# 6、一个Class文件在JVM中的分配详情

比如下面这份代码
![31.png](..%2F..%2Fpublic%2Fjvm%2F31.png)
他在JVM中的分配如下
![32.png](..%2F..%2Fpublic%2Fjvm%2F32.png)


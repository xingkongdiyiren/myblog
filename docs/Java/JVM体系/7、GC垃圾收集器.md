# 1、为什么要有GC?


- 本质上就是内存资源的有限性（收集垃圾）

什么场景下该使用什么垃圾回收策略？


- 在堆内存要求苛刻的场景：想办法提高对象的回收效率，多回收掉一些对象，腾出更多内存

- 在CPU使用率高的情况下：降低高并发时垃圾回收的频率，让CPU更多地去执行你的业务而不是垃圾回收


# 2、如何回收垃圾呢?


## 2.1、引用计数法


- 有引用，计数器 +1

- 无引用，计数器 -1


### 2.1.1、产生的问题：


- 循环依赖（跟事务，线程死锁一个道理）


样例：(证据)


```java

 public class ReferenceCountingGc {

     Object instance = null;

     public static void main(String[] args) { 

         ReferenceCountingGc objA = new ReferenceCountingGc(); 

         ReferenceCountingGc objB = new ReferenceCountingGc();

         objA.instance = objB;

         objB.instance = objA;

         objA = null; 

         objB = null; 

     }

 }

```


如何解决？


- 引用追踪 => 标记清除算法


## 2.2、可达性分析算法（一般用于标记清除和标记整理算法中）


将“GC Roots” 对象作为起点，从这些节点开始向下搜索引用的对象，找到的对象都标记为非垃圾对象，其余未标记的对象都是垃圾对象


**GC Roots根节点：**


- 虚拟机栈（栈帧中的本地变量表）中引用的对象

- 方法区中类静态属性引用的对象

- 方法区中常量引用的对象

- 本地方法栈中JNI（即Native）引用的对象


![38.png](..%2F..%2Fpublic%2Fjvm%2F38.png)

![39.png](..%2F..%2Fpublic%2Fjvm%2F39.png)

**上面的引用的类型有**


- 强引用：普通的变量引用


```java

public static User user = new User();

```


- 软引用：将对象用SoftReference软引用类型的对象包裹，正常情况不会被回收，但是GC做完后发现释放不出空间存放新的对象，则会把这些软引用的对象回收掉。软引用可用来实现内存敏感的高速缓存。


```java

public static SoftReference<User> user = new SoftReference<User>(new User());

```


- 使用场景：浏览器的后退按钮

    - 为什么?

        - 如果一个网页在浏览结束时就进行内容的回收，则按后退查看前面浏览过的页面时，需要重新构建

        - 如果将浏览过的网页存储到内存中会造成内存的大量浪费，甚至会造成内存溢出

- 弱引用：将对象用WeakReference软引用类型的对象包裹，弱引用跟没引用差不多，GC会直接回收掉，很少用

```java

public static WeakReference<User> user = new WeakReference<User>(new User());

```


- 虚引用

  - 虚引用也称为幽灵引用或者幻影引用，它是最弱的一种引用关系，几乎不用

  - 不影响对象的生命周期，如果一个对象只有虚引用，那么他就和没有任何引用一样，在任何时候都可能被垃圾回收器回收。虚引用主要用来跟踪对象被垃圾回收器回收的获得，必须和引用队列（ReferenceQueue）配合使用。当垃圾回收器准备回收一个对象时，如果发现它还有虚引用，就会回收对象的内存之前，把这个虚引用加入到与之关联的引用队列中。程序可以通过判断引用队列中是否已经加入了虚引用，来了解被引用的对象是否将要被垃圾回收。如果程序发现某个虚引用已经被加入到引用队列，那么就可以在所引用的对象的内存被回收之前采取必要的行动。

  - 如：

```java

    ReferenceQueue<String> queue=new ReferenceQueue<>();

    PhantomReference<String> pr=new PhantomReference<>("hello",queue);

```

    
**可达性算法注意点**


- 一个对象即使不可达，也不一定会被回收


![40.png](..%2F..%2Fpublic%2Fjvm%2F40.png)


```java

@SuppressWarnings("Duplicates")

public class GCTest1 {

    private static GCTest1 obj;


    @Override

    protected void finalize() throws Throwable {

        super.finalize();

        System.out.println("finalize被调用了");

        obj = this;

    }


    public static void main(String[] args) throws InterruptedException {

        obj = new GCTest1();

        obj = null;

        System.gc();


        Thread.sleep(1000L);

        if (obj == null) {

            System.out.println("obj == null");

        } else {

            System.out.println("obj可用");

        }


        Thread.sleep(1000L);

        obj = null;

        System.gc();

        if (obj == null) {

            System.out.println("obj == null");

        } else {

            System.out.println("obj可用");

        }

    }

}

```


![41.png](..%2F..%2Fpublic%2Fjvm%2F41.png)

**finalize()的建议**


- 避免使用finalize()方法，操作不当可能会导致问题

- finalize()优先级，何时会被调用无法确定，因为什么时间发生GC不确定。

- 建议使用try-catch-finally来替代finalize()。


# 3、垃圾收集的算法有什么呢？


- **标记清除算法（Mark and Sweep）**

    - 定义

        - Marking（标记）: 遍历所有的可达对象，并在本地内存(native)中分门别类记下。

        - Sweeping（清除）: 这一步保证了，不可达对象所占用的内存，在之后进行内存分配时可以重用。

    - 用处

        - 并行 GC 和 CMS 的基本原理

    - 优势（优点）：可以处理循环依赖，只扫描部分对象

    - ![42.png](..%2F..%2Fpublic%2Fjvm%2F42.png)

    - 缺点

        -  效率问题 (如果需要标记的对象太多，效率不高)

        -  空间问题（标记清除后会产生大量不连续的碎片）

    - 如何解决？

        - 压缩，STW 标记和清除大量对象！！！！

- **标记复制算法**

    - 定义

        - 以将内存分为大小相同的两块，每次使用其中的一块。当这一块的 内存使用完后，就将还存活的对象复制到另一块去，然后再把使用的空间一次清理掉。这样就使每次的内存回收都是对 内存区间的一半进行回收。

    - ![43.png](..%2F..%2Fpublic%2Fjvm%2F43.png)

- **标记整理算法**

    - 根据老年代的特点特出的一种标记算法，标记过程仍然与“标记-清除”算法一样，但后续步骤不是直接对可回收对象回到收，而是让所有存活的对象向一端移动，然后直接清理掉端边界以外的内存

    - ![44.png](..%2F..%2Fpublic%2Fjvm%2F44.png)

- **分代收集算法**

    - 为什么会有分代？

        - ![45.png](..%2F..%2Fpublic%2Fjvm%2F45.png)

        - 分代假设：大部分新生对象很快无用；存活较长时间的对象，可能存活更长时间。

    - 所以JVM会有内存池划分

        - ![46.png](..%2F..%2Fpublic%2Fjvm%2F46.png)

        - 不同类型对象不同区域，不同策略处理。

    - 分代收集


![47.png](..%2F..%2Fpublic%2Fjvm%2F47.png)
- 对象分配在新生代的 Eden 区，标记阶段 Eden 区存活的对象就会复制到存活区；
  - 注意：为什么是复制，不是移动？？？
    - 两个存活区 from 和 to，互换角色。对象存活到一定周期会提升到老年代。
- 由如下参数控制提升阈值   -XX：+MaxTenuringThreshold=15
- 老年代默认都是存活对象，采用移动方式：
  - 1. 标记所有通过 GC roots 可达的对象；
  - 2. 删除所有不可达对象；
  - 3. 整理老年代空间中的内容，方法是将所有的存活对象复制，从老年代空间开始的地方依次存放。
- 持久代/元数据区
  - 1.8 之前 -XX:MaxPermSize=256m
  - 1.8 之后 -XX:MaxMetaspaceSize=256m


- 分代收集的好处

    - 更有效的清除不再使用的对象

    - 提升了垃圾回收的效率

- 分代收集算法调优原则

    - 合理设置Survivor区域的大小，避免内存浪费

    - 让GC尽量发生在新生代，尽量减少Full GC的发生

- **增量算法**

    - 每次只收集一小片区域的内存空间的垃圾

- **以上三种算法对比**
 
  | 回收算法  | 优点           | 缺点               |
  | --------- | -------------- | ------------------ |
  | 标记-清除 | 实现简单       | 存在内存碎片、分配 |
  | 标记-整理 | 无碎片         | 整理存在开销       |
  | 复制      | 性能好、无碎片 | 内存利用率低       |


# 4、创建与内存分配机制深度


## 4.1、对象的创建


### 4.1.1、类加载检查


- 虚拟机遇到一条new指令时，首先将去检查这个指令的参数是否能在常量池中定位到一个类的符号引用，并且检查这个符号引用代表的类是否已被加载、解析和初始化过。如果没有，那必须先执行相应的类加载过程。 new指令对应到语言层面上讲是，new关键词、对象克隆、对象序列化等。


### 4.1.2、分配内存


- 在类加载检查通过后，接下来虚拟机将为新生对象分配内存。对象所需内存的大小在类 加载完成后便可完全确定，为对象分配空间的任务等同于把&nbsp;一块确定大小的内存从Java堆中划分出来。


#### 4.1.2.1、如何分配内存？


- 指针碰撞（默认）

    - 如果Java堆中内存是绝对规整的，所有用过的内存都放在一边，空闲的内存放在另一边，中间放着一个指针作为分界点 的指示器，那所分配内存就仅仅是把那个指针向空闲空间那边挪动一段与对象大小相等的距离。

- 空闲列表

    - 如果Java堆中的内存并不是规整的，已使用的内存和空 闲的内存相互交错，那就没有办法简单地进行指针碰撞了，虚拟 机就必须维护一个列表，记 录上哪些内存块是可用的，在分配的时候从列表中找到一块足够大的空间划分给对象实例， 并更新列表上的记录


#### 4.1.2.2、解决并发问题的方法？


- CAS(compare and swap)

    - 虚拟机采用CAS配上失败重试的方式保证更新操作的原子性来对分配内存空间的动作进行同步处理。

- 本地线程分配缓冲(Thread Local Allocation Buffer,TLAB)

    - 把内存分配的动作按照线程划分在不同的空间之中进行，即每个线程在Java堆中预先分配一小块内存。通过XX:+/-UseTLAB参数来设定虚拟机是否使用TLAB(JVM会默认开启XX:+UseTLAB)，XX:TLABSize 指定TLAB大小。


### 4.1.3、初始化


- 内存分配完成后，虚拟机需要将分配到的内存空间都初始化为零值(不包括对象头)， 如果使用TLAB，这一工作过程也 可以提前至TLAB分配时进行。这一步操作保证了对象的实例字段在Java代码中可以不赋初始值就直接使用，程序能访问 到这些字段的数据类型所对应的零值。


### 4.1.4、设置对象头


- 初始化零值之后，虚拟机要对对象进行必要的设置，例如这个对象是哪个类的实例、如何才能找到类的元数据信息、对象的哈希码、对象的GC分代年龄等信息。这些信息存放在对象的对象头Object Header之中


#### 4.1.4.1、对象布局


- 对象头

    - 标记字段Mark Word

    - 类型指针klass point

    - 数组长度

- 实例数据instance data

- 对齐填充(Padding)


![48.png](..%2F..%2Fpublic%2Fjvm%2F48.png)


### 4.1.5、执行init方法


- 执行init方法，即对象按照程序员的意愿进行初始化。对应到语言层面上讲，就是为属性赋值(注意，这与上面的赋零值不同，这是由程序员赋的值)，和执行构造方法。


### 对象创建流程图


![49.png](..%2F..%2Fpublic%2Fjvm%2F49.png)


## 4.2、对象内存分配


### 4.2.1、对象栈上分配


- **解释**

    - 我们通过JVM内存分配可以知道JAVA中的对象都是在堆上进行分配，当对象没有被引用的时候，需要依靠GC进行回收内存，如果对象数量较多的时候，会给GC带来较大压力，也间接影响了应用的性能。为了减少临时对象在堆内分配的数量，JVM通过逃逸分析确定该对象不会被外部访问。如果不会逃逸可以将该对象在栈上分配内存，这样该对象所占用的 内存空间就可以随栈帧出栈而销毁，就减轻了垃圾回收的压力。

- **对象逃逸分析**

    - 就是分析对象动态作用域，当一个对象在方法中被定义后，它可能被外部方法所引用，例如作为调用参数传递到其他地方中。

- **标量替换**

    - 通过逃逸分析确定该对象不会被外部访问，并且对象可以被进一步分解时，JVM不会创建该对象，而是将该 对象成员变量分解若干个被这个方法使用的成员变量所代替，这些代替的成员变量在栈帧或寄存器上分配空间，这样就 不会因为没有一大块连续空间导致对象内存不够分配。开启标量替换参数(-XX:+EliminateAllocations)，JDK7之后默认 开启。

- **标量与聚合量**

    - 标量即不可被进一步分解的量，而JAVA的基本数据类型就是标量(如:int，long等基本数据类型以及 reference类型等)，标量的对立就是可以被进一步分解的量，而这种量称之为聚合量。而在JAVA中对象就是可以被进一 步分解的聚合量。

- **总结**

    - 栈上分配依赖于逃逸分析和标量替换


### 4.2.2、对象在Eden区分配


- **Minor GC/Young GC**

    - 指发生新生代的的垃圾收集动作，Minor GC非常频繁，回收速度一般也比较快。

- **Major GC/Full GC**

    - 一般会回收老年代 ，年轻代，方法区的垃圾，Major GC的速度一般会比Minor GC的慢 10倍以上。

- **Eden与Survivor区默认8:1:1**

    - 大量的对象被分配在eden区，eden区满了后会触发minor gc，可能会有99%以上的对象成为垃圾被回收掉，剩余存活 的对象会被挪到为空的那块survivor区，下一次eden区满了后又会触发minor gc，把eden区和survivor区垃圾对象回 收，把剩余存活的对象一次性挪动到另外一块为空的survivor区，因为新生代的对象都是朝生夕死的，存活时间很短，所 以JVM默认的8:1:1的比例是很合适的，让eden区尽量的大，survivor区够用即可， JVM默认有这个参数-XX:+UseAdaptiveSizePolicy(默认开启)，会导致这个8:1:1比例自动变化，如果不想这个比例有变 化可以设置参数-XX:-UseAdaptiveSizePolicy


### 4.2.3、大对象直接进入老年代


- 大对象就是需要大量连续内存空间的对象(比如:字符串、数组)。JVM参数 -XX:PretenureSizeThreshold 可以设置大 对象的大小，如果对象超过设置大小会直接进入老年代，不会进入年轻代，这个参数只在 Serial 和ParNew两个收集器下 有效。比如设置JVM参数:-XX:PretenureSizeThreshold=1000000 (单位是字节) -XX:+UseSerialGC ，再执行下上面的第一 个程序会发现大对象直接进了老年代


**目的：**


- 为了避免为大对象分配内存时的复制操作而降低效率。


### 4.2.4、长期存活的对象将进入老年代


- 虚拟机给每个对象一个对象年龄(Age)计数器。如果对象在 Eden 出生并经过第一次 Minor GC 后仍然能够存活，并且能被 Survivor 容纳的话，将被移动到 Survivor 空间中，并将对象年龄设为1。对象在 Survivor 中每熬过一次 MinorGC，年龄就增加1岁，当它的年龄增加到一定程度 (默认为15岁，CMS收集器默认6岁，不同的垃圾收集器会略微有点不同)，就会被晋升到老年代中。对象晋升到老年代 的年龄阈值，可以通过参-XX:MaxTenuringThreshold数来设置。


### 4.2.5、对象动态年龄判断


- 当前放对象的Survivor区域里(其中一块区域，放对象的那块s区)，一批对象的总大小大于这块Survivor区域内存大小的 50%(-XX:TargetSurvivorRatio可以指定)，那么此时大于等于这批对象年龄最大值的对象，就可以直接进入老年代了， 例如Survivor区域里现在有一批对象，年龄1+年龄2+年龄n的多个年龄对象总和超过了Survivor区域的50%，此时就会 把年龄n(含)以上的对象都放入老年代。这个规则其实是希望那些可能是长期存活的对象，尽早进入老年代。对象动态年 龄判断机制一般是在minor gc之后触发的。


### 4.2.6、老年代空间分配担保机制


- 年轻代每次minor gc之前JVM都会计算下老年代剩余可用空间。如果这个可用空间小于年轻代里现有的所有对象大小之和(包括垃圾对象) 就会看一个“-XX:-HandlePromotionFailure”(jdk1.8默认就设置了)的参数是否设置了 如果有这个参数，就会看看老年代的可用内存大小，是否大于之前每一次minor gc后进入老年代的对象的平均大小。 如果上一步结果是小于或者之前说的参数没有设置，那么就会触发一次Full gc，对老年代和年轻代一起回收一次垃圾， 如果回收完还是没有足够空间存放新的对象就会发生"OOM"。当然，如果minor gc之后剩余存活的需要挪动到老年代的对象大小还是大于老年代可用空间，那么也会触发full gc，full gc完之后如果还是没有空间放minor gc之后的存活对象，则也会发生“OOM”


![50.png](..%2F..%2Fpublic%2Fjvm%2F50.png)


### 对象内存分配流程图


![51.png](..%2F..%2Fpublic%2Fjvm%2F51.png)


## 4.3、对象内存回收


请看上面的 `2、如何回收垃圾！！ `


## 4.4、总结


# 5、垃圾收集器


Stop The World（STW）


并行收集vs并发收集


吞吐量


## 5.1、串行 GC（Serial GC）ParNewGC  =>  标记复制


执行过程：


**Serial GC**

![52.png](..%2F..%2Fpublic%2Fjvm%2F52.png)

**ParNewGC**

![53.png](..%2F..%2Fpublic%2Fjvm%2F53.png)

应用：

-XX:+UseSerialGC


> 如：java  -jar -XX:+UseSerialGC  microservice-eureka-server.jar


算法：

年轻代：mark-copy（标记-复制）算法

老年代：mark-sweep-compact（标记-清除-整理）算法


共同点：


- 都是单线程的垃圾收集器，不能并行处理，会触发STW，停止所有线程

- 不能充分利用多核CPU，只能用单核

- 单CPU利用高，暂停时间长，易卡死


使用：


- 只适合几百MB的堆内存，并且单核的CPU


为什么？


- 串行 GC中的串行，跟我们实际的队列是一样的，先进先出，所以就有个问题，容易阻塞，并且不能充分利用多核，所以单核最好，

- 因此，只适合几百MB的堆内存，并且单核的CPU


注意：

-XX：+USeParNewGC 改进版本的 Serial GC，可以配合 CMS 使用


## 5.2、并行 GC（Parallel GC）=>eden：标记复制   old：标记整理(Java 8默认GC)


执行过程：

![54.png](..%2F..%2Fpublic%2Fjvm%2F54.png)

应用：

-XX:+UseParallelGC

-XX:+UseParallelOldGC

-XX:+UseParallelGC

-XX:+UseParallelOldGC

-XX:MaxGCPaseMillis:控制最大的垃圾收集停顿时间（尽力）

-XX:GCTimeRation:设置吞吐量的大小，取值0-100，系统话费不超过1/(1+n)的时间用于垃圾收集

-XX:+UseAdptiveSizePolicy：自适应GC策略

算法：

年轻代：mark-copy（标记-复制）算法

老年代：mark-sweep-compact（标记-清除-整理）算法


-XX：ParallelGCThreads=N 来指定 GC 线程数， 其默认值为 CPU 核心数。

优点：


- 适用于多核服务器，主要目标增加吞吐量。

    - 对系统资源的有效使用，达到最高吞吐量

- 在GC期间所有CPU内核都在并行清理垃圾，总暂停时间更短

- 在两次GC周期的间隔期，没有GC在运行，不会消耗内存


## 5.3、CMS GC=>eden：标记复制  old：标记清除


### 5.3.1、六大阶段：


![55.png](..%2F..%2Fpublic%2Fjvm%2F55.png)

解释：


- 阶段 1: Initial Mark（初始标记）

    - 暂停所有的其他线程(STW)，并记录下gc roots标记所有的根对象（包括根对象直接引用的对象，以及被年轻代中所有存活对象所引用的对象（老年代单独回收）），速度很快

    - ![56.png](..%2F..%2Fpublic%2Fjvm%2F56.png)

- 阶段 2: Concurrent Mark（并发标记）

    - CMS GC 遍历老年代，标记所有的存活对象，从前一阶段 “Initial Mark” 找到的根对象开始算起。 “并发标记”阶段，就是与应用程序同时运行，不用暂停的阶段

    - ![57.png](..%2F..%2Fpublic%2Fjvm%2F57.png)

- 阶段 3: Concurrent Preclean（并发预清理）

    - 此阶段同样是与应用线程并发执行的，不需要停止应用线程。 因为前一阶段【并发标记】与程序并发运行，可能有一些引用关系已经发生了改变。如果在并发标记过程中引用关系发生了变化，JVM 会通过“Card（卡片）”的方式将发生了改t变的区域标记为“脏”区，这就是所谓的 卡片标记（Card Marking）。（漏标解决：写屏障 + 增量更新）

        - 写屏障+增量更新：当对象A的成员变量的引用发生变化时，比如新增引用（a.d = d），我们可以利用写屏障，将A新的成员变量引用对象D 记录下来。

            - 示例：


```java

void post_write_barrier(oop* field, oop new_value) {

    remark_set.add(new_value); // 记录新引用的对象

}

```


- ![58.png](..%2F..%2Fpublic%2Fjvm%2F58.png)

- 阶段 4: Final Remark（最终标记）

    - 最终标记阶段是此次 GC 事件中的第二次（也是最后一次）STW 停顿。本阶段的目标是完成老年代中所有存活对象的标记。因为之前的预清理阶段是并发执行的，有可能 GC 线程跟不上应用程序的修改速度。所以需要一次 STW 暂停来处理各种复杂的情况。通常 CMS 会尝试在年轻代尽可能空的情况下执行 Final Remark 阶段，以免连续触发多次 STW 事件

    - ![59.png](..%2F..%2Fpublic%2Fjvm%2F59.png)

- 阶段 5: Concurrent Sweep（并发清除）

    - 开启用户线程，同时GC线程开始对未标记的区域做清扫。这个阶段如果有新增对象会被标记为黑色不做任何处理。

    - ![60.png](..%2F..%2Fpublic%2Fjvm%2F60.png)

- 阶段 6: Concurrent Reset（并发重置）

    - 重置本次GC过程中的标记数据


### 5.3.2、应用：


-XX:+UseConcMarkSweepGC


### 5.3.3、算法：


年轻代：mark-copy（标记-复制）算法

老年代：mark-sweep（标记-清除）算法


### 5.3.4、优缺点


优点：

并发收集、低停顿

缺点：


- 对CPU资源敏感（会和服务抢资源）；

- 无法处理浮动垃圾(在并发标记和并发清理阶段又产生垃圾，这种浮动垃圾只能等到下一次gc再清理了)；

- 它使用的回收算法-“标记-清除”算法会导致收集结束时会有大量**空间碎片**产生，

    - 当然通过参数**- XX:+UseCMSCompactAtFullCollection**可以让jvm在执行完标记清除后再做整理

    - CMSFullGCsBeforeComplction：进行几次Full GC后就进行一次内存碎片整理，默认0

- 执行过程中的不确定性，会存在上一次垃圾回收还没执行完，然后垃圾回收又被触发的情况，特别是在并 发标记和并发清理阶段会出现，一边回收，系统一边运行，也许没回收完就再次触发full gc，也就是"concurrent mode failure"，此时会进入stop the world，用**serial old垃圾收集器**来回收


### 5.3.5、适用场景


希望系统停顿时间段，响应速度快的场景，比如各种服务器应用程序


### 5.3.6、三色标记法（CMS中Concurrent Sweep（并发清除）的底层实现）


在并发标记的过程中，因为标记期间应用线程还在继续跑，对象间的引用可能发生变化，多标和漏标的情况就有可能发生。 这里我们引入“三色标记”来给大家解释下，把Gcroots可达性分析遍历对象过程中遇到的对象， 按照“是否访问过”这个条件标记成以 下三种颜色：


- 黑色： 表示对象已经被垃圾收集器访问过， 且这个对象的所有引用都已经扫描过。 黑色的对象代表已经扫描过， 它是安全存活的， 如果有其他对象引用指向了黑色对象， 无须重新扫描一遍。 黑色对象不可能直接（不经过 灰色对象） 指向某个白色对象。

- 灰色： 表示对象已经被垃圾收集器访问过， 但这个对象上至少存在一个引用还没有被扫描过。

- 白色： 表示对象尚未被垃圾收集器访问过。 显然在可达性分析刚刚开始的阶段， 所有的对象都是白色的， 若在分析结束的阶段， 仍然是白色的对象， 即代表不可达。


### 5.3.6、CMS的相关核心参数


1. -XX:+UseConcMarkSweepGC：启用cms

2. -XX:ConcGCThreads：并发的GC线程数

3. -XX:+UseCMSCompactAtFullCollection：FullGC之后做压缩整理（减少碎片）

4. -XX:CMSFullGCsBeforeCompaction：多少次FullGC之后压缩一次，默认是0，代表每次FullGC后都会压缩一 次

5. -XX:CMSInitiatingOccupancyFraction: 当老年代使用达到该比例时会触发FullGC（默认是92，这是百分比）

6. -XX:+UseCMSInitiatingOccupancyOnly：只使用设定的回收阈值(-XX:CMSInitiatingOccupancyFraction设 定的值)，如果不指定，JVM仅在第一次使用设定值，后续则会自动调整

7. -XX:+CMSScavengeBeforeRemark：在CMS GC前启动一次minor gc，目的在于减少老年代对年轻代的引 用，降低CMS GC的标记阶段时的开销，一般CMS的GC耗时 80%都在标记阶段

8. -XX:+CMSParallellnitialMarkEnabled：表示在初始标记的时候多线程执行，缩短STW

9. -XX:+CMSParallelRemarkEnabled：在重新标记的时候多线程执行，缩短STW;


## 5.4、G1


粗略的：

![61.png](..%2F..%2Fpublic%2Fjvm%2F61.png)

顺眼的：

![62.png](..%2F..%2Fpublic%2Fjvm%2F62.png)


- G1 的全称是 Garbage-First，意为垃圾优先，哪一块的垃圾最多就优先清理它。

- G1 GC 最主要的设计目标是：将 STW 停顿的时间和分布，变成可预期且可配置的。

- 事实上，G1 GC 是一款软实时垃圾收集器，可以为其设置某项特定的性能指标。为了达成可预期停顿时间的指标，G1 GC 有一些独特的实现。

- 首先，堆不再分成年轻代和老年代，而是划分为多个（通常是2048个）可以存放对象的小块堆区域(smaller heap regions)。每个小块，可能一会被定义成 Eden 区，一会被指定为 Survivor区或者Old 区。在逻辑上，所有的 Eden 区和 Survivor 区合起来就是年轻代，所有的 Old 区拼在一起那就是老年代。

- -XX:+UseG1GC -XX:MaxGCPauseMillis=50


![63.png](..%2F..%2Fpublic%2Fjvm%2F63.png)


- 这样划分之后，使得 G1 不必每次都去收集整个堆空间，而是以增量的方式来进行处理: 每次只处理一部分内存块，称为此次 GC 的回收集(collection set)。每次 GC 暂停都会收集所有年轻代的内存块，但一般只包含部分老年代的内存块。（漏标解决：写屏障 + SATB）

    - 写屏障 + SATB意义：当对象B的成员变量的引用发生变化时，比如引用消失（a.b.d = null），我们可以利用写屏障，将B原来成员变量的引用对象D记录下来。


```java

void pre_write_barrier(oop* field) {

    oop old_value = *field; // 获取旧值 

    remark_set.add(old_value); // 记录原来的引用对象

}

```



- G1 的另一项创新是，在并发阶段估算每个小堆块存活对象的总数。构建回收集的原则是： 垃圾最多的小块会被优先收集。这也是 G1 名称的由来。


### 5.4.1、G1 GC--配置参数


- -XX：+UseG1GC：启用 G1 GC；

- -XX：G1NewSizePercent：初始年轻代占整个 Java Heap 的大小，默认值为 5%；

- -XX：G1MaxNewSizePercent：最大年轻代占整个 Java Heap 的大小，默认值为 60%；

- -XX：G1HeapRegionSize：设置每个 Region 的大小，单位 MB，需要为 1、2、4、8、16、32 中的某个值，默认是堆内存的1/2000。如果这个值设置比较大，那么大对象就可以进入 Region 了；

- -XX：ConcGCThreads：与 Java 应用一起执行的 GC 线程数量，默认是 Java 线程的 1/4，减少这个参数的数值可能会提升并行回收的效率，提高系统内部吞吐量。如果这个数值过低，参与回收垃圾的线程不足，也会导致并行回收机制耗时加长；

- -XX：+InitiatingHeapOccupancyPercent（简称 IHOP）：G1 内部并行回收循环启动的阈值，默认为 Java Heap的 45%。这个可以理解为老年代使用大于等于 45% 的时候，JVM 会启动垃圾回收。这个值非常重要，它决定了在什么时间启动老年代的并行回收；

- -XX：G1HeapWastePercent：G1停止回收的最小内存大小，默认是堆大小的 5%。GC 会收集所有的 Region 中的对象，但是如果下降到了 5%，就会停下来不再收集了。就是说，不必每次回收就把所有的垃圾都处理完，可以遗留少量的下次处理，这样也降低了单次消耗的时间；

- -XX：G1MixedGCCountTarget：设置并行循环之后需要有多少个混合 GC 启动，默认值是 8 个。老年代 Regions的回收时间通常比年轻代的收集时间要长一些。所以如果混合收集器比较多，可以允许 G1 延长老年代的收集时间。

- -XX：+G1PrintRegionLivenessInfo：这个参数需要和 -XX:+UnlockDiagnosticVMOptions 配合启动，打印 JVM 的调试信息，每个Region 里的对象存活信息。

- -XX：G1ReservePercent：G1 为了保留一些空间用于年代之间的提升，默认值是堆空间的 10%。因为大量执行回收的地方在年轻代（存活时间较短），所以如果你的应用里面有比较大的堆内存空间、比较多的大对象存活，这里需要保留一些内存。

- -XX：+G1SummarizeRSetStats：这也是一个 VM 的调试信息。如果启用，会在 VM 退出的时候打印出 Rsets 的详细总结信息。


如果启用 -XX:G1SummaryRSetStatsPeriod 参数，就会阶段性地打印 Rsets 信息。


- -XX：+G1TraceConcRefinement：这个也是一个 VM 的调试信息，如果启用，并行回收阶段的日志就会被详细打印出来。

- -XX：+GCTimeRatio：这个参数就是计算花在 Java 应用线程上和花在 GC 线程上的时间比率，默认是 9，跟新生代内存的分配比例一致。这个参数主要的目的是让用户可以控制花在应用上的时间，G1 的计算公式是 100/（1+GCTimeRatio）。这样如果参数设置为9，则最多 10% 的时间会花在 GC 工作上面。Parallel GC 的默认值是 99，表示 1% 的时间被用在 GC 上面，这是因为 Parallel GC 贯穿整个 GC，而 G1 则根据 Region 来进行划分，不需要全局性扫描整个内存堆。

- -XX：+UseStringDeduplication：手动开启 Java String 对象的去重工作，这个是 JDK8u20 版本之后新增的参数，主要用于相同String 避免重复申请内存，节约 Region 的使用。

- -XX：MaxGCPauseMills：预期 G1 每次执行 GC 操作的暂停时间，单位是毫秒，默认值是 200 毫秒，G1 会尽量保证控制在这个范围内。


### 5.4.2、垃圾收集机制


#### 5.4.2.1、Young GC


- 所有Eden Region都满了的时候，就会触发Young GC

- 伊甸园里面的对象会转移到Survivor Region里面去

- 原先Survivor Region中的对象转移到新的Survivor Region中，或者晋升到Old Region

- 空闲Region会被放入空闲列表中，等待下次被使用


#### 5.4.2.2、Mixed GC


- 老年代大小占整个堆的百分比达到一定阈值（可用-XX:InitiatingHeapOccupancyPercent指定，默认45%），就触发

- Mixed GC会回收所有Young Region，同时回收部分Old Region


#### 5.4.2.3、Full GC


- 复制对象内存不够，或者无法分配足够内存（比如巨型对象没有足够的连续分区分配）时，会触发Full GC

- Full GC模式下，使用Serial Old模式


### 5.4.3、Mixed GC处理步骤


![64.png](..%2F..%2Fpublic%2Fjvm%2F64.png)

1、年轻代模式转移暂停->初始标记（Evacuation Pause）

G1 GC 会通过前面一段时间的运行情况来不断的调整自己的回收策略和行为，以此来比较稳定地控制暂停时间。在应用程序刚启动时，G1 还没有采集到什么足够的信息，这时候就处于初始的 fully-young 模式。当年轻代空间用满后，应用线程会被暂停，年轻代内存块中的存活对象被拷贝到存活区。如果还没有存活区，则任意选择一部分空闲的内存块作为存活区。

拷贝的过程称为转移（Evacuation)，这和前面介绍的其他年轻代收集器是一样的工作原理。

2、并发标记（Concurrent Marking）

同时我们也可以看到，G1 GC 的很多概念建立在 CMS 的基础上，所以下面的内容需要对 CMS 有一定的理解。G1 并发标记的过程与 CMS 基本上是一样的。G1 的并发标记通过 Snapshot-At-The-Beginning（起始快照）的方式，在标记阶段开始时记下所有的存活对象。即使在标记的同时又有一些变成了垃圾。通过对象的存活信息，可以构建出每个小堆块的存活状态，以便回收集能高效地进行选择。

这些信息在接下来的阶段会用来执行老年代区域的垃圾收集。

有两种情况是可以完全并发执行的：


- 一、如果在标记阶段确定某个小堆块中没有存活对象，只包含垃圾；

- 二、在 STW 转移暂停期间，同时包含垃圾和存活对象的老年代小堆块。


当堆内存的总体使用比例达到一定数值，就会触发并发标记。这个默认比例是 45%，但也可以通过 JVM参数InitiatingHeapOccupancyPercent 来设置。和 CMS 一样，G1 的并发标记也是由多个阶段组成，其中一些阶段是完全并发的，还有一些阶段则会暂停应用线程。


- 阶段 1: Initial Mark（初始标记）

    - 此阶段标记所有从 GC 根对象直接可达的对象。

- 阶段 2: Root Region Scan（Root区扫描）

    - 此阶段标记所有从 "根区域" 可达的存活对象。根区域包括：非空的区域，以及在标记过程中不得不收集的区域。

- 阶段 3: Concurrent Mark（并发标记）

    - 此阶段和 CMS 的并发标记阶段非常类似：只遍历对象图，并在一个特殊的位图中标记能访问到的对象。

- 阶段 4: Remark（再次标记）

    - 和 CMS 类似，这是一次 STW 停顿（因为不是并发的阶段），以完成标记过程。 G1 收集器会短暂地停止应用线程，停止并发更新信息的写入，处理其中的少量信息，并标记所有在并发标记开始时未被标记的存活对象。

- 阶段 5: Cleanup（清理）

    - 最后这个清理阶段为即将到来的转移阶段做准备，统计小堆块中所有存活的对象，并将小堆块进行排序，以提升GC的效率，维护并发标记的内部状态。 所有不包含存活对象的小堆块在此阶段都被回收了。有一部分任务是并发的：例如空堆区的回收，还有大部分的存活率计算。此阶段也需要一个短暂的 STW 暂停。


3、转移暂停: 混合模式（Evacuation Pause (mixed)）

并发标记完成之后，G1将执行一次混合收集（mixed collection），就是不只清理年轻代，还将一部分老年代区域也加入到回收集中。混合模式的转移暂停不一定紧跟并发标记阶段。有很多规则和历史数据会影响混合模式的启动时机。比如，假若在老年代中可以并发地腾出很多的小堆块，就没有必要启动混合模式。

因此，在并发标记与混合转移暂停之间，很可能会存在多次 young 模式的转移暂停。

具体添加到回收集的老年代小堆块的大小及顺序，也是基于许多规则来判定的。其中包括指定的软实时性能指标，存活性，以及在并发标记期间收集的 GC 效率等数据，外加一些可配置的 JVM 选项。混合收集的过程，很大程度上和前面的 fully-young gc 是一样的。


### 5.4.4、注意事项


特别需要注意的是，某些情况下 G1 触发了 Full GC，这时 G1 会退化使用 Serial 收集器来完成垃圾的清理工作，它仅仅使用单线程来完成 GC 工作，GC 暂停时间将达到秒级别的。


1.并发模式失败


- G1 启动标记周期，但在 Mix GC 之前，老年代就被填满，这时候 G1 会放弃标记周期。


解决办法：增加堆大小，或者调整周期（例如增加线程数-XX：ConcGCThreads 等）。


2.晋升失败


- 没有足够的内存供存活对象或晋升对象使用，由此触发了 Full GC(to-space exhausted/to-spaceoverflow）。


解决办法：


- a) 增加 –XX：G1ReservePercent 选项的值（并相应增加总的堆大小）增加预留内存量。

- b) 通过减少 –XX：InitiatingHeapOccupancyPercent 提前启动标记周期。

- c) 也可以通过增加 –XX：ConcGCThreads 选项的值来增加并行标记线程的数目。


3.巨型对象分配失败


- 当巨型对象找不到合适的空间进行分配时，就会启动 Full GC，来释放空间。

    - 解决办法：增加内存或者增大 -XX：G1HeapRegionSize


### 5.4.5、优化原则


- 尽量减少Full GC的发生

    - 解决方法

        - 增加预留内存（增加 –XX：G1ReservePercent，默认为堆的10%）

        - 更早地回收垃圾（减少 –XX：InitiatingHeapOccupancyPercent 提前启动标记周期，老年代达到该值就触发Mixed GC，默认45%）

        - 通过增加 –XX：ConcGCThreads 选项的值来增加并行标记线程的数目。


## 5.5、Serial、Serial Old、ParNew、Parallel Scavenge、Parallel Old，CMS，G1的对比


![65.png](..%2F..%2Fpublic%2Fjvm%2F65.png)


## 5.6、常见GC组合（重要）


![66.png](..%2F..%2Fpublic%2Fjvm%2F66.png)

常用的组合为：

（1）Serial+Serial Old 实现单线程的低延迟垃圾回收机制；

（2）ParNew+CMS，实现多线程的低延迟垃圾回收机制；

（3）Parallel Scavenge和Parallel Scavenge Old，实现多线程的高吞吐量垃圾回收机制。


## 5.7、GC 如何选择（如何选择垃圾收集器？）


选择正确的 GC 算法，唯一可行的方式就是去尝试，一般性的指导原则：


1. 如果系统考虑吞吐优先，CPU 资源都用来最大程度处理业务，用 Parallel GC；

2. 如果系统考虑低延迟有限，每次 GC 时间尽量短，用 CMS GC；

3. 如果系统内存堆较大，同时希望整体来看平均 GC 时间可控，使用 G1 GC。


对于内存大小的考量：


4. 一般 4G 以上，算是比较大，用 G1 的性价比较高。

5. 一般超过 8G，比如 16G-64G 内存，非常推荐使用 G1 GC。


JDK<=8


6. **内存<=6G，建议用CMS，如果内存>6G，考虑使用G1**


**JDK>8**


7. **直接用G1**


## 5.8、ZGC


zgc，parallel，g1比较：


![67.png](..%2F..%2Fpublic%2Fjvm%2F67.png)


![68.png](..%2F..%2Fpublic%2Fjvm%2F68.png)


![69.png](..%2F..%2Fpublic%2Fjvm%2F69.png)


使用：-XX:+UnlockExperimentalVMOptions -XX:+UseZGC -Xmx16g


ZGC 最主要的特点包括:


1. GC 最大停顿时间不超过 10ms

2. 堆内存支持范围广，小至几百 MB 的堆空间，大至 4TB 的超大堆内存（JDK13 升至 16TB）

3. 与 G1 相比，应用吞吐量下降不超过 15%

4. 当前只支持 Linux/x64 位平台，JDK15 后支持 MacOS 和Windows 系统


厂商：Oracle

定位：低延迟垃圾收集器

状态：实验性

限制：JDK14之前，无法在Windows、macOS机器上使用，每个版本的特性解介绍详见：[https://wiki.openjdk.java.net/display/zgc/Main](https://wiki.openjdk.java.net/display/zgc/Main)

核心技术：染色指针技术

适用场景：


- 低延迟、响应快的业务场景


启用参数：

-XX:+UnlockExperimentalVMOptions -XX:+UseZGC

内存布局：


- ZGC也采用基于Region的堆内存布局，但与它们不同的是，ZGC的Region（在一些官方资料中将它称为Page或者ZPage，本章为行文一致继续称为Region）具有动态性，可以动态创建和销毁，以及动态的区域容量大小。region的容量：

    - 小型Region（Small Region）：容量固定为2MB，**用于放置小于256KB的小对象**。

    - 中型Region（Medium Region）：容量固定为32MB，**用于放置大于等于256KB但小于4MB的对象**。

    - 大型Region（Large Region）：容量不固定，可以动态变化，但必须为2MB的整数倍，**用于放置4MB或以上的大对象**。每个大型Region中只会存放一个大对象，这也预示着虽然名字叫作“大型Region”，但它的实际容量完全有可能小于中型Region，最小容量可低至4MB。大型Region在ZGC的实现中是不会被重分配（重分配是ZGC的一种处理动作，用于复制对象的收集器阶段，稍后会介绍到）的，因为复制一个大对象的代价非常高昂


工作步骤：


- 并发标记（Concurrent Mark）：与G1、Shenandoah一样，并发标记是遍历对象图做可达性分析的阶段，前后也要经过类似于G1、Shenandoah的初始标记、最终标记（尽管ZGC中的名字不叫这些）的短暂停顿，而且这些停顿阶段所做的事情在目标上也是相类似的。与G1、Shenandoah不同的是，ZGC的标记是在指针上而不是在对象上进行的，标记阶段会更新染色指针中的Marked 0、Marked 1标志位。

- 并发预备重分配（Concurrent Prepare for Relocate）：这个阶段需要根据特定的查询条件统计得出本次收集过程要清理哪些Region，将这些Region组成重分配集（Relocation Set）。重分配集与G1收集器的回收集（Collection Set）还是有区别的，ZGC划分Region的目的并非为了像G1那样做收益优先的增量回收。相反，ZGC每次回收都会扫描所有的Region，用范围更大的扫描成本换取省去G1中记忆集的维护成本。因此，ZGC的重分配集只是决定了里面的存活对象会被重新复制到其他的Region中，里面的Region会被释放，而并不能说回收行为就只是针对这个集合里面的Region进行，因为标记过程是针对全堆的。此外，在JDK 12的ZGC中开始支持的类卸载以及弱引用的处理，也是在这个阶段中完成的。

- 并发重分配（Concurrent Relocate）：**重分配是ZGC执行过程中的核心阶段**，这个过程要把重分配集中的存活对象复制到新的Region上，并为重分配集中的每个Region维护一个转发表（Forward Table），记录从旧对象到新对象的转向关系。

- 并发重映射（Concurrent Remap）：重映射所做的就是修正整个堆中指向重分配集中旧对象的所有引用，这一点从目标角度看是与Shenandoah并发引用更新阶段一样的，但是ZGC的并发重映射并不是一个必须要“迫切”去完成的任务，因为前面说过，即使是旧引用，它也是可以自愈的，最多只是第一次使用时多一次转发和修正操作。


性能表现：

吞吐量：

![73.png](..%2F..%2Fpublic%2Fjvm%2F73.png)

停顿时间：

![74.png](..%2F..%2Fpublic%2Fjvm%2F74.png)

## 5.9、Shenandoah GC

![70.png](..%2F..%2Fpublic%2Fjvm%2F70.png)

![71.png](..%2F..%2Fpublic%2Fjvm%2F71.png)


-XX:+UnlockExperimentalVMOptions -XX:+UseShenandoahGC -Xmx16g

Shenandoah GC 立项比 ZGC 更早，设计为GC 线程与应用线程并发执行的方式，通过实现垃圾回收过程的并发处理，改善停顿时间，使得 GC 执行线程能够在业务处理线程运行过程中进行堆压缩、标记和整理，从而消除了绝大部分的暂停时间。Shenandoah 团队对外宣称 Shenandoah GC 的暂停时间与堆大小无关，无论是 200MB还是 200 GB的堆内存，都可以保障具有很低的暂停时间（注意:并不像 ZGC 那样保证暂停时间在 10ms 以内）。


### 5.9.1、基本信息


厂商：RedHat，贡献给了OpenJDK

定位：低延迟垃圾收集器

状态：实验性

限制：**Oracle JDK无法使用**

适用版本：详见 [https://wiki.openjdk.java.net/display/shenandoah](https://wiki.openjdk.java.net/display/shenandoah)

网址：[https://wiki.openjdk.java.net/display/shenandoah](https://wiki.openjdk.java.net/display/shenandoah)

和G1对比，相同点：


- 基于Region的内存布局

- 有用于存放大对象的Humongous Region

- 回收策略也同样是优先处理回收价值最大的Region


和G1对比，不同点：


- 并发的整理算法

- Shenandoah默认是不使用分代收集的

- 解决跨region引用的机制不同，G1主要基于Rememberd Set、CardTable，而Shenandoah是基于连接矩阵（Connection Matrix）去实现的。


启用参数：

-XX:+UnlockExperimentalVMOptions  -XX:+UseShenandoahGC

适用场景：


- 低延迟、响应快的业务场景


工作步骤：

相关论文：[https://www.researchgate.net/publication/306112816_Shenandoah_An_open-source_concurrent_compacting_garbage_collector_for_OpenJDK](https://www.researchgate.net/publication/306112816_Shenandoah_An_open-source_concurrent_compacting_garbage_collector_for_OpenJDK)


1. 初始标记（Initial Marking）：与G1一样，首先标记与GC Roots直接关联的对象，存在Stop The World

2. 并发标记（Concurrent Marking）与G1一样，标记出全部可达的对象，该阶段并发执行，无Stop The World

3. 最终标记（Final Marking）统计出回收价值最高的Region、构建回收集（Collection Set）。存在Stop The World

4. 并发清理（Concurrent Cleanup）用于清理那些整个区域内连一个存活对象都没有找到的Region（这类Region被称为Immediate Garbage Region）

5. 并发回收（Concurrent Evacuation）并发回收阶段是Shenandoah与之前HotSpot中其他收集器的核心差异。在这个阶段，Shenandoah要把回收集里面的存活对象先复制一份到其他未被使用的Region之中。**复制对象这件事情如果将用户线程冻结起来再做那是相当简单的，但如果两者必须要同时并发进行的话，就变得复杂起来了。**其困难点是在移动对象的同时，用户线程仍然可能不停对被移动的对象进行读写访问，移动对象是一次性的行为，但移动之后整个内存中所有指向该对象的引用都还是旧对象的地址，这是很难一瞬间全部改变过来的。对于并发回收阶段遇到的这些困难，**Shenandoah将会通过读屏障和被称为“Brooks Pointers”的转发指针来解决**。并发回收阶段运行的时间长短取决于回收集的大小。

6. 初始引用更新（Initial Update Reference）并发回收阶段复制对象结束后，还需要**把堆中所有指向旧对象的引用修正到复制后的新地址**，这个操作称为引用更新。引用更新的初始化阶段实际上并未做什么具体的处理，设立这个阶段只是为了建立一个线程集合点，确保所有并发回收阶段中进行的收集器线程都已完成分配给它们的对象移动任务而已。初始引用更新时间很短，会产生一个非常短暂的停顿。

7. 并发引用更新（Concurrent Update Reference）真正开始进行引用更新操作，这个阶段是与用户线程一起并发的，时间长短取决于内存中涉及的引用数量的多少。主要是按照内存物理地址的顺序，线性地搜索出引用类型，把旧值改为新值即可。

8. 最终引用更新（Final Update Reference）解决了堆中的引用更新后，还要修正存在于GC Roots中的引用。这个阶段是Shenandoah的最后一次停顿，停顿时间只与GC Roots的数量相关

9. 并发清理（Concurrent Cleanup）经过并发回收和引用更新之后，整个回收集中所有的Region已再无存活对象，这些Region都变成Immediate Garbage Regions了，最后再调用一次并发清理过程来回收这些Region的内存空间，供以后新对象分配使用


**TIPS**

步骤较多，重点是：并发标记、并发回收、并发引用更新这三个阶段。

性能表现
![img.png](..%2F..%2Fpublic%2Fjvm%2Fimg.png)



### 5.9.2、ShennandoahGC 与其他 GC 的 STW 比较


![72.png](..%2F..%2Fpublic%2Fjvm%2F72.png)


## 5.10、Epsilon


Epsilon（A No-Op Garbage Collector）垃圾回收器控制内存分配，但是不执行任何垃圾回收工作。一旦java的堆被耗尽，jvm就直接关闭。设计的目的是提供一个完全消极的GC实现，分配有限的内存分配，最大限度降低消费内存占用量和内存吞吐时的延迟时间。一个好的实现是隔离代码变化，不影响其他GC，最小限度的改变其他的JVM代码。

定位：不干活儿的垃圾收集器

状态：实验性

启用参数：

-XX:+UnlockExperimentalVMOptions -XX:+UseEpsilonGC

适用场景：


- Performance testing,什么都不执行的GC非常适合用于差异性分析。no-op GC可以用于过滤掉GC诱发的新能损耗，比如GC线程的调度，GC屏障的消耗，GC周期的不合适触发，内存位置变化等。此外有些延迟者不是由于GC引起的，比如scheduling hiccups, compiler transition hiccups，所以去除GC引发的延迟有助于统计这些延迟。

- Memory pressure testing, 在测试java代码时，确定分配内存的阈值有助于设置内存压力常量值。这时no-op就很有用，它可以简单地接受一个分配的内存分配上限，当内存超限时就失败。例如：测试需要分配小于1G的内存，就使用-Xmx1g参数来配置no-op GC，然后当内存耗尽的时候就直接crash。

- VM interface testing, 以VM开发视角，有一个简单的GC实现，有助于理解VM-GC的最小接口实现。它也用于证明VM-GC接口的健全性。

- Extremely short lived jobs, 一个短声明周期的工作可能会依赖快速退出来释放资源，这个时候接收GC周期来清理heap其实是在浪费时间，因为heap会在退出时清理。并且GC周期可能会占用一会时间，因为它依赖heap上的数据量。

- Last-drop latency improvements, 对那些极端延迟敏感的应用，开发者十分清楚内存占用，或者是几乎没有垃圾回收的应用，此时耗时较长的GC周期将会是一件坏事。

- Last-drop throughput improvements, 即便对那些无需内存分配的工作，选择一个GC意味着选择了一系列的GC屏障，所有的OpenJDK GC都是分代的，所以他们至少会有一个写屏障。避免这些屏障可以带来一点点的吞吐量提升。


## 5.11、GC总结


Java 目前支持的所有 GC 算法，一共有 7 类:


1. 串行 GC（Serial GC）: 单线程执行，应用需要暂停；

2. 并行 GC（ParNew、Parallel Scavenge、Parallel Old）: 多线程并行地执行垃圾回收，关注与高吞吐；

3. CMS（Concurrent Mark-Sweep）: 多线程并发标记和清除，关注与降低延迟；

4. G1（G First）: 通过划分多个内存区域做增量整理和回收，进一步降低延迟；

5. ZGC（Z Garbage Collector）: 通过着色指针和读屏障，实现几乎全部的并发执行，几毫秒级别的延迟，线性可扩展；

6. Epsilon: 实验性的 GC，供性能分析使用；

7. Shenandoah: G1 的改进版本，跟 ZGC 类似。


可以看出 GC 算法和实现的演进路线:


1. 串行 -> 并行: 重复利用多核 CPU 的优势，大幅降低 GC 暂停时间，提升吞吐量。

2. 并行 -> 并发： 不只开多个 GC 线程并行回收，还将 GC 操作拆分为多个步骤，让很多繁重的任务和应用线程一起并发执行，减少了单次 GC 暂停持续的时间，这能有效降低业务系统的延迟。

3. CMS -> G1： G1 可以说是在 CMS 基础上进行迭代和优化开发出来的，划分为多个小堆块进行增量回收，这样就更进一步地降低了单次 GC 暂停的时间

4. G1 -> ZGC:：ZGC 号称无停顿垃圾收集器，这又是一次极大的改进。ZGC 和 G1 有一些相似的地方，但是底层的算法 和思想又有了全新的突破。

   "脱离场景谈性能都是耍流氓"

   目前绝大部分 Java 应用系统，堆内存并不大比如 2G-4G 以内，而且对 10ms 这种低延迟的 GC 暂停不敏感，也就是说处理一个业务步骤，大概几百毫秒都是可以接受的，GC 暂停 100ms 还是 10ms 没多大区别。另一方面，系统的吞吐量反而往往是我们追求的重点，这时候就需要考虑采用并行 GC。

   如果堆内存再大一些，可以考虑 G1 GC。如果内存非常大（比如超过 16G，甚至是 64G、128G），或者是对延迟非常敏感（比如高频量化交易系统），就需要考虑使用本节提到的新 GC（ZGC/Shenandoah）。

## 6、参数调优
| 收集器                | 参数及默认值                                                 | 备注                                                         |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Serial                | -XX:+UseSerialGC                                             | 虚拟机在Client模式下的默认值，开启后，使用 Serial + Serial Old 的组合 |
| ParNew                | -XX:+UseParNewGC                                             | 开启后，使用ParNew + Serial Old的组合                        |
|                       | -XX:ParallelGCThreads=n                                      | 设置垃圾收集器在并行阶段使用的垃圾收集线程数，当逻辑处理器数量小于8时，n的值与逻辑处理器数量相同；如果逻辑处理器数量大于8个，则n的值大约为逻辑处理器数量的5/8，大多数情况下是这样，除了较大的SPARC系统，其中n的值约为逻辑处理器的5/16。 |
| Parallel Scavenge     | -XX:+UseParallelGC                                           | 虚拟机在Server模式下的默认值，开启后，使用 Parallel Scavenge + Serial Old的组合 |
|                       | -XX:MaxGCPauseMillis=n                                       | 收集器尽可能保证单次内存回收停顿的时间不超过这个值，但是并不保证不超过该值 |
|                       | -XX:GCTimeRatio=n                                            | 设置吞吐量的大小，取值范围0-100，假设 GCTimeRatio 的值为 n，那么系统将花费不超过 1/(1+n) 的时间用于垃圾收集 |
|                       | -XX:+UseAdaptiveSizePolicy                                   | 开启后，无需人工指定新生代的大小（-Xmn）、 Eden和Survisor的比例（-XX:SurvivorRatio）以及晋升老年代对象的年龄（-XX:PretenureSizeThreshold）等参数，收集器会根据当前系统的运行情况自动调整 |
| Serial Old            | 无                                                           | Serial Old是Serial的老年代版本，主要用于 Client 模式下的老生代收集，同时也是 CMS 在发生 Concurrent Mode Failure时的后备方案 |
| Parallel Old          | -XX:+UseParallelOldGC                                        | 开启后，使用Parallel Scavenge + Parallel Old的组合。Parallel Old是Parallel Scavenge的老年代版本，在注重吞吐量和 CPU 资源敏感的场合，可以优先考虑这个组合 |
| CMS                   | -XX:+UseConcMarkSweepGC                                      | 开启后，使用ParNew + CMS的组合；Serial Old收集器将作为CMS收集器出现 Concurrent Mode Failure 失败后的后备收集器使用 |
|                       | -XX:CMSInitiatingOccupancyFraction=68                        | CMS 收集器在老年代空间被使用多少后触发垃圾收集，默认68%      |
|                       | -XX:+UseCMSCompactAtFullCollection                           | 在完成垃圾收集后是否要进行一次内存碎片整理，默认开启         |
|                       | -XX:CMSFullGCsBeforeCompaction=0                             | 在进行若干次Full GC后就进行一次内存碎片整理，默认0           |
|                       | -XX:+UseCMSInitiatingOccupancyOnly                           | 允许使用占用值作为启动CMS收集器的唯一标准，一般和CMSFullGCsBeforeCompaction配合使用。如果开启，那么当CMSFullGCsBeforeCompaction达到阈值就开始GC，如果关闭，那么JVM仅在第一次使用CMSFullGCsBeforeCompaction的值，后续则自动调整，默认关闭。 |
|                       | -XX:+CMSParallelRemarkEnabled                                | 重新标记阶段并行执行，使用此参数可降低标记停顿，默认打开（仅适用于ParNewGC） |
|                       | -XX:+CMSScavengeBeforeRemark                                 | 开启或关闭在CMS重新标记阶段之前的清除（YGC）尝试。新生代里一部分对象会作为GC Roots，让CMS在重新标记之前，做一次YGC，而YGC能够回收掉新生代里大多数对象，这样就可以减少GC Roots的开销。因此，打开此开关，可在一定程度上降低CMS重新标记阶段的扫描时间，当然，开启此开关后，YGC也会消耗一些时间。PS. 开启此开关并不保证在标记阶段前一定会进行清除操作，生产环境建议开启，默认关闭。 |
| CMS-Precleaning       | -XX:+CMSPrecleaningEnabled                                   | 是否启用并发预清理，默认开启                                 |
| CMS-AbortablePreclean | -XX:CMSScheduleRemark                                        |                                                              |
| EdenSizeThreshold=2M  | 如果伊甸园的内存使用超过该值，才可能进入“并发可中止的预清理”这个阶段 |                                                              |
| CMS-AbortablePreclean | -XX:CMSMaxAbortablePrecleanLoops=0                           | “并发可终止的预清理阶段”的循环次数，默认0，表示不做限制      |
| CMS-AbortablePreclean | -XX:+CMSMaxAbortablePrecleanTime=5000                        | “并发可终止的预清理”阶段持续的最大时间                       |
|                       | -XX:+CMSClassUnloadingEnabled                                | 使用CMS时，是否启用类卸载，默认开启                          |
|                       | -XX:+ExplicitGCInvokesConcurrent                             | 显示调用System.gc()会触发Full GC，会有Stop The World，开启此参数后，可让System.gc()触发的垃圾回收变成一次普通的CMS GC。 |
|                       | -XX:+UseG1GC                                                 | 使用G1收集器                                                 |
|                       | -XX:G1HeapRegionSize=n                                       | 设置每个region的大小，该值为2的幂，范围为1MB到32MB，如不指定G1会根据堆的大小自动决定 |
|                       | -XX:MaxGCPauseMillis=200                                     | 设置最大停顿时间，默认值为200毫秒。                          |
|                       | -XX:G1NewSizePercent=5                                       | 设置年轻代占整个堆的最小百分比，默认值是5，这是个实验参数。需用-XX:+UnlockExperimentalVMOptions解锁试验参数后，才能使用该参数。 |
|                       | -XX:G1MaxNewSizePercent=60                                   | 设置年轻代占整个堆的最大百分比，默认值是60，这是个实验参数。需用-XX:+UnlockExperimentalVMOptions解锁试验参数后，才能使用该参数。 |
|                       | -XX:ParallelGCThreads=n                                      | 设置垃圾收集器在并行阶段使用的垃圾收集线程数，当逻辑处理器数量小于8时，n的值与逻辑处理器数量相同；如果逻辑处理器数量大于8个，则n的值大约为逻辑处理器数量的5/8，大多数情况下是这样，除了较大的SPARC系统，其中n的值约为逻辑处理器的5/16。 |
|                       | -XX:ConcGCThreads=n                                          | 设置垃圾收集器并发阶段使用的线程数量，设置n大约为ParallelGCThreads的1/4。 |
|                       | -XX:InitiatingHeapOccupancyPercent=45                        | 老年代大小达到该阈值，就触发Mixed GC，默认值为45。           |
|                       | -XX:G1MixedGCLiveThresholdPercent=85                         | Region中的对象，活跃度低于该阈值，才可能被包含在Mixed GC收集周期中，默认值为85，这是个实验参数。需用-XX:+UnlockExperimentalVMOptions解锁试验参数后，才能使用该参数。 |
|                       | -XX:G1HeapWastePercent=5                                     | 设置浪费的堆内存百分比，当可回收百分比小于浪费百分比时，JVM就不会启动Mixed GC，从而避免昂贵的GC开销。此参数相当于用来设置允许垃圾对象占用内存的最大百分比。 |
|                       | -XX:G1MixedGCCountTarget=8                                   | 设置在标记周期完成之后，最多执行多少次Mixed GC，默认值为8。  |
|                       | -XX:G1OldCSetRegionThresholdPercent=10                       | 设置在一次Mixed GC中被收集的老年代的比例上限，默认值是Java堆的10%，这是个实验参数。需用-XX:+UnlockExperimentalVMOptions解锁试验参数后，才能使用该参数。 |
|                       | -XX:G1ReservePercent=10                                      | 设置预留空闲内存百分比，虚拟机会保证Java堆有这么多空间可用，从而防止对象晋升时无空间可用而失败，默认值为Java堆的10％。 |
|                       | -XX:-G1PrintHeapRegions                                      | 输出Region被分配和回收的信息，默认false                      |
|                       | -XX:-G1PrintRegionLivenessInfo                               | 在清理阶段的并发标记环节，输出堆中的所有Regions的活跃度信息，默认false |
| Shenandoah            | -XX:+UseShenandoahGC                                         | 使用UseShenandoahGC，这是个实验参数，需用-XX:+UnlockExperimentalVMOptions解锁试验参数后，才能使用该参数；另外该参数只能在Open JDK中使用，Oracle JDK无法使用 |
| ZGC                   | -XX:+UseZGC                                                  | 使用ZGC，这是个实验参数，需用-XX:+UnlockExperimentalVMOptions解锁试验参数后，才能使用该参数； |
| Epsilon               | -XX:+UseEpsilonGC                                            | 使用EpsilonGC，这是个实验参数，需用-XX:+UnlockExperimentalVMOptions解锁试验参数后，才能使用该参数； |



## 参考文档


- 周志明《深入理解Java虚拟机》

- [https://www.jianshu.com/p/a06c8e9e7931](https://www.jianshu.com/p/a06c8e9e7931)



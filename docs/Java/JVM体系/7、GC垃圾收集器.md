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


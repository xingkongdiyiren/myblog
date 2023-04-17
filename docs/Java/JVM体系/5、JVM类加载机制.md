# 1、类加载机制

## 1.1、类加载运行全过程

当我们启动一个Java文件的时候，比如
![13.png](..%2F..%2Fpublic%2Fjvm%2F13.png)
点击main方法时，首先需要通过类加载器把主类加载到JVM，具体如下
粗略地：
地址：[https://www.processon.com/view/link/613df3f6e401fd7aedfe372d](https://www.processon.com/view/link/613df3f6e401fd7aedfe372d)
![Java命令执行代码的大体流程.jpg](..%2F..%2Fpublic%2Fjvm%2FJava%E5%91%BD%E4%BB%A4%E6%89%A7%E8%A1%8C%E4%BB%A3%E7%A0%81%E7%9A%84%E5%A4%A7%E4%BD%93%E6%B5%81%E7%A8%8B.jpg)
详细地：
![Hotspot源码JVM启动执行main方法流程.jpg](..%2F..%2Fpublic%2Fjvm%2FHotspot%E6%BA%90%E7%A0%81JVM%E5%90%AF%E5%8A%A8%E6%89%A7%E8%A1%8Cmain%E6%96%B9%E6%B3%95%E6%B5%81%E7%A8%8B.jpg)
细分：

- **加载**
    - 在硬盘上查找并通过IO读入字节码文件，使用到类时才会加载，例如调用类的 main()方法，new对象等等，在加载阶段会在内存中生成一个**代表这个类的 java.lang.Class对象**，作为方法区这个类的各种数据的访问入口 （找 Class 文件）
    - class文件由下面十个部分组成:

❏ 魔数(Magic Number)
使用文件名后缀来区分文件类型很不靠谱，后缀可以被随便修改，可以用魔数(Magic Number)实现，根据文件内容本身来标识文件的类型；很多文件都以固定的几字节开头作为魔数，比如PDF文件的魔数是 %PDF-(十六进制 0x255044462D), png文件的魔数是 \x89PNG(十六进制0x89504E47)。        
使用十六进制工具打开class文件，首先看到的是充满浪漫气息的魔数0xCAFEBABE(咖啡宝贝)
❏ 版本号(Minor&Major Version)
在魔数之后的四个字节分别表示副版本号(Minor Version)和主版本号(MajorVersion)
主版本号是52(0x34)，虚拟机解析这个类时就知道这是一个Java 8编译出的类
❏ 常量池(Constant Pool)
常量池是类文件中最复杂的数据结构。对于JVM字节码来说，如果操作数是很常用的数字，比如0，这 些操作数是内嵌到字节码中的。如果是字符串常量和较大的整数等，class文件则会把这些操作数存储在 常量池(Constant Pool)中，当使用这些操作数时，会根据常量池的索引位置来查找。
❏ 类访问标记(Access Flag)
访问标记(Access flags)，用来标识一个类为final、abstract等，由两个字节表示，总共有16个标记位可供使用
❏ 类索引(This Class)
this_class表示类索引，
❏ 超类索引(Super Class)        super_name表示直接父类的索引
❏ 接口表索引(Interface)
interfaces表示类或者接口的直接父接口
❏ 字段表(Field)
字段表(fields)，类中定义的字段会被存储到这个集合中，包括静态和非静态的字段
❏ 方法表(Method)
类中定义的方法会被存储在方法表，方法表也是一个变长结构。                  
方法method_info结构 	
方法访问标记
方法名与描述符
方法属性表
❏ 属性表(Attribute)
属性表使用两个字节表示属性的个数attributes_count，接下来是若干个属性项的集合，可以看作是一 个数组，数组的每一项都是一个属性项attribute_info，数组的大小为attributes_count     
ConstantValue属性ConstantValue属性出现在字段field_info中，用来表示静态变量的初始值
Code属性Code属性是类文件中最重要的组成部分，它包含方法的字节码，除native和abstract方 法以外，每个method都有且仅有一个Code属性

- **验证**
    - 1.文件格式验证
        - 是否以魔数0xCAFEBABE开头。
        - 主、次版本号是否在当前Java虚拟机接受范围之内。
        - 常量池的常量中是否有不被支持的常量类型(检查常量tag标志)。
        - 指向常量的各种索引值中是否有指向不存在的常量或不符合类型的常量。
        - CONSTANT_Utf8_info型的常量中是否有不符合UTF-8编码的数据。
        - Class文件中各个部分及文件本身是否有被删除的或附加的其他信息。
    - 2.元数据验证
        - 第二阶段是对字节码描述的信息进行语义分析，以保证其描述的信息符合《Java语言规范》的要求，这个阶段可能包括的验证点如下:
            - 这个类是否有父类(除了java.lang.Object之外，所有的类都应当有父类)。
            - 这个类的父类是否继承了不允许被继承的类(被final修饰的类)。
            - 如果这个类不是抽象类，是否实现了其父类或接口之中要求实现的所有方法。
    - 3.字节码验证
        - 第三阶段是整个验证过程中最复杂的一个阶段，主要目的是通过数据流分析和控制流分析，确定程序语义是合法的、符合逻辑的
            - 保证任意时刻操作数栈的数据类型与指令代码序列都能配合工作，例如不会出现类似于“在操作栈放置了一个int类型的数据，使用时却按long类型来加载入本地变量表中”这样的情况。
            - 保证任何跳转指令都不会跳转到方法体以外的字节码指令上。
            - 保证方法体中的类型转换总是有效的，例如可以把一个子类对象赋值给父类数据类型，这是安全的，但 是把父类对象赋值给子类数据类型，甚至把对象赋值给与它毫无继承关系、完全不相干的一个数据类 型，则是危险和不合法的
    - 4.符号引用验证
        - 最后一个阶段的校验行为发生在虚拟机将符号引用转化为直接引用[插图]的时候，这个转化动作将在连 接的第三阶段——解析阶段中发生。符号引用验证可以看作是对类自身以外(常量池中的各种符号引 用)的各类信息进行匹配性校验，通俗来说就是，该类是否缺少或者被禁止访问它依赖的某些外部类、 方法、字段等资源
        - 符号引用中通过字符串描述的全限定名是否能找到对应的类。
        - 在指定类中是否存在符合方法的字段描述符及简单名称所描述的方法和字段。
        - 符号引用中的类、字段、方法的可访问性(private、protected、public、)是否可被当前类访问。
- **准备**
    - 准备阶段是正式为类中定义的变量(即静态变量，被static修饰的变量)分配内存并设置类变量初始值 的阶段        
  - 首先是这时候进行内存分配的仅包括类变量，而不包括实例变量，实例变量将会在对象实例化时随着对 象一起分配在Java堆中。其次是这里所说的初始值“通常情况”下是数据类型的零值
- **解析**
    - 将符号引用替换为直接引用，该阶段会把一些静态方法(符号引用，比如 main()方法)替换为指向数据存内存的指针或句柄等(直接引用)，这是所谓的静态链接过 程(类加载期间完成)，动态链接（调方法）是在程序运行间完成的将符号引用替换为直接引用（符号解析为引用）
    - 解析阶段是Java虚拟机将常量池内的符号引用替换为直接引用的过程
        - 1.类或接口的解析
        - 2.字段解析
        - 3.方法解析
        - 4.接口方法解析
- **初始化**
    - 对类的静态变量初始化为指定的值，执行静态代码块（构造器、静态变量赋值、静态代码块）
- **使用**
- **卸载**

![类加载.jpg](..%2F..%2Fpublic%2Fjvm%2F%E7%B1%BB%E5%8A%A0%E8%BD%BD.jpg)
链接：[https://www.processon.com/view/link/613e05d8e401fd7aedfe52f3](https://www.processon.com/view/link/613e05d8e401fd7aedfe52f3)
类被加载到方法区中后后主要包含 运行时常量池、类型信息、字段信息、方法信息、类加载器的引用、对应class实例的引用等信息。

- **类加载器的引用：**这个类到类加载器实例的引用
- **对应class实例的引用：**类加载器在加载类信息放到方法区中后，会创建一个对应的Class 类型的对象实例放到堆(Heap)中, 作为开发人员访问方法区中类定义的入口和切入点

**注意：**主类在运行过程中如果使用到其它类，会逐步加载这些类。 jar包或war包里的类不是一次性全部加载的，是使用到时才加载。

```java
package com.zhz;

/**
 * @author zhouhengzhe
 * @Description: 测试动态加载
 * @date 2021/9/12下午9:55
 * @since
 */
public class TestDynamicLoad {
    static {
        System.out.println("*************load TestDynamicLoad************");
    }

    public static void main(String[] args) {
        new A();
        System.out.println("*************load test************");
        B b = null; //B不会加载，除非这里执行new B()
    }
}

class A {
    static {
        System.out.println("*************load A************");
    }

    public A() {
        System.out.println("*************initial A************");

    }
}

class B {

    static {
        System.out.println("*************load B************");

    }

    public B() {
        System.out.println("*************initial B************");

    }
}
```

![14.png](..%2F..%2Fpublic%2Fjvm%2F14.png)

## 1.2、类的加载时机

1. 当虚拟机启动时，初始化用户指定的主类，就是启动执行的 main 方法所在的类；
2. 当遇到用以新建目标类实例的 new 指令时，初始化 new 指令的目标类，就是 new 一个类的时候要初始化；
3. 当遇到调用静态方法的指令时，初始化该静态方法所在的类；
4. 当遇到访问静态字段的指令时，初始化该静态字段所在的类；
5. 子类的初始化会触发父类的初始化；
6. 如果一个接口定义了 default 方法，那么直接实现或者间接实现该接口的类的初始化，会触发该接口的初始化；
7. 使用反射 API 对某个类进行反射调用时，初始化这个类，其实跟前面一样，反射调用要么是已经有实例了，要么是静态方法，都需要初始化；
8. 当初次调用 MethodHandle 实例时，初始化该 MethodHandle 指向的方法所在的类。

## 1.3、不会初始化（可能会加载）

1. 通过子类引用父类的静态字段，只会触发父类的初始化，而不会触发子类的初始化。
2. 定义对象数组，不会触发该类的初始化。
3. 常量在编译期间会存入调用类的常量池中，本质上并没有直接引用定义常量的类，不会触发定义常量所在的类。
4. 通过类名获取 Class 对象，不会触发类的初始化，Hello.class 不会让 Hello 类初始化。
5. 通过 Class.forName 加载指定类时，如果指定参数 initialize 为 false 时，也不会触发类初始化，其实这个参数是告诉虚拟机，是否要对类进行初始化。(Class.forName("jvm.Hello"))默认会加载 Hello 类。
6. 通过 ClassLoader 默认的 loadClass 方法，也不会触发初始化动作（加载了，但是不初始化）。

## 1.4、类加载器和双亲委派机制

![15.png](..%2F..%2Fpublic%2Fjvm%2F15.png)
![16.png](..%2F..%2Fpublic%2Fjvm%2F16.png)

- 引导类加载器（BootstrapClassLoader）：负责加载支撑JVM运行的位于JRE的lib目录下的核心类库，比如rt.jar、charsets.jar等
- 扩展类加载器（ExtClassLoader）：负责加载支撑JVM运行的位于JRE的lib目录下的ext扩展目录中的JAR类包
- 应用程序类加载器（AppClassLoader）：负责加载ClassPath路径下的类包，主要就是加载你自己写的那些类
- 自定义加载器：负责加载用户自定义路径下的类包

> 双亲委派机制是什么？

- 1、我们写的类会由AppClassLoader先去加载，然后AppClassLoader会委托ExtClassLoader去加载，ExtClassLoader会委托BootstrapClassLoader去加载
- 2、如果BootstrapClassLoader加载找不到目标类，就会回退给ExtClassLoader，让ExtClassLoader去加载，ExtClassLoader加载找不到目标类，就由AppClassLoader自己加载。

> 源码（证据）：

```java
//ClassLoader的loadClass方法，里面实现了双亲委派机制 
protected Class<?> loadClass(String name, boolean resolve)
        throws ClassNotFoundException
    {
        synchronized (getClassLoadingLock(name)) {
            // First, check if the class has already been loaded
            // 检查当前类加载器是否已经加载了该类
            Class<?> c = findLoadedClass(name);
            if (c == null) {
                long t0 = System.nanoTime();
                try {
                    if (parent != null) { //如果当前加载器父加载器不为空则委托父加载器加载该类
                        c = parent.loadClass(name, false);
                    } else { //如果当前加载器父加载器为空则委托引导类加载器加载该类
                    
                        c = findBootstrapClassOrNull(name);
                    }
                } catch (ClassNotFoundException e) {
                    // ClassNotFoundException thrown if class not found
                    // from the non-null parent class loader
                }

                if (c == null) {
                    // If still not found, then invoke findClass in order
                    // to find the class.
                    long t1 = System.nanoTime();
                    //都会调用URLClassLoader的findClass方法在加载器的类路径里查找并加载该类
                    c = findClass(name);

                    // this is the defining class loader; record the stats
                    sun.misc.PerfCounter.getParentDelegationTime().addTime(t1 - t0);
                    sun.misc.PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
                    sun.misc.PerfCounter.getFindClasses().increment();
                }
            }
            if (resolve) {
                resolveClass(c);//不会执行
            }
            return c;
        }
    }

```

> 解释：

- 1、检查指定名称的类是否已经加载过，如果已经加载过，就直接返回。
- 2、如果没加载过，就判断一下是否有父加载器，如果有父加载器，由父加载器加载（即调用parent.loadClass(name, false)）,如果没有父加载器就调用BootstrapClassLoader->findBootstrapClassOrNull(name);来加载。
- 3、如果父加载器及BootstrapClassLoader都没有找到指定的类，那么调用当前类加载器的 findClass方法来完成类加载。

### 1.4.1、类加载器特点

- 1、双亲委托
- 2、防止重复加载：当父类加载器加载过后，子类加载器就不需要再次加载了，保证被加载类的唯一性
- 3、负责依赖
- 4、缓存加载
- 5、沙箱安全机制：防止Java核心类被随意篡改

```java
package java.lang;

/**
 * @author zhouhengzhe
 * @Description: 沙箱安全机制
 * @date 2021/9/18上午2:34
 * @since
 */
public class String {
    public static void main(String[] args) {
        System.out.println("aaa");
    }
}

```

![17.png](..%2F..%2Fpublic%2Fjvm%2F17.png)

### 1.4.2、类加载器初始化过程

```java
 //Launcher的构造方法    
public Launcher() {
        Launcher.ExtClassLoader var1;
        try {
            //构造扩展类加载器，在构造的过程中将其父加载器设置为null
            var1 = Launcher.ExtClassLoader.getExtClassLoader();
        } catch (IOException var10) {
            throw new InternalError("Could not create extension class loader", var10);
        }

        try {
            //构造应用类加载器，在构造的过程中将其父加载器设置为ExtClassLoader， 					//Launcher的loader属性值是AppClassLoader，我们一般都是用这个类加载器来加载我们自己写的应用程序
            this.loader = Launcher.AppClassLoader.getAppClassLoader(var1);
        } catch (IOException var9) {
            throw new InternalError("Could not create application class loader", var9);
        }

        Thread.currentThread().setContextClassLoader(this.loader);
        String var2 = System.getProperty("java.security.manager");
        if (var2 != null) {
            SecurityManager var3 = null;
            if (!"".equals(var2) && !"default".equals(var2)) {
                try {
                    var3 = (SecurityManager)this.loader.loadClass(var2).newInstance();
                } catch (IllegalAccessException var5) {
                } catch (InstantiationException var6) {
                } catch (ClassNotFoundException var7) {
                } catch (ClassCastException var8) {
                }
            } else {
                var3 = new SecurityManager();
            }

            if (var3 == null) {
                throw new InternalError("Could not create SecurityManager: " + var2);
            }

            System.setSecurityManager(var3);
        }

    }
```

### 1.4.3、全盘加载机制

> 显示指定某一个类加载器加载类

### 1.4.4、自定义类加载器

```java
package com.zhz.bytecode;

import java.io.FileInputStream;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * @author zhouhengzhe
 * @Description: 自定义类加载器
 * @date 2021/9/22上午11:29
 * @since
 */
public class CustomClassLoaderTest {
    static class CustomClassLoader extends ClassLoader {
        private String classpath;


        public CustomClassLoader(String classpath) {
            this.classpath = classpath;
        }

        @Override
        protected Class<?> findClass(String name) throws ClassNotFoundException {
            try {
                byte[] data = loadByte(name);
                //defineClass将一个字节数组转为Class对象，这个字节数组是class文件读取后最终的字节数组。
                return defineClass(name,data,0,data.length);
            } catch (IOException e) {
                e.printStackTrace();
                throw new ClassNotFoundException();
            }
        }

        private byte[] loadByte(String name) throws IOException {
//            name = name.replaceAll("\\.", "/");
            FileInputStream fis = new FileInputStream(classpath + "/" + name + ".class");
            int len = fis.available();
            byte[] data = new byte[len];
            fis.read(data);
            fis.close();
            return data;
        }
    }

    public static void main(String[] args) throws ClassNotFoundException, IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        //初始化自定义类加载器，会先初始化父类ClassLoader，其中会把自定义类加载器的父加载 器设置为应用程序类加载器AppClassLoader
        CustomClassLoader customClassLoader=new CustomClassLoader("/Users/mac/Documents/ideaproject/Java/Java基础/jvm-learn-demo/src/main/java/");
        //D盘创建 test/com/zhz/bytecode 几级目录，将User类的复制类User1.class丢入该目录
        Class<?> clazz = customClassLoader.loadClass("com.zhz.bytecode.Hello");
        Object instance = clazz.newInstance();
        Method method = clazz.getDeclaredMethod("hello", null);
        method.invoke(instance,null);
        System.out.println(clazz.getClassLoader().getClass().getName());

    }
}

```

### 1.4.5、打破双亲加载机制

再来一个沙箱安全机制示例，尝试打破双亲委派机制，用自定义类加载器加载我们自己实现的 java.lang.String.class（失败，Java不给改核心类）
示例：

```java
package com.zhz.bytecode;

import java.io.FileInputStream;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * @author zhouhengzhe
 * @Description: 打破双亲加载机制
 * @date 2021/9/22下午12:48
 * @since
 */
public class BreakParentLoadingMechanism {
    static class CustomClassLoader extends ClassLoader {
        private String classpath;


        public CustomClassLoader(String classpath) {
            this.classpath = classpath;
        }

        /**
         * 重写类加载方法，实现自己的加载逻辑，不委派给双亲加载
         * @param name
         * @return: Class<?>
         * @author: zhouhengzhe
         * @date: 2021/9/22
         */
    @Override
    public Class<?> loadClass(String name,boolean resolve) throws ClassNotFoundException {
        synchronized (getClassLoadingLock(name)) {
            // First, check if the class has already been loaded
            Class<?> c = findLoadedClass(name);
                if (c == null) {
                    // If still not found, then invoke findClass in order
                    // to find the class.
                    long t1 = System.nanoTime();
                    c = findClass(name);

                    // this is the defining class loader; record the stats
                    sun.misc.PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
                    sun.misc.PerfCounter.getFindClasses().increment();
                }
            if (resolve) {
                resolveClass(c);
            }
            return c;
        }
    }


        @Override
        protected Class<?> findClass(String name) throws ClassNotFoundException {
            try {
                byte[] data = loadByte(name);
                //defineClass将一个字节数组转为Class对象，这个字节数组是class文件读取后最终的字节数组。
                return defineClass(name,data,0,data.length);
            } catch (IOException e) {
                e.printStackTrace();
                throw new ClassNotFoundException();
            }
        }

        private byte[] loadByte(String name) throws IOException {
//            name = name.replaceAll("\\.", "/");
            FileInputStream fis = new FileInputStream(classpath + "/" + name + ".class");
            int len = fis.available();
            byte[] data = new byte[len];
            fis.read(data);
            fis.close();
            return data;
        }
    }
    public static void main(String[] args) throws ClassNotFoundException, IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        //初始化自定义类加载器，会先初始化父类ClassLoader，其中会把自定义类加载器的父加载 器设置为应用程序类加载器AppClassLoader
        CustomClassLoaderTest.CustomClassLoader customClassLoader=new CustomClassLoaderTest.CustomClassLoader("/Users/mac/Documents/ideaproject/Java/Java基础/jvm-learn-demo/src/main/java/");
        //D盘创建 test/com/zhz/bytecode 几级目录，将User类的复制类User1.class丢入该目录
        Class<?> clazz = customClassLoader.loadClass("java.lang.String");
        Object instance = clazz.newInstance();
        Method method = clazz.getDeclaredMethod("sout", null);
        method.invoke(instance,null);
        System.out.println(clazz.getClassLoader().getClass().getName());

    }
}

```

![18.png](..%2F..%2Fpublic%2Fjvm%2F18.png)

### 1.4.6、扩展：tomcat如何打破双亲加载机制

Tomcat类加载机制详解
![19.png](..%2F..%2Fpublic%2Fjvm%2F19.png)
解释：

- CommonClassLoader能加载的类都可以被CatalinaClassLoader和SharedClassLoader使用， 从而实现了公有类库的共用，而CatalinaClassLoader和SharedClassLoader自己能加载的类则 与对方相互隔离。
- WebAppClassLoader可以使用SharedClassLoader加载到的类，但各个WebAppClassLoader 实例之间相互隔离。
- 而JasperLoader的加载范围仅仅是这个JSP文件所编译出来的那一个.Class文件，它出现的目的 就是为了被丢弃：当Web容器检测到JSP文件被修改时，会替换掉目前的JasperLoader的实例， 并通过再建立一个新的Jsp类加载器来实现JSP文件的热加载功能。

tomcat主要类加载器：

- commonLoader：Tomcat最基本的类加载器，加载路径中的class可以被Tomcat容器本身以及各个Webapp访问；
- catalinaLoader：Tomcat容器私有的类加载器，加载路径中的class对于Webapp不可见；
- sharedLoader：各个Webapp共享的类加载器，加载路径中的class对于所有 Webapp可见，但是对于Tomcat容器不可见；
- WebappClassLoader：各个Webapp私有的类加载器，加载路径中的class只对当前 Webapp可见，比如加载war包里相关的类，每个war包应用都有自己的WebappClassLoader，实现相互隔离，比如不同war包应用引入了不同的spring版本， 这样实现就能加载各自的spring版本；

注意：

- tomcat类加载机制违背了Java推荐的双亲加载机制。
- 为了实现隔离性，没有遵守Java推荐的双亲加载机制，，每个webappClassLoader加载自己的目录下的class文件，不会传递给父类加载器，打破了双亲委派机制。

模拟实现—>模拟实现Tomcat的webappClassLoader加载自己war包应用内不同版本类实现相互共存与隔离：

- 代码

```java
package com.zhz.bytecode;

import java.io.FileInputStream;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

/**
 * @author zhouhengzhe
 * @Description: 模拟实现Tomcat的webappClassLoader加载自己war包应用内不同版本类实现相互共存与隔 离
 * @date 2021/9/22下午1:12
 * @since
 */
public class SimulateTomcatMultipleVersionIsolation {
    static class CustomClassLoader extends ClassLoader {
        private String classpath;


        public CustomClassLoader(String classpath) {
            this.classpath = classpath;
        }

        /**
         * 重写类加载方法，实现自己的加载逻辑，不委派给双亲加载
         * @param name
         * @return: Class<?>
         * @author: zhouhengzhe
         * @date: 2021/9/22
         */
        @Override
        public Class<?> loadClass(String name,boolean resolve) throws ClassNotFoundException {
            synchronized (getClassLoadingLock(name)) {
                // First, check if the class has already been loaded
                Class<?> c = findLoadedClass(name);
                if (c == null) {
                    // If still not found, then invoke findClass in order
                    // to find the class.
                    long t1 = System.nanoTime();
                    //非自定义的类还是走双亲委派加载---->重要
                    if (!name.startsWith("com.zhz.jvm")){
                        c=this.getParent().loadClass(name);
                    }else {
                        c = findClass(name);
                    }

                    // this is the defining class loader; record the stats
                    sun.misc.PerfCounter.getFindClassTime().addElapsedTimeFrom(t1);
                    sun.misc.PerfCounter.getFindClasses().increment();
                }
                if (resolve) {
                    resolveClass(c);
                }
                return c;
            }
        }


        @Override
        protected Class<?> findClass(String name) throws ClassNotFoundException {
            try {
                byte[] data = loadByte(name);
                //defineClass将一个字节数组转为Class对象，这个字节数组是class文件读取后最终的字节数组。
                return defineClass(name,data,0,data.length);
            } catch (IOException e) {
                e.printStackTrace();
                throw new ClassNotFoundException();
            }
        }

        private byte[] loadByte(String name) throws IOException {
            //name = name.replaceAll("\\.", "/");
            FileInputStream fis = new FileInputStream(classpath + "/" + name + ".class");
            int len = fis.available();
            byte[] data = new byte[len];
            fis.read(data);
            fis.close();
            return data;
        }
    }
    public static void main(String[] args) throws ClassNotFoundException, IllegalAccessException, InstantiationException, NoSuchMethodException, InvocationTargetException {
        //初始化自定义类加载器，会先初始化父类ClassLoader，其中会把自定义类加载器的父加载 器设置为应用程序类加载器AppClassLoader
        CustomClassLoaderTest.CustomClassLoader customClassLoader=new CustomClassLoaderTest.CustomClassLoader("D:/test");
        //D盘创建 test/com/zhz/bytecode 几级目录，将User类的复制类User1.class丢入该目录
        Class<?> clazz = customClassLoader.loadClass("com.zhz.jvm.User1");
        Object instance = clazz.newInstance();
        Method method = clazz.getDeclaredMethod("sout", null);
        method.invoke(instance,null);
        System.out.println(clazz.getClassLoader().getClass().getName());

        //初始化自定义类加载器，会先初始化父类ClassLoader，其中会把自定义类加载器的父加载 器设置为应用程序类加载器AppClassLoader
        CustomClassLoaderTest.CustomClassLoader customClassLoader1=new CustomClassLoaderTest.CustomClassLoader("D:/test1");
        //D盘创建 test/com/zhz/bytecode 几级目录，将User类的复制类User1.class丢入该目录
        Class<?> clazz1 = customClassLoader1.loadClass("com.zhz.jvm.User1");
        Object instance1 = clazz1.newInstance();
        Method method1 = clazz1.getDeclaredMethod("sout", null);
        method1.invoke(instance1,null);
        System.out.println(clazz1.getClassLoader().getClass().getName());

    }
}

```

注意：同一个JVM内，两个相同包名和类名的类对象可以共存，因为他们的类加载器可以不一 样，所以看两个类对象是否是同一个，除了看类的包名和类名是否都相同之外，还需要他们的类加载器也是同一个才能认为他们是同一个。


## 1.5、显示当前ClassLoader加载了哪些Jar

- **方法一：**

```java
package com.zhz;

import sun.misc.Launcher;
import java.net.URL;

/**
 * @author zhouhengzhe
 * @Description: 方法一：显示当前ClassLoader加载了哪些Jar
 * @date 2021/9/12下午10:06
 * @since
 */
public class TestJdkClassLoader {

    public static void main(String[] args) {
        System.out.println(String.class.getClassLoader());
        System.out.println(com.sun.crypto.provider.DESKeyFactory.class.getClassLoader().getClass().getName());
        System.out.println(TestJdkClassLoader.class.getClassLoader().getClass().getName());
        System.out.println();
        ClassLoader appClassLoader = ClassLoader.getSystemClassLoader();
        ClassLoader extClassloader = appClassLoader.getParent();
        ClassLoader bootstrapLoader = extClassloader.getParent();
        System.out.println("the bootstrapLoader : " + bootstrapLoader);
        System.out.println("the extClassloader : " + extClassloader);
        System.out.println("the appClassLoader : " + appClassLoader);
        System.out.println();
        System.out.println("bootstrapLoader加载以下文件：");
        URL[] urls = Launcher.getBootstrapClassPath().getURLs();
        for (int i = 0; i < urls.length; i++) {
            System.out.println(urls[i]);
        }
        System.out.println();
        System.out.println("extClassloader加载以下文件：");
        System.out.println(System.getProperty("java.ext.dirs"));
        System.out.println();
        System.out.println("appClassLoader加载以下文件：");
        System.out.println(System.getProperty("java.class.path"));
    }
}
```

![20.png](..%2F..%2Fpublic%2Fjvm%2F20.png)

- **方法二：**

```java
package com.zhz.bytecode;

import sun.misc.Launcher;

import java.lang.reflect.Field;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.Objects;

/**
 * @author zhouhengzhe
 * @Description: 方法二：显示当前ClassLoader加载了哪些Jar
 * @date 2021/9/18上午12:20
 * @since
 */
public class JvmClassLoaderPrintPath {
    public static void main(String[] args) {
        //启动类加载器
        URL[] urLs = Launcher.getBootstrapClassPath().getURLs();
        System.out.println("启动类加载器");
        for (URL urL : urLs) {
            System.out.println("==>"+ urL.toExternalForm());
        }

        //扩展类加载器
        printClassLoad("扩展类加载器",JvmClassLoaderPrintPath.class.getClassLoader());

        //应用类加载器
        printClassLoad("应用类加载器",JvmClassLoaderPrintPath.class.getClassLoader());

    }

    private static void printClassLoad(String name, ClassLoader classLoader) {
        if (Objects.nonNull(classLoader)){
            System.out.println(name+" ClassLoader -> "+classLoader.toString());
            printURLForClassLoader(classLoader);
            return;
        }
        System.out.println(name+" ClassLoader -> null");
        
    }

    private static void printURLForClassLoader(ClassLoader classLoader) {
        Object ucp = insightField(classLoader, "ucp");
        Object path = insightField(ucp, "path");
        ArrayList ps = (ArrayList) path;
        for (Object p : ps) {
            System.out.println(" ==> "+p.toString());
        }
    }

    private static Object insightField(Object obj, String name){
        try {
            Field field=null;
            if (obj instanceof URLClassLoader){
                field=URLClassLoader.class.getDeclaredField(name);
            }else {
                field=obj.getClass().getDeclaredField(name);
            }
            field.setAccessible(true);
            return field.get(obj);
        }catch (Exception e){
            e.printStackTrace();
            return null;
        }
    }
}
```

结果
![21.png](..%2F..%2Fpublic%2Fjvm%2F21.png)

## 1.6、添加引用类的几种方式

1、放到 JDK 的 lib/ext 下，或者 -Djava.ext.dirs

2、java-cp/classpath 或者 class 文件放到当前路径

3、自定义 ClassLoader 加载

4、拿到当前执行类的 ClassLoader，反射调用 addUrl 方法添加 Jar 或路径（JDK9 无效）
![22.png](..%2F..%2Fpublic%2Fjvm%2F22.png)


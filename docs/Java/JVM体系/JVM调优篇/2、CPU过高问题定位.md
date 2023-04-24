测试代码

```java
package com.zhz.jvm.tuning;

/**
 * 该测试简单占用cpu，4个用户线程，一个占用大量cpu资源，3个线程处于空闲状态
 * 
 * CPU过高
 */
public class HoldCPUMain {
    //大量占用cpu
    public static class HoldCPUTask implements Runnable {
        @Override
        public void run() {
            while (true) {
                double a = Math.random() * Math.random();
                System.out.println(a);
            }
        }
    }

    //空闲线程
    public static class LazyTask implements Runnable {
        @Override
        public void run() {
            try {
                while (true) {

                    Thread.sleep(1000);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String[] args) {
        //开启线程，占用cpu
        new Thread(new HoldCPUTask()).start();
        //3个空闲线程
        new Thread(new LazyTask()).start();
        new Thread(new LazyTask()).start();
        new Thread(new LazyTask()).start();
    }
}
```

# 1、方法一：top+Jstack

1、**top** 查看CPU最高的进程，发现是36032
![3.png](..%2F..%2F..%2Fpublic%2Fjvm%2F%E8%B0%83%E4%BC%98%2F3.png)
2、**top -Hp **36032  能够查看当前进程下面最高的线程排行,发现最高是36044
![2.png](..%2F..%2F..%2Fpublic%2Fjvm%2F%E8%B0%83%E4%BC%98%2F2.png)
3、printf %x 36044 转化成16进制，变为**8ccc**
![4.png](..%2F..%2F..%2Fpublic%2Fjvm%2F%E8%B0%83%E4%BC%98%2F4.png)
4、jstack 30632 > 1.txt 把线程36032下面的堆栈信息输入到1.txt
5、cat 1.txt | grep -A 30 8ccc  在1.txt中搜索8ccc，往后打印30行
6、就可以发现是哪行代码错误了。

# 2、JMC

实际项目中一般建议服务器开启JMX
![5.png](..%2F..%2F..%2Fpublic%2Fjvm%2F%E8%B0%83%E4%BC%98%2F5.png)

# 3、可能导致CPU占用率过高的场景与解决方案

- 无限while循环
    - 尽量避免无限循环
    - 让循环执行得慢一点
- 频繁GC
    - 降低GC频率
- 频繁创建新对象
    - 合理使用单例
- 序列化和反序列化
    - 选择合理的API实现功能
- 正则表达式
    - 减少字符匹配期间执行的回溯
        - 样例：[https://blog.csdn.net/ityouknow/article/details/80851338](https://blog.csdn.net/ityouknow/article/details/80851338)
- 频繁的线程上下文切换
    - 降低切换的频率
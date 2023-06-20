| 属性                            | 作用                                                         | 默认值                                       |
| ------------------------------- | ------------------------------------------------------------ | -------------------------------------------- |
| -XX:InitialCodeCacheSize        | 设置代码缓存区的初始大小，以java -XX:+PrintFlagsFinal &#124; grep InitialCodeCacheSize 结果为准 | 不同操作系统、不同编译器的值不同             |
| -XX:ReservedCodeCacheSize       | 设置代码缓存区的最大大小，以java -XX:+PrintFlagsFinal &#124; grep ReservedCodeCacheSize结果为准 | 不同版本不同，JDK 8 64位、JDK 1164位都是240M |
| -XX:PrintCodeCache              | 在JVM停止时打印代码缓存的使用情况                            | 关闭                                         |
| -XX:PrintCodeCacheOnCompilation | 每当方法被编译后，就打印一下代码缓存区的使用情况             | 关闭                                         |
| -XX:UseCodeCacheFlushing        | 代码缓存区即将耗尽时，尝试回收一些早期编译、很久未被地调用的方法 | 打开                                         |
| -XX:SegmentedCodeCache          | 是否使用分段的代码缓存区，默认关闭，表示使用整体的代码缓存区 | 关闭                                         |

总结：

- 设置合理的代码缓存区大小
- 如果项目平时性能OK，但突然出现性能下降，业务没有问题，可排查是否由代码缓存区满所导致
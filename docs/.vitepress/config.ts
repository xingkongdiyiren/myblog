export default {
    // 网站标题
    title: '小白的编程之路',
    // // 网站描述
    // description: 'Interview with vitePress',
    // // 打包目录
    // dest: './dist',
    base: '/myblog/',
    lastUpdated: true,
    cleanUrls: true,
    // 头部head
    algolia: {
        appId: '4U7RZD5OL6',
        apiKey: '7831c2e3569defa8d0028d760ce1df85',
        indexName: 'searchapi',
        placeholder: '请输入关键词',
        buttonText: '搜索',
    },
    head: [
        ['meta', {name: 'theme-color', content: '#3c8772'}],
        [
            'script',
            {
                src: 'https://cdn.usefathom.com/script.js',
                'data-site': 'AZBRSFGG',
                'data-spa': 'auto',
                defer: ''
            },
        ]
    ],
    markdown: {
        externalLinks: {
            target: '_blank', // 打开外链的方式，可以根据情况更改
            rel: 'noopener noreferrer' // 标签中的 rel 属性，也可以根据情况更改
        }
    },
    // 主题配置
    themeConfig: {
        // 配置顶部的文字(不配置则是英文)
        outlineTitle: '文章目录',
        // 表示显示h2-h6的标题
        outline: [0, 6],
        // 导航栏配置
        nav: [
            {text: '考研4件套', items: getKaoYan()},
            {text: 'Java', items: getJava()},
            {text: 'Spring 全家桶', items: getSpring()},
            {text: '分布式中间件', items: getDistributedMiddleware()},
            {text: '云原生', items: getCloudNative()},
            {text: '运维相关', items: getOther()},
            {text: '架构体系', items: getArchitectureSystem()},
            {text: '实战系列', items: getActualComBatSeries()},
            {
                text: '软技能', items: getSoftSkills()
            },
            {text: '关于个人', items: [{text: '个人介绍', link: '个人介绍/简历介绍'},]},
            {
                text: '博主其他平台博客', items: [
                    {text: '我的个人网站', link: 'https://blog.csdn.net/zhouhengzhe?type=blog'},
                    {text: 'CSDN', link: 'https://blog.csdn.net/zhouhengzhe?type=blog'},
                    {text: 'Gitee', link: 'https://gitee.com/zhouzhz/projects'}
                ]
            },
        ],
        sidebar: {
            'kaoyan': getKaoYan(),
            '/Java/': getJava(),
            '/Spring Family/': getSpring(),
            'Distributed Middleware': getDistributedMiddleware(),
            'Cloud native': getCloudNative(),
            'other': getOther(),
            'Architecture system': getArchitectureSystem(),
            'Actual combat series': getActualComBatSeries(),
            'soft skills': getSoftSkills()
        }
    }
}

function getKaoYan() {
    return [
        {
            text: '操作系统', items: [
                {text: '第1章 操作系统概述', link: '/kaoyan/操作系统/第1章 操作系统概述'},
                {text: '第2章 内存管理', link: '/kaoyan/操作系统/第2章 内存管理'},
                {text: '第3章 进程和线程', link: '/kaoyan/操作系统/第3章 进程和线程'},
                {text: '第4章 进程间通信', link: '/kaoyan/操作系统/第4章 进程间通信'},
                {text: '第5章 文件系统', link: '/kaoyan/操作系统/第5章 文件系统'},
                {text: '第6章 设备管理', link: '/kaoyan/操作系统/第6章 设备管理'},
                {text: '第7章 网络系统', link: '/kaoyan/操作系统/第7章 网络系统'},
            ]
        }, {
            text: '计算机组成', items: [
                {text: '计算机组成', link: '/kaoyan/计算机组成/计算机组成'},

            ]
        }, {
            text: '计算机网络', items: [
                {text: '计算机网络', link: '/kaoyan/计算机网络/计算机网络'},

            ]
        },
    ]
}

function getJava() {
    return [
        {
            text: 'Java基础', items: [
                {text: '面向对象', link: '/Java/基础/1-面向对象'},
                {text: '泛型机制', link: '/Java/基础/2-泛型机制'},
                {text: '注解机制', link: '/Java/基础/3-注解机制'},
                {text: '异常机制', link: '/Java/基础/4-异常机制'},
                {text: 'SPI机制', link: '/Java/基础/5-SPI机制'},
                {text: '反射机制', link: '/Java/基础/6-反射机制'},
                {text: 'Stream流', link: '/Java/基础/7-Stream流'},
            ]
        },
        {
            text: 'JVM体系',
            items: [
                {text: 'JVM基础-字节码', link: '/Java/JVM体系/1、JVM基础-字节码'},
                {text: 'JVM字节码指令手册', link: '/Java/JVM体系/2、JVM字节码指令手册'},
                {text: 'Class常量池类型分类', link: '/Java/JVM体系/3、Class常量池类型分类'},
                {text: 'Class文件结构参照表全集', link: '/Java/JVM体系/4、Class文件结构参照表全集'},
                {text: 'JVM类加载机制', link: '/Java/JVM体系/5、JVM类加载机制'},
                {text: 'JVM内存模型', link: '/Java/JVM体系/6、JVM内存模型'},
                {text: 'GC垃圾收集器', link: '/Java/JVM体系/7、GC垃圾收集器'},
                {text: 'JVM启动参数', link: '/Java/JVM体系/8、JVM 启动参数'},
                {text: 'JVM工具篇（JDK11）', link: '/Java/JVM体系/9、JVM工具篇（JDK11）'},
                {text: '编译器优化机制详解（JIT）', link: '/Java/JVM体系/10、编译器优化机制详解（JIT）'},
                {text: '方法内联详解', link: '/Java/JVM体系/11、方法内联详解'},
                {text: '逃逸分析、标量替换，栈上分配', link: '/Java/JVM体系/12、逃逸分析、标量替换，栈上分配'},
            ]
        },
        {
            text: 'JVM实战篇', items: [
                {
                    text: 'GC日志篇解析',
                    link: '/Java/JVM体系/JVM调优篇/1、GC日志篇解析'
                },
                {
                    text: 'CPU过高问题定位',
                    link: '/Java/JVM体系/JVM调优篇/2、CPU过高问题定位'
                },
                {
                    text: '堆内存溢出',
                    link: '/Java/JVM体系/JVM调优篇/3、堆内存溢出'
                },
                {
                    text: '栈内存溢出',
                    link: '/Java/JVM体系/JVM调优篇/4、栈内存溢出'
                },
                {
                    text: '方法区溢出',
                    link: '/Java/JVM体系/JVM调优篇/5、方法区溢出'
                },
                {
                    text: 'Metaspace泄漏排查',
                    link: '/Java/JVM体系/JVM调优篇/5.1、Metaspace泄漏排查'
                },
                {
                    text: '直接内存溢出',
                    link: '/Java/JVM体系/JVM调优篇/6、直接内存溢出'
                },
                {
                    text: 'Java直接内存与非直接内存性能测试',
                    link: '/Java/JVM体系/JVM调优篇/6.1、Java直接内存与非直接内存性能测试'
                },
                {
                    text: '代码缓存区（Code Cache）满',
                    link: '/Java/JVM体系/JVM调优篇/7、代码缓存区（Code Cache）满'
                },
                {
                    text: '定位并解决项目越来越慢的问题',
                    link: '/Java/JVM体系/JVM调优篇/8、定位并解决项目越来越慢的问题'
                },
                {
                    text: 'TLAB',
                    link: '/Java/JVM体系/JVM调优篇/9、TLAB'
                },
                {
                    text: '调优实践',
                    link: '/Java/JVM体系/JVM调优篇/10、调优实践'
                },
            ]
        },
        {
            text: 'Java集合体系',
            items: [
                {text: 'ArrayList', link: '/Java/集合体系/1、ArrayList'},
                {text: 'LinkedList', link: '/Java/集合体系/2、LinkedList'},
                {text: 'Stack&Queue', link: '/Java/集合体系/3、Stack&Queue'},
                {text: 'PriorityQueue', link: '/Java/集合体系/4、PriorityQueue'},
                {text: 'HashSet&HashMap', link: '/Java/集合体系/5、HashSet&HashMap'},
                {text: 'TreeSet&TreeMap', link: '/Java/集合体系/6、TreeSet&TreeMap'},
                {text: 'WeakHashMap', link: '/Java/集合体系/7、WeakHashMap'},
            ]
        },
        {
            text: 'Java并发编程',
            items: [
                {
                    text: '深入理解并发、线程与等待通知机制',
                    link: '/Java/并发体系/1、深入理解并发、线程与等待通知机制'
                },
                {text: 'JMM&volatile', link: '/Java/并发体系/2、JMM&volatile'},
                {text: 'CopyOnWriteArrayList', link: '/Java/并发体系/3、CopyOnWriteArrayList'},
                {text: 'ConcurrentLinkedQueue', link: '/Java/并发体系/4、ConcurrentLinkedQueue'},
                {text: 'ConcurrentHashMap', link: '/Java/并发体系/5、ConcurrentHashMap'},
                {text: 'ThreadPoolExecutor线程池', link: '/Java/并发体系/6、ThreadPoolExecutor线程池'},
                {text: 'ThreadLocal', link: '/Java/并发体系/7、ThreadLocal'},
                {text: 'CAS&Atomic', link: '/Java/并发体系/8、CAS&Atomic'},
                {text: 'Unsafe工具类入门', link: '/Java/并发体系/9、Unsafe工具类入门'},
                {text: 'Synchronized', link: '/Java/并发体系/10、Synchronized'},
                {text: 'ReentrantLock', link: '/Java/并发体系/11、AQS&ReentrantLock'},
                {
                    text: 'ReentrantReadWriteLock&StampLock',
                    link: '/Java/并发体系/12、ReentrantReadWriteLock&StampLock'
                },
                {text: 'BlockingQueue', link: '/Java/并发体系/13、BlockingQueue'},
                {text: 'FutureJoinPool&Fork&Join', link: '/Java/并发体系/14、FutureJoinPool&Fork&Join'},
                {text: 'Disruptor', link: '/Java/并发体系/15、Disruptor'},
                {text: 'Phaser', link: '/Java/并发体系/16、Phaser'},
                {text: 'Exchanger', link: '/Java/并发体系/17、Exchanger'},
                {text: 'CountDownLatch', link: '/Java/并发体系/18、CountDownLatch'},
                {text: 'CyclicBarrier', link: '/Java/并发体系/19、CyclicBarrier'},
                {text: 'Semaphore', link: '/Java/并发体系/20、Semaphore'},
                {text: '常用并发设计模式', link: '/Java/并发体系/21、常用并发设计模式'},
            ]
        },
    ];
}

function getSpring() {
    return [
        {text: 'Spring', link: '/Spring Family/Spring/Spring'},
        {text: 'SpringBoot', link: '/Spring Family/SpringBoot/SpringBoot'},
        {text: 'SpringMVC', link: '/Spring Family/SpringMVC/SpringMVC'},
        {text: 'Mybatis', link: '/Spring Family/MyBatis/Mybatis'},
        {
            text: 'SpringCloud体系', items: [
                {text: '注册配置中心—>Nacos(底层)', link: '/Spring Family/微服务/SpringCloud体系/Nacos'},
                {text: '分布式事务', link: '/Spring Family/微服务/SpringCloud体系/分布式事务'},
                {text: '安全', link: '/Spring Family/微服务/SpringCloud体系/安全'},
                {text: '服务调用', link: '/Spring Family/微服务/SpringCloud体系/服务调用'},
                {text: '消息驱动', link: '/Spring Family/微服务/SpringCloud体系/消息驱动'},
                {text: '网关', link: '/Spring Family/微服务/SpringCloud体系/网关'},
                {text: '负载均衡', link: '/Spring Family/微服务/SpringCloud体系/负载均衡'},
                {text: '运维与监控', link: '/Spring Family/微服务/SpringCloud体系/运维与监控'},
                {text: '链路追踪', link: '/Spring Family/微服务/SpringCloud体系/链路追踪'},
                {text: 'Sentinel生产使用', link: '/Spring Family/微服务/SpringCloud体系/Sentinel生产使用'}
            ]
        },
        {
            text: 'Dubbo体系', items: [
                {text: 'Zookeeper', link: '/Spring Family/微服务/Dubbo体系/分布式注册中心/Zookeeper'},
                {text: 'Dubbo', link: '/Spring Family/微服务/Dubbo体系/服务治理/Dubbo'}
            ]
        }
    ];
}

function getDistributedMiddleware() {
    return [
        {
            text: '分布式事务',
            items: [
                {text: '分布式事务详解', link: '/Distributed Middleware/分布式事务/分布式事务详解'},
            ]
        },
        {
            text: '分布式会话',
            items: [
                {text: '分布式会话详解', link: '/Distributed Middleware/分布式会话/分布式会话详解'},
            ]
        },
        {
            text: '分布式唯一ID',
            items: [
                {text: '分布式唯一ID详解', link: '/Distributed Middleware/分布式唯一ID/分布式唯一ID详解'},
            ]
        },
        {
            text: '分布式幂等性',
            items: [
                {text: '分布式幂等性详解', link: '/Distributed Middleware/分布式幂等性/分布式幂等性详解'},
            ]
        },
        {
            text: '分布式搜索',
            items: [
                {text: 'ElasticSearch', link: '/Distributed Middleware/分布式搜索/ElasticSearch'},
            ]
        },
        {
            text: '分布式文件存储',
            items: [
                {text: 'FastFDS', link: '/Distributed Middleware/分布式文件存储/FastFDS.md'},
                {text: 'Oss', link: '/Distributed Middleware/分布式文件存储/Oss'},
                {text: '七牛云', link: '/Distributed Middleware/分布式文件存储/七牛云'},
            ]
        },
        {
            text: '分布式权限控制与安全认证',
            items: [
                {
                    text: 'Spring Security',
                    link: '/Distributed Middleware/分布式权限控制与安全认证/Spring Security'
                },
                {text: 'Shiro', link: '/Distributed Middleware/分布式权限控制与安全认证/Shiro'},
            ]
        },
        {
            text: '分布式消息',
            items: [
                {text: 'Kafka', link: '/Distributed Middleware/分布式消息/Kafka'},
                {text: 'RabbitMQ', link: '/Distributed Middleware/分布式消息/RabbitMQ'},
                {text: 'RocketMQ', link: '/Distributed Middleware/分布式消息/RocketMQ'}

            ]
        },
        {
            text: '分布式缓存',
            items: [
                {text: 'Redis', link: '/Distributed Middleware/分布式缓存/Redis'},
                {text: 'MongoDB', link: '/Distributed Middleware/分布式缓存/MongoDB'}
            ]
        },
        {
            text: '分布式重试机制',
            items: [
                {text: 'Guava-Retry和Spring-retry', link: '/Distributed Middleware/分布式重试机制/Guava-Spring-Retry'}
            ]
        },
        {
            text: '分布式锁',
            items: [
                {
                    text: '01_分布式锁是啥？基于Redis和Zookeeper的分布式锁实现',
                    link: '/Distributed Middleware/分布式锁/01_分布式锁是啥？基于Redis和Zookeeper的分布式锁实现'
                },
                {
                    text: '02_基于docker搭建一套3主3从的redis cluster',
                    link: '/Distributed Middleware/分布式锁/02_基于docker搭建一套3主3从的redis cluster'
                },
                {
                    text: '03_redis开源客户端框架redisson的初步介绍以及使用',
                    link: '/Distributed Middleware/分布式锁/03_redis开源客户端框架redisson的初步介绍以及使用'
                },
                {
                    text: '04_redis分布式锁（一）：可重入锁源码剖析之使用场景介绍',
                    link: '/Distributed Middleware/分布式锁/04_redis分布式锁（一）：可重入锁源码剖析之使用场景介绍'
                },
                {
                    text: '05_redis分布式锁（二）：可重入锁源码剖析之lua脚本加锁逻辑',
                    link: '/Distributed Middleware/分布式锁/05_redis分布式锁（二）：可重入锁源码剖析之lua脚本加锁逻辑'
                },
                {
                    text: '06_redis分布式锁（三）：可重入锁源码剖析之watchdog维持加锁',
                    link: '/Distributed Middleware/分布式锁/06_redis分布式锁（三）：可重入锁源码剖析之watchdog维持加锁'
                },
                {
                    text: '07_redis分布式锁（四）：可重入锁源码剖析之可重入加锁',
                    link: '/Distributed Middleware/分布式锁/07_redis分布式锁（四）：可重入锁源码剖析之可重入加锁'
                },
                {
                    text: '08_redis分布式锁（五）：可重入锁源码剖析之锁的互斥阻塞',
                    link: '/Distributed Middleware/分布式锁/08_redis分布式锁（五）：可重入锁源码剖析之锁的互斥阻塞'
                },
                {
                    text: '09_redis分布式锁（六）：可重入锁源码剖析之释放锁',
                    link: '/Distributed Middleware/分布式锁/09_redis分布式锁（六）：可重入锁源码剖析之释放锁'
                },
                {
                    text: '10_redis分布式锁（七）：可重入锁源码剖析之获取锁超时与自动释放',
                    link: '/Distributed Middleware/分布式锁/10_redis分布式锁（七）：可重入锁源码剖析之获取锁超时与自动释放'
                },
                {
                    text: '11_redis分布式锁（八）：可重入锁源码剖析之总结',
                    link: '/Distributed Middleware/分布式锁/11_redis分布式锁（八）：可重入锁源码剖析之总结'
                },
                {
                    text: '12_redis分布式锁（九）：公平锁源码剖析之定位加锁源码位置',
                    link: '/Distributed Middleware/分布式锁/12_redis分布式锁（九）：公平锁源码剖析之定位加锁源码位置'
                },
                {
                    text: '13_redis分布式锁（十）：公平锁源码剖析之排队加锁',
                    link: '/Distributed Middleware/分布式锁/13_redis分布式锁（十）：公平锁源码剖析之排队加锁'
                },
                {
                    text: '14_redis分布式锁（十一）：公平锁源码剖析之队列重排序',
                    link: '/Distributed Middleware/分布式锁/14_redis分布式锁（十一）：公平锁源码剖析之队列重排序'
                },
                {
                    text: '15_redis分布式锁（十二）：公平锁源码剖析之释放锁',
                    link: '/Distributed Middleware/分布式锁/15_redis分布式锁（十二）：公平锁源码剖析之释放锁'
                },
                {
                    text: '16_redis分布式锁（十三）：MultiLock源码剖析',
                    link: '/Distributed Middleware/分布式锁/16_redis分布式锁（十三）：MultiLock源码剖析'
                },
                {
                    text: '17_redis分布式锁（十四）：RedLock源码剖析',
                    link: '/Distributed Middleware/分布式锁/17_redis分布式锁（十四）：RedLock源码剖析'
                },
                {
                    text: '18_redis分布式锁（十五）：读写锁源码剖析之加锁逻辑分析',
                    link: '/Distributed Middleware/分布式锁/18_redis分布式锁（十五）：读写锁源码剖析之加锁逻辑分析'
                },
                {
                    text: '19_redis分布式锁（十六）：读写锁源码剖析之读锁释放锁',
                    link: '/Distributed Middleware/分布式锁/19_redis分布式锁（十六）：读写锁源码剖析之读锁释放锁'
                },
                {
                    text: '20_redis分布式锁（十七）：读写锁源码剖析之释放写锁',
                    link: '/Distributed Middleware/分布式锁/20_redis分布式锁（十七）：读写锁源码剖析之释放写锁'
                },
                {
                    text: '21_redis分布式锁（十八）Semaphore',
                    link: '/Distributed Middleware/分布式锁/21_redis分布式锁（十八）Semaphore'
                },
                {
                    text: '分布式锁之基于Redis实现小结与源码分析',
                    link: '/Distributed Middleware/分布式锁/分布式锁之基于Redis实现小结与源码分析'
                },
            ]
        },
        {
            text: '分布式限流',
            items: [
                {text: '分布式限流', link: '/Distributed Middleware/分布式限流/分布式限流'}
            ]
        },
        {
            text: '分库分表',
            items: [
                {text: 'MyCat', link: '/Distributed Middleware/分库分表/MyCat'},
                {text: 'ShardingSphere之实践4', link: '/Distributed Middleware/分库分表/ShardingSphere之实践4'},
                {text: 'ShardingSphere之实践5', link: '/Distributed Middleware/分库分表/ShardingSphere之实践5'}
            ]
        },

    ];
}

function getCloudNative() {
    return [
        {text: 'Docker', link: '/Cloud native/Docker'},
        {text: 'k8s', link: '/Cloud native/k8s'}
    ];
}

function getOther() {
    return [
        {
            text: '协同开发',
            items: [
                {text: 'Git', link: '/other/协同开发/1、Git'},
                {text: 'Maven', link: '/other/协同开发/2、Maven'},
            ]
        },
        {
            text: '线上环境', items: [
                {text: 'Linux', link: '/other/线上环境/Linux'}
            ]
        }
    ];
}

function getArchitectureSystem() {
    return [
        {text: 'DDD', link: '/Architecture system/DDD'},
        {text: '全链路压测', link: '/Architecture system/全链路压测'},
        {text: '安全的生产体系', link: '/Architecture system/安全的生产体系'},
        {text: '完整质量管理体系', link: '/Architecture system/完整质量管理体系'},
        {text: '故障管理体系', link: '/Architecture system/故障管理体系'},
        {text: '架构治理&面向防错架构设计', link: '/Architecture system/架构治理&面向防错架构设计'},
        {text: '混沌工程体系', link: '/Architecture system/混沌工程体系'},
    ];
}

function getActualComBatSeries() {
    return [
        {text: '二次封装RabbitMQ', link: '/Actual combat series/二次封装RabbitMQ'},
        {text: '二次封装Kafka', link: '/Actual combat series/二次封装Kafka'},
        {text: '通用组件导入导出(少量与大数据量)', link: '/Actual combat series/通用组件导入导出（少量与大数据量）'},
        {text: '通用组件Swagger', link: '/Actual combat series/通用组件Swagger'},
        {text: '通用组件SpringValidate', link: '/Actual combat series/通用组件SpringValidate'},
        {text: '通用组件Activiti7', link: '/Actual combat series/通用组件Activiti7'},
        {text: '通用组件分布式锁', link: '/Actual combat series/通用组件分布式锁'},
        {text: '通用组件Mybatis二次封装', link: '/Actual combat series/通用组件Mybatis二次封装'},
        {text: '通用组件文件存储（OSS，七牛云）', link: '/Actual combat series/通用组件文件存储（OSS，七牛云）'},
        {text: '通用组件ElasticJob', link: '/Actual combat series/通用组件ElasticJob'},
    ];
}

function getSoftSkills() {
    return [
        {
            text: '软技能', items: [
                {text: '复盘', link: '/soft skills/复盘'},
                {text: '沟通', link: '/soft skills/沟通'},
                {text: '项目管理', link: '/soft skills/项目管理'},
            ]
        }
    ];
}

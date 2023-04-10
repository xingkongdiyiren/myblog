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
    // head: [
    //     // 添加图标
    //     ['link', {
    //         rel: 'icon',
    //         href: '/favicon.ico'
    //     }]
    // ],
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
    // 主题配置
    themeConfig: {
        // 导航栏配置
        nav: [
            {
                text: '博主其他平台博客', items: [
                    {text: '我的个人网站', link: 'https://blog.csdn.net/zhouhengzhe?type=blog'},
                    {text: 'CSDN', link: 'https://blog.csdn.net/zhouhengzhe?type=blog'},
                    {text: 'Gitee', link: 'https://gitee.com/zhouzhz/projects'}
                ]
            },
            {
                text: 'Java', items: [
                    {text: 'Java基础', link: '/Java/基础/面向对象'},
                    {text: 'Spring', link: '/CSS/'},
                    {text: 'SpringBoot', link: '/Vue/'},
                    {text: 'SpringMVC', link: '/Vue/'},
                    {text: 'Mybatis', link: '/Vue/'},
                    {text: 'Mybatis', link: '/Vue/'},
                ]
            },
            {
                text: 'Spring全家桶', items: [
                    {text: 'Spring', link: '/CSS/'},
                    {text: 'SpringBoot', link: '/Vue/'},
                    {text: 'SpringMVC', link: '/Vue/'},
                    {text: 'Mybatis', link: '/Vue/'},
                ]
            },
            {
                text: '分布式中间件', items: [
                    {
                        text: '分布式事务',
                        items: [
                            {text: '分布式事务详解', link: '/分布式中间件/分布式事务/分布式事务详解'},
                        ]
                    },
                    {
                        text: '分布式会话',
                        items: [
                            {text: '分布式会话详解', link: '/分布式中间件/分布式会话/分布式会话详解'},
                        ]
                    },
                    {
                        text: '分布式唯一ID',
                        items: [
                            {text: '分布式唯一ID详解', link: '/分布式中间件/分布式唯一ID/分布式唯一ID详解'},
                        ]
                    },
                    {
                        text: '分布式幂等性',
                        items: [
                            {text: '分布式幂等性详解', link: '/分布式中间件/分布式幂等性/分布式幂等性详解'},
                        ]
                    },
                    {
                        text: '分布式搜索',
                        items: [
                            {text: 'ElasticSearch', link: '/分布式中间件/分布式搜索/ElasticSearch'},
                        ]
                    },
                    {
                        text: '分布式文件存储',
                        items: [
                            {text: 'FastFDS', link: '/分布式中间件/分布式文件存储/FastFDS.md'},
                            {text: 'Oss', link: '/分布式中间件/分布式文件存储/Oss'},
                            {text: '七牛云', link: '/分布式中间件/分布式文件存储/七牛云'},
                        ]
                    },
                    {
                        text: '分布式权限控制与安全认证',
                        items: [
                            {text: 'Spring Security', link: '/分布式中间件/分布式权限控制与安全认证/Spring Security.md'},
                            {text: 'Shiro', link: '/分布式中间件/分布式权限控制与安全认证/Shiro'},
                            {text: '七牛云', link: '/分布式中间件/分布式文件存储/七牛云'},
                        ]
                    },
                    {
                        text: '分布式消息',
                        items: [
                            {text: 'Kafka', link: '/分布式中间件/分布式消息/Kafka'},
                            {text: 'RabbitMQ', link: '/分布式中间件/分布式消息/RabbitMQ'},
                            {text: 'RocketMQ', link: '/分布式中间件/分布式消息/RocketMQ'}

                        ]
                    },
                    {
                        text: '分布式缓存',
                        items: [
                            {text: 'Redis', link: '/分布式中间件/分布式缓存/Redis'},
                            {text: 'MongoDB', link: '/分布式中间件/分布式缓存/MongoDB'}
                        ]
                    },
                    {
                        text: '分布式重试机制',
                        items: [
                            {text: 'Guava-Retry', link: '/分布式中间件/分布式重试机制/Guava-Retry'},
                            {text: 'Spring-Retry', link: '/分布式中间件/分布式重试机制/Spring-Retry'}
                        ]
                    },
                    {
                        text: '分布式锁',
                        items: [
                            {text: '分布式锁详解', link: '/分布式中间件/分布式锁/分布式锁详解'}
                        ]
                    },
                    {
                        text: '分布式限流',
                        items: [
                            {text: '分布式限流', link: '/分布式中间件/分布式限流/分布式限流'}
                        ]
                    },
                    {
                        text: '分库分表',
                        items: [
                            {text: 'MyCat', link: '/分布式中间件/分库分表/MyCat'},
                            {text: 'ShardingSphere之实践4', link: '/分布式中间件/分库分表/ShardingSphere之实践4'},
                            {text: 'ShardingSphere之实践5', link: '/分布式中间件/分库分表/ShardingSphere之实践5'}
                        ]
                    },

                ]
            },
            {
                text: '协同开发', items: [
                    {text: 'Git', link: '/CSS/'},
                    {text: 'Maven', link: '/Vue/'},
                ]
            },
            {
                text: '线上环境', items: [
                    {text: 'Linux', link: '/CSS/'},
                ]
            },
            {
                text: '环境', items: [
                    {text: 'Linux', link: '/CSS/'},
                ]
            },

        ],
        sidebar: {
            '/Java/': [
                {
                    text: 'Java基础', items: [
                        {text: '面向对象', link: '/Java/1-面向对象.md'},
                        {text: '进阶', link: '/HTML/advanced'},
                    ]
                }
            ],
            '/CSS/': [
                {
                    text: 'CSS', items: [
                        {text: '开始', link: '/CSS/'},
                        {text: '进阶', link: '/CSS/advanced'},
                    ]
                }
            ],
        }
    }
}
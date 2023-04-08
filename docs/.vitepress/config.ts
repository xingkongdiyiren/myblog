export default {
    // 网站标题
    title: '小白的编程之路',
    // // 网站描述
    // description: 'Interview with vitePress',
    // // 打包目录
    // dest: './dist',
    base: '/myblog/',
    // 头部head
    // head: [
    //     // 添加图标
    //     ['link', {
    //         rel: 'icon',
    //         href: '/favicon.ico'
    //     }]
    // ],
    // 主题配置
    themeConfig: {
        // 获取每个文件最后一次 git 提交的 UNIX 时间戳(ms)，同时它将以合适的日期格式显示在每一页的底部
        lastUpdated: 'Last Updated', // string | boolean
        // 启动页面丝滑滚动
        smoothScroll: true,
        logo: '/logo.jpeg',
        docsDir: 'docs',
        docsBranch: 'main',
        editLinks: true,
        editLinkText: '欢迎帮助我们改善页面!',

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
                    {text: 'HTML', link: '/HTML/'},
                    {text: 'CSS', link: '/CSS/'},
                    {text: 'Vue', link: '/Vue/'}
                ]
            },
            {text: 'HTML', link: '/HTML/'},
            {text: 'CSS', link: '/CSS/'},
        ],
        sidebar: {
            '/HTML/': [
                {
                    text: 'HTML', items: [
                        {text: '开始', link: '/HTML/'},
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
            '/':getSidebar()
        }
    }
}

function getSidebar() {
    return [{
        text: 'HTML',
        children: [{
            text: '基础',
            link: '/HTML/'
        },
            {
                text: '进阶',
                link: '/HTML/advanced'
            },
        ],
        sidebarDepth: 3
    },
        {
            text: 'CSS',
            children: [{
                text: '基础',
                link: '/CSS/'
            },
                {
                    text: '进阶',
                    link: '/CSS/advanced'
                },
            ]
        },
        {
            text: 'Javascript',
            children: [{
                text: '基础',
                link: '/Javascript/'
            },
                {
                    text: '进阶',
                    link: '/Javascript/advanced'
                },
                {
                    text: '进阶',
                    link: '/Javascript/nightmare'
                },
            ]
        },
        {
            text: 'Vue',
            children: [{
                text: '基础',
                link: '/Vue/'
            },
                {
                    text: '进阶',
                    link: '/Vue/advanced'
                },
            ]
        },
        {
            text: '浏览器',
            children: [{
                text: '基础',
                link: '/Vue/'
            },
                {
                    text: '进阶',
                    link: '/Vue/advanced'
                },
            ]
        },
        {
            text: '网络',
            children: [{
                text: '基础',
                link: '/Network/'
            },
                {
                    text: '进阶',
                    link: '/Network/advanced'
                },
            ]
        },
        {
            text: '安全',
            children: [{
                text: '基础',
                link: '/Security/'
            },
                {
                    text: '进阶',
                    link: '/Security/advanced'
                },
            ]
        },
        {
            text: '面经',
            children: [{
                text: '基础',
                link: '/Experience/'
            },
                {
                    text: '进阶',
                    link: '/Experience/advanced'
                },
            ]
        },
    ]
}
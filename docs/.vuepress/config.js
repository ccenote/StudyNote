import {defaultTheme, defineUserConfig} from "vuepress";
import {searchPlugin} from "@vuepress/plugin-search";
export default defineUserConfig({
    base:'/',
    lang:'zh-CN',
    title:'Program Study Note',
    description:"编程学习笔记",
    docsDir: 'docs',
    head:[
        ['link',{rel:'icon',href:'/favicon.ico'}],
    ],

    theme: defaultTheme({
        home:'/',
        repo:'https://github.com/ccenote/StudyNote',
        lastUpdatedText:'更新时间',
        editLinkText:'编辑此页',
        contributorsText:'作者',
        toggleColorMode:'切换主题',
        heroText:'学习笔记',
        logo:'/images/logo.png',
        sidebar:{
            '/note/java/':[
                {
                    text:'Java',
                    children:[
                        {
                            text:"springcloud",
                            children:[
                                '/note/java/springcloud/',
                                '/note/java/springcloud/Eureka.md',
                                '/note/java/springcloud/Ribbon.md',
                                '/note/java/springcloud/Nacos.md',
                                '/note/java/springcloud/Feign.md',
                                '/note/java/springcloud/GateWay.md',
                                '/note/java/springcloud/RabbitMQ.md',
                                '/note/java/springcloud/ElasticSearch.md'
                            ]
                        }
                    ]
                }
            ],
            '/note/docker/':[
                {
                    text:"docker",
                    link:'/note/docker/'
                }
            ],
            '/note/iq/':[
                {
                    text:"面试题",
                    link:'/note/iq/'
                }
            ],
            '/list/':[
                '/list/README.md'
            ]
        },
        navbar:[
            {
                text:"项目简介",
                link:'/guide/README.md'
            },
            {
                text:"文档目录",
                link:'/list/README.md'
            }
        ]
    }),
    plugins:[
        searchPlugin({
            // 配置项
            locales:{
                '/':{
                    placeholder:"搜索"
                }
            }
        }),
    ],
})
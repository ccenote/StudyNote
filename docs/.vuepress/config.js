import {defaultTheme, defineUserConfig} from "vuepress";

export default defineUserConfig({
    base:'/',
    lang:'zh-CN',
    title:'学习笔记',
    description:"我的学习笔记大全",
    docsDir: 'docs',
    head:[
        ['link',{rel:'icon',href:'/favicon.ico'}],
    ],
    theme: defaultTheme({
        sidebar:{
            '/java/':[
                {
                    text:'Java',
                    children:[
                        {
                            text:"SpringCloud",
                            children:[
                                '/java/SpringCloud/README.md',
                                '/java/SpringCloud/Eureka.md',
                                '/java/SpringCloud/Ribbon.md',
                                '/java/SpringCloud/Nacos.md',
                                '/java/SpringCloud/Feign.md',
                                '/java/SpringCloud/GateWay.md'
                            ]
                        }
                    ]
                }
            ]
        }
    })
})
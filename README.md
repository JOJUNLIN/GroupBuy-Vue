# 拼团配送管理系统——web端

## 项目简介

这是团购毕设的web端，实现团购系统的站点和订单配送管理

### 技术栈

- 核心框架：[Vue.js(版本 3.x)](https://vuejs.org/)
- 构建工具：Vue CLI
- UI组件库：Element Plus

### 开发工具

- 集成开发环境：Visual Studio Code

## 资料说明

### 📦 后端SpringBoot项目源码

[https://github.com/JOJUNLIN/GroupBuy-SpringBoot.git](https://github.com/JOJUNLIN/GroupBuy-SpringBoot.git)

### 📦 小程序项目源码

[https://github.com/JOJUNLIN/GroupBuy-UniApp.git](https://github.com/JOJUNLIN/GroupBuy-UniApp.git)

### 📦 web端Vue项目源码

[https://github.com/JOJUNLIN/GroupBuy-Vue.git](https://github.com/JOJUNLIN/GroupBuy-Vue.git)

## 工程结构解析

```
├── node_moudles                # 项目依赖包目录
├── public/                     # 静态资源目录 
│   ├── favicon.ico             # 网站图标示例
│   └── index.html              # 应用的 HTML 入口文件
├── src/                        # 主要源代码目录
│   ├── assets/                 # 静态资源 
│   ├── components/             # 可复用的 UI 组件目录 
│   ├── router/                 # 路由配置目录
│   │   └── index.js            # 路由配置文件 (定义路径和组件映射)
│   ├── views/                  # 视图 (页面级) 组件目录
│   │   ├── LoginPage.vue       # 登录页面组件
│   │   ├── RegisterPage.vue    # 注册页面组件
│   │   ├── MainLayout.vue      # 主应用布局组件 (包含 Tabs 和 router-view)
│   │   ├── SiteManagement.vue  # 拼团站点管理页面组件
│   │   ├── OrderStatus.vue     # 订单状态查询页面组件
│   │   ├── OrderDispatch.vue   # 订单发货管理页面组件
│   │   └── OrderDelivery.vue   # 订单送达管理页面组件
│   ├── App.vue                 # 根 Vue 组件 
│   └── main.js                 # 应用入口文件 
├── .gitignore                  # Git 忽略文件配置
├── babel.config.js             # Babel 配置文件
├── jsconfig.json               # JavaScript 项目的配置文件
├── package-lock.json           # npm 依赖版本锁定文件
├── package.json                # 项目依赖和脚本配置文件
├── README.md                   # 项目说明文件
└── vue.config.js               # Vue CLI 配置文件
```

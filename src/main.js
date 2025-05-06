// src/main.js
// import "./assets/main.css"; // 保留或根据需要修改基础样式
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// 完整引入 Element Plus (也可以按需引入)
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
// 如果需要中文语言包
import zhCn from "element-plus/dist/locale/zh-cn.mjs";

const app = createApp(App);

app.use(router);
// 使用 Element Plus 并设置为中文
app.use(ElementPlus, { locale: zhCn });

app.mount("#app");

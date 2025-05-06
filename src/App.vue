<template>
  <div id="app-container">
    <router-view />
    <!-- 路由出口，会渲染匹配到的组件 -->
  </div>
</template>

<script setup>
// 通常不需要在这里写太多逻辑
</script>

<style>
/* 可以放一些全局样式，或者在 main.css / assets 中管理 */
html,
body,
#app,
#app-container {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", Arial, sans-serif;
}
</style>

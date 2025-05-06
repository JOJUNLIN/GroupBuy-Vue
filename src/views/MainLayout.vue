<template>
  <el-container class="main-layout-container">
    <el-header class="main-header">
      <span>拼团配送管理系统</span>
      <el-button type="info" plain @click="handleLogout" size="small"
        >退出登录</el-button
      >
    </el-header>
    <el-main class="main-content">
      <el-tabs
        v-model="activeTab"
        type="card"
        class="main-tabs"
        @tab-change="handleTabChange"
      >
        <el-tab-pane label="拼团站点管理" name="/site-management"></el-tab-pane>
        <el-tab-pane label="订单状态查询" name="/order-status"></el-tab-pane>
        <el-tab-pane label="订单发货管理" name="/order-dispatch"></el-tab-pane>
        <el-tab-pane label="订单送达管理" name="/order-delivery"></el-tab-pane>
      </el-tabs>
      <!-- 子路由的视图将在这里渲染 -->
      <div class="tab-content">
        <router-view v-slot="{ Component }">
          <!-- 可以选择性地缓存标签页内容 -->
          <!-- <keep-alive> -->
          <component :is="Component" />
          <!-- </keep-alive> -->
        </router-view>
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

const router = useRouter();
const route = useRoute();

// 当前激活的 Tab，其值应与子路由的 path 对应
// 初始化时，根据当前路由路径设置 activeTab
const activeTab = ref(route.path);

// 监听路由变化，以更新激活的 Tab (例如，浏览器前进后退)
watch(
  () => route.path,
  (newPath) => {
    // 确保只在当前布局下的子路由之间切换时更新 tab
    if (newPath.startsWith("/")) {
      // 基本判断，确保是子路由
      // 检查 newPath 是否是 MainLayout 下定义的子路由之一
      const validPaths = [
        "/site-management",
        "/order-status",
        "/order-dispatch",
        "/order-delivery",
      ];
      if (validPaths.includes(newPath)) {
        activeTab.value = newPath;
      }
    }
  }
);

// 处理 Tab 切换事件
const handleTabChange = (tabName) => {
  // tabName 就是我们在 el-tab-pane 上设置的 name 属性值 (即路径)
  router.push(tabName);
};

// 处理退出登录
const handleLogout = () => {
  ElMessageBox.confirm("确定要退出登录吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      localStorage.removeItem("user-token"); // 清除 token
      sessionStorage.removeItem("isLoggedIn"); // 清除简单演示的状态 (可选)
      ElMessage.success("已退出登录");
      router.push("/login"); // 跳转回登录页
    })
    .catch(() => {
      // 用户取消操作
      ElMessage.info("已取消退出");
    });
};
</script>

<style scoped>
.main-layout-container {
  height: 100vh; /* 占满整个视口高度 */
  display: flex;
  flex-direction: column;
}

.main-header {
  background-color: #3a8ee6; /* Element Plus 主题蓝 */
  color: #fff;
  line-height: 60px; /* Header 默认高度 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  font-size: 1.2em;
  flex-shrink: 0; /* 防止 header 被压缩 */
}

.main-content {
  padding: 15px;
  flex-grow: 1; /* 占据剩余空间 */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止内容溢出 */
}

.main-tabs {
  flex-shrink: 0; /* 防止 tabs 被压缩 */
  /* 可以调整 Tabs 的样式 */
}

/* :deep() 用于穿透 scoped 样式，修改子组件样式 */
:deep(.el-tabs__header) {
  margin-bottom: 0; /* 去掉 tab header 下方的默认间距 */
}
:deep(.el-tabs__nav) {
  border-top: none;
  border-left: none;
  border-right: none;
}

.tab-content {
  flex-grow: 1; /* Tab 内容区域占据剩余空间 */
  padding: 15px;
  border: 1px solid #e4e7ed; /* 给内容区域一个边框，看起来更清晰 */
  border-top: none; /* 顶部边框与 Tabs 重合，去掉 */
  overflow-y: auto; /* 如果内容超长，允许垂直滚动 */
  background-color: #fff;
}
</style>

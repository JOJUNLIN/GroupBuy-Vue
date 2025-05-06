<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <span>用户登录</span>
        </div>
      </template>
      <el-form
        :model="loginForm"
        ref="loginFormRef"
        :rules="loginRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            v-model="loginForm.password"
            placeholder="请输入密码"
            show-password
            @keyup.enter="handleLogin"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleLogin"
            :loading="loading"
            style="width: 100%"
            >登录</el-button
          >
        </el-form-item>
        <el-form-item>
          <el-button type="text" @click="goToRegister"
            >没有账号？去注册</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { loginApi } from "@/api/auth"; // 引入 API

const router = useRouter();
const loginFormRef = ref(null);
const loading = ref(false);

const loginForm = reactive({
  username: "",
  password: "",
});

// 表单验证规则
const loginRules = reactive({
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 后端返回的 Result 结构: { code: 0, message: "...", data: "token_string" }
        const response = await loginApi(loginForm.username, loginForm.password);
        // response 已经是拦截器处理过的，如果 code !== 0 会进入 catch
        // 如果 code === 0, response 就是 { code:0, message:"操作成功", data: "jwt_token"}

        ElMessage.success("登录成功！");
        // 存储 Token (更安全的做法是存储在 HttpOnly Cookie 中，但 localStorage 简单)
        localStorage.setItem("user-token", response.data);
        // 也可以设置一个简单的登录状态标志 (可选，导航守卫主要看token)
        sessionStorage.setItem("isLoggedIn", "true");

        router.push("/");
      } catch (error) {
        // API 调用失败或后端返回 code !== 0 的错误信息会在这里捕获
        // error.message 应该是后端返回的错误信息，或者网络错误信息
        ElMessage.error(error.message || "登录失败，请检查用户名和密码");
        console.error("登录失败:", error);
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.warning("请完整填写登录信息");
      return false;
    }
  });
};

const goToRegister = () => {
  router.push("/register");
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}
.login-card {
  width: 400px;
}
.card-header {
  text-align: center;
  font-size: 1.5em;
}
</style>

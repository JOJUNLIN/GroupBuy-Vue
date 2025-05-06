<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <span>用户注册</span>
        </div>
      </template>
      <el-form
        :model="registerForm"
        ref="registerFormRef"
        :rules="registerRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            v-model="registerForm.password"
            placeholder="请输入密码"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            type="password"
            v-model="registerForm.confirmPassword"
            placeholder="请再次输入密码"
            show-password
            @keyup.enter="handleRegister"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleRegister"
            :loading="loading"
            style="width: 100%"
            >注册</el-button
          >
        </el-form-item>
        <el-form-item>
          <el-button type="text" @click="goToLogin">已有账号？去登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { registerApi } from "@/api/auth"; // 引入 API

const router = useRouter();
const registerFormRef = ref(null);
const loading = ref(false);

const registerForm = reactive({
  username: "",
  password: "",
  confirmPassword: "",
});

// 自定义确认密码验证器
const validateConfirmPassword = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请再次输入密码"));
  } else if (value !== registerForm.password) {
    callback(new Error("两次输入的密码不一致!"));
  } else {
    callback();
  }
};

// 表单验证规则
const registerRules = reactive({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 15, message: "长度在 3 到 15 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入密码", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" },
  ],
});

const handleRegister = async () => {
  if (!registerFormRef.value) return;
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 后端成功返回 Result.success()，结构是 { code: 0, message: "操作成功", data: null }
        await registerApi(registerForm.username, registerForm.password);
        ElMessage.success("注册成功！请登录。");
        router.push("/login");
      } catch (error) {
        // API 调用失败或后端返回 code !== 0 的错误信息
        ElMessage.error(error.message || "注册失败，请稍后再试");
        console.error("注册失败:", error);
      } finally {
        loading.value = false;
      }
    } else {
      ElMessage.warning("请检查注册信息是否正确");
      return false;
    }
  });
};

const goToLogin = () => {
  router.push("/login");
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}
.register-card {
  width: 400px;
}
.card-header {
  text-align: center;
  font-size: 1.5em;
}
</style>

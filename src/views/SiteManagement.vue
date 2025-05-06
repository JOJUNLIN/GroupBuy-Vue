<template>
  <div class="site-management-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>拼团站点管理</span>
          <el-button type="primary" @click="openAddSiteDialog" :icon="Plus"
            >新增站点</el-button
          >
        </div>
      </template>

      <el-table :data="siteList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="站点ID" width="100" />
        <el-table-column prop="address" label="站点名称/地址" />
        <el-table-column prop="group_num" label="当前拼团数" width="150" />
      </el-table>

      <!-- 新增/编辑站点对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="500px"
        @close="resetForm"
      >
        <el-form
          ref="siteFormRef"
          :model="siteForm"
          :rules="siteFormRules"
          label-width="100px"
        >
          <el-form-item label="站点名称" prop="address">
            <el-input
              v-model="siteForm.address"
              placeholder="请输入站点名称或详细地址"
            ></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              @click="submitSiteForm"
              :loading="formLoading"
              >确定</el-button
            >
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue"; // 引入图标
import { getAllSitesApi, addSiteApi } from "@/api/auth"; // 或者你创建的 site.js

const siteList = ref([]);
const loading = ref(false); // 表格加载状态

// 对话框相关
const dialogVisible = ref(false);
const dialogTitle = ref("新增站点"); // 将来可用于编辑
const formLoading = ref(false); // 表单提交加载状态
const siteFormRef = ref(null); // 表单引用

const initialSiteForm = {
  id: null, // 用于编辑
  address: "",
  group_num: 0,
};
const siteForm = reactive({ ...initialSiteForm });

const siteFormRules = reactive({
  address: [
    { required: true, message: "请输入站点名称", trigger: "blur" },
    { min: 2, max: 100, message: "长度在 2 到 100 个字符", trigger: "blur" },
  ],
});

// 获取所有站点
const fetchSites = async () => {
  loading.value = true;
  try {
    const response = await getAllSitesApi();
    // response.data 已经是拦截器处理过的站点列表数组了
    siteList.value = response.data || []; // 后端返回的是 Result<List<AddressItem>>, 拦截器转换后是 {code:0, message:"...", data: List<AddressItem>}
  } catch (error) {
    // ElMessage 已经在拦截器中处理了
    console.error("获取站点列表失败:", error);
    siteList.value = []; // 出错时清空列表
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchSites();
  console.log("站点管理页面已挂载并尝试获取站点列表");
});

// 打开新增站点对话框
const openAddSiteDialog = () => {
  dialogTitle.value = "新增站点";
  // 重置表单数据
  Object.assign(siteForm, initialSiteForm);
  // 清除可能的校验状态 (如果在关闭时没清除)
  if (siteFormRef.value) {
    siteFormRef.value.clearValidate();
  }
  dialogVisible.value = true;
};

// 重置表单（对话框关闭时调用）
const resetForm = () => {
  if (siteFormRef.value) {
    siteFormRef.value.resetFields(); // 重置表单项的值和校验状态
  }
  Object.assign(siteForm, initialSiteForm); // 确保完全重置
};

// 提交表单 (新增或编辑)
const submitSiteForm = async () => {
  if (!siteFormRef.value) return;
  await siteFormRef.value.validate(async (valid) => {
    if (valid) {
      formLoading.value = true;
      try {
        // 准备提交的数据
        const payload = {
          address: siteForm.address,
          group_num: siteForm.group_num,
        };

        // 如果是编辑模式，需要包含 id
        // if (siteForm.id) {
        //   payload.id = siteForm.id;
        //   // await updateSiteApi(payload); // 假设有更新API
        //   ElMessage.success("站点更新成功！");
        // } else {
        await addSiteApi(payload);
        ElMessage.success("站点新增成功！");
        // }
        dialogVisible.value = false;
        await fetchSites(); // 重新获取站点列表
      } catch (error) {
        // ElMessage 已经在拦截器中处理，这里可以只 console.error
        console.error("提交站点表单失败:", error);
      } finally {
        formLoading.value = false;
      }
    } else {
      ElMessage.warning("请检查表单填写是否正确");
      return false;
    }
  });
};
</script>

<style scoped>
.site-management-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dialog-footer {
  text-align: right;
}
</style>

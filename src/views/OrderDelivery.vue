<template>
  <div class="order-delivery-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单送达管理</span>
        </div>
      </template>

      <!-- 筛选区域 -->
      <el-form :inline="true" :model="filterParams" class="filter-form">
        <el-form-item label="选择站点" required>
          <el-select
            v-model="filterParams.selectedSiteId"
            placeholder="请选择站点"
            clearable
            @change="handleSiteChange"
            style="width: 200px"
          >
            <el-option
              v-for="site in siteOptions"
              :key="site.id"
              :label="site.address"
              :value="site.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleSearch"
            :icon="SearchIcon"
            :disabled="!filterParams.selectedSiteId"
            >查询运送中</el-button
          >
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <div style="margin-bottom: 15px">
        <el-button
          type="success"
          @click="handleBatchReceive"
          :disabled="
            selectedOrders.length === 0 || !filterParams.selectedSiteId
          "
          :icon="CheckIcon"
        >
          批量确认送达
        </el-button>
        <span
          v-if="!filterParams.selectedSiteId && selectedOrders.length > 0"
          style="color: #e6a23c; margin-left: 10px"
        >
          (请先选择一个站点以启用批量确认送达)
        </span>
      </div>

      <!-- 运送中订单列表表格 -->
      <el-table
        :data="orderList"
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        ref="deliveryTableRef"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="订单ID" width="220" />
        <el-table-column prop="userId" label="用户ID" width="180" />
        <el-table-column prop="siteAddress" label="站点/收货地址" />
        <el-table-column prop="orderState" label="订单状态" width="120">
          <template #default="scope">
            <el-tag type="primary">{{
              formatOrderState(scope.row.orderState)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="totalOrders > 0"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalOrders"
        :page-sizes="[10, 20, 50, 100]"
        :current-page="paginationParams.page"
        :page-size="paginationParams.pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentPageChange"
        style="margin-top: 20px; text-align: right"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search as SearchIcon,
  Check as CheckIcon,
} from "@element-plus/icons-vue";
import { getAllSitesApi } from "@/api/auth";
import {
  adminGetDeliveryOrdersBySiteApi,
  adminReceiveOrdersApi,
} from "@/api/auth"; // 引入送达相关API

const loading = ref(false);
const orderList = ref([]);
const totalOrders = ref(0);
const siteOptions = ref([]);
const selectedOrders = ref([]);
const deliveryTableRef = ref(null);

const filterParams = reactive({
  selectedSiteId: null, // 必须选择一个站点
});

const paginationParams = reactive({
  page: 1,
  pageSize: 10,
});

const fetchSiteOptions = async () => {
  try {
    const response = await getAllSitesApi();
    siteOptions.value = response.data || [];
  } catch (error) {
    console.error("获取站点选项失败:", error);
  }
};

// 获取运送中订单列表 (必须选择站点)
const fetchDeliveryOrders = async () => {
  if (!filterParams.selectedSiteId) {
    orderList.value = [];
    totalOrders.value = 0;
    // ElMessage.info("请选择一个站点以查询运送中的订单。"); // 或者在按钮禁用时提示
    return;
  }
  loading.value = true;
  const params = {
    page: paginationParams.page,
    pageSize: paginationParams.pageSize,
  };

  try {
    const response = await adminGetDeliveryOrdersBySiteApi(
      filterParams.selectedSiteId,
      params
    );
    orderList.value = response.data.items || [];
    totalOrders.value = response.data.totalCount || 0;
    selectedOrders.value = []; // 重新加载数据后清空选择
    if (deliveryTableRef.value) {
      deliveryTableRef.value.clearSelection();
    }
  } catch (error) {
    console.error("获取运送中订单列表失败:", error);
    orderList.value = [];
    totalOrders.value = 0;
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchSiteOptions();
  // 页面加载时不主动查询，等待用户选择站点
  console.log("订单送达管理页面已挂载");
});

const formatOrderState = (state) => {
  const states = {
    1: "待付款",
    2: "待发货",
    3: "待收货",
    4: "配送中",
    5: "已完成",
  };
  return states[state] || "未知状态";
};

const handleSiteChange = () => {
  paginationParams.page = 1;
  fetchDeliveryOrders(); // 站点改变后自动查询
};

const handleSearch = () => {
  paginationParams.page = 1;
  fetchDeliveryOrders();
};

const handleSelectionChange = (val) => {
  selectedOrders.value = val;
};

const handleBatchReceive = async () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning("请至少选择一个订单进行确认送达操作。");
    return;
  }
  if (!filterParams.selectedSiteId) {
    // 理论上按钮会被禁用，但加个保险
    ElMessage.error("未选择站点，无法执行操作。");
    return;
  }

  const orderIdsToReceive = selectedOrders.value.map((order) => order.id);

  ElMessageBox.confirm(
    `确定要将选中的 ${orderIdsToReceive.length} 个订单标记为“待收货”吗？`,
    "批量确认送达",
    {
      confirmButtonText: "确定送达",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      loading.value = true;
      try {
        const response = await adminReceiveOrdersApi(
          filterParams.selectedSiteId,
          orderIdsToReceive
        );
        // response.data 结构是 ReceiveResultDto { receivedCount, operationMessage }
        ElMessage.success(
          response.data.operationMessage ||
            `${response.data.receivedCount} 个订单已成功确认送达！`
        );
        await fetchDeliveryOrders(); // 刷新列表
      } catch (error) {
        console.error("批量确认送达失败:", error);
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {
      ElMessage.info("已取消批量确认送达操作。");
    });
};

const handleSizeChange = (newSize) => {
  paginationParams.pageSize = newSize;
  paginationParams.page = 1;
  fetchDeliveryOrders();
};

const handleCurrentPageChange = (newPage) => {
  paginationParams.page = newPage;
  fetchDeliveryOrders();
};
</script>

<style scoped>
.order-delivery-container {
  padding: 20px;
}
</style>

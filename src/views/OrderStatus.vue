<template>
  <div class="order-status-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单状态查询</span>
        </div>
      </template>

      <!-- 筛选区域 -->
      <el-form :inline="true" :model="filterParams" class="filter-form">
        <el-form-item label="选择站点">
          <el-select
            v-model="filterParams.selectedSiteId"
            placeholder="所有站点"
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
        <el-form-item label="订单状态">
          <el-select
            v-model="filterParams.orderState"
            placeholder="所有状态"
            clearable
            style="width: 180px"
          >
            <el-option label="待付款" :value="1" />
            <el-option label="待发货" :value="2" />
            <el-option label="待收货" :value="3" />
            <el-option label="配送中" :value="4" />
            <el-option label="已完成" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="SearchIcon"
            >查询</el-button
          >
        </el-form-item>
      </el-form>

      <!-- 订单列表表格 -->
      <el-table :data="orderList" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="订单ID" width="220" />
        <el-table-column prop="userId" label="用户ID" width="180" />
        <el-table-column prop="siteAddress" label="站点/收货地址" />
        <el-table-column prop="orderState" label="订单状态" width="120">
          <template #default="scope">
            {{ formatOrderState(scope.row.orderState) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <!-- 如果需要操作，可以添加操作列 -->
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
import { ref, reactive, onMounted /*, watch*/ } from "vue";
// import { ElMessage } from "element-plus";
import { Search as SearchIcon } from "@element-plus/icons-vue";
import { getAllSitesApi } from "@/api/auth"; // 用于获取站点选项
import { adminGetAllOrdersApi, adminGetOrdersBySiteApi } from "@/api/auth"; // 引入订单API

const loading = ref(false);
const orderList = ref([]);
const totalOrders = ref(0);

// 站点选项
const siteOptions = ref([]);

// 筛选参数
const filterParams = reactive({
  selectedSiteId: null, // null 或 '' 表示所有站点
  orderState: null, // null 或 '' 表示所有状态
});

// 分页参数
const paginationParams = reactive({
  page: 1,
  pageSize: 10,
});

// 获取站点列表用于下拉选择
const fetchSiteOptions = async () => {
  try {
    const response = await getAllSitesApi();
    // response.data 已经是拦截器处理过的站点列表数组
    siteOptions.value = response.data || [];
  } catch (error) {
    console.error("获取站点选项失败:", error);
    // ElMessage 已在拦截器中处理
  }
};

// 获取订单列表数据
const fetchOrders = async () => {
  loading.value = true;
  const apiParams = {
    // 使用一个新的对象来构造发送给API的参数
    page: paginationParams.page,
    pageSize: paginationParams.pageSize,
  };

  // 只在 orderState 有实际值 (非 null, 非 undefined, 非空字符串) 时才添加到 apiParams
  if (
    filterParams.orderState !== null &&
    filterParams.orderState !== undefined &&
    filterParams.orderState !== ""
  ) {
    apiParams.orderState = filterParams.orderState;
  }

  try {
    let response;
    // 只在 selectedSiteId 有实际值时才调用按站点查询的API，并传递 siteId
    if (
      filterParams.selectedSiteId !== null &&
      filterParams.selectedSiteId !== undefined &&
      filterParams.selectedSiteId !== ""
    ) {
      response = await adminGetOrdersBySiteApi(
        filterParams.selectedSiteId,
        apiParams
      );
    } else {
      response = await adminGetAllOrdersApi(apiParams); // 不需要 siteId
    }

    orderList.value = response.data.items || [];
    totalOrders.value = response.data.totalCount || 0;
  } catch (error) {
    console.error("获取订单列表失败:", error);
    orderList.value = [];
    totalOrders.value = 0;
  } finally {
    loading.value = false;
  }
};

// 组件挂载时
onMounted(async () => {
  await fetchSiteOptions(); // 先获取站点选项
  await fetchOrders(); // 再获取订单列表
  console.log("订单状态管理页面已挂载");
});

// 格式化订单状态显示
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

// 处理站点选择变化
const handleSiteChange = () => {
  // 选择站点后，重置页码到第一页并重新查询
  paginationParams.page = 1;
  fetchOrders();
};

// 处理查询按钮点击
const handleSearch = () => {
  paginationParams.page = 1; // 查询时重置到第一页
  fetchOrders();
};

// 处理每页显示数量变化
const handleSizeChange = (newSize) => {
  paginationParams.pageSize = newSize;
  paginationParams.page = 1; // 切换size时回到第一页
  fetchOrders();
};

// 处理当前页码变化
const handleCurrentPageChange = (newPage) => {
  paginationParams.page = newPage;
  fetchOrders();
};

// 监听筛选参数变化自动刷新 (可选，如果希望选择后立即刷新而不是点查询按钮)
// watch(
//   () => [filterParams.selectedSiteId, filterParams.orderState],
//   () => {
//     paginationParams.page = 1;
//     fetchOrders();
//   },
//   { deep: true } // 如果 filterParams 是深层对象
// );
</script>

<style scoped>
.order-status-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.filter-form {
  margin-bottom: 20px;
}
</style>

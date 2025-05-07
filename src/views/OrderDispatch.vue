<template>
  <div class="order-dispatch-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单发货管理</span>
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
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="SearchIcon"
            >查询待发货</el-button
          >
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <div style="margin-bottom: 15px">
        <el-button
          type="success"
          @click="handleBatchDispatch"
          :disabled="
            selectedOrders.length === 0 || !filterParams.selectedSiteId
          "
          :icon="VanIcon"
        >
          批量发货选中订单
        </el-button>
        <span
          v-if="!filterParams.selectedSiteId && selectedOrders.length > 0"
          style="color: #e6a23c; margin-left: 10px"
        >
          (请先选择一个站点以启用批量发货)
        </span>
      </div>

      <!-- 待发货订单列表表格 -->
      <el-table
        :data="orderList"
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        ref="dispatchTableRef"
      >
        <el-table-column
          type="selection"
          width="55"
          :selectable="isOrderSelectableForDispatch"
        />
        <el-table-column prop="id" label="订单ID" width="220" />
        <el-table-column prop="userId" label="用户ID" width="180" />
        <el-table-column prop="siteAddress" label="站点/收货地址" />
        <el-table-column prop="orderState" label="订单状态" width="120">
          <template #default="scope">
            <el-tag type="warning">{{
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
import { ref, reactive, onMounted /*, computed*/ } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search as SearchIcon, Van as VanIcon } from "@element-plus/icons-vue";
import { getAllSitesApi } from "@/api/auth";
import {
  adminGetAllDispatchOrdersApi,
  adminGetDispatchOrdersBySiteApi,
  adminDispatchOrdersApi,
} from "@/api/auth"; // 引入发货相关API

const loading = ref(false);
const orderList = ref([]);
const totalOrders = ref(0);
const siteOptions = ref([]);
const selectedOrders = ref([]); // 存储表格中选中的订单
const dispatchTableRef = ref(null); // 表格引用

const filterParams = reactive({
  selectedSiteId: null,
});

const paginationParams = reactive({
  page: 1,
  pageSize: 10,
});

// 获取站点选项
const fetchSiteOptions = async () => {
  try {
    const response = await getAllSitesApi();
    siteOptions.value = response.data || [];
  } catch (error) {
    console.error("获取站点选项失败:", error);
  }
};

// 获取待发货订单列表
const fetchDispatchOrders = async () => {
  if (
    !filterParams.selectedSiteId &&
    !confirm(
      "未选择站点，将查询所有站点的待发货订单，数据量可能较大，是否继续？"
    )
  ) {
    // 如果希望不选站点时不允许查询，可以取消这里的 confirm，直接 return 或提示
    // orderList.value = []; // 清空列表
    // totalOrders.value = 0;
    // ElMessage.info("请先选择一个站点进行查询。");
    return;
  }

  loading.value = true;
  const params = {
    page: paginationParams.page,
    pageSize: paginationParams.pageSize,
  };

  try {
    let response;
    if (filterParams.selectedSiteId) {
      response = await adminGetDispatchOrdersBySiteApi(
        filterParams.selectedSiteId,
        params
      );
    } else {
      // 查询所有站点的待发货订单
      response = await adminGetAllDispatchOrdersApi(params);
    }
    orderList.value = response.data.items || [];
    totalOrders.value = response.data.totalCount || 0;
    selectedOrders.value = []; // 重新加载数据后清空选择
    if (dispatchTableRef.value) {
      dispatchTableRef.value.clearSelection();
    }
  } catch (error) {
    console.error("获取待发货订单列表失败:", error);
    orderList.value = [];
    totalOrders.value = 0;
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchSiteOptions();
  // 页面加载时不主动查询，等待用户选择站点或点击查询
  // await fetchDispatchOrders();
  console.log("订单发货管理页面已挂载");
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
  fetchDispatchOrders(); // 站点改变后自动查询
};

const handleSearch = () => {
  paginationParams.page = 1;
  fetchDispatchOrders();
};

const handleSelectionChange = (val) => {
  selectedOrders.value = val;
};

// 确保只有当前已选站点的订单才能被勾选进行批量发货
const isOrderSelectableForDispatch = (row) => {
  if (!filterParams.selectedSiteId) return false; // 未选站点时，不允许勾选
  return (
    row.siteAddress ===
    siteOptions.value.find((s) => s.id === filterParams.selectedSiteId)?.address
  );
  // 或者后端返回的 AdminOrderItemDto 中直接有 siteId 字段，则判断 row.siteId === filterParams.selectedSiteId
};

const handleBatchDispatch = async () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning("请至少选择一个订单进行发货。");
    return;
  }
  if (!filterParams.selectedSiteId) {
    ElMessage.warning("请先选择一个站点以进行批量发货。");
    return;
  }

  // 再次确认选中的订单是否都属于当前筛选的站点 (如果 isOrderSelectableForDispatch 逻辑不够严格)
  const ordersToDispatch = selectedOrders.value.filter((order) => {
    const selectedSite = siteOptions.value.find(
      (s) => s.id === filterParams.selectedSiteId
    );
    return selectedSite && order.siteAddress === selectedSite.address;
    // 或者如果 AdminOrderItemDto 有 siteId: return order.siteId === filterParams.selectedSiteId;
  });

  if (ordersToDispatch.length !== selectedOrders.value.length) {
    ElMessage.error(
      "选择的订单中包含不属于当前已选站点或状态不符的订单，请重新选择。"
    );
    return;
  }
  if (ordersToDispatch.length === 0) {
    ElMessage.warning("没有符合当前已选站点的订单被选中。");
    return;
  }

  const orderIdsToDispatch = ordersToDispatch.map((order) => order.id);

  ElMessageBox.confirm(
    `确定要将选中的 ${orderIdsToDispatch.length} 个订单标记为“配送中”吗？`,
    "批量发货确认",
    {
      confirmButtonText: "确定发货",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      loading.value = true;
      try {
        const response = await adminDispatchOrdersApi(
          filterParams.selectedSiteId,
          orderIdsToDispatch
        );
        // response.data 结构是 DispatchResultDto { dispatchedCount, operationMessage }
        ElMessage.success(
          response.data.operationMessage ||
            `${response.data.dispatchedCount} 个订单已成功发货！`
        );
        await fetchDispatchOrders(); // 刷新列表
      } catch (error) {
        console.error("批量发货失败:", error);
        // ElMessage 应该已在拦截器中处理，或在此处显示更具体的错误
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {
      ElMessage.info("已取消批量发货操作。");
    });
};

const handleSizeChange = (newSize) => {
  paginationParams.pageSize = newSize;
  paginationParams.page = 1;
  fetchDispatchOrders();
};

const handleCurrentPageChange = (newPage) => {
  paginationParams.page = newPage;
  fetchDispatchOrders();
};
</script>

<style scoped>
.order-dispatch-container {
  padding: 20px;
}
</style>

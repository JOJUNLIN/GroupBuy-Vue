import axios from "axios";
import qs from "qs";
import { ElMessage } from "element-plus";
import router from "@/router";

const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// 请求拦截器 (如果你需要在这里添加 token)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("user-token");
    if (token) {
      config.headers["Authorization"] = token; // 或者 'Bearer ' + token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 (只保留一个，基于你原来的第一个)
apiClient.interceptors.response.use(
  (response) => {
    const res = response.data;

    if (!res) {
      console.error("API Error: Received empty response data from backend.");
      ElMessage.error("收到空的响应数据");
      return Promise.reject(new Error("Received empty response data"));
    }

    // 后端 code 是 number 类型
    if (res.code === undefined || res.code === null) {
      console.error("API Error: Response data is missing 'code' field.", res);
      ElMessage.error("响应数据缺少 'code' 字段");
      return Promise.reject(new Error("Response data missing 'code' field"));
    }

    // 后端：1 代表成功，0 代表失败
    if (res.code === 1) {
      // 检查是否为 1 (成功)
      // 业务成功，返回改造后的对象
      return {
        code: 0, // 模拟前端期望的成功码 (或者你的组件直接使用 res.result)
        message: res.msg || "操作成功",
        data: res.result, // 将后端的 result 映射到 data
      };
    } else {
      // code 为 0 或其他非 1 值，视为失败
      // 业务失败
      ElMessage.error(res.msg || "操作失败");
      // 拒绝 Promise，传递错误消息
      return Promise.reject(new Error(res.msg || "Error from backend failure")); // 更明确的错误
    }
  },
  (error) => {
    // HTTP 错误处理 (例如 401, 500 等) 或网络错误
    console.error("API HTTP Error or Network Error: ", error);
    if (error.response) {
      // 请求已发出，但服务器响应的状态码不在 2xx 范围内
      if (error.response.status === 401) {
        // Token 验证失败 (由后端拦截器设置 response.setStatus(401))
        ElMessage.error("登录已过期或无效，请重新登录");
        localStorage.removeItem("user-token");
        sessionStorage.removeItem("isLoggedIn"); // 如果你用了这个
        if (router.currentRoute.value.path !== "/login") {
          router.push("/login");
        }
      } else {
        // 其他 HTTP 错误
        ElMessage.error(
          (error.response.data &&
            (error.response.data.message || error.response.data.msg)) || // 尝试读取标准错误结构
            error.message ||
            `服务器错误: ${error.response.status}`
        );
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应 (例如网络问题)
      ElMessage.error("网络请求失败，请检查您的网络连接");
    } else {
      // 发送请求时出了点问题 (这通常是 Promise.reject(new Error(...)) 从上一个 onFulfilled 传递过来的)
      // error.message 应该是 "Error from backend failure" 或 "用户名错误" 等
      ElMessage.error(error.message || "操作发生未知错误");
    }
    return Promise.reject(error); // 必须将错误继续传递下去
  }
);

// 登录请求
export const loginApi = (username, password) => {
  const data = {
    name: username,
    password: password,
  };
  return apiClient.post("/attendant/login", qs.stringify(data), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

// 注册请求
export const registerApi = (username, password) => {
  const data = {
    name: username,
    password: password,
  };
  return apiClient.post("/attendant/register", qs.stringify(data), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

// --- 站点管理 API ---
/**
 * 获取所有拼团站点列表
 */
export const getAllSitesApi = () => {
  return apiClient.get("/attendant/sites"); // 对应后端 @GetMapping("/sites")
};

/**
 * 新增拼团站点
 * @param {object} siteData - 站点数据，例如 { address: "新站点名称", group_num: 0 }
 */
export const addSiteApi = (siteData) => {
  return apiClient.post("/attendant/sites", siteData); // 对应后端 @PostMapping("/sites")
  // apiClient.post 默认会以 application/json 发送对象数据
};
// --- 结束 站点管理 API ---

// --- 管理员订单管理 API ---

/**
 * (管理员) 获取所有订单列表
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number} [params.orderState] - 订单状态 (可选)
 */
export const adminGetAllOrdersApi = (params) => {
  return apiClient.get("/attendant/orders", { params }); // params 会被 axios 自动转为 URL query string
};

/**
 * (管理员) 根据站点ID获取订单列表
 * @param {number} siteId - 站点ID
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number} [params.orderState] - 订单状态 (可选)
 */
export const adminGetOrdersBySiteApi = (siteId, params) => {
  return apiClient.get(`/attendant/orders/site/${siteId}`, { params });
};

// --- 结束 管理员订单管理 API ---

export default apiClient;

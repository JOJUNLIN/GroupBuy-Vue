// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../views/LoginPage.vue";
import RegisterPage from "../views/RegisterPage.vue";
import MainLayout from "../views/MainLayout.vue";
import SiteManagement from "../views/SiteManagement.vue";
import OrderStatus from "../views/OrderStatus.vue";
import OrderDispatch from "../views/OrderDispatch.vue";
import OrderDelivery from "../views/OrderDelivery.vue";

const isAuthenticated = () => {
  return !!localStorage.getItem("user-token"); // 检查是否存在 token
};

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: LoginPage,
    },
    {
      path: "/register",
      name: "Register",
      component: RegisterPage,
    },
    {
      // 主应用布局路由，包含嵌套的子路由（功能页面）
      path: "/",
      name: "MainLayout",
      component: MainLayout,
      // 如果直接访问根路径，重定向到第一个功能页面
      redirect: "/site-management",
      children: [
        {
          path: "site-management", // 注意这里是相对路径
          name: "SiteManagement",
          component: SiteManagement,
          meta: { title: "拼团站点管理" }, // 可以给路由添加元信息
        },
        {
          path: "order-status",
          name: "OrderStatus",
          component: OrderStatus,
          meta: { title: "订单状态管理" },
        },
        {
          path: "order-dispatch",
          name: "OrderDispatch",
          component: OrderDispatch,
          meta: { title: "订单发货管理" },
        },
        {
          path: "order-delivery",
          name: "OrderDelivery",
          component: OrderDelivery,
          meta: { title: "订单送达管理" },
        },
      ],
    },
    // 可选: 添加一个 404 页面
    // { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView }

    // 初始项目可能有一个 /about 路由，可以删掉或注释掉
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // }
  ],
});

router.beforeEach((to, from, next) => {
  const requiresAuth = !["/login", "/register"].includes(to.path);

  if (requiresAuth && !isAuthenticated()) {
    next("/login");
  } else if (
    (to.path === "/login" || to.path === "/register") &&
    isAuthenticated() &&
    to.name !== "MainLayout"
  ) {
    // 如果已登录，并且访问登录/注册页，则跳转到首页 (避免在MainLayout下重复跳转)
    // 同时避免在刷新MainLayout下的子路由时，因为isAuthenticated()为true而错误跳转
    if (from.path.startsWith("/")) {
      // 确保不是首次进入应用
      next("/");
    } else {
      next(); // 允许首次加载或直接访问根路径后重定向到子路由
    }
  } else {
    next();
  }
});

// 简单的导航守卫示例 (可选，用于强制跳转登录页)
// 在实际项目中，你需要根据 token 或其他登录状态来判断
// const isAuthenticated = () => {
//   // 这里应该有真实的检查逻辑，例如检查 localStorage/sessionStorage/cookie 中的 token
//   // 为了演示，我们暂时假设直接访问非登录注册页都需要“登录”
//   // return !!localStorage.getItem('user-token'); // 实际检查示例
//   return sessionStorage.getItem("isLoggedIn") === "true"; // 简单演示
// };

// router.beforeEach((to, from, next) => {
//   const requiresAuth = !["/login", "/register"].includes(to.path); // 需要认证的路径

//   if (requiresAuth && !isAuthenticated()) {
//     // 如果访问需要认证的页面但未认证，跳转到登录页
//     next("/login");
//   } else if (
//     (to.path === "/login" || to.path === "/register") &&
//     isAuthenticated()
//   ) {
//     // 如果已认证，访问登录/注册页则跳转到首页
//     next("/");
//   } else {
//     // 其他情况正常放行
//     next();
//   }
// });

export default router;

const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 12344,
    proxy: {
      "/api": {
        target: "http://localhost:12345", // 目标后端
        changeOrigin: true,
        pathRewrite: {
          "^/api": "", // 将 /api 前缀去掉
        },
      },
    },
  },
});

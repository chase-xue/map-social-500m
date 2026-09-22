<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import "./styles/global.scss";

onLaunch(() => {
  console.log("[App] 500米地图生活圈应用启动");
});

onShow(() => {
  console.log("[App] 页面展现");
});

onHide(() => {
  console.log("[App] 页面挂起");
});
</script>

<style>
/* 全局重置与基础样式 */
html, body, #app, uni-app, uni-page, uni-page-wrapper, uni-page-body, page {
  width: 100%;
  height: 100%;
  height: 100dvh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #f1f5f9;
}

view, text, image, input, textarea, button {
  box-sizing: border-box;
}

/* 隐藏滚动条 */
::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}
</style>

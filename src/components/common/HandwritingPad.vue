<template>
  <view class="handwriting-full-page" :class="'paper-bg-' + paperPattern">
    <!-- 顶栏：返回、纸张材质切换与关闭 -->
    <view class="pad-top-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="pad-nav-back" @tap="closePad">
        <text class="back-arrow">‹</text>
        <text class="back-text">返回</text>
      </view>

      <view class="paper-patterns-bar">
        <text class="pattern-label">信纸底纹：</text>
        <view
          v-for="p in patterns"
          :key="p.key"
          class="pattern-chip"
          :class="{ 'chip-selected': paperPattern === p.key }"
          @tap="paperPattern = p.key"
        >
          {{ p.name }}
        </view>
      </view>

      <view class="pad-nav-close" @tap="closePad">
        <text class="close-icon">✕</text>
      </view>
    </view>

    <!-- 真实手写全屏画布区域 (flex: 1 撑满剩余全屏) -->
    <view class="canvas-wrapper" :class="'pattern-' + paperPattern">
      <!-- 方格/横线底纹网格层 -->
      <view class="paper-grid-lines" v-if="paperPattern === 'grid'" />
      <view class="paper-ruled-lines" v-if="paperPattern === 'lined'" />

      <!-- 真实 HTML5 手写 Canvas -->
      <canvas
        id="handwritingCanvas"
        canvas-id="handwritingCanvas"
        class="hw-canvas"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseUp"
        @mouseleave="onMouseLeave"
      />

      <!-- 空白时的手写提示手势 -->
      <view v-if="isCanvasEmpty" class="canvas-empty-hint" pointer-events="none">
        <text class="hint-hand">✍️</text>
        <text class="hint-title">手写与涂鸦真迹信纸</text>
        <text class="hint-text">在信纸上随意手写文字、签名或画一幅治愈小插画吧～</text>
      </view>
    </view>

    <!-- 底部拟物文具工具栏 -->
    <view class="pad-bottom-toolbar">
      <view class="pen-tools-row">
        <view
          v-for="pen in penList"
          :key="pen.key"
          class="pen-btn"
          :class="{ 'pen-active': activePen === pen.key && !isEraser }"
          @tap="selectPen(pen.key)"
        >
          <text class="pen-icon">{{ pen.icon }}</text>
          <text class="pen-name">{{ pen.name }}</text>
        </view>

        <!-- 橡皮擦 -->
        <view
          class="pen-btn eraser-btn"
          :class="{ 'pen-active': isEraser }"
          @tap="toggleEraser"
        >
          <text class="pen-icon">🧹</text>
          <text class="pen-name">橡皮擦</text>
        </view>
      </view>

      <!-- 底部操作：清空重写 / 折起贴上窗台 -->
      <view class="pad-footer-actions">
        <button class="action-btn clear-btn" @tap="clearCanvas">
          <text class="btn-icon">↺</text>
          <text>清空重写</text>
        </button>
        <button class="action-btn send-btn" :disabled="isCanvasEmpty" @tap="confirmHandwriting">
          <text class="btn-icon">💌</text>
          <text>{{ actionConfirmText || '折起贴上窗台' }}</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { useAppState } from "../../composables/useAppState";

const { statusBarHeight } = useAppState();

const props = defineProps<{
  actionConfirmText?: string;
  defaultPattern?: string;
}>();

const emit = defineEmits<{
  (e: "confirm", dataUrl: string): void;
  (e: "close"): void;
}>();

type PenType = "fountain" | "pencil" | "ballpoint";
type PaperPattern = "yellow" | "grid" | "lined" | "kraft";

const paperPattern = ref<PaperPattern>((props.defaultPattern as PaperPattern) || "yellow");
const activePen = ref<PenType>("fountain");
const isEraser = ref(false);
const isCanvasEmpty = ref(true);

const patterns = [
  { key: "yellow" as PaperPattern, name: "便签黄" },
  { key: "grid" as PaperPattern, name: "方格稿纸" },
  { key: "lined" as PaperPattern, name: "横线信笺" },
  { key: "kraft" as PaperPattern, name: "牛皮纸" }
];

const penList = [
  { key: "fountain" as PenType, name: "钢笔墨水", icon: "✒️", color: "#1a1a1a", width: 3 },
  { key: "pencil" as PenType, name: "铅笔素描", icon: "✏️", color: "#555555", width: 2 },
  { key: "ballpoint" as PenType, name: "红圆珠笔", icon: "🔴", color: "#c62828", width: 2.5 }
];

let canvasEl: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let isCanvasInitialized = false;

onMounted(() => {
  nextTick(() => {
    initCanvas();
  });
});

function initCanvas() {
  // #ifdef H5
  if (isCanvasInitialized && canvasEl && ctx) return;

  const uniCanvas = document.querySelector("#handwritingCanvas") || document.querySelector("uni-canvas");
  if (uniCanvas) {
    canvasEl = uniCanvas.tagName.toLowerCase() === "canvas"
      ? (uniCanvas as HTMLCanvasElement)
      : (uniCanvas.querySelector("canvas") as HTMLCanvasElement);
  }
  if (!canvasEl) {
    canvasEl = (document.querySelector(".hw-canvas canvas") || document.querySelector("canvas")) as HTMLCanvasElement;
  }

  const wrapper = document.querySelector(".canvas-wrapper") as HTMLElement;
  const rect = wrapper ? wrapper.getBoundingClientRect() : (canvasEl ? canvasEl.parentElement?.getBoundingClientRect() || canvasEl.getBoundingClientRect() : null);

  if (canvasEl && rect && rect.width > 0 && rect.height > 0) {
    // 1. 强制覆盖 uni-app 内联注入的 width: 300px; height: 150px 样式，与外层容器严格 1:1 对齐
    canvasEl.style.setProperty("width", `${rect.width}px`, "important");
    canvasEl.style.setProperty("height", `${rect.height}px`, "important");
    canvasEl.style.setProperty("position", "absolute", "important");
    canvasEl.style.setProperty("left", "0px", "important");
    canvasEl.style.setProperty("top", "0px", "important");

    // 2. 严格 1:1 坐标系绑定，杜绝 dpr 与 CSS 缩放产生 2x 偏移与笔画位移
    canvasEl.width = Math.round(rect.width);
    canvasEl.height = Math.round(rect.height);

    ctx = canvasEl.getContext("2d");
    if (ctx) {
      applyPenStyle();
      isCanvasInitialized = true;
    }
  }
  // #endif
}

function applyPenStyle() {
  if (!ctx) return;
  if (isEraser.value) {
    ctx.strokeStyle = getEraserBgColor();
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    return;
  }

  const pen = penList.find(p => p.key === activePen.value) || penList[0];
  ctx.strokeStyle = pen.color;
  ctx.lineWidth = pen.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (activePen.value === "pencil") {
    ctx.shadowBlur = 1;
    ctx.shadowColor = "#666";
  } else {
    ctx.shadowBlur = 0;
  }
}

function getEraserBgColor(): string {
  switch (paperPattern.value) {
    case "yellow": return "#fff9c4";
    case "grid": return "#fffdf7";
    case "lined": return "#faf8f2";
    case "kraft": return "#efebe9";
    default: return "#fff9c4";
  }
}

function selectPen(pen: PenType) {
  activePen.value = pen;
  isEraser.value = false;
  applyPenStyle();
}

function toggleEraser() {
  isEraser.value = !isEraser.value;
  applyPenStyle();
}

function getPos(e: any): { x: number; y: number } {
  if (!canvasEl) return { x: 0, y: 0 };
  const rect = canvasEl.getBoundingClientRect();
  const touch = e.touches && e.touches.length > 0 ? e.touches[0] : (e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0] : null);
  const clientX = touch ? touch.clientX : e.clientX;
  const clientY = touch ? touch.clientY : e.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function startStroke(x: number, y: number) {
  isDrawing = true;
  lastX = x;
  lastY = y;
  isCanvasEmpty.value = false;
  if (!ctx) return;
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function drawStroke(x: number, y: number) {
  if (!isDrawing || !ctx) return;
  const midX = (lastX + x) / 2;
  const midY = (lastY + y) / 2;
  ctx.quadraticCurveTo(lastX, lastY, midX, midY);
  ctx.stroke();
  lastX = x;
  lastY = y;
}

function stopStroke() {
  if (!isDrawing || !ctx) return;
  isDrawing = false;
  ctx.closePath();
}

// 触摸事件
function onTouchStart(e: any) {
  const { x, y } = getPos(e);
  startStroke(x, y);
}

function onTouchMove(e: any) {
  const { x, y } = getPos(e);
  drawStroke(x, y);
}

function onTouchEnd() {
  stopStroke();
}

// 鼠标事件 (兼容电脑端浏览器)
function onMouseDown(e: any) {
  const { x, y } = getPos(e);
  startStroke(x, y);
}

function onMouseMove(e: any) {
  if (isDrawing) {
    const { x, y } = getPos(e);
    drawStroke(x, y);
  }
}

function onMouseUp() {
  stopStroke();
}

function onMouseLeave() {
  stopStroke();
}

function clearCanvas() {
  if (!canvasEl || !ctx) return;
  const rect = canvasEl.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  isCanvasEmpty.value = true;
}

function confirmHandwriting() {
  if (!canvasEl) return;
  try {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvasEl.width;
    exportCanvas.height = canvasEl.height;
    const expCtx = exportCanvas.getContext("2d");
    if (expCtx) {
      // 填充纸张底色
      expCtx.fillStyle = getEraserBgColor();
      expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      // 绘制纸张手写字迹
      expCtx.drawImage(canvasEl, 0, 0);
      const dataUrl = exportCanvas.toDataURL("image/png");
      emit("confirm", dataUrl);
      return;
    }
    const dataUrl = canvasEl.toDataURL("image/png");
    emit("confirm", dataUrl);
  } catch (err) {
    console.warn("手写导出提示:", err);
    emit("confirm", canvasEl.toDataURL("image/png"));
  }
}

function closePad() {
  emit("close");
}
</script>

<style lang="scss" scoped>
/* ==================== ✍️ 全窗口手写与真迹涂鸦画板 ==================== */
.handwriting-full-page {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  height: 100dvh;
  z-index: 300;
  display: flex;
  flex-direction: column;
  background: #fff9c4;
  overflow: hidden;
  animation: pad-slide-in 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes pad-slide-in {
  from {
    transform: translateY(100%);
    opacity: 0.8;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.pad-top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(215, 204, 200, 0.8);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
  z-index: 20;
}

.pad-nav-back {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 5px 12px;
  border-radius: 16px;
  background: rgba(62, 39, 35, 0.06);
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.95);
    background: rgba(62, 39, 35, 0.12);
  }

  .back-arrow {
    font-size: 18px;
    font-weight: 700;
    color: #4e342e;
    line-height: 1;
  }
  .back-text {
    font-size: 12px;
    font-weight: 600;
    color: #4e342e;
  }
}

.paper-patterns-bar {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pattern-label {
  font-size: 11px;
  color: #795548;
  font-weight: 700;
}

.pattern-chip {
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 12px;
  background: #f7f5f0;
  border: 1px solid #d7ccc8;
  color: #5d4037;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.95);
  }
}

.chip-selected {
  background: #e67e22;
  border-color: #e67e22;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(230, 126, 34, 0.3);
}

.pad-nav-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(62, 39, 35, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.92);
    background: rgba(62, 39, 35, 0.12);
  }

  .close-icon {
    font-size: 14px;
    color: #5d4037;
    font-weight: 700;
  }
}

/* 画布区域与纸张纹理 (撑满剩余视口) */
.canvas-wrapper {
  position: relative;
  flex: 1;
  height: 0;
  width: 100%;
  background: #fff9c4;
  overflow: hidden;

  :deep(uni-canvas),
  uni-canvas {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
    position: relative !important;
  }

  :deep(canvas),
  canvas {
    width: 100% !important;
    height: 100% !important;
    display: block !important;
    touch-action: none !important;
    cursor: crosshair !important;
  }
}

.pattern-yellow { background: #fff9c4; }
.pattern-grid   { background: #fffdf7; }
.pattern-lined  { background: #faf8f2; }
.pattern-kraft  { background: #efebe9; }

.paper-grid-lines {
  position: absolute;
  inset: 0;
  background-size: 20px 20px;
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  pointer-events: none;
}

.paper-ruled-lines {
  position: absolute;
  inset: 0;
  background-size: 100% 28px;
  background-image: linear-gradient(to bottom, transparent 27px, rgba(141, 110, 99, 0.2) 28px);
  pointer-events: none;
}

.hw-canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
  cursor: crosshair;
}

.canvas-empty-hint {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  opacity: 0.45;
  padding: 20px;
  text-align: center;
}

.hint-hand {
  font-size: 40px;
  animation: write-shake 1.5s infinite ease-in-out;
}

.hint-title {
  font-size: 14px;
  font-weight: 700;
  color: #5d4037;
  margin-top: 10px;
}

.hint-text {
  font-size: 12px;
  color: #795548;
  margin-top: 4px;
}

@keyframes write-shake {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-4px) rotate(6deg); }
}

/* 底部工具栏 */
.pad-bottom-toolbar {
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  padding: 12px 16px;
  padding-bottom: calc(14px + env(safe-area-inset-bottom, 10px));
  border-top: 1px solid rgba(215, 204, 200, 0.8);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  z-index: 20;
}

.pen-tools-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.pen-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 6px;
  border-radius: 10px;
  background: #f7f5f0;
  border: 1px solid #ebd9c5;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.96);
  }
}

.pen-icon {
  font-size: 15px;
}

.pen-name {
  font-size: 11px;
  font-weight: 600;
  color: #4e342e;
}

.pen-active {
  background: #fff3e0;
  border-color: #e67e22;
  box-shadow: 0 2px 8px rgba(230, 126, 34, 0.25);

  .pen-name {
    color: #e67e22;
    font-weight: 700;
  }
}

.eraser-btn {
  background: #f5f5f5;
}

.pad-footer-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  height: 42px;
  border-radius: 21px;
  font-size: 13.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.97);
  }

  .btn-icon {
    font-size: 14px;
  }
}

.clear-btn {
  background: #f5f2eb;
  color: #8d6e63;
  border: 1px solid #d7ccc8;
}

.send-btn {
  background: linear-gradient(135deg, #ff9800 0%, #e65100 100%);
  color: #fff;
  box-shadow: 0 4px 14px rgba(230, 81, 0, 0.35);

  &:disabled {
    background: #e0e0e0;
    color: #9e9e9e;
    box-shadow: none;
  }
}
</style>

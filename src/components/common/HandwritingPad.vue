<template>
  <view class="handwriting-pad-mask" @tap.self="closePad">
    <view class="pad-container" :class="'paper-bg-' + paperPattern">
      <!-- 顶栏：纸张材质切换与关闭 -->
      <view class="pad-header">
        <view class="paper-patterns">
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
        <view class="pad-close-btn" @tap="closePad">✕</view>
      </view>

      <!-- 真实手写画布区域 -->
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
          <text class="hint-text">用手指或鼠标在纸上写字、画小涂鸦...</text>
        </view>
      </view>

      <!-- 工具栏：画笔类型选择（钢笔/铅笔/红圆珠笔/橡皮擦） -->
      <view class="pad-toolbar">
        <view class="pen-tools-row">
          <view
            v-for="pen in penList"
            :key="pen.key"
            class="pen-btn"
            :class="{ 'pen-active': activePen === pen.key }"
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

        <!-- 底部操作：清空重写 / 切换打字 / 折起寄出 -->
        <view class="pad-footer-actions">
          <button class="action-btn clear-btn" @tap="clearCanvas">
            清空重写
          </button>
          <button class="action-btn send-btn" :disabled="isCanvasEmpty" @tap="confirmHandwriting">
            {{ actionConfirmText || '💌 贴上窗台' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";

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

onMounted(() => {
  nextTick(() => {
    initCanvas();
  });
});

function initCanvas() {
  // #ifdef H5
  canvasEl = document.querySelector("#handwritingCanvas") as HTMLCanvasElement;
  if (!canvasEl) {
    const list = document.querySelectorAll("canvas");
    for (let i = 0; i < list.length; i++) {
      if (list[i].classList.contains("hw-canvas") || list[i].getAttribute("canvas-id") === "handwritingCanvas") {
        canvasEl = list[i];
        break;
      }
    }
  }

  if (canvasEl) {
    const rect = canvasEl.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvasEl.width = rect.width * dpr;
    canvasEl.height = rect.height * dpr;
    ctx = canvasEl.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      applyPenStyle();
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
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
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
  // 导出高质量图片 base64
  const dataUrl = canvasEl.toDataURL("image/png");
  emit("confirm", dataUrl);
}

function closePad() {
  emit("close");
}
</script>

<style lang="scss" scoped>
.handwriting-pad-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

.pad-container {
  width: 100%;
  max-width: 380px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  border: 1px solid #d7ccc8;
  animation: pad-appear 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pad-appear {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

.pad-header {
  padding: 10px 14px;
  background: #f7f3ee;
  border-bottom: 1px solid #ebd9c5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.paper-patterns {
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
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #d7ccc8;
  color: #5d4037;
  cursor: pointer;
}

.chip-selected {
  background: #e67e22;
  border-color: #e67e22;
  color: #fff;
  font-weight: 700;
}

.pad-close-btn {
  font-size: 16px;
  color: #8d6e63;
  padding: 4px 8px;
  cursor: pointer;
}

/* 画布区域与纸张纹理 */
.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 230px;
  background: #fff9c4;
  overflow: hidden;
}

.pattern-yellow { background: #fff9c4; }
.pattern-grid   { background: #fffdf7; }
.pattern-lined  { background: #faf8f2; }
.pattern-kraft  { background: #efebe9; }

.paper-grid-lines {
  position: absolute;
  inset: 0;
  background-size: 18px 18px;
  background-image: 
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  pointer-events: none;
}

.paper-ruled-lines {
  position: absolute;
  inset: 0;
  background-size: 100% 24px;
  background-image: linear-gradient(to bottom, transparent 23px, rgba(141, 110, 99, 0.2) 24px);
  pointer-events: none;
}

.hw-canvas {
  width: 100%;
  height: 100%;
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
}

.hint-hand {
  font-size: 32px;
  animation: write-shake 1.5s infinite ease-in-out;
}

.hint-text {
  font-size: 12px;
  color: #5d4037;
  margin-top: 6px;
}

@keyframes write-shake {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-4px) rotate(6deg); }
}

/* 工具栏 */
.pad-toolbar {
  background: #fff;
  padding: 10px 14px 14px;
  border-top: 1px solid #ebd9c5;
}

.pen-tools-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.pen-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 4px;
  border-radius: 8px;
  background: #f7f5f0;
  border: 1px solid #ebd9c5;
  cursor: pointer;
  transition: all 0.15s;
}

.pen-icon {
  font-size: 14px;
}

.pen-name {
  font-size: 10px;
  font-weight: 600;
  color: #4e342e;
}

.pen-active {
  background: #fff3e0;
  border-color: #e67e22;
  box-shadow: 0 2px 6px rgba(230, 126, 34, 0.25);

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
  gap: 10px;
}

.action-btn {
  flex: 1;
  height: 38px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}

.clear-btn {
  background: #f5f2eb;
  color: #8d6e63;
  border: 1px solid #d7ccc8;
}

.send-btn {
  background: linear-gradient(135deg, #ff9800 0%, #e65100 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(230, 81, 0, 0.35);

  &:disabled {
    background: #e0e0e0;
    color: #9e9e9e;
    box-shadow: none;
  }
}
</style>

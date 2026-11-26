/**
 * 前端纯本地 Canvas 照片转铅笔素描滤镜 (Zero-API / Local-First)
 * 算法：灰度化 -> 反相 -> 盒式近似高斯模糊 -> Color Dodge 颜色减淡混合 -> 淡黄纸张微着色
 */
export function convertImageToSketch(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    if (typeof document === "undefined" || typeof Image === "undefined") {
      resolve(imageUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const maxDim = 640;
        let w = img.naturalWidth || img.width || 400;
        let h = img.naturalHeight || img.height || 400;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.max(1, Math.round(w * ratio));
          h = Math.max(1, Math.round(h * ratio));
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const srcData = ctx.getImageData(0, 0, w, h);
        const data = srcData.data;
        const len = w * h;

        const gray = new Uint8ClampedArray(len);
        const inv = new Uint8ClampedArray(len);

        for (let i = 0; i < len; i++) {
          const idx = i * 4;
          const g = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
          gray[i] = g;
          inv[i] = 255 - g;
        }

        // 轻量 5x5 盒式模糊近似高斯模糊，突出素描铅笔轮廓线
        const blurred = new Uint8ClampedArray(len);
        const radius = 3;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            let sum = 0;
            let count = 0;
            for (let dy = -radius; dy <= radius; dy++) {
              const ny = y + dy;
              if (ny < 0 || ny >= h) continue;
              const rowOffset = ny * w;
              for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                if (nx < 0 || nx >= w) continue;
                sum += inv[rowOffset + nx];
                count++;
              }
            }
            blurred[y * w + x] = Math.round(sum / count);
          }
        }

        // Color Dodge 颜色减淡 + 温暖淡黄和纸色调融合
        for (let i = 0; i < len; i++) {
          const base = gray[i];
          const blend = blurred[i];
          let dodge = blend >= 255 ? 255 : Math.min(255, Math.floor((base << 8) / (255 - blend)));
          // 适度增强铅笔笔触对比度
          dodge = dodge < 215 ? Math.max(28, Math.round(dodge * 0.88)) : Math.min(255, dodge);
          const idx = i * 4;
          // 轻微染上淡黄纸底 (#FFF9E8)
          data[idx] = Math.min(255, Math.round(dodge * 1.0));
          data[idx + 1] = Math.min(255, Math.round(dodge * 0.975));
          data[idx + 2] = Math.min(255, Math.round(dodge * 0.91));
          data[idx + 3] = 255;
        }

        ctx.putImageData(srcData, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      } catch (e) {
        // 跨域图片无法读取像素时优雅降级返回原图（配合 CSS 素描滤镜展示）
        resolve(imageUrl);
      }
    };
    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
}

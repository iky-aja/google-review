/**
 * Transparent QR Slot Bounding Box
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Auto-detects the transparent QR slot in a template ImageData.
 * Uses a high-performance queue-based BFS algorithm to locate contiguous
 * pixels with alpha < threshold, filtering out noise and non-square regions.
 *
 * @param imageData ImageData object from canvas context
 * @param alphaThreshold Max alpha value to consider transparent (default: 30)
 * @returns BoundingBox of the detected QR slot
 */
export function detectTransparentRegion(
  imageData: ImageData,
  alphaThreshold: number = 30
): BoundingBox {
  const { width, height, data } = imageData;
  const totalPixels = width * height;
  const visited = new Uint8Array(totalPixels);

  // Pre-allocated Int32Array queue to prevent GC overhead during BFS
  const queue = new Int32Array(totalPixels * 2);

  interface RegionCandidate {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
    pixelCount: number;
  }

  const validRegions: RegionCandidate[] = [];

  // Minimum pixel count to filter out transparent noise / small icons (at least 0.5% of canvas area)
  const minPixelCount = Math.floor(totalPixels * 0.005);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (visited[idx]) continue;

      const alpha = data[idx * 4 + 3];
      if (alpha < alphaThreshold) {
        // Start BFS
        let head = 0;
        let tail = 0;

        queue[tail++] = x;
        queue[tail++] = y;
        visited[idx] = 1;

        let minX = x;
        let maxX = x;
        let minY = y;
        let maxY = y;
        let pixelCount = 0;

        while (head < tail) {
          const cx = queue[head++];
          const cy = queue[head++];
          pixelCount++;

          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;

          // 4-neighbor traversal
          const neighbors: [number, number][] = [
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx, cy - 1],
          ];

          for (let i = 0; i < 4; i++) {
            const nx = neighbors[i][0];
            const ny = neighbors[i][1];
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (!visited[nIdx]) {
                const nAlpha = data[nIdx * 4 + 3];
                if (nAlpha < alphaThreshold) {
                  visited[nIdx] = 1;
                  queue[tail++] = nx;
                  queue[tail++] = ny;
                }
              }
            }
          }
        }

        const regW = maxX - minX + 1;
        const regH = maxY - minY + 1;

        // Filtering & Validation:
        // 1. Must have sufficient pixel count
        // 2. Minimum dimension > 50px
        // 3. Aspect ratio between 0.7 and 1.4 (near square)
        const aspectRatio = regW / regH;
        if (
          pixelCount >= minPixelCount &&
          regW >= 50 &&
          regH >= 50 &&
          aspectRatio >= 0.7 &&
          aspectRatio <= 1.4
        ) {
          validRegions.push({
            minX,
            minY,
            maxX,
            maxY,
            width: regW,
            height: regH,
            pixelCount,
          });
        }
      }
    }
  }

  if (validRegions.length === 0) {
    throw new Error(
      "Template PNG tidak memiliki area transparan (QR slot) yang valid. Pastikan template memiliki area transparan berbentuk persegi di frame QR."
    );
  }

  // Select the region with the largest pixel count (most prominent QR slot)
  validRegions.sort((a, b) => b.pixelCount - a.pixelCount);
  const best = validRegions[0];

  return {
    x: best.minX,
    y: best.minY,
    width: best.width,
    height: best.height,
  };
}

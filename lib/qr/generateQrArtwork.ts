import QRCode from "qrcode";
import { detectTransparentRegion, BoundingBox } from "./detectTransparentRegion";

export interface GenerateQrArtworkOptions {
  publicToken: string;
  appUrl: string;
  templateSrc?: string;
}

export interface QrArtworkResult {
  dataUrl: string;
  width: number;
  height: number;
  detectedSlot: BoundingBox;
  cardUrl: string;
}

/**
 * Helper to load an image from a URL into an HTMLImageElement safely
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback: If image fails to load with crossOrigin, retry without crossOrigin
      if (img.crossOrigin) {
        const retryImg = new Image();
        retryImg.onload = () => resolve(retryImg);
        retryImg.onerror = () =>
          reject(new Error(`Gagal memuat template gambar dari path: ${src}`));
        retryImg.src = src;
      } else {
        reject(new Error(`Gagal memuat template gambar dari path: ${src}`));
      }
    };

    // Only set crossOrigin for cross-domain external URLs
    if (src.startsWith("http://") || src.startsWith("https://")) {
      img.crossOrigin = "anonymous";
    }

    img.src = src;
  });
}

/**
 * Generates high-quality composite QR Artwork using master template PNG.
 * 1. Loads master template image
 * 2. Auto-detects transparent QR slot via RGBA alpha detection
 * 3. Encodes Public Gateway URL into crisp high-contrast QR Code
 * 4. Fits & centers QR inside transparent region
 * 5. Composites QR and template cleanly
 * 6. Returns PNG Data URL
 */
export async function generateQrArtwork(
  options: GenerateQrArtworkOptions
): Promise<QrArtworkResult> {
  const {
    publicToken,
    appUrl,
    templateSrc = "/templates/google-review-template-transparent-qr.png",
  } = options;

  const cardUrl = `${appUrl}/c/${publicToken}`;

  // 1. Load template image
  const templateImg = await loadImage(templateSrc);
  const imgW = templateImg.naturalWidth || templateImg.width;
  const imgH = templateImg.naturalHeight || templateImg.height;

  if (!imgW || !imgH) {
    throw new Error("Dimensi gambar template tidak valid.");
  }

  // 2. Create offscreen canvas for transparency analysis
  const detectCanvas = document.createElement("canvas");
  detectCanvas.width = imgW;
  detectCanvas.height = imgH;
  const detectCtx = detectCanvas.getContext("2d", { willReadFrequently: true });

  if (!detectCtx) {
    throw new Error("Gagal menginisialisasi 2D canvas context.");
  }

  detectCtx.drawImage(templateImg, 0, 0);
  const imageData = detectCtx.getImageData(0, 0, imgW, imgH);

  // 3. Auto-detect transparent QR slot bounding box
  const slot = detectTransparentRegion(imageData);

  // 4. Calculate QR size & position to fit perfectly inside detected slot
  const qrSize = Math.min(slot.width, slot.height);
  const qrX = slot.x + Math.floor((slot.width - qrSize) / 2);
  const qrY = slot.y + Math.floor((slot.height - qrSize) / 2);

  // 5. Generate high-resolution QR code onto a temporary canvas
  const qrCanvas = document.createElement("canvas");
  qrCanvas.width = qrSize;
  qrCanvas.height = qrSize;

  await QRCode.toCanvas(qrCanvas, cardUrl, {
    width: qrSize,
    margin: 1, // Safe quiet zone margin for scannability
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H", // High error correction level for maximum scan reliability
  });

  // 6. Perform image compositing
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = imgW;
  outputCanvas.height = imgH;
  const outCtx = outputCanvas.getContext("2d");

  if (!outCtx) {
    throw new Error("Gagal menginisialisasi output canvas context.");
  }

  // Draw QR canvas in the detected transparent slot location
  outCtx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

  // Draw master template OVER the QR canvas (template frame overlays QR edges seamlessly)
  outCtx.drawImage(templateImg, 0, 0, imgW, imgH);

  // 7. Export HD PNG Data URL
  const dataUrl = outputCanvas.toDataURL("image/png");

  return {
    dataUrl,
    width: imgW,
    height: imgH,
    detectedSlot: slot,
    cardUrl,
  };
}

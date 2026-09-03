"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface DigitalTwinProps {
  publicToken: string;
  appUrl: string;
  status: "UNASSIGNED" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";
  businessName?: string | null;
}

export default function DigitalTwin({
  publicToken,
  appUrl,
  status,
  businessName,
}: DigitalTwinProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrReady, setQrReady] = useState(false);
  const cardUrl = `${appUrl}/c/${publicToken}`;
  const isActive = status === "ACTIVE";
  const isDimmed = status === "SUSPENDED" || status === "ARCHIVED";

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, cardUrl, {
      width: 120,
      margin: 1,
      color: { dark: "#F5F5F5", light: "#141416" },
    }).then(() => setQrReady(true));
  }, [cardUrl]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `have-tech-${publicToken}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      className={`relative w-full max-w-xs rounded-xl border border-surface-2 bg-surface-1 p-5 transition-all select-none ${
        isDimmed ? "opacity-40 grayscale" : ""
      }`}
      style={{ aspectRatio: "1.585" }}
    >
      {/* Status dot */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <span
          className={`h-2 w-2 rounded-full ${
            isActive
              ? "bg-gold"
              : status === "SUSPENDED" || status === "ARCHIVED"
              ? "bg-destructive"
              : "bg-text-secondary"
          }`}
        />
        <span className="text-xs font-mono text-text-secondary">{status}</span>
      </div>

      {/* Logo */}
      <div className="text-xs font-bold tracking-widest text-gold">HAVE TECH</div>

      {/* QR Code */}
      <div className="mt-2 flex justify-center">
        <button
          onClick={downloadQR}
          title="Download QR Code"
          className="cursor-pointer rounded p-1 transition hover:ring-1 hover:ring-gold/40"
        >
          <canvas
            ref={canvasRef}
            className={`rounded ${qrReady ? "opacity-100" : "opacity-0"}`}
          />
        </button>
      </div>

      {/* Token */}
      <div className="mt-2 text-center font-mono text-xs tracking-widest text-text-secondary">
        {publicToken}
      </div>

      {businessName && (
        <div className="mt-1 text-center text-xs text-text-secondary truncate px-2">
          {businessName}
        </div>
      )}
    </div>
  );
}

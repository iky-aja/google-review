"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface QrCodeModalProps {
  publicToken: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QrCodeModal({ publicToken, isOpen, onClose }: QrCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedNdef, setCopiedNdef] = useState(false);

  const [appUrl, setAppUrl] = useState("https://google-review-one.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAppUrl(window.location.origin);
    }
  }, []);

  const cardUrl = `${appUrl}/c/${publicToken}`;

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        cardUrl,
        {
          width: 300,
          margin: 2,
          color: {
            dark: "#0A0A0B",
            light: "#FFFFFF",
          },
        },
        (err) => {
          if (err) console.error("Error generating QR Code:", err);
        }
      );
    }
  }, [isOpen, cardUrl]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `havetech-qr-${publicToken}.png`;
    link.href = dataUrl;
    link.click();
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl border border-surface-2 bg-canvas p-6 text-center shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-xl font-bold p-1"
        >
          ✕
        </button>

        <h3 className="text-sm font-bold tracking-widest text-gold uppercase">QR Code Provisioning</h3>
        <p className="text-xs text-text-secondary mt-1">
          Scan QR atau tulis URL NDEF ini ke chip NFC fisik.
        </p>

        {/* Canvas QR Code */}
        <div className="my-5 flex justify-center bg-white p-4 rounded-xl border border-surface-2 shadow-inner inline-block mx-auto">
          <canvas ref={canvasRef} />
        </div>

        {/* Token Badge */}
        <div className="rounded-lg bg-surface-1 p-3 text-left flex flex-col gap-2 border border-surface-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-text-secondary">Token</span>
            <span className="font-mono text-xs font-bold text-gold">{publicToken}</span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-surface-2">
            <span className="text-[10px] uppercase font-semibold text-text-secondary">Public Gateway URL</span>
            <button
              onClick={() => copyToClipboard(cardUrl, setCopiedUrl)}
              className="text-[11px] font-semibold text-gold hover:underline cursor-pointer"
            >
              {copiedUrl ? "✓ Tersalin!" : "Salin URL"}
            </button>
          </div>
          <code className="text-[11px] font-mono text-text-secondary truncate bg-surface-2 px-2 py-1 rounded">
            {cardUrl}
          </code>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-surface-2">
            <span className="text-[10px] uppercase font-semibold text-text-secondary">NDEF URI for NFC Tools</span>
            <button
              onClick={() => copyToClipboard(cardUrl, setCopiedNdef)}
              className="text-[11px] font-semibold text-gold hover:underline cursor-pointer"
            >
              {copiedNdef ? "✓ Tersalin!" : "Salin NDEF"}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex h-11 items-center justify-center gap-2 rounded-lg bg-gold text-xs font-semibold text-canvas transition hover:bg-gold-hover shadow-md cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PNG (HD)
          </button>
        </div>
      </div>
    </div>
  );
}

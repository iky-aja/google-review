"use client";

import { useEffect, useState, useCallback } from "react";
import { generateQrArtwork, QrArtworkResult } from "@/lib/qr/generateQrArtwork";

interface QrCodeModalProps {
  publicToken: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QrCodeModal({ publicToken, isOpen, onClose }: QrCodeModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedNdef, setCopiedNdef] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artwork, setArtwork] = useState<QrArtworkResult | null>(null);

  const [appUrl] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : ""
  );

  const cardUrl = `${appUrl}/c/${publicToken}`;

  const loadArtwork = useCallback(async () => {
    if (!publicToken) return;
    setLoading(true);
    setError(null);

    try {
      const result = await generateQrArtwork({
        publicToken,
        appUrl: appUrl || window.location.origin,
      });
      setArtwork(result);
    } catch (err: unknown) {
      console.error("[QrCodeModal] Artwork generation error:", err);
      const msg = err instanceof Error ? err.message : "Gagal memproses QR Code Artwork.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [publicToken, appUrl]);

  useEffect(() => {
    if (isOpen) {
      loadArtwork();
    } else {
      setArtwork(null);
      setError(null);
    }
  }, [isOpen, loadArtwork]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!artwork?.dataUrl) return;
    const link = document.createElement("a");
    link.download = `havetech-artwork-${publicToken}.png`;
    link.href = artwork.dataUrl;
    link.click();
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl border border-surface-2 bg-canvas p-6 text-center shadow-2xl relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-xl font-bold p-1 cursor-pointer transition"
          title="Tutup Modal"
        >
          ✕
        </button>

        <h3 className="text-sm font-bold tracking-widest text-gold uppercase">
          QR Artwork Provisioning
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          Master Template dengan QR Code Dinamis Otomatis.
        </p>

        {/* Artwork Preview Area */}
        <div className="my-5 flex flex-col items-center justify-center min-h-[280px] bg-surface-1 rounded-xl border border-surface-2 p-3 shadow-inner relative overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              <span className="text-xs font-semibold text-text-secondary">
                Mendeteksi Slot & Komposisi QR Artwork...
              </span>
            </div>
          ) : error ? (
            <div className="p-4 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive text-lg">
                ⚠️
              </div>
              <p className="text-xs text-destructive font-medium leading-relaxed">{error}</p>
              <button
                onClick={loadArtwork}
                className="px-3 py-1.5 bg-surface-2 hover:bg-surface-2/80 text-text-primary rounded text-xs font-semibold cursor-pointer transition"
              >
                Coba Lagi
              </button>
            </div>
          ) : artwork ? (
            <div className="relative group w-full flex justify-center">
              <img
                src={artwork.dataUrl}
                alt={`QR Artwork - ${publicToken}`}
                className="max-h-[50vh] w-auto rounded-lg shadow-md object-contain border border-gold/20 transition group-hover:border-gold/40"
              />
              <span className="absolute bottom-2 right-2 bg-black/70 text-gold text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur">
                {artwork.width}x{artwork.height}px
              </span>
            </div>
          ) : null}
        </div>

        {/* Token & Gateway Details */}
        <div className="rounded-lg bg-surface-1 p-3 text-left flex flex-col gap-2 border border-surface-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-text-secondary">Token Kartu</span>
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

        {/* Action Buttons */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={loading || !!error || !artwork}
            className="flex-1 flex h-11 items-center justify-center gap-2 rounded-lg bg-gold text-xs font-semibold text-canvas transition hover:bg-gold-hover shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Artwork PNG (HD)
          </button>
        </div>
      </div>
    </div>
  );
}

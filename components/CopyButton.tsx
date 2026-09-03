"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded border border-surface-2 px-3 py-2 text-xs font-semibold text-text-secondary transition hover:border-gold/40 hover:text-gold"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

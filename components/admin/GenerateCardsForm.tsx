"use client";

import { useState, useTransition } from "react";

export default function GenerateCardsForm() {
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState<{ tokens: string[] } | { error: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/cards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      setResult(data);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="quantity" className="text-xs text-text-secondary">
            Jumlah Kartu
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            max={100}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-28 rounded-lg border border-surface-2 bg-canvas px-4 py-2.5 text-sm text-text-primary outline-none focus:border-gold/60 transition"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-canvas transition hover:opacity-80 disabled:opacity-40"
        >
          {isPending ? "Generating…" : "Generate"}
        </button>
      </form>

      {result && "error" in result && (
        <p className="text-xs text-destructive">{result.error}</p>
      )}

      {result && "tokens" in result && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-text-secondary">
            {result.tokens.length} kartu berhasil dibuat:
          </p>
          <div className="flex flex-wrap gap-2">
            {result.tokens.map((t) => (
              <code
                key={t}
                className="rounded bg-surface-2 px-2 py-1 text-xs font-mono text-text-primary"
              >
                {t}
              </code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

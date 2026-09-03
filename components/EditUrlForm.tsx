"use client";

import { useState, useTransition } from "react";
import { validateReviewUrl } from "@/lib/card-utils";

interface Props {
  currentUrl: string;
  onSubmit: (formData: FormData) => Promise<void>;
}

export default function EditUrlForm({ currentUrl, onSubmit }: Props) {
  const [value, setValue] = useState(currentUrl);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validateReviewUrl(value);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.set("reviewUrl", value);
    startTransition(async () => {
      await onSubmit(fd);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="url"
        name="reviewUrl"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setError(null);
        }}
        placeholder="https://g.page/r/YOUR_REVIEW_ID/review"
        className="w-full rounded-lg border border-surface-2 bg-canvas px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-gold/60 transition"
        required
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-text-primary px-5 py-2.5 text-sm font-semibold text-canvas transition hover:opacity-80 disabled:opacity-40"
      >
        {isPending ? "Saving…" : saved ? "Saved!" : "Save URL"}
      </button>
    </form>
  );
}

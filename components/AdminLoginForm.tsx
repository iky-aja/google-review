"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AdminLoginFormProps {
  callbackUrl: string;
}

export default function AdminLoginForm({ callbackUrl }: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email atau password salah.");
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="admin-email" className="text-xs font-semibold tracking-wider uppercase text-text-secondary">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@havetech.id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="h-12 w-full rounded-lg bg-surface-2 px-4 text-sm text-text-primary placeholder:text-text-secondary border-b-2 border-transparent focus:outline-none focus:border-gold transition disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="admin-password" className="text-xs font-semibold tracking-wider uppercase text-text-secondary">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className={`h-12 w-full rounded-lg bg-surface-2 px-4 text-sm text-text-primary placeholder:text-text-secondary border-b-2 ${
            error ? "border-destructive" : "border-transparent"
          } focus:outline-none focus:border-gold transition disabled:opacity-50`}
        />
        {error && (
          <p className="text-xs text-destructive mt-0.5">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full flex h-12 cursor-pointer items-center justify-center rounded-lg bg-gold px-5 text-sm font-semibold text-canvas transition hover:bg-gold-hover disabled:opacity-50"
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5 text-canvas" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          "Masuk"
        )}
      </button>
    </form>
  );
}

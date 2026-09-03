"use client";

import { useState } from "react";
import Link from "next/link";
import QrCodeModal from "./QrCodeModal";

export interface CardItem {
  id: string;
  publicToken: string;
  status: "UNASSIGNED" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";
  reviewUrl: string | null;
  createdAt: Date;
  activatedAt: Date | null;
  businessName: string | null;
  ownerEmail: string | null;
}

interface AdminCardTableProps {
  cards: CardItem[];
}

export default function AdminCardTable({ cards }: AdminCardTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedQrToken, setSelectedQrToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://havetech.web.id";

  // Filter cards based on search string and status filter
  const filteredCards = cards.filter((card) => {
    const matchSearch =
      card.publicToken.toLowerCase().includes(search.toLowerCase()) ||
      (card.businessName && card.businessName.toLowerCase().includes(search.toLowerCase())) ||
      (card.ownerEmail && card.ownerEmail.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === "ALL" || card.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const copyUrl = (token: string) => {
    const url = `${appUrl}/c/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-surface-1 p-4 rounded-xl border border-surface-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari Token, Bisnis, atau Email Owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-lg bg-surface-2 px-3.5 pl-9 text-xs text-text-primary placeholder:text-text-secondary border border-transparent focus:outline-none focus:border-gold transition"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg overflow-x-auto">
          {["ALL", "UNASSIGNED", "ACTIVE", "SUSPENDED", "ARCHIVED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? "bg-canvas text-gold shadow-sm font-bold"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-surface-2 overflow-hidden shadow-md bg-surface-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-2 bg-surface-2/60">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Token</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Bisnis</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Owner Email</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Aksi & Tool</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-2">
            {filteredCards.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-xs text-text-secondary">
                  Tidak ada kartu yang cocok dengan pencarian / filter.
                </td>
              </tr>
            ) : (
              filteredCards.map((card) => (
                <tr key={card.id} className="hover:bg-surface-2/40 transition">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-text-primary">
                    <Link href={`/admin/cards/${card.id}`} className="text-gold hover:underline">
                      {card.publicToken}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      card.status === "ACTIVE" ? "bg-gold/10 text-gold" :
                      card.status === "SUSPENDED" ? "bg-destructive/10 text-destructive" :
                      card.status === "UNASSIGNED" ? "bg-surface-2 text-text-secondary border border-surface-2" : "bg-surface-2 text-text-secondary"
                    }`}>
                      {card.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs truncate max-w-[140px]">
                    {card.businessName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs truncate max-w-[150px]">
                    {card.ownerEmail ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Copy Gateway URL */}
                      <button
                        onClick={() => copyUrl(card.publicToken)}
                        title="Copy Gateway URL for NFC"
                        className="rounded bg-surface-2 px-2 py-1 text-[11px] font-semibold text-text-secondary hover:text-gold hover:bg-surface-2/80 transition cursor-pointer"
                      >
                        {copiedToken === card.publicToken ? "✓ Copied" : "📋 Copy URL"}
                      </button>

                      {/* QR Code Modal Button */}
                      <button
                        onClick={() => setSelectedQrToken(card.publicToken)}
                        title="View / Download QR Code PNG"
                        className="rounded bg-surface-2 px-2 py-1 text-[11px] font-semibold text-text-secondary hover:text-gold hover:bg-surface-2/80 transition cursor-pointer"
                      >
                        🖼️ QR
                      </button>

                      {/* Open Gateway Test Link */}
                      <a
                        href={`/c/${card.publicToken}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Test Card Gateway Link"
                        className="rounded bg-surface-2 px-2 py-1 text-[11px] font-semibold text-text-secondary hover:text-gold transition"
                      >
                        🔗 Test
                      </a>

                      {/* Manage Detail */}
                      <Link
                        href={`/admin/cards/${card.id}`}
                        className="rounded bg-gold/10 px-2.5 py-1 text-[11px] font-semibold text-gold hover:bg-gold hover:text-canvas transition ml-1"
                      >
                        Detail →
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* QR Code Provisioning Modal */}
      {selectedQrToken && (
        <QrCodeModal
          publicToken={selectedQrToken}
          isOpen={!!selectedQrToken}
          onClose={() => setSelectedQrToken(null)}
        />
      )}
    </div>
  );
}

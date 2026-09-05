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

const PAGE_SIZE = 10;

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function AdminCardTable({ cards }: AdminCardTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [selectedQrToken, setSelectedQrToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const getDynamicAppUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
    }
    return "";
  };

  // Handlers that reset page to 1 on filter changes
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleDateFromChange = (val: string) => {
    setDateFrom(val);
    setCurrentPage(1);
  };

  const handleDateToChange = (val: string) => {
    setDateTo(val);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  // Date validation check
  const isDateInvalid = Boolean(
    dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)
  );

  // Filter Pipeline: Search -> Status -> Date Range
  const filteredCards = cards.filter((card) => {
    const matchSearch =
      card.publicToken.toLowerCase().includes(search.toLowerCase()) ||
      (card.businessName && card.businessName.toLowerCase().includes(search.toLowerCase())) ||
      (card.ownerEmail && card.ownerEmail.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === "ALL" || card.status === statusFilter;

    let matchDate = true;
    if (isDateInvalid) {
      matchDate = false;
    } else if (dateFrom || dateTo) {
      const cardDate = new Date(card.createdAt);
      if (dateFrom) {
        const fromBoundary = new Date(dateFrom + "T00:00:00");
        if (cardDate < fromBoundary) matchDate = false;
      }
      if (dateTo) {
        const toBoundary = new Date(dateTo + "T23:59:59.999");
        if (cardDate > toBoundary) matchDate = false;
      }
    }

    return matchSearch && matchStatus && matchDate;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCards.length / PAGE_SIZE);
  const activePage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
  const startIndex = (activePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const displayedCards = filteredCards.slice(startIndex, endIndex);

  const copyUrl = (token: string) => {
    const url = `${getDynamicAppUrl()}/c/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 bg-surface-1 p-4 rounded-xl border border-surface-2 shadow-sm">
        {/* Top Row: Search & Status Tabs */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari Token, Bisnis, atau Email Owner..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-10 rounded-lg bg-surface-2 px-3.5 pl-9 text-xs text-text-primary placeholder:text-text-secondary border border-transparent focus:outline-none focus:border-gold transition"
            />
            <svg className="absolute left-3 top-3 h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg overflow-x-auto max-w-full">
            {["ALL", "UNASSIGNED", "ACTIVE", "SUSPENDED", "ARCHIVED"].map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
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

        {/* Bottom Row: Date Filter & Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-surface-2/60 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-text-secondary whitespace-nowrap">Dari:</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="h-8 rounded-md bg-surface-2 px-2.5 text-xs text-text-primary border border-surface-2 focus:outline-none focus:border-gold transition cursor-pointer [color-scheme:dark]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-text-secondary whitespace-nowrap">Sampai:</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="h-8 rounded-md bg-surface-2 px-2.5 text-xs text-text-primary border border-surface-2 focus:outline-none focus:border-gold transition cursor-pointer [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Subtle Reset Action */}
          {(search || statusFilter !== "ALL" || dateFrom || dateTo) && (
            <button
              onClick={resetFilters}
              className="text-[11px] font-semibold text-gold hover:underline cursor-pointer flex items-center gap-1 self-end sm:self-auto"
            >
              <span>↺ Reset Filter</span>
            </button>
          )}
        </div>

        {/* Date Validation Notice */}
        {isDateInvalid && (
          <p className="text-[11px] text-destructive font-medium pt-1">
            ⚠️ Tanggal &quot;Dari&quot; tidak boleh lebih besar dari &quot;Sampai&quot;.
          </p>
        )}
      </div>

      {/* MOBILE VIEW (< md): Card List Layout */}
      <div className="flex flex-col gap-3 md:hidden">
        {filteredCards.length === 0 ? (
          <div className="rounded-xl border border-surface-2 bg-surface-1 p-8 text-center flex flex-col items-center justify-center gap-3">
            <p className="text-xs text-text-secondary font-medium">
              Tidak ada kartu yang sesuai dengan filter.
            </p>
            {(search || statusFilter !== "ALL" || dateFrom || dateTo) && (
              <button
                onClick={resetFilters}
                className="px-3.5 py-1.5 bg-surface-2 hover:bg-surface-2/80 text-gold rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          displayedCards.map((card) => (
            <div key={card.id} className="rounded-xl border border-surface-2 bg-surface-1 p-4 flex flex-col gap-3 shadow-sm">
              {/* Top Row: Token & Status */}
              <div className="flex items-center justify-between">
                <Link href={`/admin/cards/${card.id}`} className="font-mono text-xs font-bold text-gold hover:underline">
                  TOKEN: {card.publicToken}
                </Link>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  card.status === "ACTIVE" ? "bg-gold/10 text-gold" :
                  card.status === "SUSPENDED" ? "bg-destructive/10 text-destructive" :
                  card.status === "UNASSIGNED" ? "bg-surface-2 text-text-secondary border border-surface-2" : "bg-surface-2 text-text-secondary"
                }`}>
                  {card.status}
                </span>
              </div>

              {/* Middle Row: Business & Owner */}
              <div className="text-xs space-y-1 py-1 border-y border-surface-2/60">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Bisnis:</span>
                  <span className="font-semibold text-text-primary truncate max-w-[180px]">{card.businessName ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Owner:</span>
                  <span className="font-semibold text-text-primary truncate max-w-[180px]">{card.ownerEmail ?? "—"}</span>
                </div>
              </div>

              {/* Action Toolbar on Mobile */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {/* Copy URL */}
                <button
                  onClick={() => copyUrl(card.publicToken)}
                  className="flex h-9 items-center justify-center gap-1 rounded bg-surface-2 text-[10px] font-semibold text-text-primary hover:text-gold transition cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>{copiedToken === card.publicToken ? "✓ Copy" : "URL"}</span>
                </button>

                {/* QR Code Modal */}
                <button
                  onClick={() => setSelectedQrToken(card.publicToken)}
                  className="flex h-9 items-center justify-center gap-1 rounded bg-surface-2 text-[10px] font-semibold text-text-primary hover:text-gold transition cursor-pointer"
                >
                  <svg className="h-3.5 w-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-4v-3m-6 3h2m6 0h1m-4-7h3m-3 4h3m-6-4h.01M9 16h.01M9 12h.01M12 12h.01M15 12h.01M12 16h.01M15 16h.01M12 8h.01M15 8h.01M9 8h.01" />
                  </svg>
                  <span>QR</span>
                </button>

                {/* Gateway Test */}
                <a
                  href={`/c/${card.publicToken}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 items-center justify-center gap-1 rounded bg-surface-2 text-[10px] font-semibold text-text-primary hover:text-gold transition"
                >
                  <svg className="h-3.5 w-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Test</span>
                </a>

                {/* Manage Detail */}
                <Link
                  href={`/admin/cards/${card.id}`}
                  className="flex h-9 items-center justify-center gap-1 rounded bg-gold text-[10px] font-bold text-canvas transition hover:bg-gold-hover"
                >
                  <span>Detail →</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP VIEW (>= md): Horizontal Scrollable Table */}
      <div className="hidden md:block rounded-xl border border-surface-2 overflow-hidden shadow-md bg-surface-1 min-w-0">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm min-w-[700px]">
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
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <p className="text-xs text-text-secondary font-medium">
                        Tidak ada kartu yang cocok dengan filter.
                      </p>
                      {(search || statusFilter !== "ALL" || dateFrom || dateTo) && (
                        <button
                          onClick={resetFilters}
                          className="px-3.5 py-1.5 bg-surface-2 hover:bg-surface-2/80 text-gold rounded-lg text-xs font-semibold transition cursor-pointer"
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                displayedCards.map((card) => (
                  <tr key={card.id} className="hover:bg-surface-2/40 transition">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-text-primary">
                      <Link href={`/admin/cards/${card.id}`} className="text-gold hover:underline">
                        {card.publicToken}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
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
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Copy Gateway URL */}
                        <button
                          onClick={() => copyUrl(card.publicToken)}
                          title="Salin Gateway URL ke Clipboard"
                          className="flex items-center gap-1.5 rounded bg-surface-2 px-2.5 py-1.5 text-[11px] font-semibold text-text-primary hover:text-gold hover:bg-surface-2/80 transition cursor-pointer"
                        >
                          <svg className="h-3.5 w-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          <span>{copiedToken === card.publicToken ? "✓ Tersalin" : "Copy URL"}</span>
                        </button>

                        {/* QR Code Modal Button */}
                        <button
                          onClick={() => setSelectedQrToken(card.publicToken)}
                          title="Lihat / Download QR Code PNG"
                          className="flex items-center gap-1.5 rounded bg-surface-2 px-2.5 py-1.5 text-[11px] font-semibold text-text-primary hover:text-gold hover:bg-surface-2/80 transition cursor-pointer"
                        >
                          <svg className="h-3.5 w-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-4v-3m-6 3h2m6 0h1m-4-7h3m-3 4h3m-6-4h.01M9 16h.01M9 12h.01M12 12h.01M15 12h.01M12 16h.01M15 16h.01M12 8h.01M15 8h.01M9 8h.01" />
                          </svg>
                          <span>QR Code</span>
                        </button>

                        {/* Open Gateway Test Link */}
                        <a
                          href={`/c/${card.publicToken}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Tes Link Gateway Kartu"
                          className="flex items-center gap-1.5 rounded bg-surface-2 px-2.5 py-1.5 text-[11px] font-semibold text-text-primary hover:text-gold transition"
                        >
                          <svg className="h-3.5 w-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span>Tes Link</span>
                        </a>

                        {/* Manage Detail */}
                        <Link
                          href={`/admin/cards/${card.id}`}
                          className="flex items-center gap-1 rounded bg-gold px-3 py-1.5 text-[11px] font-bold text-canvas transition hover:bg-gold-hover ml-1"
                        >
                          <span>Detail</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION TOOLBAR (Hidden if total cards <= 10) */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-surface-2 bg-surface-1 text-xs shadow-sm">
          <span className="text-text-secondary text-[11px]">
            Menampilkan <strong className="text-text-primary">{startIndex + 1}</strong>–
            <strong className="text-text-primary">{Math.min(endIndex, filteredCards.length)}</strong> dari{" "}
            <strong className="text-gold">{filteredCards.length}</strong> kartu
          </span>

          <div className="flex items-center gap-1.5">
            {/* Previous Page Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={activePage === 1}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activePage === 1
                  ? "opacity-40 cursor-not-allowed text-text-secondary bg-surface-2"
                  : "bg-surface-2 text-text-primary hover:text-gold hover:bg-surface-2/80"
              }`}
            >
              ← Previous
            </button>

            {/* Compact Page Number Buttons */}
            <div className="flex items-center gap-1">
              {getPageNumbers(activePage, totalPages).map((num, idx) =>
                typeof num === "number" ? (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(num)}
                    className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activePage === num
                        ? "bg-gold text-canvas font-bold shadow-sm"
                        : "bg-surface-2 text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {num}
                  </button>
                ) : (
                  <span key={idx} className="px-1 text-text-secondary font-mono">
                    {num}
                  </span>
                )
              )}
            </div>

            {/* Next Page Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={activePage === totalPages}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activePage === totalPages
                  ? "opacity-40 cursor-not-allowed text-text-secondary bg-surface-2"
                  : "bg-surface-2 text-text-primary hover:text-gold hover:bg-surface-2/80"
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      )}

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

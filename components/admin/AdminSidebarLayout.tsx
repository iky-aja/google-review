"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarLayoutProps {
  children: React.ReactNode;
  userEmail?: string;
  onSignOut: () => Promise<void>;
}

export default function AdminSidebarLayout({
  children,
  userEmail = "admin@havetech.id",
  onSignOut,
}: AdminSidebarLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      label: "Beranda Overview",
      href: "/admin",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: "Tambah Produk (Batch)",
      href: "/admin/generate",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      label: "Riwayat Kartu",
      href: "/admin/cards",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      label: "Pengaturan Platform",
      href: "/admin/settings",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-text-primary selection:bg-gold selection:text-canvas flex flex-col md:flex-row">
      {/* Mobile Top Navbar Header */}
      <header className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-2 bg-canvas/90 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg bg-surface-1 p-2 text-text-secondary hover:text-text-primary border border-surface-2 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-extrabold tracking-widest text-gold">HAVE TECH</span>
        </div>
        <span className="rounded bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold uppercase tracking-wider">
          Admin Portal
        </span>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden animate-fade-in"
        />
      )}

      {/* Desktop Persistent Sidebar & Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-surface-2 bg-surface-1 transition-transform duration-300 md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-surface-2 px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-widest text-gold">HAVE TECH</span>
            <span className="rounded bg-gold/10 px-1.5 py-0.5 text-[9px] font-extrabold text-gold uppercase">
              ADMIN
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-text-secondary hover:text-text-primary p-1"
          >
            ✕
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-3">
            Menu Utama
          </p>
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-gold text-canvas font-bold shadow-md"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Sign Out Footer */}
        <div className="border-t border-surface-2 p-4 bg-canvas/30">
          <div className="mb-3 rounded-lg bg-surface-2 p-2.5 text-xs border border-surface-2">
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Logged in as</p>
            <p className="font-bold text-text-primary truncate mt-0.5">{userEmail}</p>
          </div>

          <form action={onSignOut}>
            <button
              type="submit"
              className="w-full flex h-9 items-center justify-center gap-2 rounded-lg bg-destructive/10 border border-destructive/30 px-3 text-xs font-bold text-destructive transition hover:bg-destructive hover:text-white cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout Admin
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

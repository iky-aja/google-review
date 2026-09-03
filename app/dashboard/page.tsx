import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOwnerAnalytics } from "@/lib/analytics";
import DigitalTwin from "@/components/DigitalTwin";

export const metadata = {
  title: "Owner Dashboard — Have Tech",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Fetch owner's cards via their businesses
  const ownerBusinesses = await db.query.businesses.findMany({
    where: eq(businesses.ownerId, session.user.id),
    with: { cards: true },
  });

  const ownerCards = ownerBusinesses.flatMap((b) =>
    b.cards.map((c) => ({ ...c, businessName: b.name }))
  );

  const analytics = await getOwnerAnalytics(session.user.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://havetech.web.id";

  return (
    <div className="min-h-screen bg-canvas text-text-primary selection:bg-gold selection:text-canvas">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-surface-2 bg-canvas/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold tracking-widest text-gold">HAVE TECH</span>
            <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Owner Portal</span>
          </div>
          <nav className="flex items-center gap-6 text-xs">
            <Link href="/dashboard" className="font-bold text-text-primary">Dashboard</Link>
            <Link href="/cards" className="text-text-secondary hover:text-text-primary transition">Kartu Saya</Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="text-destructive hover:underline font-semibold cursor-pointer"
              >
                Keluar
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Hero Metric */}
        <section className="mb-10">
          <p className="text-xs font-bold tracking-widest uppercase text-text-secondary">
            Total Tap Pelanggan
          </p>
          <p className="mt-1 text-7xl font-extrabold tracking-tight text-text-primary tabular-nums">
            {analytics.totalTaps.toLocaleString("id-ID")}
          </p>

          {/* Secondary Metrics */}
          <div className="mt-6 flex gap-8 border-t border-surface-2 pt-6">
            {[
              { label: "Hari Ini", value: analytics.todayTaps },
              { label: "Minggu Ini", value: analytics.weekTaps },
              { label: "Bulan Ini", value: analytics.monthTaps },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">{label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {value.toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Cards Overview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Kartu Aktif Anda</h2>
            <Link href="/cards" className="text-xs text-gold hover:underline font-semibold">Lihat semua →</Link>
          </div>

          {ownerCards.length === 0 ? (
            <div className="rounded-xl border border-surface-2 bg-surface-1 p-10 text-center text-sm text-text-secondary shadow-sm">
              Belum ada kartu yang diaktifkan di akun ini. Tap kartu fisik Have Tech Anda untuk mulai mengaktifkan!
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ownerCards.map((card) => (
                <Link key={card.id} href={`/cards/${card.id}`} className="group block">
                  <div className="flex flex-col gap-3 rounded-xl border border-surface-2 bg-surface-1 p-4 transition hover:border-gold/40 shadow-sm">
                    <DigitalTwin
                      publicToken={card.publicToken}
                      appUrl={appUrl}
                      status={card.status}
                      businessName={card.businessName}
                    />
                    <div className="mt-1">
                      <p className="text-sm font-bold truncate text-text-primary">{card.businessName}</p>
                      <p className="text-xs font-mono text-gold font-semibold">{card.publicToken}</p>
                    </div>
                    <button className="mt-1 w-full rounded-lg border border-surface-2 py-2 text-xs font-semibold text-text-secondary transition group-hover:border-gold/40 group-hover:text-gold cursor-pointer">
                      Kelola Link Review →
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

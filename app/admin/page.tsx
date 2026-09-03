import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { cards, tapLogs } from "@/db/schema";
import { desc, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminSidebarLayout from "@/components/admin/AdminSidebarLayout";
import AdminCardTable, { CardItem } from "@/components/admin/AdminCardTable";

export const metadata = { title: "Beranda Overview — Admin — Have Tech" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/login?callbackUrl=/admin");

  const handleSignOut = async () => {
    "use server";
    await signOut({ redirectTo: "/login?callbackUrl=/admin" });
  };

  const [allCardsDb, totalTapCount] = await Promise.all([
    db.query.cards.findMany({
      orderBy: [desc(cards.createdAt)],
      with: {
        business: {
          with: { owner: true },
        },
      },
    }),
    db.select({ value: count() }).from(tapLogs),
  ]);

  const cardsList: CardItem[] = allCardsDb.map((c) => ({
    id: c.id,
    publicToken: c.publicToken,
    status: c.status,
    reviewUrl: c.reviewUrl,
    createdAt: c.createdAt,
    activatedAt: c.activatedAt,
    businessName: c.business?.name ?? null,
    ownerEmail: c.business?.owner?.email ?? null,
  }));

  const totalCards = cardsList.length;
  const activeCards = cardsList.filter((c) => c.status === "ACTIVE").length;
  const unassignedCards = cardsList.filter((c) => c.status === "UNASSIGNED").length;
  const suspendedCards = cardsList.filter((c) => c.status === "SUSPENDED").length;
  const totalTaps = Number(totalTapCount[0]?.value ?? 0);

  return (
    <AdminSidebarLayout userEmail={session.user.email ?? "admin@havetech.id"} onSignOut={handleSignOut}>
      <div className="flex flex-col gap-8">
        {/* Header Title */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Beranda Overview</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Dashboard analitik sistem & pengelolaan status kartu pintar fisik Have Tech.
            </p>
          </div>
          <div className="flex gap-2 mt-3 sm:mt-0">
            <Link
              href="/admin/generate"
              className="rounded-lg bg-gold px-3.5 py-2 text-xs font-semibold text-canvas transition hover:bg-gold-hover shadow-sm"
            >
              + Tambah Kartu Baru
            </Link>
            <a
              href="/api/admin/cards/export"
              className="rounded-lg border border-surface-2 bg-surface-1 px-3.5 py-2 text-xs font-semibold text-text-primary transition hover:bg-surface-2"
            >
              Export CSV ↓
            </a>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-xl border border-surface-2 bg-surface-1 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Total Kartu</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{totalCards}</p>
            <span className="text-[10px] text-text-secondary mt-1 block">Tersimpan di DB</span>
          </div>

          <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gold">Kartu Active</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-gold">{activeCards}</p>
            <span className="text-[10px] text-gold/80 mt-1 block">Sudah dihubungkan</span>
          </div>

          <div className="rounded-xl border border-surface-2 bg-surface-1 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Unassigned</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{unassignedCards}</p>
            <span className="text-[10px] text-text-secondary mt-1 block">Siap diaktivasi</span>
          </div>

          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-destructive">Suspended</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-destructive">{suspendedCards}</p>
            <span className="text-[10px] text-destructive/80 mt-1 block">Ditangguhkan</span>
          </div>

          <div className="col-span-2 lg:col-span-1 rounded-xl border border-surface-2 bg-surface-1 p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Total Tap System</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-text-primary">{totalTaps.toLocaleString("id-ID")}</p>
            <span className="text-[10px] text-text-secondary mt-1 block">Akumulasi HTTP 302</span>
          </div>
        </section>

        {/* Interactive Cards Table with Search & Filter Tabs */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary">
              Kelola Kartu & Quick Actions
            </h2>
            <Link href="/admin/cards" className="text-xs font-semibold text-gold hover:underline">
              Lihat Semua Kartu →
            </Link>
          </div>

          <AdminCardTable cards={cardsList} />
        </section>
      </div>
    </AdminSidebarLayout>
  );
}

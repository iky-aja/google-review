import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import GenerateCardsForm from "@/components/admin/GenerateCardsForm";
import AdminCardTable, { CardItem } from "@/components/admin/AdminCardTable";

export const metadata = { title: "Admin Portal — Have Tech" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/login?callbackUrl=/admin");

  const allCardsDb = await db.query.cards.findMany({
    orderBy: [desc(cards.createdAt)],
    with: {
      business: {
        with: { owner: true },
      },
    },
  });

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

  return (
    <div className="min-h-screen bg-canvas text-text-primary selection:bg-gold selection:text-canvas">
      {/* Admin Header */}
      <header className="sticky top-0 z-20 border-b border-surface-2 bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold tracking-widest text-gold">HAVE TECH</span>
            <span className="rounded bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold uppercase tracking-wider">
              Admin Portal
            </span>
          </div>
          <nav className="flex items-center gap-6 text-xs">
            <Link href="/admin" className="font-bold text-text-primary">Dashboard</Link>
            <a href="/api/admin/cards/export" className="text-gold font-semibold hover:underline">
              Export CSV ↓
            </a>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login?callbackUrl=/admin" });
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

      <main className="mx-auto max-w-6xl px-6 py-8 flex flex-col gap-8">
        {/* Overview Stats */}
        <section>
          <div className="mb-4">
            <h1 className="text-2xl font-extrabold tracking-tight">Admin Overview</h1>
            <p className="text-xs text-text-secondary mt-1">
              Pusat pengelolaan batch kartu fisik NFC/QR Code, status klaim, dan destination review link.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total Kartu", value: totalCards, bg: "border-surface-2" },
              { label: "Active", value: activeCards, bg: "border-gold/30 text-gold" },
              { label: "Unassigned", value: unassignedCards, bg: "border-surface-2" },
              { label: "Suspended", value: suspendedCards, bg: "border-destructive/30 text-destructive" },
            ].map(({ label, value, bg }) => (
              <div key={label} className={`rounded-xl border bg-surface-1 px-5 py-4 shadow-sm ${bg}`}>
                <p className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold">{label}</p>
                <p className="mt-1 text-3xl font-extrabold tabular-nums">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Batch Card Generator */}
        <section className="rounded-xl border border-surface-2 bg-surface-1 p-6 shadow-md">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gold mb-3">
            + Batch Card Generator
          </h2>
          <p className="text-xs text-text-secondary mb-4">
            Generate N kartu baru dengan public token acak (8 karakter aman kriptografis).
          </p>
          <GenerateCardsForm />
        </section>

        {/* Interactive Cards Table with Search & Filter */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary">
              Pusat Pengelolaan Kartu (CRUD)
            </h2>
            <span className="text-xs text-text-secondary font-mono">
              Total {filteredCardsCount(cardsList)} kartu terdaftar
            </span>
          </div>

          <AdminCardTable cards={cardsList} />
        </section>
      </main>
    </div>
  );
}

function filteredCardsCount(cards: CardItem[]) {
  return cards.length;
}

import { auth } from "@/auth";
import { db } from "@/db";
import { businesses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Cards — Have Tech" };

export default async function CardsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ownerBusinesses = await db.query.businesses.findMany({
    where: eq(businesses.ownerId, session.user.id),
    with: { cards: true },
  });

  const ownerCards = ownerBusinesses.flatMap((b) =>
    b.cards.map((c) => ({ ...c, businessName: b.name }))
  );

  const statusColor: Record<string, string> = {
    ACTIVE: "text-gold",
    SUSPENDED: "text-destructive",
    UNASSIGNED: "text-text-secondary",
    ARCHIVED: "text-text-secondary",
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <header className="sticky top-0 z-10 border-b border-surface-2 bg-canvas/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <span className="text-sm font-bold tracking-widest text-gold">HAVE TECH</span>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition">Dashboard</Link>
            <Link href="/cards" className="font-semibold text-text-primary">Cards</Link>
            <Link href="/settings" className="text-text-secondary hover:text-text-primary transition">Settings</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-2xl font-extrabold tracking-tight mb-8">Kartu Saya</h1>

        {ownerCards.length === 0 ? (
          <div className="rounded-xl border border-surface-2 bg-surface-1 p-16 text-center text-sm text-text-secondary">
            Belum ada kartu aktif. Tap kartu fisik Have Tech untuk mulai.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {ownerCards.map((card) => (
              <Link
                key={card.id}
                href={`/cards/${card.id}`}
                className="flex items-center justify-between rounded-xl border border-surface-2 bg-surface-1 px-5 py-4 transition hover:border-gold/40"
              >
                <div>
                  <p className="font-semibold">{card.businessName}</p>
                  <p className="text-xs font-mono text-text-secondary mt-0.5">{card.publicToken}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${statusColor[card.status]}`}>
                    {card.status}
                  </span>
                  <span className="text-text-secondary text-sm">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import { auth } from "@/auth";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "All Cards — Admin — Have Tech" };

export default async function AdminCardsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  const allCards = await db.query.cards.findMany({
    orderBy: [desc(cards.createdAt)],
    with: {
      business: {
        with: { owner: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <header className="sticky top-0 z-10 border-b border-surface-2 bg-canvas/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="text-sm text-text-secondary hover:text-text-primary transition">
            ← Admin
          </Link>
          <span className="text-sm font-bold tracking-widest text-gold">HAVE TECH</span>
          <a
            href="/api/admin/cards/export"
            className="text-xs text-gold hover:underline"
          >
            Export CSV
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-extrabold tracking-tight mb-6">
          All Cards ({allCards.length})
        </h1>

        <div className="rounded-xl border border-surface-2 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-2 bg-surface-1">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Token</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">Business</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary hidden md:table-cell">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary hidden lg:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-2">
              {allCards.map((card) => (
                <tr key={card.id} className="hover:bg-surface-1 transition">
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link href={`/admin/cards/${card.id}`} className="text-gold hover:underline">
                      {card.publicToken}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold uppercase ${
                      card.status === "ACTIVE" ? "text-gold" :
                      card.status === "SUSPENDED" ? "text-destructive" : "text-text-secondary"
                    }`}>
                      {card.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs">
                    {card.business?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs hidden md:table-cell truncate max-w-[180px]">
                    {card.business?.owner?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs hidden lg:table-cell">
                    {card.createdAt.toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

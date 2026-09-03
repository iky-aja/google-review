import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminSidebarLayout from "@/components/admin/AdminSidebarLayout";
import AdminCardTable, { CardItem } from "@/components/admin/AdminCardTable";

export const metadata = { title: "Riwayat Kartu — Admin — Have Tech" };

export default async function AdminCardsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/login?callbackUrl=/admin");

  const handleSignOut = async () => {
    "use server";
    await signOut({ redirectTo: "/login?callbackUrl=/admin" });
  };

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

  return (
    <AdminSidebarLayout userEmail={session.user.email ?? "admin@havetech.id"} onSignOut={handleSignOut}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Riwayat & Daftar Seluruh Kartu</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Total {cardsList.length} kartu terdaftar. Kelola detail, status, dan salin URL / QR Code.
            </p>
          </div>

          <div className="flex gap-2 mt-3 sm:mt-0">
            <Link
              href="/admin/generate"
              className="rounded-lg bg-gold px-3.5 py-2 text-xs font-semibold text-canvas transition hover:bg-gold-hover shadow-sm"
            >
              + Tambah Kartu
            </Link>
            <a
              href="/api/admin/cards/export"
              className="rounded-lg border border-surface-2 bg-surface-1 px-3.5 py-2 text-xs font-semibold text-text-primary transition hover:bg-surface-2"
            >
              Export CSV ↓
            </a>
          </div>
        </div>

        {/* Interactive Cards Table */}
        <AdminCardTable cards={cardsList} />
      </div>
    </AdminSidebarLayout>
  );
}

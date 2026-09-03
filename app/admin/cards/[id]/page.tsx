import { auth } from "@/auth";
import { db } from "@/db";
import { cards, businesses, auditLogs, tapLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import DigitalTwin from "@/components/DigitalTwin";
import { getCardAnalytics } from "@/lib/analytics";
import { validateReviewUrl } from "@/lib/card-utils";
import EditUrlForm from "@/components/EditUrlForm";
import CopyButton from "@/components/CopyButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCardDetailPage(props: PageProps) {
  const { id } = await props.params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/login?callbackUrl=/admin");

  const card = await db.query.cards.findFirst({
    where: eq(cards.id, id),
    with: { business: { with: { owner: true } } },
  });
  if (!card) notFound();

  const logs = await db.query.auditLogs.findMany({
    where: eq(auditLogs.cardId, id),
    orderBy: [desc(auditLogs.createdAt)],
    with: { user: true },
    limit: 30,
  });

  const analytics = await getCardAnalytics(card.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://havetech.web.id";
  const cardGatewayUrl = `${appUrl}/c/${card.publicToken}`;

  // Admin Actions
  const updateCardDetails = async (formData: FormData) => {
    "use server";
    const s = await auth();
    if (!s?.user?.id || s.user.role !== "admin") return;

    const newUrl = (formData.get("reviewUrl") as string)?.trim();
    const newBizName = (formData.get("businessName") as string)?.trim();

    if (newUrl) {
      const err = validateReviewUrl(newUrl);
      if (err) return;
      await db.update(cards)
        .set({ reviewUrl: newUrl, updatedAt: new Date() })
        .where(eq(cards.id, id));
    }

    if (newBizName && card.businessId) {
      await db.update(businesses)
        .set({ name: newBizName, updatedAt: new Date() })
        .where(eq(businesses.id, card.businessId));
    }

    await db.insert(auditLogs).values({
      cardId: id,
      userId: s.user.id,
      action: "ADMIN_UPDATED_DETAILS",
    });

    revalidatePath(`/admin/cards/${id}`);
  };

  const suspendCard = async () => {
    "use server";
    const s = await auth();
    if (!s?.user?.id || s.user.role !== "admin") return;
    await db.update(cards).set({ status: "SUSPENDED", updatedAt: new Date() }).where(eq(cards.id, id));
    await db.insert(auditLogs).values({ cardId: id, userId: s.user.id, action: "SUSPENDED" });
    revalidatePath(`/admin/cards/${id}`);
  };

  const reactivateCard = async () => {
    "use server";
    const s = await auth();
    if (!s?.user?.id || s.user.role !== "admin") return;
    await db.update(cards).set({ status: "ACTIVE", updatedAt: new Date() }).where(eq(cards.id, id));
    await db.insert(auditLogs).values({ cardId: id, userId: s.user.id, action: "REACTIVATED" });
    revalidatePath(`/admin/cards/${id}`);
  };

  const archiveCard = async () => {
    "use server";
    const s = await auth();
    if (!s?.user?.id || s.user.role !== "admin") return;
    await db.update(cards).set({ status: "ARCHIVED", updatedAt: new Date() }).where(eq(cards.id, id));
    await db.insert(auditLogs).values({ cardId: id, userId: s.user.id, action: "ARCHIVED" });
    revalidatePath(`/admin/cards/${id}`);
  };

  const deleteCard = async () => {
    "use server";
    const s = await auth();
    if (!s?.user?.id || s.user.role !== "admin") return;
    await db.delete(cards).where(eq(cards.id, id));
    redirect("/admin");
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary selection:bg-gold selection:text-canvas">
      <header className="sticky top-0 z-10 border-b border-surface-2 bg-canvas/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="text-xs font-semibold text-text-secondary hover:text-text-primary transition">
            ← Kembali ke Dashboard Admin
          </Link>
          <span className="text-xs font-extrabold tracking-widest text-gold uppercase">HAVE TECH</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 flex flex-col gap-8">
        {/* Digital Twin Card Visual */}
        <div className="flex justify-center py-2">
          <DigitalTwin
            publicToken={card.publicToken}
            appUrl={appUrl}
            status={card.status}
            businessName={card.business?.name ?? "UNASSIGNED"}
          />
        </div>

        {/* Public Gateway Info */}
        <div className="rounded-xl border border-surface-2 bg-surface-1 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Public Gateway URL</span>
              <h2 className="text-xl font-mono font-extrabold text-gold mt-0.5">{card.publicToken}</h2>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
              card.status === "ACTIVE" ? "bg-gold/10 text-gold" :
              card.status === "SUSPENDED" ? "bg-destructive/10 text-destructive" :
              "bg-surface-2 text-text-secondary"
            }`}>
              {card.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-surface-2 px-3 py-2 text-xs font-mono text-text-primary">
              {cardGatewayUrl}
            </code>
            <CopyButton text={cardGatewayUrl} />
            <a
              href={`/c/${card.publicToken}`}
              target="_blank"
              rel="noreferrer"
              className="rounded bg-gold px-3 py-2 text-xs font-semibold text-canvas hover:bg-gold-hover transition"
            >
              Tes Gateway ↗
            </a>
          </div>
        </div>

        {/* Tap Analytics */}
        <div className="rounded-xl border border-surface-2 bg-surface-1 p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4">Tap Analytics Counter</p>
          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { label: "Total Taps", value: analytics.totalTaps },
              { label: "Hari Ini", value: analytics.todayTaps },
              { label: "Minggu Ini", value: analytics.weekTaps },
              { label: "Bulan Ini", value: analytics.monthTaps },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-surface-2/60 p-3">
                <p className="text-[10px] uppercase text-text-secondary font-semibold">{label}</p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums">{value.toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Business & Review URL Info */}
        <div className="rounded-xl border border-surface-2 bg-surface-1 p-5 shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gold">Informasi Pemilik & Bisnis</h3>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-text-secondary block">Nama Bisnis</span>
              <span className="font-semibold text-text-primary text-sm">{card.business?.name ?? "— Belum Diklaim —"}</span>
            </div>
            <div>
              <span className="text-text-secondary block">Owner Email</span>
              <span className="font-semibold text-text-primary text-sm">{card.business?.owner?.email ?? "— Belum Diklaim —"}</span>
            </div>
          </div>

          {/* Admin Edit Review URL */}
          <div className="border-t border-surface-2 pt-4">
            <p className="text-xs font-semibold text-text-secondary mb-2">Edit Review Destination URL (Admin Direct)</p>
            <EditUrlForm currentUrl={card.reviewUrl ?? ""} onSubmit={updateCardDetails} />
          </div>
        </div>

        {/* Status Control Actions */}
        <div className="rounded-xl border border-surface-2 bg-surface-1 p-5 shadow-sm flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-1">Kontrol Status Kartu (Admin)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {card.status === "ACTIVE" && (
              <form action={suspendCard}>
                <button type="submit" className="w-full rounded-lg border border-destructive/40 py-2.5 text-xs font-bold text-destructive transition hover:bg-destructive hover:text-white cursor-pointer">
                  Suspend Kartu
                </button>
              </form>
            )}
            {card.status === "SUSPENDED" && (
              <form action={reactivateCard}>
                <button type="submit" className="w-full rounded-lg bg-gold py-2.5 text-xs font-bold text-canvas transition hover:bg-gold-hover cursor-pointer">
                  Reactivate Kartu
                </button>
              </form>
            )}
            {card.status !== "ARCHIVED" && (
              <form action={archiveCard}>
                <button type="submit" className="w-full rounded-lg border border-surface-2 py-2.5 text-xs font-bold text-text-secondary transition hover:border-destructive/40 hover:text-destructive cursor-pointer">
                  Archive Kartu
                </button>
              </form>
            )}
            <form action={deleteCard}>
              <button type="submit" className="w-full rounded-lg bg-destructive/10 border border-destructive/30 py-2.5 text-xs font-bold text-destructive transition hover:bg-destructive hover:text-white cursor-pointer">
                Hapus Kartu (Delete)
              </button>
            </form>
          </div>
        </div>

        {/* Audit Log Timeline */}
        <div className="rounded-xl border border-surface-2 bg-surface-1 p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4">Audit Log Timeline</h3>
          <div className="flex flex-col gap-2">
            {logs.length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-4">Belum ada log aktivitas.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg bg-surface-2/60 px-4 py-2.5 text-xs border border-surface-2">
                  <div>
                    <span className="font-mono font-bold text-gold">{log.action}</span>
                    {log.user && <span className="ml-2 text-text-secondary">oleh {log.user.email}</span>}
                  </div>
                  <span className="text-text-secondary text-[11px]">
                    {new Date(log.createdAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

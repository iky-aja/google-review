import { auth } from "@/auth";
import { db } from "@/db";
import { cards, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import DigitalTwin from "@/components/DigitalTwin";
import { getCardAnalytics } from "@/lib/analytics";
import { validateReviewUrl } from "@/lib/card-utils";
import EditUrlForm from "@/components/EditUrlForm";
import CopyButton from "@/components/CopyButton";

export const metadata = { title: "Manage Card — Have Tech" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CardDetailPage(props: PageProps) {
  const { id } = await props.params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // IDOR protection on page render
  const card = await db.query.cards.findFirst({
    where: eq(cards.id, id),
    with: { business: true },
  });

  if (!card) notFound();
  if (!card.business || card.business.ownerId !== session.user.id) notFound();

  const analytics = await getCardAnalytics(card.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://havetech.web.id";
  const cardUrl = `${appUrl}/c/${card.publicToken}`;

  const canSuspend = card.status === "ACTIVE";
  const canReactivate = card.status === "SUSPENDED";

  // Helper for server-side ownership authorization in Server Actions
  const verifyOwnership = async (userId: string) => {
    const targetCard = await db.query.cards.findFirst({
      where: eq(cards.id, id),
      with: { business: true },
    });
    if (!targetCard || !targetCard.business || targetCard.business.ownerId !== userId) {
      return null;
    }
    return targetCard;
  };

  // Server Actions with Server-Side IDOR protection
  const updateReviewUrl = async (formData: FormData) => {
    "use server";
    const s = await auth();
    if (!s?.user?.id) return;

    const ownedCard = await verifyOwnership(s.user.id);
    if (!ownedCard) return;

    const newUrl = formData.get("reviewUrl") as string;
    const err = validateReviewUrl(newUrl);
    if (err) return;

    await db.update(cards)
      .set({ reviewUrl: newUrl.trim(), updatedAt: new Date() })
      .where(eq(cards.id, id));

    await db.insert(auditLogs).values({
      cardId: id,
      userId: s.user.id,
      action: "URL_UPDATED",
    });
    revalidatePath(`/cards/${id}`);
  };

  const suspendCard = async () => {
    "use server";
    const s = await auth();
    if (!s?.user?.id) return;

    const ownedCard = await verifyOwnership(s.user.id);
    if (!ownedCard) return;

    await db.update(cards)
      .set({ status: "SUSPENDED", updatedAt: new Date() })
      .where(eq(cards.id, id));

    await db.insert(auditLogs).values({
      cardId: id,
      userId: s.user.id,
      action: "SUSPENDED",
    });
    revalidatePath(`/cards/${id}`);
  };

  const reactivateCard = async () => {
    "use server";
    const s = await auth();
    if (!s?.user?.id) return;

    const ownedCard = await verifyOwnership(s.user.id);
    if (!ownedCard) return;

    await db.update(cards)
      .set({ status: "ACTIVE", updatedAt: new Date() })
      .where(eq(cards.id, id));

    await db.insert(auditLogs).values({
      cardId: id,
      userId: s.user.id,
      action: "REACTIVATED",
    });
    revalidatePath(`/cards/${id}`);
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <header className="sticky top-0 z-10 border-b border-surface-2 bg-canvas/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-xl items-center justify-between px-6 py-4">
          <Link href="/cards" className="text-sm text-text-secondary hover:text-text-primary transition">
            ← Back
          </Link>
          <span className="text-sm font-bold tracking-widest text-gold">HAVE TECH</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 py-10 flex flex-col gap-8">
        {/* Digital Twin */}
        <div className="flex justify-center">
          <DigitalTwin
            publicToken={card.publicToken}
            appUrl={appUrl}
            status={card.status}
            businessName={card.business.name}
          />
        </div>

        {/* Card Status */}
        <div className="rounded-xl border border-surface-2 bg-surface-1 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1">Status</p>
          <p className={`font-bold text-lg ${card.status === "ACTIVE" ? "text-gold" : "text-destructive"}`}>
            {card.status}
          </p>
        </div>

        {/* Analytics */}
        <div className="rounded-xl border border-surface-2 bg-surface-1 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-4">Analytics</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total", value: analytics.totalTaps },
              { label: "Today", value: analytics.todayTaps },
              { label: "This Week", value: analytics.weekTaps },
              { label: "This Month", value: analytics.monthTaps },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-text-secondary">{label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{value.toLocaleString("id-ID")}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Public URL */}
        <div className="rounded-xl border border-surface-2 bg-surface-1 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-2">Public URL</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded bg-surface-2 px-3 py-2 text-xs font-mono text-text-primary">
              {cardUrl}
            </code>
            <CopyButton text={cardUrl} />
          </div>
        </div>

        {/* Edit Review URL */}
        {card.status !== "ARCHIVED" && (
          <div className="rounded-xl border border-surface-2 bg-surface-1 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-3">
              Review Destination
            </p>
            <EditUrlForm currentUrl={card.reviewUrl ?? ""} onSubmit={updateReviewUrl} />
          </div>
        )}

        {/* Actions */}
        {card.status !== "ARCHIVED" && (
          <div className="flex flex-col gap-3">
            {canSuspend && (
              <form action={suspendCard}>
                <button
                  type="submit"
                  className="w-full rounded-lg border border-destructive/40 py-3 text-sm font-semibold text-destructive transition hover:bg-destructive hover:text-white"
                >
                  Suspend Card
                </button>
              </form>
            )}
            {canReactivate && (
              <form action={reactivateCard}>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-gold py-3 text-sm font-semibold text-canvas transition hover:bg-gold-hover"
                >
                  Reactivate Card
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

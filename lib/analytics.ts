import { db } from "@/db";
import { businesses, tapLogs } from "@/db/schema";
import { eq, and, gte, count } from "drizzle-orm";

/**
 * Returns analytics for a specific card:
 * - totalTaps
 * - todayTaps   (UTC+7 / WIB)
 * - weekTaps    (UTC+7 / WIB, last 7 days)
 * - monthTaps   (UTC+7 / WIB, current calendar month)
 */
export async function getCardAnalytics(cardId: string) {
  // UTC+7 offset: shift now by +7 hours to get "local midnight" in UTC
  const now = new Date();
  const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
  const nowWIB = new Date(now.getTime() + WIB_OFFSET_MS);

  // Today midnight WIB expressed as UTC
  const todayWIB = new Date(
    Date.UTC(nowWIB.getUTCFullYear(), nowWIB.getUTCMonth(), nowWIB.getUTCDate())
  );
  const todayUTC = new Date(todayWIB.getTime() - WIB_OFFSET_MS);

  // 7 days ago
  const weekAgoUTC = new Date(todayUTC.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Start of current month WIB expressed as UTC
  const monthStartWIB = new Date(
    Date.UTC(nowWIB.getUTCFullYear(), nowWIB.getUTCMonth(), 1)
  );
  const monthStartUTC = new Date(monthStartWIB.getTime() - WIB_OFFSET_MS);

  const [total, today, week, month] = await Promise.all([
    db.select({ value: count() }).from(tapLogs).where(eq(tapLogs.cardId, cardId)),
    db.select({ value: count() }).from(tapLogs).where(
      and(eq(tapLogs.cardId, cardId), gte(tapLogs.createdAt, todayUTC))
    ),
    db.select({ value: count() }).from(tapLogs).where(
      and(eq(tapLogs.cardId, cardId), gte(tapLogs.createdAt, weekAgoUTC))
    ),
    db.select({ value: count() }).from(tapLogs).where(
      and(eq(tapLogs.cardId, cardId), gte(tapLogs.createdAt, monthStartUTC))
    ),
  ]);

  return {
    totalTaps: Number(total[0]?.value ?? 0),
    todayTaps: Number(today[0]?.value ?? 0),
    weekTaps: Number(week[0]?.value ?? 0),
    monthTaps: Number(month[0]?.value ?? 0),
  };
}

/**
 * Returns aggregate analytics across all cards owned by a user.
 * Performs database-filtered query to prevent full-table memory scans.
 */
export async function getOwnerAnalytics(ownerId: string) {
  // Query businesses owned by this owner directly from PostgreSQL
  const ownerBusinesses = await db.query.businesses.findMany({
    where: eq(businesses.ownerId, ownerId),
    with: {
      cards: true,
    },
  });

  const ownedCardIds = ownerBusinesses.flatMap((b) => b.cards.map((c) => c.id));

  if (ownedCardIds.length === 0) {
    return { totalTaps: 0, todayTaps: 0, weekTaps: 0, monthTaps: 0 };
  }

  // Aggregate analytics across all owned cards
  const analyticsPerCard = await Promise.all(
    ownedCardIds.map((id) => getCardAnalytics(id))
  );

  return analyticsPerCard.reduce(
    (acc, curr) => ({
      totalTaps: acc.totalTaps + curr.totalTaps,
      todayTaps: acc.todayTaps + curr.todayTaps,
      weekTaps: acc.weekTaps + curr.weekTaps,
      monthTaps: acc.monthTaps + curr.monthTaps,
    }),
    { totalTaps: 0, todayTaps: 0, weekTaps: 0, monthTaps: 0 }
  );
}

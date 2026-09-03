import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allCards = await db.query.cards.findMany({
    orderBy: [desc(cards.createdAt)],
    with: {
      business: {
        with: { owner: true },
      },
    },
  });

  const rows = [
    ["token", "status", "business", "owner_email", "review_url", "created_at", "activated_at"].join(","),
    ...allCards.map((c) => [
      c.publicToken,
      c.status,
      c.business?.name ?? "",
      c.business?.owner?.email ?? "",
      c.reviewUrl ?? "",
      c.createdAt.toISOString(),
      c.activatedAt?.toISOString() ?? "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")),
  ];

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="have-tech-cards-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

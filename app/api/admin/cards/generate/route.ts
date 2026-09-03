import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { cards, auditLogs } from "@/db/schema";
import { generatePublicToken } from "@/lib/card-utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let quantity = 1;
  try {
    const body = await req.json();
    quantity = Math.max(1, Math.min(100, Number(body.quantity) || 1));
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const tokens: string[] = [];
  for (let i = 0; i < quantity; i++) {
    let token: string;
    // Guarantee uniqueness: retry if collision
    let attempts = 0;
    do {
      token = generatePublicToken();
      attempts++;
      if (attempts > 20) {
        return NextResponse.json({ error: "Token generation failed" }, { status: 500 });
      }
      const existing = await db.query.cards.findFirst({
        where: (c, { eq }) => eq(c.publicToken, token),
      });
      if (!existing) break;
    } while (true);

    await db.insert(cards).values({ publicToken: token });
    await db.insert(auditLogs).values({
      cardId: (await db.query.cards.findFirst({
        where: (c, { eq }) => eq(c.publicToken, token),
      }))!.id,
      userId: session.user.id,
      action: "GENERATED",
    });
    tokens.push(token);
  }

  return NextResponse.json({ tokens });
}

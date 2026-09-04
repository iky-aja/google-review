import { db } from "@/db";
import { cards, businesses, tapLogs, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import { auth, signIn } from "@/auth";
import Link from "next/link";
import ActivationWizard from "@/components/ActivationForm";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function CardGatewayPage(props: PageProps) {
  const params = await props.params;
  const token = params.token;

  // 1. Fetch card details and associated business
  const cardData = await db.query.cards.findFirst({
    where: eq(cards.publicToken, token),
    with: {
      business: {
        with: {
          owner: true,
        },
      },
    },
  });

  if (!cardData) {
    notFound();
  }

  // 2. Handle ACTIVE state: Immediate Server-Side Redirection (HTTP 302)
  if (cardData.status === "ACTIVE") {
    if (!cardData.reviewUrl) {
      notFound();
    }

    try {
      // Async tap log insertion on ACTIVE state only
      await db.insert(tapLogs).values({
        cardId: cardData.id,
      });
    } catch (e) {
      console.error("Failed to insert tap log:", e);
    }

    redirect(cardData.reviewUrl);
  }

  // 3. Handle SUSPENDED or ARCHIVED state: Render branded unavailable page
  if (cardData.status === "SUSPENDED" || cardData.status === "ARCHIVED") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas text-text-primary px-6 py-12 text-center">
        <div className="w-full max-w-sm rounded-xl bg-surface-1 p-8 border border-surface-2 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-destructive">Kartu Tidak Tersedia</h1>
          <p className="mt-2 text-xs text-text-secondary leading-relaxed">
            Layanan kartu fisik ini sedang ditangguhkan atau tidak aktif.
          </p>
          <div className="mt-6">
            <Link href="/" className="text-xs font-semibold text-gold hover:underline">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Handle UNASSIGNED state: Render 3-Step Wizard Activation Page
  const session = await auth();

  // Server Action for Google Sign-In
  const handleGoogleSignIn = async () => {
    "use server";
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://google-review-one.vercel.app").replace(/\/$/, "");
    await signIn("google", { redirectTo: `${baseUrl}/c/${token}` });
  };

  // Server Action to perform the atomic claim
  const handleActivate = async (formData: FormData) => {
    "use server";
    const businessName = formData.get("businessName") as string;
    const reviewUrl = formData.get("reviewUrl") as string;
    const userSession = await auth();

    if (!userSession?.user?.id) {
      return { error: "Silakan login terlebih dahulu di Step 1." };
    }

    if (!businessName || !reviewUrl) {
      return { error: "Semua field wajib diisi." };
    }

    const trimmedUrl = reviewUrl.trim();
    if (!trimmedUrl.startsWith("https://")) {
      return { error: "URL Google Review harus menggunakan protokol https://" };
    }

    let urlObj;
    try {
      urlObj = new URL(trimmedUrl);
    } catch {
      return { error: "Format URL tidak valid." };
    }

    const whitelist = [
      "g.page",
      "search.google.com",
      "google.com",
      "www.google.com",
      "maps.google.com",
      "maps.app.goo.gl",
      "goo.gl",
    ];

    const host = urlObj.hostname.toLowerCase();
    const isWhitelisted = whitelist.some(
      (domain) => host === domain || host.endsWith("." + domain)
    );

    if (!isWhitelisted) {
      return { error: "Domain URL tidak valid (Hanya domain Google Review yang diizinkan)." };
    }

    try {
      const result = await db.transaction(async (tx) => {
        // Concurrency Control: Select For Update to lock the card record
        const lockedCards = await tx
          .select()
          .from(cards)
          .where(eq(cards.id, cardData.id))
          .for("update");

        const lockedCard = lockedCards[0];
        if (!lockedCard) {
          throw new Error("Kartu tidak ditemukan.");
        }

        if (lockedCard.status !== "UNASSIGNED") {
          throw new Error("409_CONFLICT");
        }

        // Insert new business
        const [newBusiness] = await tx
          .insert(businesses)
          .values({
            ownerId: userSession.user.id,
            name: businessName,
          })
          .returning();

        // Update card to ACTIVE
        await tx
          .update(cards)
          .set({
            businessId: newBusiness.id,
            reviewUrl: trimmedUrl,
            status: "ACTIVE",
            activatedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(cards.id, cardData.id));

        // Insert audit log
        await tx.insert(auditLogs).values({
          cardId: cardData.id,
          userId: userSession.user.id,
          action: "ACTIVATED",
        });

        return { success: true };
      });

      return result;
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "409_CONFLICT") {
        return { error: "Kartu sudah diaktifkan oleh pengguna lain." };
      }
      const message = err instanceof Error ? err.message : "Gagal mengaktifkan kartu.";
      console.error("Activation transaction error:", err);
      return { error: message };
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas text-text-primary px-6 py-12">
      <header className="fixed top-0 left-0 w-full h-14 flex items-center justify-center bg-canvas/90 backdrop-blur-sm border-b border-surface-2/40 z-10">
        <span className="text-sm font-bold tracking-widest text-gold">HAVE TECH</span>
      </header>

      <main className="w-full pt-12">
        <ActivationWizard
          token={token}
          userEmail={session?.user?.email ?? undefined}
          onActivate={handleActivate}
          googleSignInAction={handleGoogleSignIn}
        />
      </main>
    </div>
  );
}

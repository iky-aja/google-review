import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Settings — Have Tech" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="min-h-screen bg-canvas text-text-primary">
      <header className="sticky top-0 z-10 border-b border-surface-2 bg-canvas/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-sm text-text-secondary hover:text-text-primary transition">
            ← Dashboard
          </Link>
          <span className="text-sm font-bold tracking-widest text-gold">HAVE TECH</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 py-10 flex flex-col gap-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>

        {/* Account Info */}
        <div className="rounded-xl border border-surface-2 bg-surface-1 px-5 py-5 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Account</p>
          <div className="flex items-center gap-4">
            {session.user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt="Profile"
                className="h-10 w-10 rounded-full border border-surface-2"
              />
            )}
            <div>
              <p className="font-semibold">{session.user.name}</p>
              <p className="text-xs text-text-secondary">{session.user.email}</p>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Role</span>
            <span className="font-mono text-xs uppercase tracking-wider">{session.user.role}</span>
          </div>
        </div>

        {/* Sign Out */}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg border border-destructive/30 py-3 text-sm font-semibold text-destructive transition hover:bg-destructive hover:text-white"
          >
            Sign Out
          </button>
        </form>
      </main>
    </div>
  );
}

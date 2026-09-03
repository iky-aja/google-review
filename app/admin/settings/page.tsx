import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebarLayout from "@/components/admin/AdminSidebarLayout";

export const metadata = { title: "Pengaturan Platform — Admin — Have Tech" };

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/login?callbackUrl=/admin");

  const handleSignOut = async () => {
    "use server";
    await signOut({ redirectTo: "/login?callbackUrl=/admin" });
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://havetech.web.id";

  return (
    <AdminSidebarLayout userEmail={session.user.email ?? "admin@havetech.id"} onSignOut={handleSignOut}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Pengaturan Platform</h1>
          <p className="text-xs text-text-secondary mt-1">
            Status konfigurasi sistem, koneksi database, dan autentikasi.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Environment Info */}
          <div className="rounded-xl border border-surface-2 bg-surface-1 p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gold">Status Konfigurasi Domain</h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-surface-2">
                <span className="text-text-secondary">Public App URL</span>
                <code className="font-mono text-gold bg-surface-2 px-2 py-1 rounded text-[11px]">{appUrl}</code>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-surface-2">
                <span className="text-text-secondary">Node Environment</span>
                <span className="font-semibold text-text-primary uppercase">{process.env.NODE_ENV}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Database Engine</span>
                <span className="font-semibold text-gold">PostgreSQL (Supabase Pooler)</span>
              </div>
            </div>
          </div>

          {/* Admin Account Security */}
          <div className="rounded-xl border border-surface-2 bg-surface-1 p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gold">Akun Admin & Keamanan</h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-surface-2">
                <span className="text-text-secondary">Admin Email</span>
                <span className="font-semibold text-text-primary">{session.user.email}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-surface-2">
                <span className="text-text-secondary">Role</span>
                <span className="rounded bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold uppercase">
                  {session.user.role}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Authentication Mode</span>
                <span className="font-semibold text-text-primary">Bcrypt Password Credentials</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Capabilities */}
        <div className="rounded-xl border border-surface-2 bg-surface-1 p-6 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">Integrasi External Service</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center justify-between rounded-lg bg-surface-2 p-3 border border-surface-2">
              <div>
                <p className="font-semibold text-text-primary">Google OAuth 2.0</p>
                <p className="text-[10px] text-text-secondary">Digunakan oleh owner untuk aktivasi kartu</p>
              </div>
              <span className="text-xs font-bold text-gold">Aktif ✓</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-2 p-3 border border-surface-2">
              <div>
                <p className="font-semibold text-text-primary">QR Code Generator</p>
                <p className="text-[10px] text-text-secondary">HD PNG export for physical printing</p>
              </div>
              <span className="text-xs font-bold text-gold">Aktif ✓</span>
            </div>
          </div>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}

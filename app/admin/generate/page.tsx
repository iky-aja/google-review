import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebarLayout from "@/components/admin/AdminSidebarLayout";
import GenerateCardsForm from "@/components/admin/GenerateCardsForm";

export const metadata = { title: "Tambah Produk (Batch) — Admin — Have Tech" };

export default async function AdminGeneratePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/login?callbackUrl=/admin");

  const handleSignOut = async () => {
    "use server";
    await signOut({ redirectTo: "/login?callbackUrl=/admin" });
  };

  return (
    <AdminSidebarLayout userEmail={session.user.email ?? "admin@havetech.id"} onSignOut={handleSignOut}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Tambah Produk / Batch Kartu Baru</h1>
          <p className="text-xs text-text-secondary mt-1">
            Buat N kartu fisik baru sekaligus secara otomatis dengan token acak aman kriptografis (8 karakter).
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-xl border border-surface-2 bg-surface-1 p-6 shadow-md">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gold mb-4">
            Generator Kuantitas Kartu
          </h2>
          <GenerateCardsForm />
        </div>

        {/* Instructions Card */}
        <div className="rounded-xl border border-surface-2 bg-surface-1 p-6 shadow-sm flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary">
            Alur Pemrosesan Fisik Kartu
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-xs text-text-secondary leading-relaxed">
            <li>
              <strong className="text-text-primary">Generate Batch:</strong> Tentukan jumlah kartu (misal: 15 kartu) lalu klik tombol Generate.
            </li>
            <li>
              <strong className="text-text-primary">Export CSV / NDEF:</strong> Buka menu <a href="/admin/cards" className="text-gold underline">Riwayat Kartu</a> dan klik <strong className="text-gold">Export CSV</strong>.
            </li>
            <li>
              <strong className="text-text-primary">Program NFC & Cetak QR:</strong> Suntikkan URL NDEF ke chip NFC menggunakan aplikasi <em>NFC Tools</em> dan cetak QR Code pada fisik kartu.
            </li>
            <li>
              <strong className="text-text-primary">Distribusi ke Owner:</strong> Kartu siap digunakan. Saat owner pertama kali melakukan tap/scan, mereka akan diarahkan ke Halaman Aktivasi.
            </li>
          </ol>
        </div>
      </div>
    </AdminSidebarLayout>
  );
}

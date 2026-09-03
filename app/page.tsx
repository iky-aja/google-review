import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (session?.user?.role === "admin") {
    redirect("/admin");
  }

  if (session?.user?.role === "owner") {
    redirect("/dashboard");
  }

  // Not logged in -> Go straight to Admin Login page!
  redirect("/login?callbackUrl=/admin");
}

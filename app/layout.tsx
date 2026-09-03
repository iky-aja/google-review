import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Have Tech",
  description: "Satu Tap. Satu Review. Premium physical smart card gateway.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

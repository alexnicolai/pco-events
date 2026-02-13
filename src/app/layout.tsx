import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRC Events",
  description: "Mobile-first event request coordination for Planning Center.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

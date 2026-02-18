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
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <head><script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

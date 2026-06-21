import type { Metadata } from "next";
import "./globals.css";
import AppChrome from "@/components/AppChrome";
import RecoveryHandler from "@/components/RecoveryHandler";

export const metadata: Metadata = {
  title: "LinkedIn PostPilot",
  description:
    "AI-powered personal LinkedIn operating system — generate posts, hooks, hashtags, and visuals in seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <RecoveryHandler />
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}

import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find New Clubs",
  description: "Find groups, clubs, orchestras, theatre groups, sports clubs, and book clubs near you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

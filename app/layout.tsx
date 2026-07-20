import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "aKe infra smoke test",
  description: "Frontend -> Go API -> Postgres connectivity check",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}

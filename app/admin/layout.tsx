import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | 🏆 Riviera Games",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
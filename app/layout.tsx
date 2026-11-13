import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XIYU STORE — Testimoni",
  description: "Kumpulan testimoni pelanggan XIYU STORE",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}

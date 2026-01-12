import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marp AI - AIで資料を自動作成",
  description: "AIを活用してプレゼンテーション資料を自動作成するツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

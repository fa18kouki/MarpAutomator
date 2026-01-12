import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marp AI - AIで資料を自動作成",
  description: "AIを活用してプレゼンテーション資料を自動作成するツール",
};

// Google Fonts URL with all fonts
const googleFontsUrl = "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Noto+Serif+JP:wght@400;700&family=M+PLUS+1p:wght@400;700&family=M+PLUS+Rounded+1c:wght@400;700&family=Kosugi+Maru&family=Kosugi&family=Sawarabi+Gothic&family=Sawarabi+Mincho&family=Zen+Kaku+Gothic+New:wght@400;700&family=Zen+Maru+Gothic:wght@400;700&family=Zen+Old+Mincho:wght@400;700&family=Shippori+Mincho:wght@400;700&family=Kiwi+Maru:wght@400;500&family=Hachi+Maru+Pop&family=Yusei+Magic&family=Reggae+One&family=RocknRoll+One&family=Dela+Gothic+One&family=DotGothic16&family=Potta+One&family=Stick&family=Train+One&family=Roboto:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Poppins:wght@400;700&family=Inter:wght@400;700&family=Nunito:wght@400;700&family=Quicksand:wght@400;700&family=Raleway:wght@400;700&family=Work+Sans:wght@400;700&family=Oswald:wght@400;700&family=Source+Sans+Pro:wght@400;700&family=Playfair+Display:wght@400;700&family=Merriweather:wght@400;700&family=Lora:wght@400;700&family=PT+Serif:wght@400;700&family=Libre+Baskerville:wght@400;700&family=Crimson+Text:wght@400;700&family=Bebas+Neue&family=Righteous&family=Fredoka+One&family=Bangers&family=Bungee&family=Passion+One:wght@400;700&family=Alfa+Slab+One&family=Rubik+Mono+One&family=Black+Ops+One&family=Titan+One&family=Dancing+Script:wght@400;700&family=Pacifico&family=Caveat:wght@400;700&family=Satisfy&family=Great+Vibes&family=Lobster&family=Sacramento&family=Indie+Flower&family=Architects+Daughter&family=Shadows+Into+Light&family=Fira+Code:wght@400;700&family=JetBrains+Mono:wght@400;700&family=Source+Code+Pro:wght@400;700&family=Roboto+Mono:wght@400;700&family=IBM+Plex+Mono:wght@400;700&family=Space+Mono:wght@400;700&display=swap";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontsUrl} rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

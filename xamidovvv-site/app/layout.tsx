import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XAMIDOVVV",
  description: "XAMIDOVVV is a modern development studio: websites, web applications and online stores.",
  openGraph: { title: "XAMIDOVVV", description: "Development studio. I build what you'll want to watch again.", type: "website" },
};
export const viewport: Viewport = { themeColor: "#050506", viewportFit: "cover", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Unbounded:wght@200;300;400;500&family=Manrope:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

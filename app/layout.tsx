import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "MoneyInsight",
  description: "Personal finance insights",
  icons: {
    icon: [
      "/money-insight-logo.svg",
      {
        url: "/money-insight-logo-dark-mode.svg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
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

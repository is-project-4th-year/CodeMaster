import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { ConfettiProvider } from "@/contexts/confetti-context";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Codemaster - The way to learn coding",
  description: "Codemaster is a platform that offers coding challenges to help you improve your programming skills. Solve problems, earn points, and climb the leaderboard!",
  openGraph: {
    title: "Codemaster - The way to learn coding",
    description: "Codemaster is a platform that offers coding challenges to help you improve your programming skills. Solve problems, earn points, and climb the leaderboard!",
    url: defaultUrl,
    siteName: "Codemaster",
  }
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConfettiProvider>
          {children}
          </ConfettiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

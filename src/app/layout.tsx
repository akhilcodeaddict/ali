import type { Metadata } from "next";
import { Inter, Orbitron, Rajdhani, Arimo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider, themeInitScript } from "@/lib/theme-context";
import { ToastProvider } from "@/lib/toast-context";
import { ConfirmProvider } from "@/lib/confirm-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-tech",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ALI CMS Studio",
  description: "Adaptive Layout Interface — Content management dashboard for Blossm Weddings",
  // Admin tool: keep it out of search results.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable} ${arimo.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <ToastProvider>
            <ConfirmProvider>
              <AuthProvider>{children}</AuthProvider>
            </ConfirmProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

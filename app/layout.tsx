import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header/header";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Finance Tracker",
    template: "%s | Finance Tracker",
  },
  description:
    "Track your household finances with ease. Manage expenses, income, and budgets efficiently.",
  keywords: [
    "finance",
    "budget",
    "expense tracker",
    "income management",
    "household finances",
  ],
  authors: [{ name: "Michael De Guzman" }],
  creator: "Michael De Guzman",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Finance Tracker",
    description: "Track your household finances with ease",
    siteName: "Finance Tracker",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finance Tracker",
    description: "Track your household finances with ease",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="bottom-center" />
          <SidebarProvider>
            <main className="w-full flex flex-col min-h-screen justify-center items-center max-w-[1400px] mx-auto">
              <Header />

              <div className="flex flex-col gap-8 flex-grow w-full px-[80px] py-5">
                {children}
              </div>
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

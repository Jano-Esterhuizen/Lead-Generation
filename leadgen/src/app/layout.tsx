import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/toast-provider";
import { GoogleMapsProvider } from "@/components/providers/google-maps-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "LeadGen - Find Local Business Opportunities",
    template: "%s | LeadGen"
  },
  description: "Discover and connect with local businesses that need your web development, design, and digital marketing services.",
  keywords: ["lead generation", "local business", "web development", "digital marketing", "freelance"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <GoogleMapsProvider>
          <ToastProvider />
          {children}
        </GoogleMapsProvider>
      </body>
    </html>
  );
}

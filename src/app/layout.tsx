import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./global.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LedgerOne",
  description: "Entity relationship management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 min-h-screen bg-card border-r p-4 space-y-4">
              <div>
                <h1 className="text-xl font-bold mb-4">LedgerOne</h1>
              </div>
              <Navigation />
            </div>
            
            {/* Main Content */}
            <div className="flex-1 p-6">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
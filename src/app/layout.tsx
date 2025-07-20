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
          <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <Navigation />
              </div>
              <div className="lg:col-span-3">
                {children}
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
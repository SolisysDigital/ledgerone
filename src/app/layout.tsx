import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./global.css";
import Navigation from "@/components/Navigation";

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "LedgerOne - Data Management System",
  description: "Comprehensive data management system for entities, contacts, and related information",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className={`${montserrat.className} antialiased`}>
        {/* Wallpaper Background - Inspired by the uploaded photo */}
        <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-pink-50 via-blue-50 to-purple-100 z-0"></div>
        
        {/* Main Application Layer */}
        <div className="relative z-10 flex h-screen">
          {/* Enhanced Navigation Sidebar */}
          <Navigation />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="min-h-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
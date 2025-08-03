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
      <body className={`${montserrat.className} antialiased bg-background`}>
        <div className="flex h-screen bg-gradient-to-br from-background via-background to-muted/10">
          {/* Enhanced Navigation Sidebar */}
          <Navigation />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-muted/5">
            <div className="min-h-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Button } from "../components/ui/button";
import Link from "next/link";
import { tableConfigs } from "../tableConfigs";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LedgerOne",
  description: "Full stack app with Supabase and Shadcn UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="p-4 bg-primary text-primary-foreground">
          <ul className="flex space-x-4">
            {Object.keys(tableConfigs).map((table) => (
              <li key={table}>
                <Button variant="ghost" asChild>
                  <Link href={`/${table}`}>{tableConfigs[table].label}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        <main className="p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
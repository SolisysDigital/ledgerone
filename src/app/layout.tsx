import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./global.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ConditionalProtectedRoute } from "@/components/auth/ConditionalProtectedRoute";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LedgerOne - Entity Management System",
  description: "Comprehensive entity and relationship management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ConditionalProtectedRoute>
            {children}
          </ConditionalProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}
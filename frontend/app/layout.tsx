// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar"; // Create this component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Auth App",
  description: "Django Next.js Auth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto p-4">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
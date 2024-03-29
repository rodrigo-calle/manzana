import MainNav from "@/components/ui/nav/MainNav";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/redux/providers";
import { Toaster } from "@/components/ui/toast/Toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Manzana",
  description: "Haz realidad tus sueños",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <MainNav />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

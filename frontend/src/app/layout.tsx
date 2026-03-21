import type { Metadata } from "next";
import { Outfit, Space_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ModelGate",
  description: "Contract-Aware AI Control Plane",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${spaceMono.variable} h-full antialiased`}>
      <body className="h-screen flex flex-row font-sans overflow-hidden bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 w-full h-full overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto min-h-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/client";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mytube",
  icons: {
    icon: "/icon.png",
  },
  description: "video straming platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TRPCReactProvider>
      <ClerkProvider>
        <html lang="en" suppressHydrationWarning>
          <body className={`${inter.variable} antialiased`}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              {children}
              <Toaster />
            </ThemeProvider>
          </body>
        </html>
      </ClerkProvider>
    </TRPCReactProvider>
  );
}

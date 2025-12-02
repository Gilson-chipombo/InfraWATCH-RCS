import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryClientProviderMain from "@/src/providers/QueryClientProvider";
import SessionProviderMain from "@/src/providers/SessionProvider";
import AuthProviderMain from "../providers/AuthProvider";
import { Toaster } from "@/src/components/ui/sonner"
import { ThemeProvider } from "../providers/theme-provider";
import 'boxicons/css/boxicons.min.css'
import { EventProvider } from "../hooks/useEvent";
import { LanguageProvider } from "../providers/LanguageProvider";
import BProgressProvider from "../providers/ProgressProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InfraWatch",
  description: "Monitoramento de Infraestrutura em Tempo Real",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <BProgressProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <SessionProviderMain>
                <QueryClientProviderMain>
                  <AuthProviderMain>
                    <EventProvider>
                      {children}
                    </EventProvider>
                  </AuthProviderMain>
                </QueryClientProviderMain>
              </SessionProviderMain>
            </ThemeProvider>
          </BProgressProvider>
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}

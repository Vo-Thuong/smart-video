import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleProvider } from "@/components/auth/google-provider";
import { LanguageProvider } from "@/lib/i18n";
import './patch-api';

export const metadata: Metadata = {
  title: "Smart Video",
  description: "Language learning platform",
  icons: {
    icon: "/assets/image/logo/logo-smart-video.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <GoogleProvider>
          <LanguageProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster richColors position="top-right" />
            </ThemeProvider>
          </LanguageProvider>
        </GoogleProvider>
      </body>
    </html>
  );
}
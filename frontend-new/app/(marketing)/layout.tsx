import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { LanguageProvider } from "@/lib/i18n";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <Navbar />
      {children}
      <Footer />
    </LanguageProvider>
  );
}
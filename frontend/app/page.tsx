import { Hero } from "@/components/landingpage/hero";
import { ProductPreview } from "@/components/landingpage/product-preview";
import { Features } from "@/components/landingpage/features";
import { FeaturesGrid } from "@/components/landingpage/features-grid";
import { Pricing } from "@/components/landingpage/pricing";
export default function LandingPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-x-hidden">
      <Hero />
      <ProductPreview />
      <Features />
      <FeaturesGrid />
      <Pricing />
    </main>
  );
}

"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/i18n";
import { useRouter } from "next/navigation";

export const Hero = () => {
  const { t } = useLang();
  const router = useRouter();

  function handleGetStarted() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    router.push(token ? "/dashboard" : "/auth/signin");
  }

  return (
    <section className="pt-32 pb-10 px-6 text-center">
      <Badge
        variant="outline"
        className="mb-4 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-3 py-1"
      >
        {t.hero.badge}
      </Badge>

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
        {t.hero.headline1} <br /> {t.hero.headline2}
      </h1>

      <p className="max-w-2xl mx-auto text-muted-foreground text-lg mb-10 leading-relaxed">
        {t.hero.description}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          size="lg"
          onClick={handleGetStarted}
          className="bg-blue-600 hover:bg-blue-700 px-8 text-md font-semibold text-white shadow-lg shadow-blue-500/20"
        >
          {t.hero.cta}
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="border-border hover:bg-accent hover:text-accent-foreground text-foreground"
        >
          {t.hero.demo}
        </Button>
      </div>
    </section>
  );
};

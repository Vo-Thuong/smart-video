"use client";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/lib/i18n";
import { useRouter } from "next/navigation";

export const Pricing = () => {
  const { t } = useLang();
  const plans = t.pricing.plans;
  const router = useRouter();

  function handleFree() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    router.push(token ? "/dashboard" : "/auth/signin");
  }

  const handleUpgrade = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/auth/signin?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <section id="pricing" className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-green-600 dark:text-green-500 font-semibold mb-2 block uppercase tracking-wider text-sm">
          {t.pricing.label}
        </span>
        <h2 className="text-4xl font-bold text-foreground">{t.pricing.heading}</h2>
        <p className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
          {t.pricing.paymentGuide}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Free */}
        <div className="p-8 rounded-3xl border border-border bg-card flex flex-col shadow-sm transition-all hover:shadow-md">
          <h3 className="text-xl font-bold mb-2 text-foreground">{plans[0].name}</h3>
          <p className="text-muted-foreground text-sm mb-6">{plans[0].tagline}</p>
          <div className="text-4xl font-bold mb-8 text-foreground">
            {plans[0].price}{" "}
            <span className="text-sm font-normal text-muted-foreground">{plans[0].priceSub}</span>
          </div>
          <Button variant="outline" className="w-full mb-8 border-border hover:bg-accent" onClick={handleFree}>
            {plans[0].cta}
          </Button>
          <ul className="space-y-4 text-sm text-muted-foreground">
            {plans[0].features.map((f) => (
              <li key={f} className="flex gap-3">
                <Check className="w-4 h-4 text-green-500 shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro */}
        <div className="p-8 rounded-3xl border-2 border-green-500 bg-card relative flex flex-col shadow-xl dark:shadow-[0_0_30px_-10px_rgba(34,197,94,0.3)] scale-105 z-10">
          {"badge" in plans[1] && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 hover:bg-green-600 text-white border-none">
              {(plans[1] as typeof plans[1] & { badge: string }).badge}
            </Badge>
          )}
          <h3 className="text-xl font-bold mb-2 text-green-600 dark:text-green-500">{plans[1].name}</h3>
          <p className="text-muted-foreground text-sm mb-6">{plans[1].tagline}</p>
          <div className="text-4xl font-bold mb-8 text-foreground">
            {plans[1].price}{" "}
            <span className="text-sm font-normal text-muted-foreground">{plans[1].priceSub}</span>
          </div>
          <Button
            className="w-full mb-8 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
            onClick={handleUpgrade}
          >
            {plans[1].cta}
          </Button>
          <ul className="space-y-4 text-sm text-muted-foreground">
            {plans[1].features.map((f) => (
              <li key={f} className="flex gap-3">
                <Check className="w-4 h-4 text-green-500 shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Organize */}
        <div className="p-8 rounded-3xl border border-border bg-card flex flex-col shadow-sm transition-all hover:shadow-md">
          <h3 className="text-xl font-bold mb-2 text-foreground">{plans[2].name}</h3>
          <p className="text-muted-foreground text-sm mb-6">{plans[2].tagline}</p>
          <div className="text-3xl font-bold mb-8 text-foreground">{plans[2].price}</div>
          <Button variant="outline" className="w-full mb-8 border-border hover:bg-accent">
            {plans[2].cta}
          </Button>
          <ul className="space-y-4 text-sm text-muted-foreground">
            {plans[2].features.map((f) => (
              <li key={f} className="flex gap-3">
                <Check className="w-4 h-4 text-green-500 shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

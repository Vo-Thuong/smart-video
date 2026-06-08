"use client";
import { Globe, Keyboard, CheckCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";

const ICONS = [
  <Globe key="globe" className="w-6 h-6" />,
  <Keyboard key="keyboard" className="w-6 h-6" />,
  <CheckCircle key="check" className="w-6 h-6" />,
];

export const Features = () => {
  const { t } = useLang();

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
      {t.features.items.map((feature, i) => (
        <div
          key={i}
          className="p-8 rounded-2xl border border-border bg-card hover:bg-accent/50 hover:border-blue-500/50 transition-all group shadow-sm"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
            {ICONS[i]}
          </div>
          <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
          <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
        </div>
      ))}
    </section>
  );
};


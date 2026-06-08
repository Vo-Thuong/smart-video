"use client";
import { Youtube, Zap, Target, Mic, BookOpen, BarChart3 } from "lucide-react";
import { useLang } from "@/lib/i18n";

const ICONS = [
  <Youtube key="yt" className="text-green-600 dark:text-green-500" />,
  <Zap key="zap" className="text-green-600 dark:text-green-500" />,
  <Target key="target" className="text-green-600 dark:text-green-500" />,
  <Mic key="mic" className="text-green-600 dark:text-green-500" />,
  <BookOpen key="book" className="text-green-600 dark:text-green-500" />,
  <BarChart3 key="bar" className="text-green-600 dark:text-green-500" />,
];

export const FeaturesGrid = () => {
  const { t } = useLang();

  return (
    <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4 text-foreground">{t.featuresGrid.heading}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t.featuresGrid.subheading}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {t.featuresGrid.items.map((f, i) => (
          <div
            key={i}
            className="p-8 rounded-2xl border border-border bg-card hover:bg-accent/50 transition-all shadow-sm group"
          >
            <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-6 bg-background group-hover:border-green-500/50 transition-colors">
              {ICONS[i]}
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">{f.title}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

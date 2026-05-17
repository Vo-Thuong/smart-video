"use client";
import { Globe, Keyboard, CheckCircle } from "lucide-react";

const FEATURE_LIST = [
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Any Video Source",
    desc: "Upload local files or paste links to practice with your favorite content.",
  },
  {
    icon: <Keyboard className="w-6 h-6" />,
    title: "Interactive Typing",
    desc: "Type along with real-time feedback and automatic timestamp synchronization.",
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Instant Evaluation",
    desc: "Get immediate corrections for spelling and grammar as you practice.",
  },
];

export const Features = () => {
  return (
    <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
      {FEATURE_LIST.map((feature, i) => (
        <div
          key={i}
          className="p-8 rounded-2xl border border-border bg-card hover:bg-accent/50 hover:border-blue-500/50 transition-all group shadow-sm"
        >
          {/* Icon container: Màu xanh blue giữ độ tươi sáng trên cả 2 nền */}
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
            {feature.icon}
          </div>

          {/* Title: Dùng text-foreground để tự đảo trắng/đen */}
          <h3 className="text-xl font-bold mb-3 text-foreground">
            {feature.title}
          </h3>

          {/* Description: Dùng text-muted-foreground để tránh bị mờ trên nền sáng */}
          <p className="text-muted-foreground leading-relaxed">
            {feature.desc}
          </p>
        </div>
      ))}
    </section>
  );
};

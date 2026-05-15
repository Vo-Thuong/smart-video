"use client";
import { Youtube, Zap, Target, Mic, BookOpen, BarChart3 } from "lucide-react";

const features = [
  {
    icon: <Youtube className="text-green-600 dark:text-green-500" />,
    title: "Learn from Any YouTube Video",
    desc: "Add any YouTube video — AI generates perfect transcripts with translations in 70+ languages.",
  },
  {
    icon: <Zap className="text-green-600 dark:text-green-500" />,
    title: "No more manual rewinding",
    desc: "Auto-pause after each sentence. Set repeat count (1-5 times). Focus on listening.",
  },
  {
    icon: <Target className="text-green-600 dark:text-green-500" />,
    title: "Instant Accuracy Feedback",
    desc: "See exactly which words you missed with word-by-word comparison.",
  },
  {
    icon: <Mic className="text-green-600 dark:text-green-500" />,
    title: "Shadowing with AI Scoring",
    desc: "Record your voice, get instant AI feedback on pronunciation.",
  },
  {
    icon: <BookOpen className="text-green-600 dark:text-green-500" />,
    title: "Auto-tracked Vocabulary",
    desc: "Words you struggle with are automatically saved to your vocabulary book.",
  },
  {
    icon: <BarChart3 className="text-green-600 dark:text-green-500" />,
    title: "Track Progress & Stay Motivated",
    desc: "Detailed reports on your mistakes, learning analytics, and leaderboard.",
  },
];

export const FeaturesGrid = () => {
  return (
    <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4 text-foreground">
          Everything You Need to Master English Listening
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Powerful AI-driven features designed for serious learners
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div
            key={i}
            className="p-8 rounded-2xl border border-border bg-card hover:bg-accent/50 transition-all shadow-sm group"
          >
            <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center mb-6 bg-background group-hover:border-green-500/50 transition-colors">
              {f.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">
              {f.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

"use client";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Pricing = () => {
  return (
    <section id="pricing" className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-green-600 dark:text-green-500 font-semibold mb-2 block uppercase tracking-wider text-sm">
          Pricing
        </span>
        <h2 className="text-4xl font-bold text-foreground">
          Pricing for Different Account Types
        </h2>
        {/* Thêm link hướng dẫn thanh toán nếu cần */}
        <p className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
          (Hướng dẫn thanh toán nội địa Việt Nam)
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* 1. Free Plan */}
        <div className="p-8 rounded-3xl border border-border bg-card flex flex-col shadow-sm transition-all hover:shadow-md">
          <h3 className="text-xl font-bold mb-2 text-foreground">Free</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Perfect for trying out
          </p>
          <div className="text-4xl font-bold mb-8 text-foreground">
            $0{" "}
            <span className="text-sm font-normal text-muted-foreground">
              Free Forever
            </span>
          </div>
          <Button
            variant="outline"
            className="w-full mb-8 border-border hover:bg-accent"
          >
            Start
          </Button>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <Check className="w-4 h-4 text-green-500 shrink-0" /> 1 video/day
              (1 min limit)
            </li>
            <li className="flex gap-3">
              <Check className="w-4 h-4 text-green-500 shrink-0" /> 10 shadowing
              practices
            </li>
            <li className="flex gap-3">
              <Check className="w-4 h-4 text-green-500 shrink-0" /> AI
              transcription
            </li>
          </ul>
        </div>

        {/* 2. Pro Plan - Highlighted */}
        <div className="p-8 rounded-3xl border-2 border-green-500 bg-card relative flex flex-col shadow-xl dark:shadow-[0_0_30px_-10px_rgba(34,197,94,0.3)] scale-105 z-10">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 hover:bg-green-600 text-white border-none">
            MOST POPULAR
          </Badge>
          <h3 className="text-xl font-bold mb-2 text-green-600 dark:text-green-500">
            Pro
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            For dedicated language learners
          </p>
          <div className="text-4xl font-bold mb-8 text-foreground">
            $6{" "}
            <span className="text-sm font-normal text-muted-foreground">
              /month
            </span>
          </div>
          <Button className="w-full mb-8 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20">
            Upgrade
          </Button>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <Check className="w-4 h-4 text-green-500 shrink-0" /> Unlimited
              video length
            </li>
            <li className="flex gap-3">
              <Check className="Check w-4 h-4 text-green-500 shrink-0" /> Full
              video dictation
            </li>
            <li className="flex gap-3">
              <Check className="w-4 h-4 text-green-500 shrink-0" /> Save notes
              for sentences
            </li>
            <li className="flex gap-3">
              <Check className="w-4 h-4 text-green-500 shrink-0" /> Priority
              processing
            </li>
          </ul>
        </div>

        {/* 3. Organize Plan */}
        <div className="p-8 rounded-3xl border border-border bg-card flex flex-col shadow-sm transition-all hover:shadow-md">
          <h3 className="text-xl font-bold mb-2 text-foreground">Organize</h3>
          <p className="text-muted-foreground text-sm mb-6">
            For teachers and organizations
          </p>
          <div className="text-3xl font-bold mb-8 text-foreground">
            Contact Us
          </div>
          <Button
            variant="outline"
            className="w-full mb-8 border-border hover:bg-accent"
          >
            Contact Sales
          </Button>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <Check className="w-4 h-4 text-green-500 shrink-0" /> Custom
              subdomain
            </li>
            <li className="flex gap-3">
              <Check className="w-4 h-4 text-green-500 shrink-0" /> Student
              dashboard
            </li>
            <li className="flex gap-3">
              <Check className="w-4 h-4 text-green-500 shrink-0" /> Assignment
              system
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

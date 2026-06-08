"use client";
import { useState } from "react";
import { Check, X, Crown, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

const CYCLES = [
  { id: "weekly",  label: "Tuần",   price: 49000,  saving: null,          badge: null },
  { id: "monthly", label: "Tháng",  price: 149000, saving: "Tiết kiệm 25%", badge: "Phổ biến nhất" },
  { id: "yearly",  label: "Năm",    price: 999000, saving: "Tiết kiệm 57%", badge: "Tốt nhất" },
] as const;

type CycleId = typeof CYCLES[number]["id"];

function formatPrice(n: number) {
  return n.toLocaleString("vi-VN");
}

const FREE_FEATURES = [
  { text: "Tối đa 8 video AI gợi ý", included: true },
  { text: "Upload & học từ video YouTube", included: true },
  { text: "Transcript cơ bản", included: true },
  { text: "Luyện tập từ vựng cơ bản", included: true },
  { text: "Không giới hạn độ dài video", included: false },
  { text: "Flashcard từ vựng thông minh", included: false },
  { text: "20 video AI gợi ý", included: false },
  { text: "Không quảng cáo", included: false },
  { text: "Hỗ trợ ưu tiên 24/7", included: false },
];

const PRO_FEATURES = [
  { text: "Tất cả tính năng Free", included: true },
  { text: "Không giới hạn độ dài video", included: true },
  { text: "Luyện từ vựng với Flashcard thông minh", included: true },
  { text: "20 video AI gợi ý mỗi lần", included: true },
  { text: "Transcript chi tiết từng câu", included: true },
  { text: "Lưu từ vựng không giới hạn", included: true },
  { text: "Không quảng cáo", included: true },
  { text: "Hỗ trợ ưu tiên 24/7", included: true },
  { text: "Truy cập sớm tính năng mới", included: true },
];

export const Pricing = () => {
  const router = useRouter();
  const [cycle, setCycle] = useState<CycleId>("monthly");
  const activeCycle = CYCLES.find((c) => c.id === cycle)!;

  function handleFree() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    router.push(token ? "/dashboard" : "/auth/signin");
  }

  function handleUpgrade() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    router.push(token ? `/checkout?plan=${cycle}` : `/auth/signin?redirect=/checkout?plan=${cycle}`);
  }

  return (
    <section id="pricing" className="py-20 px-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-[#a78bfa] font-semibold mb-2 block uppercase tracking-wider text-sm">
          Bảng giá
        </span>
        <h2 className="text-4xl font-bold text-foreground">Gói phù hợp với mọi nhu cầu</h2>
        <p className="mt-3 text-muted-foreground text-sm max-w-md mx-auto">
          Bắt đầu miễn phí, nâng cấp khi bạn cần nhiều hơn. Huỷ bất kỳ lúc nào.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex gap-1 bg-white/5 dark:bg-white/5 border border-white/10 rounded-2xl p-1.5">
          {CYCLES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCycle(c.id)}
              className={`relative px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                cycle === c.id
                  ? "bg-[#7c3aed] text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
              {c.saving && cycle === c.id && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  {c.saving}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-2 gap-6 items-stretch max-w-3xl mx-auto">

        {/* Free */}
        <div className="p-8 rounded-3xl border border-border bg-card flex flex-col shadow-sm hover:shadow-md transition-all">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground mb-1">Free</h3>
            <p className="text-muted-foreground text-sm">Trải nghiệm không cần thẻ</p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-bold text-foreground">0₫</span>
            <span className="text-muted-foreground text-sm ml-2">mãi mãi</span>
          </div>
          <button
            onClick={handleFree}
            className="w-full mb-8 py-3 rounded-xl border border-border hover:bg-accent text-foreground font-semibold text-sm transition-colors"
          >
            Bắt đầu miễn phí
          </button>
          <ul className="space-y-3 text-sm flex-1">
            {FREE_FEATURES.map(({ text, included }) => (
              <li key={text} className={`flex items-center gap-3 ${included ? "text-foreground" : "text-muted-foreground/50 line-through"}`}>
                {included
                  ? <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  : <X className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                }
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro */}
        <div className="relative p-8 rounded-3xl border-2 border-[#7c3aed] bg-card flex flex-col shadow-xl shadow-purple-500/10 scale-[1.02]">
          {/* Badge */}
          {activeCycle.badge && (
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-[#7c3aed] text-white shadow">
              {activeCycle.badge}
            </span>
          )}

          <div className="mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-amber-400" />
                <h3 className="text-xl font-bold text-[#a78bfa]">Pro</h3>
              </div>
              <p className="text-muted-foreground text-sm">Mở khoá toàn bộ tính năng</p>
            </div>
          </div>

          <div className="mb-2">
            <span className="text-4xl font-bold text-foreground">{formatPrice(activeCycle.price)}₫</span>
            <span className="text-muted-foreground text-sm ml-2">/ {activeCycle.label.toLowerCase()}</span>
          </div>
          {activeCycle.saving && (
            <span className="text-emerald-500 text-xs font-semibold mb-6 block">{activeCycle.saving}</span>
          )}
          {!activeCycle.saving && <div className="mb-6" />}

          <button
            onClick={handleUpgrade}
            className="w-full mb-8 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:from-[#6d28d9] hover:to-[#4f46e5] text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Nâng cấp ngay
          </button>

          <ul className="space-y-3 text-sm flex-1">
            {PRO_FEATURES.map(({ text }) => (
              <li key={text} className="flex items-center gap-3 text-foreground">
                <Check className="w-4 h-4 text-[#a78bfa] shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-center text-muted-foreground/50 text-xs mt-8">
        Hoàn tiền 100% trong 7 ngày nếu không hài lòng · Không phí ẩn · Huỷ bất kỳ lúc nào
      </p>
    </section>
  );
};

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Zap,
  Infinity,
  BookOpen,
  Sparkles,
  Crown,
  ShieldCheck,
  RefreshCw,
  ArrowDownLeft,
  X,
  AlertTriangle,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

type ActivePlan = {
  planId: string;
  label: string;
  price: number;
  unit: string;
  activatedAt: string;
};

function formatPrice(n: number) {
  return n.toLocaleString("vi-VN");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ── Downgrade confirmation modal ─────────────────────────────────────────────
function DowngradeModal({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useLang();
  const p = t.upgrade;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-gradient-to-b from-[#2a1845] to-[#1e1235] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <h3 className="text-white font-bold text-base mb-2">
          {p.downgradeModal.title}
        </h3>
        <p className="text-white/50 text-sm mb-1">{p.downgradeModal.body}</p>
        <ul className="mt-3 mb-5 space-y-2">
          {p.proFeaturesList.slice(0, 3).map((f) => (
            <li
              key={f}
              className="flex items-center gap-2 text-white/40 text-xs"
            >
              <X className="w-3 h-3 text-red-400 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 text-sm font-medium transition-colors"
          >
            {p.downgradeModal.keep}
          </button>
          <button
            onClick={onConfirm}
            className="py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-sm font-medium transition-colors"
          >
            {p.downgradeModal.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Active plan banner ────────────────────────────────────────────────────────
function ActivePlanBanner({
  active,
  onChangePlan,
  onDowngrade,
}: {
  active: ActivePlan;
  onChangePlan: () => void;
  onDowngrade: () => void;
}) {
  const { t } = useLang();
  const p = t.upgrade;
  return (
    <div className="w-full max-w-3xl mb-10">
      <div className="relative bg-gradient-to-r from-[#a78bfa]/20 via-[#7c3aed]/15 to-[#6366f1]/20 border border-[#a78bfa]/40 rounded-2xl p-6 overflow-hidden">
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#a78bfa]/10 to-transparent" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
            <Crown className="w-6 h-6 text-amber-400" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-bold text-base">
                SmartVideo Pro
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {p.activeBanner.active}
              </span>
            </div>
            <p className="text-white/60 text-sm">
              {p.activeBanner.plan
                .replace("{label}", active.label)
                .replace("{price}", formatPrice(active.price))
                .replace("{unit}", active.unit)}
            </p>
            <p className="text-white/40 text-xs mt-1">
              {p.activeBanner.activated.replace(
                "{date}",
                formatDate(active.activatedAt),
              )}
            </p>
          </div>

          {/* Active features quick-list */}
          <div className="flex flex-col gap-1.5 sm:items-end">
            {p.proFeaturesList.slice(0, 3).map((f) => (
              <span
                key={f}
                className="flex items-center gap-1.5 text-white/50 text-xs"
              >
                <ShieldCheck className="w-3 h-3 text-[#a78bfa]" />
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Actions row */}
        <div className="relative mt-5 pt-4 border-t border-white/8 flex flex-wrap items-center gap-3">
          <span className="text-white/40 text-xs">{p.activeBanner.change}</span>
          <button
            onClick={onChangePlan}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/25 rounded-lg px-3 py-1.5 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            {p.activeBanner.switchPlan}
          </button>
          <button
            onClick={onDowngrade}
            className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 border border-red-500/15 hover:border-red-500/35 rounded-lg px-3 py-1.5 transition-colors ml-auto"
          >
            <ArrowDownLeft className="w-3 h-3" />
            {p.activeBanner.downgrade}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function UpgradePage() {
  const router = useRouter();
  const { t } = useLang();
  const p = t.upgrade;
  const [selected, setSelected] = useState<string>("monthly");
  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);

  const features = [
    {
      icon: Infinity,
      title: p.features[0].title,
      description: p.features[0].desc,
    },
    {
      icon: BookOpen,
      title: p.features[1].title,
      description: p.features[1].desc,
    },
    {
      icon: Sparkles,
      title: p.features[2].title,
      description: p.features[2].desc,
    },
  ];

  const plans = [
    {
      id: "weekly",
      label: p.plans.weekly,
      price: "49.000",
      rawPrice: 49000,
      unit: p.plans.units.week,
      badge: null,
      saving: null,
    },
    {
      id: "monthly",
      label: p.plans.monthly,
      price: "149.000",
      rawPrice: 149000,
      unit: p.plans.units.month,
      badge: p.plans.popular,
      saving: p.plans.save25,
    },
    {
      id: "yearly",
      label: p.plans.yearly,
      price: "999.000",
      rawPrice: 999000,
      unit: p.plans.units.year,
      badge: p.plans.best,
      saving: p.plans.save57,
    },
  ];

  useEffect(() => {
    // Ưu tiên đọc từ backend để đảm bảo chính xác
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (
            data.success &&
            data.user.is_premium &&
            data.user.premiumPlan?.planId
          ) {
            const plan: ActivePlan = {
              planId: data.user.premiumPlan.planId,
              label: data.user.premiumPlan.label,
              price: data.user.premiumPlan.price,
              unit: data.user.premiumPlan.unit,
              activatedAt: data.user.premiumPlan.activatedAt,
            };
            setActivePlan(plan);
            // Đồng bộ lại cache localStorage
            localStorage.setItem("smartvideo_pro_plan", JSON.stringify(plan));
            // Cập nhật user object
            try {
              const rawUser = localStorage.getItem("user");
              if (rawUser) {
                const u = JSON.parse(rawUser);
                u.is_premium = true;
                localStorage.setItem("user", JSON.stringify(u));
              }
            } catch {}
          } else {
            // User không có pro trên DB — xóa cache cũ nếu có
            setActivePlan(null);
            localStorage.removeItem("smartvideo_pro_plan");
            // Cập nhật user object
            try {
              const rawUser = localStorage.getItem("user");
              if (rawUser) {
                const u = JSON.parse(rawUser);
                u.is_premium = false;
                localStorage.setItem("user", JSON.stringify(u));
              }
            } catch {}
          }
        })
        .catch(() => {
          // Fallback sang localStorage nếu mất mạng
          const raw = localStorage.getItem("smartvideo_pro_plan");
          if (raw) {
            try {
              setActivePlan(JSON.parse(raw));
            } catch {}
          }
        });
    }
  }, []);

  async function handleDowngrade() {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("http://localhost:5000/api/auth/downgrade", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {}
    // Cập nhật user object trong localStorage
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const user = JSON.parse(rawUser);
        user.is_premium = false;
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch {}
    localStorage.removeItem("smartvideo_pro_plan");
    setActivePlan(null);
    setShowDowngradeModal(false);
    setShowUpgrade(false);
  }

  const isProActive = activePlan !== null && !showUpgrade;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0f2e] via-[#2a1845] to-[#1e1235] px-4 py-10 flex flex-col items-center">
      {/* Downgrade confirmation modal */}
      {showDowngradeModal && (
        <DowngradeModal
          onConfirm={handleDowngrade}
          onClose={() => setShowDowngradeModal(false)}
        />
      )}

      {/* Active plan banner */}
      {activePlan && (
        <ActivePlanBanner
          active={activePlan}
          onChangePlan={() => setShowUpgrade(true)}
          onDowngrade={() => setShowDowngradeModal(true)}
        />
      )}

      {/* Header */}
      <div className="text-center mb-10 max-w-xl">
        <div className="inline-flex items-center gap-2 bg-[#a78bfa]/15 border border-[#a78bfa]/30 text-[#c4b5fd] text-sm font-medium px-4 py-1.5 rounded-full mb-5">
          <Crown className="w-4 h-4" />
          {isProActive ? p.managePro : p.upgradeTitle}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
          {isProActive ? (
            <>
              {p.onPro.replace("SmartVideo", "")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] to-[#818cf8]">
                SmartVideo Pro
              </span>
            </>
          ) : (
            <>
              {p.unlock.replace("SmartVideo", "")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] to-[#818cf8]">
                SmartVideo
              </span>
            </>
          )}
        </h1>
        <p className="mt-3 text-white/50 text-sm sm:text-base">
          {isProActive ? p.proActive : p.smarter}
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-12">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className={`bg-white/5 border rounded-2xl p-5 flex flex-col gap-3 transition-colors ${
              isProActive
                ? "border-[#a78bfa]/30 bg-[#a78bfa]/5"
                : "border-white/10 hover:border-[#a78bfa]/40"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#a78bfa]/15 flex items-center justify-center">
              <Icon className="w-5 h-5 text-[#c4b5fd]" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold text-sm leading-snug">
                {title}
              </h3>
              {isProActive && (
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check
                    className="w-2.5 h-2.5 text-emerald-400"
                    strokeWidth={3}
                  />
                </span>
              )}
            </div>
            <p className="text-white/45 text-xs leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>

      {/* Pricing — only show when not active OR user clicked "Đổi gói" */}
      {!isProActive && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
            {plans.map((plan) => {
              const isSelected = selected === plan.id;
              const isCurrentPlan = activePlan?.planId === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelected(plan.id)}
                  className={`
                    relative text-left rounded-2xl border p-5 transition-all duration-200
                    ${
                      isSelected
                        ? "bg-gradient-to-b from-[#a78bfa]/20 to-[#7c3aed]/10 border-[#a78bfa]/60 shadow-[0_0_24px_rgba(167,139,250,0.2)]"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/60 text-xs font-medium uppercase tracking-wider">
                      {plan.label}
                    </span>
                    {isCurrentPlan && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {p.currentPlan}
                      </span>
                    )}
                    {!isCurrentPlan && plan.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          plan.id === "yearly"
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                            : "bg-[#a78bfa]/20 text-[#c4b5fd] border border-[#a78bfa]/30"
                        }`}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div className="mb-1">
                    <span className="text-white font-bold text-2xl">
                      {plan.price}₫
                    </span>
                    <span className="text-white/40 text-sm ml-1">
                      / {plan.unit}
                    </span>
                  </div>
                  {plan.saving ? (
                    <span className="text-emerald-400 text-xs font-medium">
                      {plan.saving}
                    </span>
                  ) : (
                    <span className="text-transparent text-xs select-none">
                      ‌
                    </span>
                  )}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#a78bfa] flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => router.push(`/checkout?plan=${selected}`)}
            className="w-full max-w-3xl py-4 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:from-[#6d28d9] hover:to-[#4f46e5] shadow-[0_4px_24px_rgba(124,58,237,0.4)] hover:shadow-[0_4px_32px_rgba(124,58,237,0.6)] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            {activePlan ? p.switchPlan : p.upgradeNow}
            {plans.find((pl) => pl.id === selected)?.price}₫ /{" "}
            {plans.find((pl) => pl.id === selected)?.unit}
          </button>

          <p className="mt-4 text-white/30 text-xs text-center">{p.noFees}</p>
        </>
      )}

      {/* All features list */}
      <div className="mt-10 w-full max-w-3xl bg-white/4 border border-white/8 rounded-2xl p-6">
        <h2 className="text-white font-semibold text-sm mb-4">
          {p.everythingPro}
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
          {p.proFeaturesList.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 text-white/60 text-sm"
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isProActive ? "bg-emerald-500/20" : "bg-[#a78bfa]/20"
                }`}
              >
                <Check
                  className={`w-2.5 h-2.5 ${isProActive ? "text-emerald-400" : "text-[#c4b5fd]"}`}
                  strokeWidth={3}
                />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

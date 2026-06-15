"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  CreditCard,
  ArrowLeft,
  Lock,
  Landmark,
  ShieldCheck,
  Crown,
  Infinity,
  BookOpen,
  Sparkles,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type PlanId = "weekly" | "monthly" | "yearly";
type PaymentMethod = "card" | "bank";

// ─── Plan definitions ─────────────────────────────────────────────────────────
const PLANS: Record<
  PlanId,
  {
    label: string;
    price: number;
    unit: string;
    saving: string | null;
    badge: string | null;
  }
> = {
  weekly: {
    label: "Hàng tuần",
    price: 49000,
    unit: "tuần",
    saving: null,
    badge: null,
  },
  monthly: {
    label: "Hàng tháng",
    price: 149000,
    unit: "tháng",
    saving: "Tiết kiệm 25%",
    badge: "Phổ biến nhất",
  },
  yearly: {
    label: "Hàng năm",
    price: 999000,
    unit: "năm",
    saving: "Tiết kiệm 57%",
    badge: "Tốt nhất",
  },
};

// ─── Vietnamese banks ─────────────────────────────────────────────────────────
const BANKS = [
  {
    code: "VCB",
    name: "Vietcombank",
    fullName: "Ngân hàng TMCP Ngoại thương Việt Nam",
  },
  {
    code: "VTB",
    name: "VietinBank",
    fullName: "Ngân hàng TMCP Công Thương Việt Nam",
  },
  {
    code: "BIDV",
    name: "BIDV",
    fullName: "Ngân hàng TMCP Đầu tư & Phát triển VN",
  },
  {
    code: "AGR",
    name: "Agribank",
    fullName: "Ngân hàng Nông nghiệp & PTNT Việt Nam",
  },
  {
    code: "TCB",
    name: "Techcombank",
    fullName: "Ngân hàng TMCP Kỹ Thương Việt Nam",
  },
  { code: "MBB", name: "MB Bank", fullName: "Ngân hàng TMCP Quân Đội" },
  {
    code: "VPB",
    name: "VPBank",
    fullName: "Ngân hàng TMCP Việt Nam Thịnh Vượng",
  },
  { code: "ACB", name: "ACB", fullName: "Ngân hàng TMCP Á Châu" },
  {
    code: "STB",
    name: "Sacombank",
    fullName: "Ngân hàng TMCP Sài Gòn Thương Tín",
  },
  { code: "HDB", name: "HDBank", fullName: "Ngân hàng TMCP Phát triển TP.HCM" },
  { code: "TPB", name: "TPBank", fullName: "Ngân hàng TMCP Tiên Phong" },
  { code: "OCB", name: "OCB", fullName: "Ngân hàng TMCP Phương Đông" },
  { code: "VIB", name: "VIB", fullName: "Ngân hàng TMCP Quốc tế Việt Nam" },
  { code: "SEAB", name: "SeABank", fullName: "Ngân hàng TMCP Đông Nam Á" },
  { code: "SHB", name: "SHB", fullName: "Ngân hàng TMCP Sài Gòn – Hà Nội" },
  {
    code: "LPB",
    name: "LienVietPostBank",
    fullName: "Ngân hàng TMCP Bưu điện Liên Việt",
  },
  { code: "NAB", name: "Nam A Bank", fullName: "Ngân hàng TMCP Nam Á" },
  { code: "ABB", name: "ABBank", fullName: "Ngân hàng TMCP An Bình" },
  { code: "BAB", name: "Bac A Bank", fullName: "Ngân hàng TMCP Bắc Á" },
  { code: "BVB", name: "BaoViet Bank", fullName: "Ngân hàng TMCP Bảo Việt" },
  {
    code: "CBB",
    name: "CB Bank",
    fullName: "Ngân hàng TMCP Xây dựng Việt Nam",
  },
  {
    code: "EIB",
    name: "Eximbank",
    fullName: "Ngân hàng TMCP Xuất Nhập Khẩu VN",
  },
  { code: "GPB", name: "GP Bank", fullName: "Ngân hàng TMCP Dầu khí Toàn Cầu" },
  { code: "KLB", name: "KienLongBank", fullName: "Ngân hàng TMCP Kiên Long" },
  { code: "MSB", name: "MSB", fullName: "Ngân hàng TMCP Hàng Hải Việt Nam" },
  { code: "NCB", name: "NCB", fullName: "Ngân hàng TMCP Quốc Dân" },
  {
    code: "PGB",
    name: "PG Bank",
    fullName: "Ngân hàng TMCP Xăng dầu Petrolimex",
  },
  {
    code: "SCB",
    name: "Saigon Bank",
    fullName: "Ngân hàng TMCP Sài Gòn Công Thương",
  },
  { code: "VAB", name: "VietA Bank", fullName: "Ngân hàng TMCP Việt Á" },
  {
    code: "VBB",
    name: "VietBank",
    fullName: "Ngân hàng TMCP Việt Nam Thương Tín",
  },
  {
    code: "VCCB",
    name: "VietCapital Bank",
    fullName: "Ngân hàng TMCP Bản Việt",
  },
  { code: "IVB", name: "Indovina Bank", fullName: "Ngân hàng TNHH Indovina" },
  {
    code: "WOO",
    name: "Woori Bank Việt Nam",
    fullName: "Ngân hàng Woori Việt Nam",
  },
  {
    code: "HSBC",
    name: "HSBC Việt Nam",
    fullName: "Ngân hàng TNHH MTV HSBC (Việt Nam)",
  },
  {
    code: "SCB2",
    name: "Standard Chartered VN",
    fullName: "Ngân hàng TNHH MTV Standard Chartered VN",
  },
  {
    code: "CITI",
    name: "Citibank Việt Nam",
    fullName: "Chi nhánh Citibank N.A. tại Việt Nam",
  },
  {
    code: "UOB",
    name: "UOB Việt Nam",
    fullName: "Ngân hàng United Overseas Bank VN",
  },
  {
    code: "SHIN",
    name: "Shinhan Bank Việt Nam",
    fullName: "Ngân hàng TNHH MTV Shinhan Việt Nam",
  },
  {
    code: "PUB",
    name: "Public Bank Việt Nam",
    fullName: "Ngân hàng TNHH MTV Public Việt Nam",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(n: number) {
  return n.toLocaleString("vi-VN");
}

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length >= 3
    ? digits.slice(0, 2) + "/" + digits.slice(2)
    : digits;
}

// ─── Bank Selector ────────────────────────────────────────────────────────────
function BankSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = BANKS.find((b) => b.code === value);
  const filtered = BANKS.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.fullName.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 text-white text-sm transition-colors"
      >
        {selected ? (
          <span className="font-medium">
            {selected.name}{" "}
            <span className="text-white/50 font-normal text-xs">
              — {selected.fullName}
            </span>
          </span>
        ) : (
          <span className="text-white/40">Chọn ngân hàng...</span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-white/40 transition-transform flex-shrink-0 ml-2 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl bg-[#1e1235] border border-white/15 shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/8">
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm ngân hàng..."
              className="w-full px-3 py-2 rounded-lg bg-white/8 text-white text-sm placeholder-white/35 outline-none border border-white/10 focus:border-[#a78bfa]/50"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto divide-y divide-white/5">
            {filtered.length === 0 && (
              <li className="px-4 py-3 text-white/40 text-sm">
                Không tìm thấy ngân hàng
              </li>
            )}
            {filtered.map((bank) => (
              <li key={bank.code}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(bank.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-white/8 transition-colors ${value === bank.code ? "bg-[#a78bfa]/10" : ""}`}
                >
                  <span className="text-[10px] font-bold text-[#a78bfa] bg-[#a78bfa]/15 px-1.5 py-0.5 rounded w-14 text-center flex-shrink-0 truncate">
                    {bank.code}
                  </span>
                  <span className="text-white text-sm font-medium">
                    {bank.name}
                  </span>
                  {value === bank.code && (
                    <Check className="w-3.5 h-3.5 text-[#a78bfa] ml-auto flex-shrink-0" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Success overlay ──────────────────────────────────────────────────────────
function SuccessScreen({ plan }: { plan: (typeof PLANS)[PlanId] }) {
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0e0720]/90 backdrop-blur-sm px-4">
      <div className="bg-gradient-to-b from-[#2a1845] to-[#1e1235] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
          <Check className="w-8 h-8 text-emerald-400" strokeWidth={2.5} />
        </div>
        <h2 className="text-white font-bold text-xl mb-2">
          Thanh toán thành công!
        </h2>
        <p className="text-white/50 text-sm mb-1">
          Gói <span className="text-white font-medium">{plan.label}</span> đã
          được kích hoạt.
        </p>
        <p className="text-white/40 text-xs mb-7">
          Cảm ơn bạn đã tin tưởng SmartVideo Pro ✨
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:opacity-90 transition-opacity"
        >
          Bắt đầu học ngay
        </button>
      </div>
    </div>
  );
}

// ─── Field helper ─────────────────────────────────────────────────────────────
const inputCls = (hasError: boolean) =>
  `w-full px-4 py-3 rounded-xl bg-white/5 border text-white text-sm placeholder-white/30 outline-none transition-colors ${
    hasError
      ? "border-red-500/60 focus:border-red-400"
      : "border-white/10 focus:border-[#a78bfa]/60"
  }`;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-white/60 text-xs font-medium mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  copyable,
  highlight,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  highlight?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-white/40 text-xs flex-shrink-0">{label}</span>
      <span
        className={`font-medium text-xs text-right ${highlight ? "text-[#c4b5fd]" : "text-white"}`}
      >
        {value}
      </span>
      {copyable && (
        <button
          type="button"
          onClick={copy}
          className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded bg-white/8 border border-white/10 text-white/50 hover:text-white hover:border-white/25 transition-colors"
        >
          {copied ? "Đã sao chép" : "Sao chép"}
        </button>
      )}
    </div>
  );
}

// ─── Main checkout content ────────────────────────────────────────────────────
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = (searchParams.get("plan") as PlanId) || "monthly";
  const plan = PLANS[planId] ?? PLANS.monthly;

  const [method, setMethod] = useState<PaymentMethod>("card");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (method === "card") {
      if (!cardName.trim()) e.cardName = "Vui lòng nhập tên chủ thẻ";
      if (cardNumber.replace(/\s/g, "").length < 16)
        e.cardNumber = "Số thẻ không hợp lệ";
      if (expiry.length < 5) e.expiry = "Ngày hết hạn không hợp lệ";
      if (cvv.length < 3) e.cvv = "CVV không hợp lệ";
    } else {
      if (!selectedBank) e.bank = "Vui lòng chọn ngân hàng";
    }
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 1800));
    // Persist premium to backend
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("http://localhost:5000/api/auth/upgrade", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            planId,
            label: plan.label,
            price: plan.price,
            unit: plan.unit,
          }),
        });
      }
    } catch {
      // Non-blocking — still show success UI
    }
    // Cập nhật user object trong localStorage để các component đọc ngay đúng giá trị
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const user = JSON.parse(rawUser);
        user.is_premium = true;
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch {}
    // Cập nhật cache plan
    localStorage.setItem(
      "smartvideo_pro_plan",
      JSON.stringify({
        planId,
        label: plan.label,
        price: plan.price,
        unit: plan.unit,
        activatedAt: new Date().toISOString(),
      }),
    );
    setLoading(false);
    setSuccess(true);
  }

  if (success) return <SuccessScreen plan={plan} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0e0720] via-[#1a0f2e] to-[#0e0720] text-white">
      {/* Top bar */}
      <div className="border-b border-white/8 px-6 py-4 flex items-center">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <div className="mx-auto flex items-center gap-2">
          <span className="font-bold text-white text-base">
            Smart<span className="text-[#a78bfa]">Video</span>
          </span>
          <span className="text-white/20 text-sm">·</span>
          <span className="text-white/50 text-sm">Thanh toán</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/35 text-xs">
          <Lock className="w-3.5 h-3.5" />
          SSL 256-bit
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* ── LEFT: Form ── */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Billing cycle */}
          <section className="bg-white/4 border border-white/8 rounded-2xl p-5">
            <h2 className="text-white font-semibold text-sm mb-4">
              Chu kỳ thanh toán
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {(
                Object.entries(PLANS) as [PlanId, (typeof PLANS)[PlanId]][]
              ).map(([id, p]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => router.replace(`/checkout?plan=${id}`)}
                  className={`relative rounded-xl border p-3 text-left transition-all duration-150 ${
                    planId === id
                      ? "border-[#a78bfa]/60 bg-[#a78bfa]/10 shadow-[0_0_12px_rgba(167,139,250,0.15)]"
                      : "border-white/8 hover:border-white/20"
                  }`}
                >
                  <div className="text-white/60 text-[10px] font-medium uppercase tracking-wider mb-1">
                    {p.label}
                  </div>
                  <div className="text-white font-bold text-base">
                    {formatPrice(p.price)}₫
                  </div>
                  {p.saving && (
                    <div className="text-emerald-400 text-[10px] font-medium mt-0.5">
                      {p.saving}
                    </div>
                  )}
                  {planId === id && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#a78bfa] flex items-center justify-center">
                      <Check
                        className="w-2.5 h-2.5 text-white"
                        strokeWidth={3}
                      />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Payment method */}
          <section className="bg-white/4 border border-white/8 rounded-2xl p-5">
            <h2 className="text-white font-semibold text-sm mb-4">
              Phương thức thanh toán
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(
                [
                  {
                    id: "card" as const,
                    label: "Thẻ tín dụng / ghi nợ",
                    icon: CreditCard,
                  },
                  {
                    id: "bank" as const,
                    label: "Chuyển khoản ngân hàng",
                    icon: Landmark,
                  },
                ] as {
                  id: PaymentMethod;
                  label: string;
                  icon: React.ElementType;
                }[]
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setMethod(id);
                    setErrors({});
                  }}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    method === id
                      ? "border-[#a78bfa]/60 bg-[#a78bfa]/10 text-white"
                      : "border-white/10 text-white/50 hover:text-white hover:border-white/20"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </div>

            {/* Card form */}
            {method === "card" && (
              <div className="space-y-4">
                <Field label="Tên chủ thẻ" error={errors.cardName}>
                  <input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="NGUYEN VAN A"
                    className={inputCls(!!errors.cardName)}
                  />
                </Field>
                <Field label="Số thẻ" error={errors.cardNumber}>
                  <div className="relative">
                    <input
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(formatCardNumber(e.target.value))
                      }
                      placeholder="0000 0000 0000 0000"
                      className={inputCls(!!errors.cardNumber) + " pr-12"}
                    />
                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/25" />
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Ngày hết hạn" error={errors.expiry}>
                    <input
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      className={inputCls(!!errors.expiry)}
                    />
                  </Field>
                  <Field label="CVV / CVC" error={errors.cvv}>
                    <input
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      placeholder="•••"
                      type="password"
                      className={inputCls(!!errors.cvv)}
                    />
                  </Field>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {["VISA", "MC", "JCB", "AMEX", "NAPAS"].map((c) => (
                    <span
                      key={c}
                      className="px-2 py-1 rounded bg-white/8 border border-white/10 text-[10px] font-bold text-white/60 tracking-wider"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bank transfer */}
            {method === "bank" && (
              <div className="space-y-5">
                <Field label="Chọn ngân hàng" error={errors.bank}>
                  <BankSelector
                    value={selectedBank}
                    onChange={setSelectedBank}
                  />
                </Field>
                {selectedBank && (
                  <div className="bg-[#a78bfa]/8 border border-[#a78bfa]/20 rounded-xl p-4 space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-[#c4b5fd] font-semibold text-xs uppercase tracking-wide mb-1">
                      <Landmark className="w-3.5 h-3.5" />
                      Thông tin chuyển khoản
                    </div>
                    <InfoRow
                      label="Ngân hàng"
                      value={
                        BANKS.find((b) => b.code === selectedBank)?.name ?? ""
                      }
                    />
                    <InfoRow
                      label="Số tài khoản"
                      value="1900 1234 5678 90"
                      copyable
                    />
                    <InfoRow
                      label="Chủ tài khoản"
                      value="CONG TY TNHH SMARTVIDEO"
                    />
                    <InfoRow
                      label="Số tiền"
                      value={`${formatPrice(plan.price)}₫`}
                      highlight
                    />
                    <InfoRow
                      label="Nội dung CK"
                      value={`SMARTVIDEO PRO ${planId.toUpperCase()} ${Date.now().toString().slice(-6)}`}
                      copyable
                    />
                    <p className="text-white/40 text-xs pt-2 border-t border-white/8">
                      Vui lòng chuyển khoản đúng số tiền và nội dung. Gói Pro
                      kích hoạt trong 5–15 phút sau khi nhận thanh toán.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:from-[#6d28d9] hover:to-[#4f46e5] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_24px_rgba(124,58,237,0.4)] transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                Đang xử lý...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                {method === "card"
                  ? `Thanh toán ${formatPrice(plan.price)}₫`
                  : "Tôi đã chuyển khoản"}
              </>
            )}
          </button>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-white/30 text-xs">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Bảo mật SSL 256-bit
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Dữ liệu thẻ được mã hoá
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Huỷ bất kỳ lúc nào
            </span>
          </div>
        </form>

        {/* ── RIGHT: Summary ── */}
        <aside className="space-y-4 lg:sticky lg:top-8">
          {/* Plan card */}
          <div className="bg-gradient-to-b from-[#2a1845]/80 to-[#1e1235]/80 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-white font-bold text-base">
                    SmartVideo Pro
                  </span>
                </div>
                <span className="text-white/50 text-sm">{plan.label}</span>
              </div>
              {plan.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#a78bfa]/20 text-[#c4b5fd] border border-[#a78bfa]/30">
                  {plan.badge}
                </span>
              )}
            </div>
            <div className="space-y-2 text-sm border-t border-white/8 pt-4">
              {plan.saving && (
                <div className="flex justify-between text-emerald-400 text-xs">
                  <span>{plan.saving}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-base">
                <span>
                  Tổng cộng{" "}
                  <span className="text-white/40 font-normal text-xs">
                    (đã gồm thuế)
                  </span>
                </span>
                <span>{formatPrice(plan.price)}₫</span>
              </div>
            </div>
          </div>

          {/* Perks */}
          <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
            <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-3">
              Quyền lợi bao gồm
            </h3>
            <ul className="space-y-2.5">
              {[
                { icon: Infinity, text: "Không giới hạn độ dài video" },
                { icon: BookOpen, text: "Luyện từ vựng với Flashcard" },
                { icon: Sparkles, text: "AI gợi ý nội dung hấp dẫn" },
                { icon: Check, text: "Transcript chi tiết từng câu" },
                { icon: Check, text: "Lưu từ vựng không giới hạn" },
                { icon: Check, text: "Không quảng cáo" },
                { icon: Check, text: "Hỗ trợ ưu tiên 24/7" },
              ].map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-2.5 text-white/60 text-sm"
                >
                  <span className="w-4 h-4 rounded-full bg-[#a78bfa]/15 flex items-center justify-center flex-shrink-0">
                    <Icon
                      className="w-2.5 h-2.5 text-[#c4b5fd]"
                      strokeWidth={3}
                    />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Guarantee */}
          <div className="flex items-start gap-3 bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-300 font-semibold text-sm">
                Hoàn tiền trong 7 ngày
              </p>
              <p className="text-emerald-400/60 text-xs mt-0.5">
                Không hài lòng? Chúng tôi hoàn tiền 100%, không cần lý do.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0e0720]" />}>
      <CheckoutContent />
    </Suspense>
  );
}

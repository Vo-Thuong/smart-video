"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard, ArrowLeft, Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type BillingCycle = "monthly" | "yearly";
type PaymentMethod = "card" | "paypal";

const PLANS = {
  monthly: { price: 6, label: "/ month", saving: null },
  yearly: { price: 60, label: "/ year", saving: "Save $12" },
};

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

export default function CheckoutPage() {
  const router = useRouter();

  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const plan = PLANS[billing];

  function validate() {
    const e: Record<string, string> = {};
    if (method === "card") {
      const rawCard = cardNumber.replace(/\s/g, "");
      if (rawCard.length !== 16) e.cardNumber = "Card number must be 16 digits";
      if (expiry.length < 5) e.expiry = "Enter expiry as MM/YY";
      if (cvv.length < 3) e.cvv = "CVV must be 3–4 digits";
      if (!cardName.trim()) e.cardName = "Cardholder name is required";
      if (!address.trim()) e.address = "Address is required";
      if (!city.trim()) e.city = "City is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handlePay() {
    if (!validate()) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1800);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-3xl p-10 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-8">
            You are now on the <span className="text-green-500 font-semibold">Pro plan</span>. Enjoy all premium features.
          </p>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white w-full"
            onClick={() => router.push("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="grid md:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Left – Payment form */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-foreground mb-1">Upgrade to Pro</h1>
            <p className="text-muted-foreground text-sm mb-8">Complete your purchase below</p>

            {/* Billing cycle toggle */}
            <div className="mb-8">
              <p className="text-sm font-medium text-foreground mb-3">Billing cycle</p>
              <div className="flex gap-3">
                {(["monthly", "yearly"] as BillingCycle[]).map((cycle) => (
                  <button
                    key={cycle}
                    onClick={() => setBilling(cycle)}
                    className={`flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      billing === cycle
                        ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                        : "border-border bg-background text-muted-foreground hover:border-green-400"
                    }`}
                  >
                    <span className="block font-semibold capitalize">{cycle}</span>
                    <span className="text-xs opacity-80">
                      ${PLANS[cycle].price}{PLANS[cycle].label}
                      {PLANS[cycle].saving && (
                        <span className="ml-1 text-green-500">{PLANS[cycle].saving}</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment method tabs */}
            <div className="mb-8">
              <p className="text-sm font-medium text-foreground mb-3">Payment method</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setMethod("card")}
                  className={`flex items-center gap-2 py-2.5 px-5 rounded-xl border text-sm font-medium transition-all ${
                    method === "card"
                      ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "border-border text-muted-foreground hover:border-blue-400"
                  }`}
                >
                  <CreditCard size={16} /> Credit / Debit Card
                </button>
                <button
                  onClick={() => setMethod("paypal")}
                  className={`flex items-center gap-2 py-2.5 px-5 rounded-xl border text-sm font-medium transition-all ${
                    method === "paypal"
                      ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "border-border text-muted-foreground hover:border-blue-400"
                  }`}
                >
                  {/* PayPal "P" logo */}
                  <span className="font-bold text-[#003087]">Pay</span>
                  <span className="font-bold text-[#009cde]">Pal</span>
                </button>
              </div>
            </div>

            {method === "card" ? (
              <div className="space-y-5">
                {/* Card number */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Card number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className={`w-full bg-background border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${errors.cardNumber ? "border-red-500" : "border-border"}`}
                  />
                  {errors.cardNumber && <p className="text-xs text-red-500 mt-1">{errors.cardNumber}</p>}
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Expiry date</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      className={`w-full bg-background border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${errors.expiry ? "border-red-500" : "border-border"}`}
                    />
                    {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">CVV</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      placeholder="•••"
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className={`w-full bg-background border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${errors.cvv ? "border-red-500" : "border-border"}`}
                    />
                    {errors.cvv && <p className="text-xs text-red-500 mt-1">{errors.cvv}</p>}
                  </div>
                </div>

                {/* Cardholder name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Cardholder name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className={`w-full bg-background border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${errors.cardName ? "border-red-500" : "border-border"}`}
                  />
                  {errors.cardName && <p className="text-xs text-red-500 mt-1">{errors.cardName}</p>}
                </div>

                {/* Billing address */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Billing address</label>
                  <input
                    type="text"
                    placeholder="123 Main St, Apt 4B"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full bg-background border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${errors.address ? "border-red-500" : "border-border"}`}
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">City</label>
                  <input
                    type="text"
                    placeholder="Ho Chi Minh City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`w-full bg-background border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${errors.city ? "border-red-500" : "border-border"}`}
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>
              </div>
            ) : (
              /* PayPal method */
              <div className="rounded-2xl border border-border bg-background p-8 text-center">
                <div className="text-3xl font-bold mb-2">
                  <span className="text-[#003087]">Pay</span>
                  <span className="text-[#009cde]">Pal</span>
                </div>
                <p className="text-muted-foreground text-sm mb-6">
                  You will be redirected to PayPal to complete your payment securely.
                </p>
                <div className="bg-secondary/40 rounded-xl p-4 text-sm text-muted-foreground">
                  Amount: <span className="font-semibold text-foreground">${plan.price} {plan.label}</span>
                </div>
              </div>
            )}

            {/* Pay button */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-5">
                <span>Total due today</span>
                <span className="text-xl font-bold text-foreground">${plan.price}</span>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold shadow-lg shadow-green-500/20 rounded-xl"
                onClick={handlePay}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : method === "paypal" ? (
                  "Continue with PayPal"
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock size={16} /> Pay ${plan.price}
                  </span>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                <Lock size={12} /> Secured by 256-bit SSL encryption
              </p>
            </div>
          </div>

          {/* Right – Order summary */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-6">Order Summary</h2>

            {/* Plan badge */}
            <div className="flex items-center justify-between mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/30">
              <div>
                <p className="font-semibold text-foreground">Pro Plan</p>
                <p className="text-sm text-muted-foreground capitalize">{billing} billing</p>
              </div>
              <Badge className="bg-green-500 text-white border-none">Most Popular</Badge>
            </div>

            {/* Features included */}
            <ul className="space-y-3 mb-8">
              {[
                "Unlimited video lessons",
                "AI vocabulary flashcards",
                "Interactive transcripts",
                "Pronunciation feedback",
                "Progress analytics",
                "Priority support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500 shrink-0" /> {f}
                </li>
              ))}
            </ul>

            {/* Price breakdown */}
            <div className="border-t border-border pt-5 space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Pro Plan ({billing})</span>
                <span>${plan.price}</span>
              </div>
              {billing === "yearly" && (
                <div className="flex justify-between text-green-500">
                  <span>Annual discount</span>
                  <span>-$12</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-foreground text-base border-t border-border pt-3">
                <span>Total</span>
                <span>${plan.price}</span>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-secondary/40 text-xs text-muted-foreground flex items-start gap-2">
              <Zap size={14} className="text-yellow-500 shrink-0 mt-0.5" />
              Cancel anytime. No hidden fees. Your plan activates immediately after payment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

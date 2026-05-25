"use client";

import React, { createContext, useContext, useState } from "react";

export type Lang = "en" | "vi";

export const translations = {
  en: {
    // Navbar
    nav: {
      howItWorks: "How it works",
      features: "Features",
      pricing: "Pricing",
      signIn: "Sign In",
      getStarted: "Get Started",
    },
    // Hero
    hero: {
      badge: "AI-Powered Transcription ✨",
      headline1: "Master Languages",
      headline2: "Through Dictation.",
      description:
        "Improve your listening and writing skills by practicing with your favorite videos. Smart-Video turns any content into a personalized learning experience.",
      cta: "Get Started Free",
      demo: "View Live Demo",
    },
    // Features (3-col simple)
    features: {
      items: [
        {
          title: "Any Video Source",
          desc: "Upload local files or paste links to practice with your favorite content.",
        },
        {
          title: "Interactive Typing",
          desc: "Type along with real-time feedback and automatic timestamp synchronization.",
        },
        {
          title: "Instant Evaluation",
          desc: "Get immediate corrections for spelling and grammar as you practice.",
        },
      ],
    },
    // Features grid
    featuresGrid: {
      heading: "Everything You Need to Master English Listening",
      subheading: "Powerful AI-driven features designed for serious learners",
      items: [
        {
          title: "Learn from Any YouTube Video",
          desc: "Add any YouTube video — AI generates perfect transcripts with translations in 70+ languages.",
        },
        {
          title: "No more manual rewinding",
          desc: "Auto-pause after each sentence. Set repeat count (1–5 times). Focus on listening.",
        },
        {
          title: "Instant Accuracy Feedback",
          desc: "See exactly which words you missed with word-by-word comparison.",
        },
        {
          title: "Shadowing with AI Scoring",
          desc: "Record your voice, get instant AI feedback on pronunciation.",
        },
        {
          title: "Auto-tracked Vocabulary",
          desc: "Words you struggle with are automatically saved to your vocabulary book.",
        },
        {
          title: "Track Progress & Stay Motivated",
          desc: "Detailed reports on your mistakes, learning analytics, and leaderboard.",
        },
      ],
    },
    // Pricing
    pricing: {
      label: "Pricing",
      heading: "Pricing for Different Account Types",
      paymentGuide: "(Vietnam domestic payment guide)",
      plans: [
        {
          name: "Free",
          tagline: "Perfect for trying out",
          price: "$0",
          priceSub: "Free Forever",
          cta: "Start",
          features: ["1 video/day (1 min limit)", "10 shadowing practices", "AI transcription"],
        },
        {
          name: "Pro",
          tagline: "For dedicated language learners",
          price: "$6",
          priceSub: "/month",
          cta: "Upgrade",
          badge: "MOST POPULAR",
          features: [
            "Unlimited video length",
            "Full video dictation",
            "Save notes for sentences",
            "Priority processing",
          ],
        },
        {
          name: "Organize",
          tagline: "For teachers and organizations",
          price: "Contact Us",
          priceSub: "",
          cta: "Contact Sales",
          features: ["Custom subdomain", "Student dashboard"],
        },
      ],
    },
    // Footer
    footer: {
      brandDesc:
        "An intelligent language learning platform leveraging AI and Dictation methods to help you master listening and writing skills naturally and effectively.",
      columns: {
        product: {
          heading: "Product",
          links: ["Explore Videos", "Dictation Practice", "Pro Plan (AI Premium)", "Download Flutter App"],
        },
        resources: {
          heading: "Resources",
          links: ["Documentation", "Feedback & Ideas", "Terms of Service", "Privacy Policy"],
        },
        contact: {
          heading: "Contact",
          email: "Email",
          telegram: "Telegram",
          newsletter: "Newsletter",
          newsletterPlaceholder: "Your email...",
          subscribe: "Subscribe",
        },
      },
      copyright: "All rights reserved.",
    },
  },

  vi: {
    // Navbar
    nav: {
      howItWorks: "Cách hoạt động",
      features: "Tính năng",
      pricing: "Bảng giá",
      signIn: "Đăng nhập",
      getStarted: "Bắt đầu ngay",
    },
    // Hero
    hero: {
      badge: "Chuyển giọng nói bằng AI ✨",
      headline1: "Thành thạo Ngoại ngữ",
      headline2: "qua Luyện Nghe Chép.",
      description:
        "Cải thiện kỹ năng nghe và viết bằng cách luyện tập cùng những video yêu thích. Smart-Video biến mọi nội dung thành trải nghiệm học tập cá nhân hóa.",
      cta: "Dùng thử miễn phí",
      demo: "Xem Demo",
    },
    // Features (3-col simple)
    features: {
      items: [
        {
          title: "Mọi nguồn video",
          desc: "Tải file hoặc dán link để luyện tập cùng nội dung yêu thích của bạn.",
        },
        {
          title: "Gõ theo tương tác",
          desc: "Gõ theo thời gian thực với phản hồi ngay lập tức và đồng bộ mốc thời gian tự động.",
        },
        {
          title: "Đánh giá tức thì",
          desc: "Nhận sửa lỗi chính tả và ngữ pháp ngay khi bạn luyện tập.",
        },
      ],
    },
    // Features grid
    featuresGrid: {
      heading: "Tất cả những gì bạn cần để thành thạo Tiếng Anh",
      subheading: "Các tính năng AI mạnh mẽ được thiết kế cho người học nghiêm túc",
      items: [
        {
          title: "Học từ bất kỳ video YouTube nào",
          desc: "Thêm video YouTube bất kỳ — AI tạo bản chép lời chính xác với bản dịch hơn 70 ngôn ngữ.",
        },
        {
          title: "Không cần tua lại thủ công",
          desc: "Tự động dừng sau mỗi câu. Đặt số lần lặp (1–5 lần). Tập trung vào nghe.",
        },
        {
          title: "Phản hồi độ chính xác tức thì",
          desc: "Xem chính xác từ nào bạn bị sai qua so sánh từng chữ.",
        },
        {
          title: "Luyện phát âm với AI chấm điểm",
          desc: "Ghi âm giọng nói, nhận phản hồi AI tức thì về phát âm.",
        },
        {
          title: "Từ vựng được theo dõi tự động",
          desc: "Những từ bạn hay mắc lỗi được tự động lưu vào sổ tay từ vựng.",
        },
        {
          title: "Theo dõi tiến độ & duy trì động lực",
          desc: "Báo cáo chi tiết về lỗi sai, phân tích học tập và bảng xếp hạng.",
        },
      ],
    },
    // Pricing
    pricing: {
      label: "Bảng giá",
      heading: "Gói phù hợp với mọi nhu cầu",
      paymentGuide: "(Hướng dẫn thanh toán nội địa Việt Nam)",
      plans: [
        {
          name: "Miễn phí",
          tagline: "Hoàn hảo để trải nghiệm",
          price: "$0",
          priceSub: "Mãi mãi miễn phí",
          cta: "Bắt đầu",
          features: ["1 video/ngày (tối đa 1 phút)", "10 lượt luyện shadowing", "Chuyển giọng nói AI"],
        },
        {
          name: "Pro",
          tagline: "Dành cho người học nghiêm túc",
          price: "$6",
          priceSub: "/tháng",
          cta: "Nâng cấp",
          badge: "PHỔ BIẾN NHẤT",
          features: [
            "Không giới hạn độ dài video",
            "Nghe chép toàn bộ video",
            "Lưu ghi chú từng câu",
            "Xử lý ưu tiên",
          ],
        },
        {
          name: "Tổ chức",
          tagline: "Dành cho giáo viên và tổ chức",
          price: "Liên hệ",
          priceSub: "",
          cta: "Liên hệ Sales",
          features: ["Tên miền phụ tùy chỉnh", "Bảng điều khiển học viên"],
        },
      ],
    },
    // Footer
    footer: {
      brandDesc:
        "Nền tảng học ngôn ngữ thông minh ứng dụng AI và phương pháp Nghe Chép giúp bạn thành thạo kỹ năng nghe và viết một cách tự nhiên và hiệu quả.",
      columns: {
        product: {
          heading: "Sản phẩm",
          links: ["Khám phá video", "Luyện nghe chép", "Gói Pro (AI Premium)", "Tải ứng dụng Flutter"],
        },
        resources: {
          heading: "Tài nguyên",
          links: ["Tài liệu hướng dẫn", "Phản hồi & Ý kiến", "Điều khoản dịch vụ", "Chính sách bảo mật"],
        },
        contact: {
          heading: "Liên hệ",
          email: "Email",
          telegram: "Telegram",
          newsletter: "Bản tin",
          newsletterPlaceholder: "Email của bạn...",
          subscribe: "Đăng ký",
        },
      },
      copyright: "Bảo lưu mọi quyền.",
    },
  },
} as const;

export type Translations = typeof translations.en;

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Hero = () => {
  return (
    <section className="pt-32 pb-10 px-6 text-center">
      {/* Badge: Sử dụng màu primary để luôn nổi bật */}
      <Badge
        variant="outline"
        className="mb-4 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 px-3 py-1"
      >
        AI-Powered Transcription ✨
      </Badge>

      {/* Headline: Thay 'from-white' bằng 'from-foreground' để tự đổi màu theo theme */}
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
        Master Languages <br /> Through Dictation.
      </h1>

      {/* Description: Thay 'text-zinc-400' bằng 'text-muted-foreground' */}
      <p className="max-w-2xl mx-auto text-muted-foreground text-lg mb-10 leading-relaxed">
        Improve your listening and writing skills by practicing with your
        favorite videos. Smart-Video turns any content into a personalized
        learning experience.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {/* Button chính: Giữ nguyên vì xanh blue hiển thị tốt trên cả 2 nền */}
        <Button
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 px-8 text-md font-semibold text-white shadow-lg shadow-blue-500/20"
        >
          Get Started Free
        </Button>

        {/* Button phụ: Thay 'border-zinc-800' và 'text-white' bằng class hệ thống */}
        <Button
          size="lg"
          variant="outline"
          className="border-border hover:bg-accent hover:text-accent-foreground text-foreground"
        >
          View Live Demo
        </Button>
      </div>
    </section>
  );
};

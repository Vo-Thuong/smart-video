import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden px-4 pt-24">
      {/* Hiệu ứng nền mờ cho đẹp */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px]" />
      </div>

      {/* Gọi component form mà bạn đã chia file */}
      <SignUpForm />
    </main>
  );
}

import { GoogleOAuthProvider } from "@react-oauth/google";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden px-4 pt-24">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px]" />
      </div>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <SignInForm />
        </GoogleOAuthProvider>
      ) : (
        <div className="z-10 text-center p-6 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 max-w-md">
          <p className="font-semibold">Lỗi cấu hình hệ thống!</p>
          <p className="text-sm mt-1 opacity-90">
            Thiếu biến{" "}
            <code className="bg-background px-1 py-0.5 rounded text-xs font-mono font-bold">
              NEXT_PUBLIC_GOOGLE_CLIENT_ID
            </code>{" "}
            trong file{" "}
            <code className="bg-background px-1 py-0.5 rounded text-xs font-mono">
              .env.local
            </code>
            .
          </p>
        </div>
      )}
    </main>
  );
}

import { Suspense } from "react";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] w-full flex-1 flex-col bg-background px-4 py-10 md:min-h-screen md:py-12" />
      }
    >
      <LoginForm />
    </Suspense>
  );
}

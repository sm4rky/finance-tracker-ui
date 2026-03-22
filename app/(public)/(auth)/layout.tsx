import { LoginHero } from "@/components/login-hero";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <LoginHero />
      <div className="flex min-h-[100dvh] flex-1 flex-col md:min-h-screen">
        {children}
      </div>
    </div>
  );
}

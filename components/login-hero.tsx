import Image from "next/image";

export function LoginHero() {
  return (
    <aside
      className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground dark:bg-background dark:text-foreground md:flex lg:p-12"
      aria-label="MoneyInsight"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-primary-foreground/5 dark:bg-foreground/5"
        aria-hidden
      />
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-foreground/15 p-2.5 ring-1 ring-primary-foreground/20 dark:bg-foreground/10 dark:ring-foreground/15">
            <Image
              src="/money-insight-logo-dark-mode.svg"
              alt=""
              width={160}
              height={160}
              className="h-6 w-auto max-w-full object-contain"
              priority
            />
          </div>
          <div>
            <p className="font-heading text-xl font-semibold tracking-tight">
              MoneyInsight
            </p>
            <span className="mt-1 inline-flex rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-2.5 py-0.5 text-xs font-medium dark:border-foreground/20 dark:bg-foreground/10">
              Early Access
            </span>
          </div>
        </div>
      </div>
      <div className="relative z-10 max-w-sm">
        <p className="font-heading text-2xl font-medium leading-snug text-primary-foreground lg:text-3xl dark:text-foreground">
          Your personal finance companion.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Track spending, plan goals, and see the full picture—built for clarity,
          not clutter.
        </p>
      </div>
      <p className="relative z-10 text-xs text-muted-foreground">
        © {new Date().getFullYear()} MoneyInsight
      </p>
    </aside>
  );
}

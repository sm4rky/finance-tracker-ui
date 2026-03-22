import Image from "next/image";

export function MobileBrand() {
  return (
    <div className="mb-8 flex flex-col items-center md:hidden">
      <Image
        src="/money-insight-logo-dark-mode.svg"
        alt=""
        width={160}
        height={160}
        className="h-10 w-auto"
        priority
      />
      <p className="mt-3 font-heading text-lg font-semibold text-foreground">
        MoneyInsight
      </p>
      <span className="mt-2 inline-flex rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
        Early Access
      </span>
    </div>
  );
}

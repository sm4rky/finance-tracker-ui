import { type LucideIcon } from "lucide-react";

type FeatureRowProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function FeatureRow({
  icon: Icon,
  title,
  description,
}: FeatureRowProps) {
  return (
    <li className="flex gap-3 rounded-lg bg-muted/60 p-3 dark:bg-muted/40">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
        aria-hidden
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </div>

      <div className="min-w-0 space-y-0.5 text-left">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs leading-snug text-muted-foreground">
          {description}
        </p>
      </div>
    </li>
  );
}

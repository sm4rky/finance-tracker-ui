import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";

import { getPfcPrmaryMeta } from "@/lib/pfc-primary";
import { cn } from "@/lib/utils";

export type PfcPrimaryNodeData = {
  code: string;
} & Record<string, unknown>;

export type PfcPrimaryNode = Node<PfcPrimaryNodeData, "pfcPrimary">;

export type PfcPrimaryFlowNodeProps = NodeProps<PfcPrimaryNode>;

export function PfcPrimaryFlowNode({ data }: PfcPrimaryFlowNodeProps) {
  const meta = getPfcPrmaryMeta(data.code);
  const Icon = meta.Icon;

  return (
    <div className="min-w-64 rounded-xl border bg-card px-3 py-2 text-card-foreground shadow-sm">
      <Handle
        type="target"
        position={Position.Right}
        className="size-3! border-background! bg-primary!"
      />
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            meta.fallbackIconClassName,
          )}
          aria-hidden
        >
          <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
        </span>
        <div className="min-w-0 truncate font-medium">{meta.displayName}</div>
      </div>
    </div>
  );
}

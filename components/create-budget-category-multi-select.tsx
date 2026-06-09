"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FieldError as HookFormFieldError } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CreateBudgetCategoryOption = {
  id: string;
  label: string;
  badgeClassName: string;
};

export type CreateBudgetCategoryMultiSelectProps = {
  options: CreateBudgetCategoryOption[];
  value: string[];
  disabled: boolean;
  error?: HookFormFieldError;
  emptyMessage: string;
  onChange: (value: string[]) => void;
};

function toggleValue(
  values: string[],
  value: string,
  checked: boolean,
): string[] {
  if (checked) return values.includes(value) ? values : [...values, value];
  return values.filter((item) => item !== value);
}

export function CreateBudgetCategoryMultiSelect({
  options,
  value,
  disabled,
  error,
  emptyMessage,
  onChange,
}: CreateBudgetCategoryMultiSelectProps) {
  const [search, setSearch] = useState("");
  const selectedOptions = options.filter((option) => value.includes(option.id));
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const allSelected =
    options.length > 0 && options.every((option) => value.includes(option.id));

  function updateOption(id: string, checked: boolean) {
    onChange(toggleValue(value, id, checked));
  }

  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel>Categories</FieldLabel>
      <FieldContent>
        <DropdownMenu
          modal={false}
          onOpenChange={(open) => {
            if (!open) setSearch("");
          }}
        >
          <DropdownMenuTrigger
            type="button"
            disabled={disabled}
            className={cn(
              buttonVariants({
                variant: value.length > 0 ? "secondary" : "outline",
                size: "sm",
              }),
              "min-h-10 h-auto w-full justify-between gap-2 border-dashed py-2 text-sm font-normal whitespace-normal",
            )}
          >
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-left">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                  <Badge
                    key={option.id}
                    variant="outline"
                    className={cn(
                      "max-w-[min(100%,16rem)] truncate border font-normal text-xs",
                      option.badgeClassName,
                    )}
                  >
                    {option.label}
                  </Badge>
                ))
              ) : (
                <span className="truncate text-muted-foreground">
                  Select categories
                </span>
              )}
            </span>
            <ChevronDown className="size-3.5 shrink-0 opacity-60" aria-hidden />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="max-h-72 overflow-y-auto p-1"
          >
            <div
              className="px-1 py-1.5"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-8 text-sm"
                autoComplete="off"
                aria-label="Search categories"
                onPointerDown={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                onKeyUp={(event) => event.stopPropagation()}
              />
            </div>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              closeOnClick={false}
              onClick={(event) => {
                event.preventDefault();
                onChange(allSelected ? [] : options.map((option) => option.id));
              }}
              className="cursor-pointer gap-2 py-1.5 pr-2 pl-1.5"
            >
              <span
                className="pointer-events-none flex shrink-0 items-center"
                aria-hidden
              >
                <Checkbox checked={allSelected} tabIndex={-1} />
              </span>
              <span className="min-w-0 flex-1 text-xs font-medium">
                Select all
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {filteredOptions.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                {options.length === 0 ? emptyMessage : "No matches"}
              </p>
            ) : (
              filteredOptions.map((option) => {
                const checked = value.includes(option.id);
                return (
                  <DropdownMenuItem
                    key={option.id}
                    closeOnClick={false}
                    onClick={(event) => {
                      event.preventDefault();
                      updateOption(option.id, !checked);
                    }}
                    className="cursor-pointer gap-2 py-1.5 pr-2 pl-1.5"
                  >
                    <span
                      className="pointer-events-none flex shrink-0 items-center"
                      aria-hidden
                    >
                      <Checkbox checked={checked} tabIndex={-1} />
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 border font-normal text-xs",
                        option.badgeClassName,
                      )}
                    >
                      {option.label}
                    </Badge>
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <FieldError errors={[error]} />
      </FieldContent>
    </Field>
  );
}

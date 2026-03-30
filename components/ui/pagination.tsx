"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";

import { Button, type buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="pagination-item"
      className={cn("", className)}
      {...props}
    />
  );
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<VariantProps<typeof buttonVariants>, "size"> &
  React.ComponentProps<typeof Button>;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      type="button"
      role="link"
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(
        "data-[active=true]:border-border data-[active=true]:bg-muted data-[active=true]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

type PaginationNavButtonProps = React.ComponentProps<typeof Button> & {
  label: string;
};

function PaginationNavButton({
  className,
  label,
  children,
  ...props
}: PaginationNavButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className={cn(className)}
      aria-label={label}
      {...props}
    >
      {children}
    </Button>
  );
}

function PaginationPrevious({
  className,
  ...props
}: Omit<PaginationNavButtonProps, "label" | "children">) {
  return (
    <PaginationNavButton label="Previous page" className={className} {...props}>
      <ChevronLeft className="size-4" />
    </PaginationNavButton>
  );
}

function PaginationNext({
  className,
  ...props
}: Omit<PaginationNavButtonProps, "label" | "children">) {
  return (
    <PaginationNavButton label="Next page" className={className} {...props}>
      <ChevronRight className="size-4" />
    </PaginationNavButton>
  );
}

function PaginationFirst({
  className,
  ...props
}: Omit<PaginationNavButtonProps, "label" | "children">) {
  return (
    <PaginationNavButton label="First page" className={className} {...props}>
      <ChevronsLeft className="size-4" />
    </PaginationNavButton>
  );
}

function PaginationLast({
  className,
  ...props
}: Omit<PaginationNavButtonProps, "label" | "children">) {
  return (
    <PaginationNavButton label="Last page" className={className} {...props}>
      <ChevronsRight className="size-4" />
    </PaginationNavButton>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pagination-ellipsis"
      aria-hidden
      className={cn("flex size-8 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4 text-muted-foreground" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};

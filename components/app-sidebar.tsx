"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, LayoutDashboard, Repeat } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/subscriptions", label: "Subscriptions", icon: Repeat },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-0 border-0 p-2">
        <div className="flex min-h-12 w-full items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Link
            href="/"
            className="inline-flex shrink-0 rounded-xl outline-none ring-sidebar-ring focus-visible:ring-2"
            aria-label="MoneyInsight home"
          >
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-foreground/15 p-2.5 ring-1 ring-primary-foreground/20 group-data-[collapsible=icon]:size-10 dark:bg-foreground/10 dark:ring-foreground/15">
              <Image
                src="/money-insight-logo.svg"
                alt=""
                width={160}
                height={160}
                className="h-6 w-auto max-w-full object-contain dark:hidden"
              />
              <Image
                src="/money-insight-logo-dark-mode.svg"
                alt=""
                width={160}
                height={160}
                className="hidden h-6 w-auto max-w-full object-contain dark:block"
              />
            </div>
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
            <span className="truncate font-heading text-sm font-semibold tracking-tight text-sidebar-foreground">
              MoneyInsight
            </span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              Personal Finance
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>App</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    render={<Link href={href} />}
                    isActive={pathname === href}
                    tooltip={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

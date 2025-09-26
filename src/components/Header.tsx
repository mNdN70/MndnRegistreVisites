"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/hooks/use-translation";

export function Header() {
  const pathname = usePathname();
  const { t, setLanguage } = useTranslation();

  const mainNavLinks = [
    { href: "/", label: t('home') },
    { href: "/configuracion/login?redirectTo=/configuracion/panel", label: t('configuration') },
  ];

  const consultesLinks = [
      { href: "/configuracion/login?redirectTo=/activos", label: t('active_visits') },
      { href: "/configuracion/login?redirectTo=/registros", label: t('consult_records') },
  ]

  const allLinks = [...mainNavLinks.slice(0,1), ...consultesLinks, ...mainNavLinks.slice(1)];


  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={cn(
        "text-muted-foreground transition-colors hover:text-foreground",
        pathname === href && "text-foreground"
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-headline text-2xl font-bold">Menadiona</span>
          </Link>
          <nav className="hidden gap-6 text-lg font-medium md:flex">
             <NavLink href="/" label={t('home')} />
            <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-lg font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none">
                    {t('consultes')} <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                        <Link href="/configuracion/login?redirectTo=/activos">{t('active_visits')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/configuracion/login?redirectTo=/registros">{t('consult_records')}</Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <NavLink href="/configuracion/login?redirectTo=/configuracion/panel" label={t('configuration')} />
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                <Globe className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Toggle language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('ca')}>
                CAT
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('es')}>
                ESP
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                ENG
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
            <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium">
                    <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold"
                    >
                    <span className="sr-only">Menadiona</span>
                    </Link>
                    {allLinks.map((link) => (
                      <NavLink key={link.href} {...link} />
                    ))}
                </nav>
                </SheetContent>
            </Sheet>
            </div>
        </div>

      </div>
    </header>
  );
}

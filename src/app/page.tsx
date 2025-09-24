"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageContainer } from "@/components/PageContainer";
import { LogOut, Truck, User } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

export default function Home() {
  const { t } = useTranslation();

  const actionCards = [
    {
      href: "/entrada",
      title: t("entry"),
      description: t("general_entry_description"),
      icon: <User className="h-12 w-12" />,
    },
    {
      href: "/entrada-transportistas",
      title: t("transporter_entry"),
      description: t("transporter_entry_description"),
      icon: <Truck className="h-12 w-12" />,
    },
    {
      href: "/salida",
      title: t("exit"),
      description: t("exit_description"),
      icon: <LogOut className="h-12 w-12" />,
    },
  ];

  return (
    <PageContainer>
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tight">
          {t('welcome_to_menadiona')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('main_description')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {actionCards.map((card) => (
          <Link href={card.href} key={card.title}>
            <Card className="h-full group hover:border-primary transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
              <CardHeader className="flex flex-col items-center justify-center text-center p-8">
                <div className="mb-4 text-primary group-hover:text-accent transition-colors duration-300">
                  {card.icon}
                </div>
                <CardTitle className="font-headline text-3xl mb-2">{card.title}</CardTitle>
                <CardDescription className="text-base">
                  {card.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}

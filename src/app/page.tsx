"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageContainer } from "@/components/PageContainer";
import { LogOut, Truck, User } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ca, es, enUS } from 'date-fns/locale';

const locales: { [key: string]: Locale } = { ca, es, en: enUS };

export default function Home() {
  const { t, language } = useTranslation();
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      const formattedDate = format(now, "EEEE, d 'de' MMMM 'de' yyyy", { locale: locales[language] });
      setCurrentDate(formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1));
    }, 1000);

    return () => clearInterval(timer);
  }, [language]);


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
      <div className="text-center mt-12">
        {currentDate ? (
            <p className="text-2xl font-body text-foreground">
                {currentDate}
            </p>
        ) : (
            <p className="text-2xl font-body text-muted-foreground animate-pulse">
                &nbsp;
            </p>
        )}
        {currentTime ? (
          <p className="text-[3.5rem] font-body tracking-widest text-foreground">
            {currentTime}
          </p>
        ) : (
          <p className="text-[3.5rem] font-body tracking-widest text-muted-foreground animate-pulse">
            00:00:00
          </p>
        )}
      </div>
    </PageContainer>
  );
}

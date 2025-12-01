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
      href: "/normes-seguretat?type=general",
      titleKey: "entry",
      icon: <User className="h-12 w-12" />,
    },
    {
      href: "/normes-transportistes",
      titleKey: "transporter_entry",
      icon: <Truck className="h-12 w-12" />,
    },
    {
      href: "/salida",
      titleKey: "exit",
      icon: <LogOut className="h-12 w-12" />,
    },
  ];

  const translatedActionCards = actionCards
    .map(card => ({
        ...card,
        title: t(card.titleKey),
    }))
    .filter(card => card.title);

  return (
    <PageContainer>
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight">
          {t('visits_control')}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-8">
        {translatedActionCards.map((card) => (
          <Link href={card.href} key={card.href}>
            <Card className="h-full group hover:border-primary transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl bg-white">
              <CardHeader className="flex flex-col items-center justify-center text-center p-6 min-h-[160px]">
                <div className="mb-4 text-primary group-hover:text-accent transition-colors duration-300">
                  {card.icon}
                </div>
                <CardTitle className="font-headline text-3xl mb-2">{card.title}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
      <div className="text-center mt-12">
        {currentDate ? (
            <p className="text-3xl font-body text-foreground">
                {currentDate}
            </p>
        ) : (
            <p className="text-3xl font-body text-muted-foreground animate-pulse">
                &nbsp;
            </p>
        )}
        {currentTime ? (
          <p className="text-[5rem] font-body tracking-widest text-foreground">
            {currentTime}
          </p>
        ) : (
          <p className="text-[5rem] font-body tracking-widest text-muted-foreground animate-pulse">
            00:00:00
          </p>
        )}
      </div>
    </PageContainer>
  );
}

"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ActiveVisitsTable from "./components/ActiveVisitsTable";
import { useTranslation } from "@/hooks/use-translation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ActiveVisitsPage() {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("config-auth") === "true";
    if (!isAuthenticated) {
      router.replace("/configuracion/login");
    }
  }, [router]);


  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-4xl">{t('active_visits_title')}</CardTitle>
          <CardDescription>
            {t('active_visits_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActiveVisitsTable />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

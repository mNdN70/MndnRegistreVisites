"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ActiveVisitsTable from "./components/ActiveVisitsTable";
import { useTranslation } from "@/hooks/use-translation";

export default function ActiveVisitsPage() {
  const { t } = useTranslation();

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

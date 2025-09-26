"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RecordsTable from "./components/RecordsTable";
import { useTranslation } from "@/hooks/use-translation";

export default function RecordsPage() {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-4xl">{t('records_title')}</CardTitle>
          <CardDescription>
            {t('records_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecordsTable />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

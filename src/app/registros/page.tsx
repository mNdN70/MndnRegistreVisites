"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RecordsTable from "./components/RecordsTable";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useVisits } from "@/hooks/use-visits";
import { useConfig } from "@/hooks/use-config";
import { useCallback } from "react";

export default function RecordsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { exportToCSV, getFilteredVisits } = useVisits();
  const { getReportRecipients } = useConfig();
  
  const handleExport = useCallback(() => {
    const recipients = getReportRecipients();
    const visitsToExport = getFilteredVisits();
    exportToCSV(() => visitsToExport, 'registros.csv', recipients);
  }, [getReportRecipients, getFilteredVisits, exportToCSV]);

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="font-headline text-4xl">{t('records_title')}</CardTitle>
                <CardDescription>
                  {t('records_description')}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    {t('export_to_csv')}
                </Button>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('back')}
                </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <RecordsTable />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

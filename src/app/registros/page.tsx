"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RecordsTable from "./components/RecordsTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useConfig } from "@/hooks/use-config";
import { VisitsContext } from "@/contexts/VisitsContext";
import { useCallback, useContext } from "react";
import { useTranslation } from "@/hooks/use-translation";

export default function RecordsPage() {
  const router = useRouter();
  const visitsContext = useContext(VisitsContext);
  const { getReportRecipients } = useConfig();
  const { t } = useTranslation();
  
  if (!visitsContext) {
    throw new Error("VisitsContext must be used within a VisitsProvider");
  }

  const { exportToCSV } = visitsContext;

  const handleExport = useCallback(() => {
    const recipients = getReportRecipients();
    exportToCSV('registros.csv', recipients);
  }, [getReportRecipients, exportToCSV]);

  return (
    <PageContainer>
      <Card className="bg-white">
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

"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TransporterEntryForm from "./components/TransporterEntryForm";
import { useTranslation } from "@/hooks/use-translation";

export default function TransporterEntryPage() {
  const { t } = useTranslation();
  return (
    <PageContainer className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-2xl shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="font-headline text-4xl text-center">{t('transporter_entry_title')}</CardTitle>
          <CardDescription className="text-center">
            {t('transporter_entry_card_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransporterEntryForm />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

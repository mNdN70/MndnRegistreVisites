"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EntryForm from "./components/EntryForm";
import { useTranslation } from "@/hooks/use-translation";

export default function GeneralEntryPage() {
  const { t } = useTranslation();
  return (
    <PageContainer className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-2xl shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="font-headline text-4xl text-center">{t('general_entry_title')}</CardTitle>
          <CardDescription className="text-center">
            {t('general_entry_card_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntryForm />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

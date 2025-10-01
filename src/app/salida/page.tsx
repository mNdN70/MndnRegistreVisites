"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ExitForm from "./components/ExitForm";
import { useTranslation } from "@/hooks/use-translation";

export default function ExitPage() {
  const { t } = useTranslation();
  return (
    <PageContainer className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="font-headline text-4xl text-center">{t('exit_registration_title')}</CardTitle>
          <CardDescription className="text-center">
            {t('exit_registration_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExitForm />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

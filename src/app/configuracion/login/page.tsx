"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "./components/LoginForm";
import { useTranslation } from "@/hooks/use-translation";

export default function LoginPage() {
  const { t } = useTranslation();
  return (
    <PageContainer className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-4xl text-center">{t('config_access_title')}</CardTitle>
          <CardDescription className="text-center">
            {t('config_access_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

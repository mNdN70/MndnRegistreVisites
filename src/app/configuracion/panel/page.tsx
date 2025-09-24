"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConfigPanel from "./components/ConfigPanel";
import { useTranslation } from "@/hooks/use-translation";

export default function ConfigPage() {
  const { t } = useTranslation();
  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-4xl">{t('config_panel_title')}</CardTitle>
          <CardDescription>
            {t('config_panel_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfigPanel />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

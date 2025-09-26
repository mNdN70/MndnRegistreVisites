"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConfigPanel from "./components/ConfigPanel";
import { useTranslation } from "@/hooks/use-translation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfigPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedToken = sessionStorage.getItem('auth_token');
        if (storedToken === 'true') {
            setIsAuthorized(true);
        } else {
            router.push('/configuracion/login?redirectTo=/configuracion/panel');
        }
    }
  }, [router]);

  if (!isAuthorized) {
    // Render nothing or a loader while we check auth and redirect.
    return null;
  }
  
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

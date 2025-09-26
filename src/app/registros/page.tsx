"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RecordsTable from "./components/RecordsTable";
import { useTranslation } from "@/hooks/use-translation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RecordsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedToken = sessionStorage.getItem('auth_token');
        if (storedToken === 'true') {
            setIsAuthorized(true);
        } else {
            router.push('/configuracion/login?redirectTo=/registros');
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

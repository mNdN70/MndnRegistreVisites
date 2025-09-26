"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RecordsTable from "./components/RecordsTable";
import { useTranslation } from "@/hooks/use-translation";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RecordsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    const token = searchParams.get('token');
     // We need to check for window because sessionStorage is not available on the server.
    if (typeof window !== 'undefined') {
        const storedToken = sessionStorage.getItem('auth_token');
        if (token && storedToken && token === storedToken) {
            setIsAuthorized(true);
            sessionStorage.removeItem('auth_token'); // Consume the token
        } else {
            router.push('/');
        }
    }
  }, [searchParams, router]);

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

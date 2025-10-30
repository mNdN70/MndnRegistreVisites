"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConfigPanel from "./components/ConfigPanel";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConfig } from "@/hooks/use-config";

export default function ConfigPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { fetchConfig } = useConfig();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedToken = sessionStorage.getItem('auth_token');
        if (storedToken === 'true') {
            setIsAuthorized(true);
            fetchConfig();
        } else {
            router.push('/configuracion/login?redirectTo=/configuracion/panel');
        }
    }
  }, [router, fetchConfig]);

  if (isAuthorized === null) {
    // Render a loader or nothing while checking auth.
    return null;
  }
  
  if (!isAuthorized) {
    // This part will likely not be seen as the user is redirected, but it's good practice.
    return null;
  }
  
  return (
    <PageContainer>
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="font-headline text-4xl">Panell de Configuració</CardTitle>
          <CardDescription>
            Gestionar els departaments, empleats i usuaris de l'aplicació.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfigPanel />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

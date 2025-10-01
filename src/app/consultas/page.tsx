"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ActiveVisitsTable from "@/app/activos/components/ActiveVisitsTable";
import { useTranslation } from "@/hooks/use-translation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, BookOpen, Download } from "lucide-react";
import Link from "next/link";
import { useVisits } from "@/hooks/use-visits";
import { useConfig } from "@/hooks/use-config";

export default function ConsultasPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { exportActiveVisitsToCSV } = useVisits();
  const { getReportRecipients } = useConfig();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedToken = sessionStorage.getItem('auth_token');
        if (storedToken === 'true') {
            setIsAuthorized(true);
        } else {
            router.push('/configuracion/login?redirectTo=/consultas');
        }
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_token');
    }
    router.push('/');
  };
  
  const handleExport = () => {
    const recipients = getReportRecipients();
    exportActiveVisitsToCSV(recipients);
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="font-headline text-4xl">Visites Actives</CardTitle>
                <CardDescription>
                  Visitants que es troben actualment a les instal·lacions.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Link href="/registros" passHref>
                  <Button>
                    <BookOpen />
                    Consultar Registres
                  </Button>
                </Link>
                <Button onClick={handleExport}>
                    <Download />
                    Exportar a CSV
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut />
                    Sortir
                </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <ActiveVisitsTable />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

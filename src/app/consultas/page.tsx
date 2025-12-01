"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ActiveVisitsTable from "@/app/activos/components/ActiveVisitsTable";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, BookOpen, Download, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { VisitsContext } from "@/contexts/VisitsContext";
import { useConfig } from "@/hooks/use-config";
import { useToast } from "@/hooks/use-toast";

export default function ConsultasPage() {
  const router = useRouter();
  const visitsContext = useContext(VisitsContext);
  const { getReportRecipients } = useConfig();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

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

  if (!visitsContext) {
    throw new Error("VisitsContext must be used within a VisitsProvider");
  }
  const { getActiveVisitsCSV } = visitsContext;

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_token');
    }
    router.push('/');
  };
  
  const handleExport = () => {
    const csvData = getActiveVisitsCSV();
    if (!csvData) {
        toast({ title: 'No hi ha dades per exportar', variant: 'destructive' });
        return;
    }
    const blob = new Blob([`\uFEFF${csvData}`], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'registre_visites_actives.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Exportació completada' });
  }
  
  const handleSendEmail = async () => {
    setIsSending(true);
    const recipients = getReportRecipients();
    if (recipients.length === 0) {
      toast({
        title: 'No hi ha destinataris',
        description: 'No hi ha empleats configurats per rebre informes.',
        variant: 'destructive',
      });
      setIsSending(false);
      return;
    }

    const csvData = getActiveVisitsCSV();
    if (!csvData) {
      toast({ title: 'No hi ha dades per enviar', variant: 'destructive' });
      setIsSending(false);
      return;
    }

    try {
      const response = await fetch('/api/send-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csvData,
          recipients,
          subject: 'Registre de visites actives',
          fromName: 'Recepció',
        }),
      });

      if (!response.ok) {
        throw new Error('El servidor ha respost amb un error');
      }

      toast({
        title: 'Correu enviat',
        description: 'El registre de visites s\'ha enviat correctament.',
      });
    } catch (error) {
      toast({
        title: 'Error en enviar el correu',
        description: 'No s\'ha pogut enviar el correu. Si us plau, torni a intentar-ho.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <PageContainer>
      <Card className="bg-white">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="font-headline text-4xl">Visites Actives</CardTitle>
                <CardDescription>
                  Visitants que es troben actualment a les instal·lacions.
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
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
                <Button onClick={handleSendEmail} disabled={isSending}>
                    {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail />}
                    Enviar per correu
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

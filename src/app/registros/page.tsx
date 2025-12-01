"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RecordsTable from "./components/RecordsTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Mail, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useConfig } from "@/hooks/use-config";
import { VisitsContext } from "@/contexts/VisitsContext";
import { useCallback, useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function RecordsPage() {
  const router = useRouter();
  const visitsContext = useContext(VisitsContext);
  const { getReportRecipients } = useConfig();
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  
  if (!visitsContext) {
    throw new Error("VisitsContext must be used within a VisitsProvider");
  }

  const { exportToCSV, getFilteredVisitsCSV } = visitsContext;

  const handleExport = useCallback(() => {
    exportToCSV('registros.csv');
  }, [exportToCSV]);
  
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

    const csvData = getFilteredVisitsCSV();
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
          subject: 'Registre Històric de visites',
          fromName: 'Recepció',
        }),
      });

      if (!response.ok) {
        throw new Error('El servidor ha respost amb un error');
      }

      toast({
        title: 'Correu enviat',
        description: 'El registre històric de visites s\'ha enviat correctament.',
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

  return (
    <PageContainer>
      <Card className="bg-white">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="font-headline text-4xl">Registre Històric de Visites</CardTitle>
                <CardDescription>
                  Consulta i exporta tots els registres d'entrada i sortida.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExport}>
                    <Download />
                    Exportar a CSV
                </Button>
                 <Button onClick={handleSendEmail} disabled={isSending}>
                    {isSending ? <Loader2 className="animate-spin" /> : <Mail />}
                    Enviar per correu
                </Button>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft />
                    Tornar
                </Button>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <RecordsTable />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

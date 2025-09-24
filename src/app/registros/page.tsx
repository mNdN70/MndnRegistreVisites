import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RecordsTable from "./components/RecordsTable";

export default function RecordsPage() {
  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-4xl">Registro Histórico de Visitas</CardTitle>
          <CardDescription>
            Consulta y exporta todos los registros de entrada y salida.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecordsTable />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

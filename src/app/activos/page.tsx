import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ActiveVisitsTable from "./components/ActiveVisitsTable";

export default function ActiveVisitsPage() {
  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-4xl">Visitas Activas</CardTitle>
          <CardDescription>
            Visitantes que se encuentran actualmente en las instalaciones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActiveVisitsTable />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

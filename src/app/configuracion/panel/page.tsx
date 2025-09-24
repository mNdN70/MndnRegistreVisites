import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConfigPanel from "./components/ConfigPanel";

export default function ConfigPage() {
  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-4xl">Panel de Configuración</CardTitle>
          <CardDescription>
            Gestionar los departamentos y empleados de la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfigPanel />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

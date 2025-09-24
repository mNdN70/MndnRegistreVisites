import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TransporterEntryForm from "./components/TransporterEntryForm";

export default function TransporterEntryPage() {
  return (
    <PageContainer className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-4xl text-center">Registro de Entrada de Transportistas</CardTitle>
          <CardDescription className="text-center">
            Complete los datos del transportista y su vehículo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransporterEntryForm />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ExitForm from "./components/ExitForm";

export default function ExitPage() {
  return (
    <PageContainer className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-4xl text-center">Registro de Salida</CardTitle>
          <CardDescription className="text-center">
            Introduzca el DNI/NIE del visitante para registrar su salida.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExitForm />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

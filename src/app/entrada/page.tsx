import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EntryForm from "./components/EntryForm";

export default function GeneralEntryPage() {
  return (
    <PageContainer className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-4xl text-center">Registro de Entrada General</CardTitle>
          <CardDescription className="text-center">
            Por favor, complete todos los campos requeridos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntryForm />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

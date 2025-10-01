"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "./components/LoginForm";

export default function LoginPage() {
  return (
    <PageContainer className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="font-headline text-4xl text-center">Accés a Configuració</CardTitle>
          <CardDescription className="text-center">
            Introduïu les vostres credencials per continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

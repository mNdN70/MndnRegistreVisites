"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "./components/LoginForm";
import { Suspense } from 'react';

function LoginPageContent() {
  return (
    <PageContainer className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="font-headline text-4xl text-center">Accés a Configuració</CardTitle>
          <CardDescription className="text-center">
            Introduïu les vostres credencials per continuar. Per crear un usuari, utilitzeu la consola de Firebase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </PageContainer>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregant...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}

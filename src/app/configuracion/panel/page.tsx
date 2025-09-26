"use client";

import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ConfigPanel from "./components/ConfigPanel";
import { useTranslation } from "@/hooks/use-translation";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ConfigPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
        sessionStorage.setItem('temp-auth-token', token);
        setIsAuthenticated(true);
        router.replace('/configuracion/panel');
    } else {
        const sessionToken = sessionStorage.getItem('temp-auth-token');
        if (sessionToken) {
            setIsAuthenticated(true);
        }
    }
  }, [searchParams, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const q = query(
            collection(db, "users"),
            where("password", "==", password)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const token = Math.random().toString(36).substring(2);
            sessionStorage.setItem('temp-auth-token', token);
            setIsAuthenticated(true);
        } else {
            toast({
                title: t('access_denied'),
                description: t('wrong_user_or_pass'),
                variant: "destructive",
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        toast({ title: "Error", description: t('login_error'), variant: "destructive" });
    } finally {
        setIsSubmitting(false);
        setPassword('');
    }
  }

  if (!isAuthenticated) {
     return (
        <PageContainer className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
             <Card className="w-full max-w-md shadow-xl">
                <CardHeader>
                    <CardTitle className="font-headline text-4xl text-center">{t('config_access_title')}</CardTitle>
                    <CardDescription className="text-center">
                        {t('config_access_description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('password_placeholder')}
                            autoFocus
                        />
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('login')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </PageContainer>
    )
  }
  
  return (
    <PageContainer>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-4xl">{t('config_panel_title')}</CardTitle>
          <CardDescription>
            {t('config_panel_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConfigPanel />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

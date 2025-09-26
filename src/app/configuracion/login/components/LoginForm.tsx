"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const getFormSchema = (t: (key: string) => string) => z.object({
  username: z.string().min(1, t('username_required')),
  password: z.string().min(1, t('password_required')),
});

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", values.username),
        where("password", "==", values.password)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast({ title: t('access_granted') });
        const token = Math.random().toString(36).substring(2);
        
        // This is the key change: we store the token and use it for one-time navigation.
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth_token', token);
        }

        const redirectTo = searchParams.get('redirectTo') || '/configuracion/panel';
        router.push(`${redirectTo}?token=${token}`);
      } else {
        toast({
          title: t('access_denied'),
          description: t('wrong_user_or_pass'),
          variant: "destructive",
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ title: "Error", description: t('login_error'), variant: "destructive" });
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('username')}</FormLabel>
              <FormControl>
                <Input placeholder={t('username_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('password')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder={t('password_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" onClick={() => router.push('/')}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('login')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

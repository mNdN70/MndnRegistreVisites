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
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { errorEmitter } from "@/lib/error-emitter";
import { FirestorePermissionError } from "@/lib/errors";

const formSchema = z.object({
  username: z.string().min(1, 'L\'usuari és obligatori.'),
  password: z.string().min(1, 'La contrasenya és obligatòria.'),
});

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const querySnapshot = await getDocs(q).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'users',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
      });

      if (!querySnapshot.empty) {
        toast({ title: 'Accés concedit' });
        
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth_token', 'true');
        }

        const redirectTo = searchParams.get('redirectTo') || '/configuracion/panel';
        router.push(redirectTo);
      } else {
        toast({
          title: 'Error d\'accés',
          description: 'L\'usuari o la contrasenya són incorrectes. Si us plau, torneu-ho a provar.',
          variant: "destructive",
        });
        setIsSubmitting(false);
      }
    } catch (error) {
       if (!(error instanceof FirestorePermissionError)) {
        console.error("Login error:", error);
        toast({ title: "Error", description: 'No s\'ha pogut iniciar sessió.', variant: "destructive" });
      }
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
              <FormLabel>Usuari</FormLabel>
              <FormControl>
                <Input placeholder='El vostre usuari' {...field} />
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
              <FormLabel>Contrasenya</FormLabel>
              <FormControl>
                <Input type="password" placeholder='La vostra contrasenya' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" onClick={() => router.push('/')}>
            Cancel·lar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Accedir
          </Button>
        </div>
      </form>
    </Form>
  );
}

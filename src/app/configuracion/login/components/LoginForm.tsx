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
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/firebase";
import { FirebaseError } from "firebase/app";

const formSchema = z.object({
  email: z.string().email('L\'email no és vàlid.'),
  password: z.string().min(1, 'La contrasenya és obligatòria.'),
});

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    signInWithEmailAndPassword(auth, values.email, values.password)
      .then((userCredential) => {
        toast({ title: 'Accés concedit' });
        
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth_token', 'true');
        }

        const redirectTo = searchParams.get('redirectTo') || '/configuracion/panel';
        router.push(redirectTo);
      })
      .catch((error: FirebaseError) => {
        let description = 'L\'usuari o la contrasenya són incorrectes. Si us plau, torneu-ho a provar.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          description = 'L\'usuari o la contrasenya són incorrectes.';
        } else if (error.code === 'auth/invalid-email') {
          description = 'El format del correu electrònic no és vàlid.';
        }

        toast({
          title: 'Error d\'accés',
          description: description,
          variant: "destructive",
        });
        setIsSubmitting(false);
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='El vostre correu electrònic' {...field} />
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

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
import { useVisits } from "@/hooks/use-visits";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  id: z.string().min(1, "El DNI/NIE es obligatorio."),
});

export default function ExitForm() {
  const router = useRouter();
  const { registerExit } = useVisits();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const result = registerExit(values.id);
    if (result.success) {
      form.reset();
      setTimeout(() => router.push("/"), 2000);
    } else {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DNI / NIE del visitante</FormLabel>
              <FormControl>
                <Input placeholder="Introduzca el DNI o NIE" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" onClick={() => router.push('/')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar Salida
          </Button>
        </div>
      </form>
    </Form>
  );
}

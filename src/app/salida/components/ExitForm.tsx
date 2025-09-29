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
import { useTranslation } from "@/hooks/use-translation";

const getFormSchema = (t: (key: string) => string) => z.object({
  id: z.string().min(1, t('dni_nie_required')),
});

export default function ExitForm() {
  const router = useRouter();
  const { registerExit } = useVisits();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const result = await registerExit(values.id.toUpperCase());
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
              <FormLabel>{t('visitor_dni_nie')}</FormLabel>
              <FormControl>
                <Input placeholder={t('dni_nie_input_placeholder')} {...field} />
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
            {t('register_exit')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectPortal,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useVisits } from "@/hooks/use-visits";
import { useConfig } from "@/hooks/use-config";
import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

const getFormSchema = (t: (key: string) => string) => z.object({
  id: z.string().min(1, t('dni_nie_required')),
  name: z.string().min(1, t('name_required')),
  company: z.string().min(1, t('company_required')),
  haulierCompany: z.string().min(1, t('haulier_company_required')),
  licensePlate: z.string().min(1, t('license_plate_required')),
  trailerLicensePlate: z.string().optional(),
  reason: z.string().optional(),
  personToVisit: z.string().min(1, t('person_to_visit_required')),
  department: z.string().optional(),
  privacyPolicyAccepted: z.boolean().refine((val) => val === true, {
    message: t('privacy_policy_required'),
  }),
});

export default function TransporterEntryForm() {
  const router = useRouter();
  const { addVisit } = useVisits();
  const { employees, loading: configLoading } = useConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const formSchema = getFormSchema(t);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
      company: "",
      haulierCompany: "",
      licensePlate: "",
      trailerLicensePlate: "",
      reason: "",
      personToVisit: "",
      department: "",
      privacyPolicyAccepted: false,
    },
  });

  const privacyPolicyAccepted = form.watch("privacyPolicyAccepted");
  const personToVisit = form.watch("personToVisit");

  useEffect(() => {
    if (personToVisit) {
      const employee = employees.find((emp) => emp.name === personToVisit);
      if (employee) {
        form.setValue("department", employee.department, { shouldValidate: true });
      } else {
        form.setValue("department", "", { shouldValidate: true });
      }
    }
  }, [personToVisit, employees, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const result = await addVisit({ ...values, type: 'transporter' });
    if (result.success) {
      form.reset();
      setTimeout(() => router.push("/"), 2000);
    } else {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('dni_nie')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('dni_nie_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name_and_surnames')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('name_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('visitor_company')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('visitor_company_placeholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="licensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('license_plate')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('license_plate_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trailerLicensePlate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('trailer_license_plate_optional')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('trailer_license_plate_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
           <FormField
            control={form.control}
            name="haulierCompany"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('haulier_company')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('haulier_company_placeholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="personToVisit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('person_to_visit')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={configLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={configLoading ? t('loading') : t('select_person')} />
                      </SelectTrigger>
                    </FormControl>
                     <SelectPortal>
                        <SelectContent>
                        {employees.map((employee) => (
                            <SelectItem key={employee.name} value={employee.name}>
                            {employee.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </SelectPortal>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('department')}</FormLabel>
                   <FormControl>
                    <Input readOnly placeholder={t('department_autocomplete')} {...field} className="bg-muted" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('visit_reason_optional')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('reason_placeholder_delivery')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="privacyPolicyAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <span className="cursor-pointer hover:underline text-accent">
                          {t('privacy_policy_text')}
                        </span>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-headline">{t('privacy_policy_title')}</AlertDialogTitle>
                           <AlertDialogDescription asChild>
                            <div className="text-foreground pt-4 space-y-2">
                              <div>{t('privacy_policy_p1')}</div>
                              <div>{t('privacy_policy_p2')}</div>
                              <div>{t('privacy_policy_p3')}</div>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                           <AlertDialogCancel>{t('close')}</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-between gap-4">
            <Button type="button" variant="outline" onClick={() => router.push('/')}>{t('cancel')}</Button>
            <Button type="submit" disabled={!privacyPolicyAccepted || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('register_entry')}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}

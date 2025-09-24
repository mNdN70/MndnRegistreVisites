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
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useVisits } from "@/hooks/use-visits";
import { useConfig } from "@/hooks/use-config";
import { useState, useEffect } from "react";
import { enableEntryButton } from "@/ai/flows/enable-entry-button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  id: z.string().min(1, "El DNI/NIE es obligatorio."),
  name: z.string().min(1, "El nombre y apellidos son obligatorios."),
  company: z.string().min(1, "La empresa es obligatoria."),
  haulierCompany: z.string().min(1, "La empresa de transporte es obligatoria."),
  licensePlate: z.string().min(1, "La matrícula es obligatoria."),
  trailerLicensePlate: z.string().optional(),
  reason: z.string().optional(),
  personToVisit: z.string().min(1, "Debe seleccionar una persona a visitar."),
  department: z.string().min(1, "El departamento es obligatorio."),
  privacyPolicyAccepted: z.boolean().refine((val) => val === true, {
    message: "Debe aceptar la política de tratamiento de datos.",
  }),
});

export default function TransporterEntryForm() {
  const router = useRouter();
  const { addVisit } = useVisits();
  const { employees, loading: configLoading } = useConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

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

  useEffect(() => {
    let isMounted = true;
    const checkButtonState = async () => {
      try {
        const { enabled } = await enableEntryButton({ privacyPolicyAccepted });
        if (isMounted) {
          setIsButtonEnabled(enabled);
        }
      } catch (error) {
        console.error("AI flow failed:", error);
        if (isMounted) {
          setIsButtonEnabled(privacyPolicyAccepted);
        }
      }
    };
    checkButtonState();
    return () => { isMounted = false; };
  }, [privacyPolicyAccepted]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const result = addVisit({ ...values, type: 'transporter' });
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
                  <FormLabel>DNI / NIE</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 12345678A" {...field} />
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
                  <FormLabel>Nombre y Apellidos</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Juan Pérez" {...field} />
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
                <FormLabel>Empresa del Visitante</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de la empresa del visitante" {...field} />
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
                  <FormLabel>Matrícula</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 1234-ABC" {...field} />
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
                  <FormLabel>Matrícula Remolque (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: R-5678-XYZ" {...field} />
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
                <FormLabel>Empresa de Transporte</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre de la empresa de transporte" {...field} />
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
                  <FormLabel>Persona a visitar</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={configLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={configLoading ? "Cargando..." : "Seleccione una persona"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.name} value={employee.name}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
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
                  <FormLabel>Departamento</FormLabel>
                   <FormControl>
                    <Input readOnly placeholder="Se rellenará automáticamente" {...field} className="bg-muted" />
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
                <FormLabel>Motivo de la visita (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Entrega de material" {...field} />
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
                          He leído y acepto la Política de tratamiento de datos.
                        </span>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-headline">POLÍTICA DE TRATAMIENTO DE DATOS</AlertDialogTitle>
                          <AlertDialogDescription className="text-foreground pt-4 space-y-2">
                            <p>Le informamos que los datos relacionados con el control de acceso a las instalaciones se encuentra regulado por la Instrucción 1/1996 de la Agencia de Protección de Datos.</p>
                            <p>Sus datos no serán cedidas a terceros excepto cuando sea indispensable para la prestación del servicio u obligaciones legales.</p>
                            <p>Puede ejercer sus derechos dirigiéndose a menadiona@menadiona.com</p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                           <Button onClick={(e) => e.preventDefault()}>Cerrar</Button>
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
            <Button type="button" variant="outline" onClick={() => router.push('/')}>Cancelar</Button>
            <Button type="submit" disabled={!isButtonEnabled || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Entrada
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}

"use client";

import { useConfig, Employee } from "@/hooks/use-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, UserPlus, KeyRound, LogOut, Mail, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const employeeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  department: z.string().min(1, "Department is required"),
  email: z.string().email("Invalid email address").or(z.literal('')),
  receivesReports: z.boolean(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;


export default function ConfigPanel() {
  const router = useRouter();
  const {
    departments,
    employees,
    users,
    addDepartment,
    removeDepartment,
    addEmployee,
    removeEmployee,
    updateEmployee,
    addUser,
    removeUser,
    loading,
  } = useConfig();

  const [newDepartment, setNewDepartment] = useState("");
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeDept, setNewEmployeeDept] = useState("");
  const [newEmployeeEmail, setNewEmployeeEmail] = useState("");
  const [newEmployeeReceivesReports, setNewEmployeeReceivesReports] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isNewEmployeeEmailValid = newEmployeeEmail === '' || emailRegex.test(newEmployeeEmail);

  useEffect(() => {
    if (newEmployeeEmail === '' || !isNewEmployeeEmailValid) {
        setNewEmployeeReceivesReports(false);
    }
  }, [isNewEmployeeEmailValid, newEmployeeEmail])

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
        name: '',
        department: '',
        email: '',
        receivesReports: false,
    }
  });
  
  const watchedEmail = watch("email");
  const isEditEmailValid = watchedEmail === '' || emailRegex.test(watchedEmail);

  useEffect(() => {
    if(watchedEmail === '' || !isEditEmailValid) {
        setValue('receivesReports', false)
    }
  }, [isEditEmailValid, setValue, watchedEmail]);


  useEffect(() => {
    if (selectedEmployee) {
      reset(selectedEmployee);
    }
  }, [selectedEmployee, reset]);


  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const handleAddDepartment = () => {
    if (newDepartment.trim()) {
      addDepartment(newDepartment.trim());
      setNewDepartment("");
    }
  };

  const handleAddEmployee = () => {
    if (newEmployeeName.trim() && newEmployeeDept.trim()) {
      addEmployee({
        name: newEmployeeName.trim(),
        department: newEmployeeDept.trim(),
        email: newEmployeeEmail.trim(),
        receivesReports: newEmployeeReceivesReports
      });
      setNewEmployeeName("");
      setNewEmployeeDept("");
      setNewEmployeeEmail("");
      setNewEmployeeReceivesReports(false);
    }
  };
  
  const handleAddUser = () => {
    if(newUsername.trim() && newPassword.trim()){
      addUser({ username: newUsername.trim(), password: newPassword.trim() });
      setNewUsername("");
      setNewPassword("");
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_token');
    }
    router.push('/');
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };
  
  const onEmployeeUpdateSubmit = (data: EmployeeFormData) => {
    if (selectedEmployee?.id) {
        const updateData = {
            name: data.name,
            email: data.email,
            department: data.department,
            receivesReports: data.receivesReports,
        };
      updateEmployee(selectedEmployee.id, updateData);
    }
    setIsEditDialogOpen(false);
    setSelectedEmployee(null);
  };

  
  return (
    <div className="space-y-8">
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Empleat</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onEmployeeUpdateSubmit)} className="space-y-4">
             <div>
                <Label htmlFor="name">Nom</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
             <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" {...register("email")} type="email" />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="department">Departament</Label>
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Departament" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department && <p className="text-red-500 text-xs">{errors.department.message}</p>}
            </div>

            <div className="flex items-center space-x-2">
                 <Controller
                    name="receivesReports"
                    control={control}
                    render={({ field }) => (
                         <Checkbox id="receivesReportsEdit" checked={field.value} onCheckedChange={field.onChange} disabled={!isEditEmailValid || watchedEmail === ''} />
                    )}
                />
                <Label htmlFor="receivesReportsEdit" className={!isEditEmailValid || watchedEmail === '' ? "text-muted-foreground" : ""}>Rep informes</Label>
            </div>
             <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel·lar</Button>
                </DialogClose>
                <Button type="submit">Guardar Canvis</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Departaments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="Nou departament"
              />
              <Button onClick={handleAddDepartment}>Afegir</Button>
            </div>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {departments.map((dept) => (
                <li key={dept} className="flex justify-between items-center p-2 border rounded-md">
                  <span>{dept}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeDepartment(dept)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empleats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Input
                    value={newEmployeeName}
                    onChange={(e) => setNewEmployeeName(e.target.value)}
                    placeholder="Nom de l'empleat"
                />
                <Input
                    value={newEmployeeEmail}
                    onChange={(e) => setNewEmployeeEmail(e.target.value)}
                    placeholder="Email de l'empleat"
                    type="email"
                />
                 <Select onValueChange={setNewEmployeeDept} value={newEmployeeDept}>
                    <SelectTrigger>
                        <SelectValue placeholder="Departament" />
                    </SelectTrigger>
                    <SelectContent>
                        {departments.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                        id="receivesReports" 
                        checked={newEmployeeReceivesReports} 
                        onCheckedChange={(checked) => setNewEmployeeReceivesReports(!!checked)} 
                        disabled={!isNewEmployeeEmailValid || newEmployeeEmail === ''}
                    />
                    <Label 
                        htmlFor="receivesReports" 
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${!isNewEmployeeEmailValid || newEmployeeEmail === '' ? 'text-muted-foreground' : ''}`}
                    >
                       Rep informes
                    </Label>
                </div>
             </div>
             <Button onClick={handleAddEmployee} className="w-full">
                <UserPlus className="mr-2 h-4 w-4"/> Afegir
              </Button>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {employees.map((emp) => (
                <li key={emp.id} className="flex justify-between items-center p-2 border rounded-md">
                  <div className="flex flex-col">
                    <span className="font-medium">{emp.name}</span>
                    <span className="text-xs text-muted-foreground">{emp.department}</span>
                     <span className="text-xs text-muted-foreground">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {emp.receivesReports && <Mail className="h-4 w-4 text-primary" title="Rep informes" />}
                    <Button variant="ghost" size="icon" onClick={() => handleEditEmployee(emp)}>
                      <Pencil className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeEmployee(emp.name)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
            <CardTitle>Usuaris</CardTitle>
            <CardDescription>Gestionar els usuaris amb accés al panell de configuració.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Usuari"
                className="flex-grow"
              />
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Contrasenya"
                type="password"
                className="flex-grow"
              />
              <Button onClick={handleAddUser} className="w-full sm:w-auto">
                <KeyRound className="mr-2 h-4 w-4"/> Afegir Usuari
              </Button>
            </div>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {users.map((user) => (
                <li key={user.id} className="flex justify-between items-center p-2 border rounded-md">
                  <div>
                    <p>{user.username}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeUser(user.id!)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <div className="flex justify-end">
            <Button onClick={handleLogout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Sortir
            </Button>
        </div>
    </div>
  );
}

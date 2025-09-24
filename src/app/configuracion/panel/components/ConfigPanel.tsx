"use client";

import { useConfig, Employee } from "@/hooks/use-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, UserPlus, LogOut, FileUp, FileDown } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function ConfigPanel() {
  const router = useRouter();
  const {
    departments,
    employees,
    addDepartment,
    removeDepartment,
    addEmployee,
    removeEmployee,
    loading,
    updateEmployees,
  } = useConfig();
  const { toast } = useToast();

  const [newDepartment, setNewDepartment] = useState("");
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeDept, setNewEmployeeDept] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("config-auth") === "true";
    if (!isAuthenticated) {
      router.replace("/configuracion/login");
    }
  }, [router]);

  if (loading) {
    return (
        <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
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
      addEmployee({ name: newEmployeeName.trim(), department: newEmployeeDept.trim() });
      setNewEmployeeName("");
      setNewEmployeeDept("");
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem("config-auth");
    router.push("/");
  };
  
  const handleExport = () => {
    const data = { employees, departments };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type : 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitwise-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({title: "Configuración exportada"});
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const data = JSON.parse(text);
            if (data.employees && data.departments) {
              updateEmployees(data.employees);
              // This is a bit of a trick to update departments without exposing a full setter
              // First, remove all existing departments
              departments.forEach(d => removeDepartment(d));
              // Then add the new ones
              data.departments.forEach((d:string) => addDepartment(d));
              toast({title: "Configuración importada con éxito"});
            } else {
              throw new Error("Formato de archivo incorrecto");
            }
          }
        } catch (error) {
          toast({title: "Error al importar", description: "El archivo no es válido.", variant: "destructive"});
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };


  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Departamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="Nuevo departamento"
              />
              <Button onClick={handleAddDepartment}>Añadir</Button>
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
            <CardTitle>Empleados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
                placeholder="Nombre del empleado"
                className="flex-grow"
              />
              <Select onValueChange={setNewEmployeeDept} value={newEmployeeDept}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                    {departments.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleAddEmployee} className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4"/> Añadir
              </Button>
            </div>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {employees.map((emp) => (
                <li key={emp.name} className="flex justify-between items-center p-2 border rounded-md">
                  <div>
                    <p>{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.department}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeEmployee(emp.name)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
       <div className="flex justify-between items-center gap-4 mt-8">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}><FileUp className="mr-2"/>Exportar</Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}><FileDown className="mr-2"/>Importar</Button>
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden"/>
        </div>
        <Button variant="outline" onClick={handleLogout}><LogOut className="mr-2" />Cerrar Sesión</Button>
      </div>
    </div>
  );
}

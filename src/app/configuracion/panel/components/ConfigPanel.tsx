"use client";

import { useConfig } from "@/hooks/use-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, UserPlus, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";

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
  } = useConfig();

  const { t } = useTranslation();

  const [newDepartment, setNewDepartment] = useState("");
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeDept, setNewEmployeeDept] = useState("");

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
  
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('departments')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder={t('new_department')}
              />
              <Button onClick={handleAddDepartment}>{t('add')}</Button>
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
            <CardTitle>{t('employees')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
                placeholder={t('employee_name')}
                className="flex-grow"
              />
              <Select onValueChange={setNewEmployeeDept} value={newEmployeeDept}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t('department')} />
                </SelectTrigger>
                <SelectContent>
                    {departments.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleAddEmployee} className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4"/> {t('add')}
              </Button>
            </div>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {employees.map((emp) => (
                <li key={emp.id} className="flex justify-between items-center p-2 border rounded-md">
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
       <div className="flex justify-end items-center gap-4 mt-8">
        <Button variant="outline" onClick={handleLogout}><LogOut className="mr-2" />{t('logout')}</Button>
      </div>
    </div>
  );
}

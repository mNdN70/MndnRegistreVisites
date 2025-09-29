"use client";

import { useConfig } from "@/hooks/use-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trash2, UserPlus, KeyRound, LogOut, Mail } from "lucide-react";
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
import { useTranslation } from "@/hooks/use-translation";
import { Label } from "@/components/ui/label";

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
    addUser,
    removeUser,
    loading,
  } = useConfig();

  const { t } = useTranslation();

  const [newDepartment, setNewDepartment] = useState("");
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeDept, setNewEmployeeDept] = useState("");
  const [newEmployeeEmail, setNewEmployeeEmail] = useState("");
  const [newEmployeeReceivesReports, setNewEmployeeReceivesReports] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

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
    if (newEmployeeName.trim() && newEmployeeDept.trim() && newEmployeeEmail.trim()) {
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
             <div className="space-y-2">
                <Input
                    value={newEmployeeName}
                    onChange={(e) => setNewEmployeeName(e.target.value)}
                    placeholder={t('employee_name')}
                />
                <Input
                    value={newEmployeeEmail}
                    onChange={(e) => setNewEmployeeEmail(e.target.value)}
                    placeholder={t('employee_email')}
                    type="email"
                />
                 <Select onValueChange={setNewEmployeeDept} value={newEmployeeDept}>
                    <SelectTrigger>
                        <SelectValue placeholder={t('department')} />
                    </SelectTrigger>
                    <SelectContent>
                        {departments.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <div className="flex items-center space-x-2 pt-2">
                    <Checkbox id="receivesReports" checked={newEmployeeReceivesReports} onCheckedChange={(checked) => setNewEmployeeReceivesReports(!!checked)} />
                    <Label htmlFor="receivesReports" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                       {t('receives_reports')}
                    </Label>
                </div>
             </div>
             <Button onClick={handleAddEmployee} className="w-full">
                <UserPlus className="mr-2 h-4 w-4"/> {t('add')}
              </Button>
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {employees.map((emp) => (
                <li key={emp.id} className="flex justify-between items-center p-2 border rounded-md">
                  <div className="flex flex-col">
                    <span className="font-medium">{emp.name}</span>
                    <span className="text-xs text-muted-foreground">{emp.department}</span>
                     <span className="text-xs text-muted-foreground">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {emp.receivesReports && <Mail className="h-4 w-4 text-primary" title={t('receives_reports')} />}
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
            <CardTitle>{t('users')}</CardTitle>
            <CardDescription>{t('users_description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={t('username')}
                className="flex-grow"
              />
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('password')}
                type="password"
                className="flex-grow"
              />
              <Button onClick={handleAddUser} className="w-full sm:w-auto">
                <KeyRound className="mr-2 h-4 w-4"/> {t('add_user')}
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
                {t('logout')}
            </Button>
        </div>
    </div>
  );
}

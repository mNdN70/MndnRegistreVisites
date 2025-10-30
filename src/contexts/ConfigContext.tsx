"use client";

import { useState, useEffect, useCallback, createContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { INITIAL_DEPARTMENTS, INITIAL_EMPLOYEES } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

export interface Employee {
  id?: string;
  name: string;
  department: string;
  email: string;
  receivesReports: boolean;
}

export interface User {
  id?: string;
  username: string;
  password?: string;
}

interface ConfigContextType {
    loading: boolean;
    departments: string[];
    employees: Employee[];
    addDepartment: (department: string) => Promise<void>;
    removeDepartment: (departmentName: string) => Promise<void>;
    addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
    removeEmployee: (employeeName: string) => Promise<void>;
    updateEmployee: (employeeId: string, employeeData: Omit<Employee, 'id'>) => Promise<void>;
    fetchConfig: () => Promise<void>;
    getReportRecipients: () => string[];
}

export const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Helper to sort employees by name
const sortEmployees = (employees: Employee[]) => employees.sort((a, b) => a.name.localeCompare(b.name));

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [departments, setDepartments] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    // Simulate fetching from a static source
    setDepartments(INITIAL_DEPARTMENTS.sort());
    // Ensure all initial employees have a unique ID
    const initialEmployeesWithIds = INITIAL_EMPLOYEES.map(emp => ({ ...emp, id: emp.id || uuidv4() }));
    setEmployees(sortEmployees(initialEmployeesWithIds));
    setLoading(false);
  }, []);

  useEffect(() => {
    // Install uuid if not present
    const installUuid = async () => {
        try {
            await import('uuid');
        } catch (e) {
            // In a real scenario, you would handle package installation here.
            // For this environment, we assume it's available or we add it to package.json
        }
    };
    installUuid();
    fetchConfig();
  }, [fetchConfig]);

  const addDepartment = useCallback(async (department: string) => {
    if (departments.map(d => d.toLowerCase()).includes(department.toLowerCase())) {
        toast({ title: t('duplicated_department'), variant: 'destructive' });
        return;
    }
    setDepartments(prev => [...prev, department].sort());
    toast({ title: t('department_added') });
  }, [departments, toast, t]);

  const removeDepartment = useCallback(async (departmentName: string) => {
    setDepartments(prev => prev.filter(d => d !== departmentName));
    setEmployees(prev => prev.filter(e => e.department !== departmentName));
    toast({ title: t('department_deleted'), description: t('department_deleted_detail') });
  }, [toast, t]);

  const addEmployee = useCallback(async (employee: Omit<Employee, 'id'>) => {
     if (employees.find(e => e.name.toLowerCase() === employee.name.toLowerCase())) {
      toast({ title: t('duplicated_employee'), variant: 'destructive' });
      return;
    }
    const newEmployee = { ...employee, id: uuidv4() };
    setEmployees(prev => sortEmployees([...prev, newEmployee]));
    toast({ title: t('employee_added') });
  }, [employees, toast, t]);

  const removeEmployee = useCallback(async (employeeName: string) => {
    const employeeToRemove = employees.find(e => e.name === employeeName);
    if (!employeeToRemove) {
       toast({ title: 'Error', description: t('employee_not_found'), variant: 'destructive' });
       return;
    }
    setEmployees(prev => prev.filter(e => e.name !== employeeName));
    toast({ title: t('employee_deleted') });
  }, [employees, toast, t]);
  
  const updateEmployee = useCallback(async (employeeId: string, employeeData: Omit<Employee, 'id'>) => {
    setEmployees(prev => sortEmployees(prev.map(e => e.id === employeeId ? { ...employeeData, id: employeeId } : e)));
    toast({ title: 'Empleado actualizado' });
  }, [toast]);
 
 const getReportRecipients = useCallback(() => {
    return employees
      .filter(e => e.receivesReports && e.email)
      .map(e => e.email);
  }, [employees]);


  return (
    <ConfigContext.Provider value={{ loading, departments, employees, addDepartment, removeDepartment, addEmployee, removeEmployee, updateEmployee, fetchConfig, getReportRecipients }}>
      {children}
    </ConfigContext.Provider>
  );
};

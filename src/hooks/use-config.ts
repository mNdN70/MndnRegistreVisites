"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { INITIAL_DEPARTMENTS, INITIAL_EMPLOYEES } from '@/lib/constants';
import { useTranslation } from './use-translation';

const DEPARTMENTS_STORAGE_KEY = 'menadiona-departments';
const EMPLOYEES_STORAGE_KEY = 'menadiona-employees';

export interface Employee {
  name: string;
  department: string;
}

export const useConfig = () => {
  const [departments, setDepartments] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    try {
      const storedDepartments = window.localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
      if (storedDepartments) {
        setDepartments(JSON.parse(storedDepartments));
      } else {
        setDepartments(INITIAL_DEPARTMENTS);
        window.localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(INITIAL_DEPARTMENTS));
      }

      const storedEmployees = window.localStorage.getItem(EMPLOYEES_STORAGE_KEY);
      if (storedEmployees) {
        setEmployees(JSON.parse(storedEmployees));
      } else {
        setEmployees(INITIAL_EMPLOYEES);
        window.localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(INITIAL_EMPLOYEES));
      }
    } catch (error) {
      console.error('Error reading from localStorage', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la configuración.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateDepartments = useCallback((updatedDepartments: string[]) => {
    setDepartments(updatedDepartments);
    try {
      window.localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(updatedDepartments));
    } catch (error) {
      console.error('Error writing to localStorage', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración de departamentos.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const updateEmployees = useCallback((updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);
    try {
      window.localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(updatedEmployees));
    } catch (error) {
      console.error('Error writing to localStorage', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración de empleados.',
        variant: 'destructive',
      });
    }
  }, [toast]);
  
  const addDepartment = useCallback((department: string, quiet = false) => {
    if (departments.find(d => d.toLowerCase() === department.toLowerCase())) {
      if (!quiet) toast({ title: t('duplicated_department'), variant: 'destructive' });
      return;
    }
    const newDepartments = [...departments, department].sort();
    updateDepartments(newDepartments);
    if (!quiet) toast({ title: t('department_added') });
  }, [departments, updateDepartments, toast, t]);

  const removeDepartment = useCallback((department: string, quiet = false) => {
    const newDepartments = departments.filter(d => d !== department);
    updateDepartments(newDepartments);

    const newEmployees = employees.filter(e => e.department !== department);
    updateEmployees(newEmployees);

    if (!quiet) toast({ title: t('department_deleted'), description: t('department_deleted_detail') });
  }, [departments, employees, updateDepartments, updateEmployees, toast, t]);


  const addEmployee = useCallback((employee: Employee) => {
     if (employees.find(e => e.name.toLowerCase() === employee.name.toLowerCase())) {
      toast({ title: t('duplicated_employee'), variant: 'destructive' });
      return;
    }
    const newEmployees = [...employees, employee].sort((a,b) => a.name.localeCompare(b.name));
    updateEmployees(newEmployees);
    toast({ title: t('employee_added') });
  }, [employees, updateEmployees, toast, t]);

  const removeEmployee = useCallback((employeeName: string) => {
    const newEmployees = employees.filter(e => e.name !== employeeName);
    updateEmployees(newEmployees);
    toast({ title: t('employee_deleted') });
  }, [employees, updateEmployees, toast, t]);


  return { loading, departments, employees, addDepartment, removeDepartment, addEmployee, removeEmployee };
};

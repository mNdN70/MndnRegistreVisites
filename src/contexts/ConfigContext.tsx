
"use client";

import { useState, useEffect, useCallback, createContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { useFirestore, useUser } from '@/firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export interface Employee {
  id: string;
  name: string;
  department: string;
  email: string;
  receivesReports: boolean;
}

const DEPARTMENTS_COLLECTION = 'departments';
const EMPLOYEES_COLLECTION = 'employees';

interface ConfigContextType {
    loading: boolean;
    departments: string[];
    employees: Employee[];
    addDepartment: (department: string) => Promise<void>;
    removeDepartment: (departmentName: string) => Promise<void>;
    addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
    removeEmployee: (employeeId: string) => Promise<void>;
    updateEmployee: (employeeId: string, employeeData: Omit<Employee, 'id'>) => Promise<void>;
    fetchConfig: () => Promise<void>;
    getReportRecipients: () => string[];
}

export const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const sortEmployees = (employees: Employee[]) => employees.sort((a, b) => a.name.localeCompare(b.name));

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [departments, setDepartments] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();
  const db = useFirestore();
  const { user } = useUser();

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    
    const departmentsCollection = collection(db, DEPARTMENTS_COLLECTION);
    const employeesCollection = collection(db, EMPLOYEES_COLLECTION);

    const unsubscribeDepartments = onSnapshot(departmentsCollection, (snapshot) => {
        const depts = snapshot.docs.map(doc => doc.id).sort();
        setDepartments(depts);
    }, (error) => {
        const permissionError = new FirestorePermissionError({
            path: DEPARTMENTS_COLLECTION,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    const unsubscribeEmployees = onSnapshot(employeesCollection, (snapshot) => {
        const emps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
        setEmployees(sortEmployees(emps));
    }, (error) => {
        const permissionError = new FirestorePermissionError({
            path: EMPLOYEES_COLLECTION,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    setLoading(false);

    return () => {
        unsubscribeDepartments();
        unsubscribeEmployees();
    };
  }, [db]);

  useEffect(() => {
    // We only fetch the full config if the user is logged in
    // Public parts of the app can use this context, but employees/depts will be empty
    if (user) {
        fetchConfig();
    } else {
        setDepartments([]);
        setEmployees([]);
        setLoading(false);
    }
  }, [user, fetchConfig]);

  const addDepartment = useCallback(async (department: string) => {
    if (departments.map(d => d.toLowerCase()).includes(department.toLowerCase())) {
        toast({ title: t('duplicated_department'), variant: 'destructive' });
        return;
    }
    const departmentData = { name: department };
    const docRef = doc(db, DEPARTMENTS_COLLECTION, department);
    setDoc(docRef, departmentData)
        .then(() => {
            toast({ title: t('department_added') });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'create',
                requestResourceData: departmentData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  }, [db, departments, toast, t]);

  const removeDepartment = useCallback(async (departmentName: string) => {
    const docRef = doc(db, DEPARTMENTS_COLLECTION, departmentName);
    deleteDoc(docRef)
        .then(async () => {
            const q = query(collection(db, EMPLOYEES_COLLECTION), where("department", "==", departmentName));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (docSnapshot) => {
                await deleteDoc(doc(db, EMPLOYEES_COLLECTION, docSnapshot.id));
            });
            toast({ title: t('department_deleted'), description: t('department_deleted_detail') });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete'
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  }, [db, toast, t]);

  const addEmployee = useCallback(async (employee: Omit<Employee, 'id'>) => {
     if (employees.find(e => e.name.toLowerCase() === employee.name.toLowerCase())) {
      toast({ title: t('duplicated_employee'), variant: 'destructive' });
      return;
    }
    const employeeData = { ...employee, id: uuidv4() };
    const docRef = doc(db, EMPLOYEES_COLLECTION, employeeData.id);
    setDoc(docRef, employeeData)
        .then(() => {
            toast({ title: t('employee_added') });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: EMPLOYEES_COLLECTION,
                operation: 'create',
                requestResourceData: employee
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  }, [db, employees, toast, t]);

  const removeEmployee = useCallback(async (employeeId: string) => {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    deleteDoc(docRef)
        .then(() => {
            toast({ title: t('employee_deleted') });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'delete'
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  }, [db, toast, t]);
  
  const updateEmployee = useCallback(async (employeeId: string, employeeData: Omit<Employee, 'id'>) => {
    const employeeDoc = doc(db, EMPLOYEES_COLLECTION, employeeId);
    updateDoc(employeeDoc, employeeData)
        .then(() => {
            toast({ title: 'Empleado actualizado' });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: employeeDoc.path,
                operation: 'update',
                requestResourceData: employeeData
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  }, [db, toast]);
 
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

    
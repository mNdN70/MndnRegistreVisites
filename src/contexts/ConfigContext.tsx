"use client";

import { useState, useEffect, useCallback, createContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  writeBatch,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
  setDoc,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { INITIAL_DEPARTMENTS, INITIAL_EMPLOYEES } from '@/lib/constants';

const DEPARTMENTS_COLLECTION = 'departments';
const EMPLOYEES_COLLECTION = 'employees';
const USERS_COLLECTION = 'users';

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
    users: User[];
    addDepartment: (department: string) => Promise<void>;
    removeDepartment: (departmentName: string) => Promise<void>;
    addEmployee: (employee: Omit<Employee, 'id'>) => Promise<void>;
    removeEmployee: (employeeName: string) => Promise<void>;
    updateEmployee: (employeeId: string, employeeData: Omit<Employee, 'id'>) => Promise<void>;
    addUser: (user: User) => Promise<void>;
    removeUser: (userId: string) => Promise<void>;
    fetchConfig: () => Promise<void>;
    getReportRecipients: () => string[];
}

export const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [departments, setDepartments] = useState<string[]>(INITIAL_DEPARTMENTS.sort());
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES.sort((a,b) => a.name.localeCompare(b.name)));
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      setDepartments(INITIAL_DEPARTMENTS.sort());
      setEmployees(INITIAL_EMPLOYEES.sort((a,b) => a.name.localeCompare(b.name)));
      
      const usersQuery = query(collection(db, USERS_COLLECTION), orderBy('username'));

      const usersSnapshot = await getDocs(usersQuery).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({ path: USERS_COLLECTION, operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
      });
      
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, username: doc.data().username } as User)).sort((a,b) => a.username.localeCompare(b.username)));

    } catch (error) {
      if (!(error instanceof FirestorePermissionError)) {
        console.error('Error fetching config from Firestore', error);
        toast({
            title: 'Error',
            description: t('error_loading_config'),
            variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const addDepartment = useCallback(async (department: string) => {
    if (departments.map(d => d.toLowerCase()).includes(department.toLowerCase())) {
        toast({ title: t('duplicated_department'), variant: 'destructive' });
        return;
    }
    
    const departmentData = { name: department };
    const docRef = doc(db, DEPARTMENTS_COLLECTION, department);
    setDoc(docRef, departmentData)
        .then(() => {
            setDepartments(prev => [...prev, department].sort());
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
  }, [departments, toast, t]);

  const removeDepartment = useCallback(async (departmentName: string) => {
    const deptDocRef = doc(db, DEPARTMENTS_COLLECTION, departmentName);
    
    const batch = writeBatch(db);
    batch.delete(deptDocRef);

    const empQuery = query(collection(db, EMPLOYEES_COLLECTION), where('department', '==', departmentName));
    
    getDocs(empQuery).then(empSnapshot => {
        empSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        batch.commit().then(() => {
            setDepartments(prev => prev.filter(d => d !== departmentName));
            setEmployees(prev => prev.filter(e => e.department !== departmentName));
            toast({ title: t('department_deleted'), description: t('department_deleted_detail') });
        }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: `[batch delete on department: ${departmentName}]`,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    }).catch(async serverError => {
         const permissionError = new FirestorePermissionError({
            path: `employees`,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    });

  }, [toast, t]);


  const addEmployee = useCallback(async (employee: Omit<Employee, 'id'>) => {
     if (employees.find(e => e.name.toLowerCase() === employee.name.toLowerCase())) {
      toast({ title: t('duplicated_employee'), variant: 'destructive' });
      return;
    }
    
    addDoc(collection(db, EMPLOYEES_COLLECTION), employee)
      .then((newDocRef) => {
        setEmployees(prev => [...prev, {id: newDocRef.id, ...employee}].sort((a,b) => a.name.localeCompare(b.name)));
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
  }, [employees, toast, t]);

  const removeEmployee = useCallback(async (employeeName: string) => {
    const employeeToRemove = employees.find(e => e.name === employeeName);
    if (!employeeToRemove || !employeeToRemove.id) {
       toast({ title: 'Error', description: t('employee_not_found'), variant: 'destructive' });
       return;
    }
    
    const docRef = doc(db, EMPLOYEES_COLLECTION, employeeToRemove.id);
    deleteDoc(docRef)
      .then(() => {
        setEmployees(prev => prev.filter(e => e.name !== employeeName));
        toast({ title: t('employee_deleted') });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });

  }, [employees, toast, t]);
  
  const updateEmployee = useCallback(async (employeeId: string, employeeData: Omit<Employee, 'id'>) => {
    const employeeRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    updateDoc(employeeRef, employeeData)
      .then(() => {
        setEmployees(prev => prev.map(e => e.id === employeeId ? { id: employeeId, ...employeeData } : e).sort((a,b) => a.name.localeCompare(b.name)));
        toast({ title: 'Empleado actualizado' });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: employeeRef.path,
            operation: 'update',
            requestResourceData: employeeData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }, [toast]);


  const addUser = useCallback(async (user: User) => {
    if (users.find(u => u.username.toLowerCase() === user.username.toLowerCase())) {
     toast({ title: t('duplicated_user'), variant: 'destructive' });
     return;
   }

   addDoc(collection(db, USERS_COLLECTION), user)
    .then((newDocRef) => {
      setUsers(prev => [...prev, {id: newDocRef.id, username: user.username }].sort((a,b) => a.username.localeCompare(b.username)));
      toast({ title: t('user_added') });
    })
    .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: USERS_COLLECTION,
            operation: 'create',
            requestResourceData: user
        });
        errorEmitter.emit('permission-error', permissionError);
    });
 }, [users, toast, t]);

 const removeUser = useCallback(async (userId: string) => {
    if(users.length <= 1) {
      toast({ title: t('cannot_delete_last_user'), variant: 'destructive' });
      return;
    }
    const docRef = doc(db, USERS_COLLECTION, userId);
    deleteDoc(docRef)
      .then(() => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast({ title: t('user_deleted') });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
 }, [users.length, toast, t]);
 
 const getReportRecipients = useCallback(() => {
    return employees
      .filter(e => e.receivesReports && e.email)
      .map(e => e.email);
  }, [employees]);


  return (
    <ConfigContext.Provider value={{ loading, departments, employees, users, addDepartment, removeDepartment, addEmployee, removeEmployee, updateEmployee, addUser, removeUser, fetchConfig, getReportRecipients }}>
      {children}
    </ConfigContext.Provider>
  );
};

    
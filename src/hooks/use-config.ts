"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { useTranslation } from './use-translation';
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
  getCountFromServer
} from 'firebase/firestore';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

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

export const useConfig = () => {
  const [departments, setDepartments] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const seedInitialData = useCallback(async () => {
    try {
      const batch = writeBatch(db);
      
      const departmentsCountSnapshot = await getCountFromServer(collection(db, DEPARTMENTS_COLLECTION));
      if(departmentsCountSnapshot.data().count === 0) {
        const deptsToAdd = ['Recursos Humanos', 'Ventas', 'Marketing', 'Producción', 'IT'];
        if(deptsToAdd.length > 0) {
          deptsToAdd.forEach(dept => {
            const docRef = doc(db, DEPARTMENTS_COLLECTION, dept);
            batch.set(docRef, { name: dept });
          });
        }
      }

      const employeesCountSnapshot = await getCountFromServer(collection(db, EMPLOYEES_COLLECTION));
      if(employeesCountSnapshot.data().count === 0) {
          // No initial employees
      }
      
      const usersCountSnapshot = await getCountFromServer(collection(db, USERS_COLLECTION));
      if(usersCountSnapshot.data().count === 0) {
        const userRef = doc(collection(db, USERS_COLLECTION));
        batch.set(userRef, { username: 'admin', password: 'admin'});
      }

      await batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: '[batch]',
            operation: 'create',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
    } catch(error) {
       // Errors are already caught by individual getCountFromServer if they fail
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const departmentsQuery = query(collection(db, DEPARTMENTS_COLLECTION), orderBy('name'));
      const employeesQuery = query(collection(db, EMPLOYEES_COLLECTION), orderBy('name'));
      const usersQuery = query(collection(db, USERS_COLLECTION), orderBy('username'));

      const departmentsSnapshot = await getDocs(departmentsQuery).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({ path: DEPARTMENTS_COLLECTION, operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
      });
      const employeesSnapshot = await getDocs(employeesQuery).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({ path: EMPLOYEES_COLLECTION, operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
      });
      const usersSnapshot = await getDocs(usersQuery).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({ path: USERS_COLLECTION, operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
      });
      
      if (departmentsSnapshot.empty && employeesSnapshot.empty && usersSnapshot.empty) {
        await seedInitialData();
        // Refetch after seeding
         const [depts, emps, usrs] = await Promise.all([
            getDocs(departmentsQuery),
            getDocs(employeesQuery),
            getDocs(usersQuery)
        ]);
        setDepartments(depts.docs.map(doc => doc.data().name).sort());
        setEmployees(emps.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)).sort((a,b) => a.name.localeCompare(b.name)));
        setUsers(usrs.docs.map(doc => ({ id: doc.id, username: doc.data().username } as User)).sort((a,b) => a.username.localeCompare(b.username)));
      } else {
        setDepartments(departmentsSnapshot.docs.map(doc => doc.data().name).sort());
        setEmployees(employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)).sort((a,b) => a.name.localeCompare(b.name)));
        setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, username: doc.data().username } as User)).sort((a,b) => a.username.localeCompare(b.username)));
      }

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
  }, [toast, seedInitialData, t]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const addDepartment = useCallback(async (department: string) => {
    if (departments.map(d => d.toLowerCase()).includes(department.toLowerCase())) {
        toast({ title: t('duplicated_department'), variant: 'destructive' });
        return;
    }
    
    const departmentData = { name: department };
    setDoc(doc(db, DEPARTMENTS_COLLECTION, department), departmentData)
        .then(() => {
            setDepartments(prev => [...prev, department].sort());
            toast({ title: t('department_added') });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: `${DEPARTMENTS_COLLECTION}/${department}`,
                operation: 'create',
                requestResourceData: departmentData,
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({ title: 'Error', description: t('error_adding_department'), variant: 'destructive' });
        });
  }, [departments, toast, t]);

  const removeDepartment = useCallback(async (departmentName: string) => {
    try {
      const deptDocRef = doc(db, DEPARTMENTS_COLLECTION, departmentName);
      
      const batch = writeBatch(db);
      
      batch.delete(deptDocRef);
  
      const empQuery = query(collection(db, EMPLOYEES_COLLECTION), where('department', '==', departmentName));
      const empSnapshot = await getDocs(empQuery);
      empSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
  
      batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `[batch delete on department: ${departmentName}]`,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ title: 'Error', description: t('error_deleting_department'), variant: 'destructive' });
      }).then(() => {
        setDepartments(prev => prev.filter(d => d !== departmentName));
        setEmployees(prev => prev.filter(e => e.department !== departmentName));
        toast({ title: t('department_deleted'), description: t('department_deleted_detail') });
      });
  
    } catch (error) {
       console.error("Error removing department:", error);
       toast({ title: 'Error', description: t('error_deleting_department'), variant: 'destructive' });
    }
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
        toast({ title: 'Error', description: t('error_adding_employee'), variant: 'destructive' });
      });
  }, [employees, toast, t]);

  const removeEmployee = useCallback(async (employeeName: string) => {
    const employeeToRemove = employees.find(e => e.name === employeeName);
    if (!employeeToRemove || !employeeToRemove.id) {
        toast({ title: 'Error', description: t('employee_not_found'), variant: 'destructive' });
        return;
    }
    
    deleteDoc(doc(db, EMPLOYEES_COLLECTION, employeeToRemove.id))
      .then(() => {
        setEmployees(prev => prev.filter(e => e.name !== employeeName));
        toast({ title: t('employee_deleted') });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `${EMPLOYEES_COLLECTION}/${employeeToRemove.id}`,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ title: 'Error', description: t('error_deleting_employee'), variant: 'destructive' });
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
        toast({ title: 'Error', description: 'No se pudo actualizar el empleado.', variant: 'destructive' });
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
        toast({ title: 'Error', description: t('error_adding_user'), variant: 'destructive' });
    });
 }, [users, toast, t]);

 const removeUser = useCallback(async (userId: string) => {
    if(users.length <= 1) {
      toast({ title: t('cannot_delete_last_user'), variant: 'destructive' });
      return;
    }

    deleteDoc(doc(db, USERS_COLLECTION, userId))
      .then(() => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast({ title: t('user_deleted') });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: `${USERS_COLLECTION}/${userId}`,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ title: 'Error', description: t('error_deleting_user'), variant: 'destructive' });
      });
 }, [users.length, toast, t]);
 
 const getReportRecipients = useCallback(() => {
    return employees
      .filter(e => e.receivesReports && e.email)
      .map(e => e.email);
  }, [employees]);


  return { loading, departments, employees, users, addDepartment, removeDepartment, addEmployee, removeEmployee, updateEmployee, addUser, removeUser, fetchConfig, getReportRecipients };
};

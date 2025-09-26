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
  getCountFromServer
} from 'firebase/firestore';

const DEPARTMENTS_COLLECTION = 'departments';
const EMPLOYEES_COLLECTION = 'employees';
const USERS_COLLECTION = 'users';

export interface Employee {
  id?: string;
  name: string;
  department: string;
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

    await batch.commit();
  }, []);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      await seedInitialData();

      const departmentsQuery = query(collection(db, DEPARTMENTS_COLLECTION), orderBy('name'));
      const employeesQuery = query(collection(db, EMPLOYEES_COLLECTION), orderBy('name'));
      const usersQuery = query(collection(db, USERS_COLLECTION), orderBy('username'));

      const [departmentsSnapshot, employeesSnapshot, usersSnapshot] = await Promise.all([
        getDocs(departmentsQuery),
        getDocs(employeesQuery),
        getDocs(usersQuery)
      ]);
      
      setDepartments(departmentsSnapshot.docs.map(doc => doc.data().name).sort());
      setEmployees(employeesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)).sort((a,b) => a.name.localeCompare(b.name)));
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, username: doc.data().username } as User)).sort((a,b) => a.username.localeCompare(b.username)));

    } catch (error) {
      console.error('Error fetching config from Firestore', error);
      toast({
        title: 'Error',
        description: t('error_loading_config'),
        variant: 'destructive',
      });
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
    
    try {
        await setDoc(doc(db, DEPARTMENTS_COLLECTION, department), { name: department });
        setDepartments(prev => [...prev, department].sort());
        toast({ title: t('department_added') });
    } catch (error) {
       toast({ title: 'Error', description: t('error_adding_department'), variant: 'destructive' });
    }
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
  
      await batch.commit();
  
      setDepartments(prev => prev.filter(d => d !== departmentName));
      setEmployees(prev => prev.filter(e => e.department !== departmentName));
  
      toast({ title: t('department_deleted'), description: t('department_deleted_detail') });
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
    try {
      const newDocRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), employee);
      setEmployees(prev => [...prev, {id: newDocRef.id, ...employee}].sort((a,b) => a.name.localeCompare(b.name)));
      toast({ title: t('employee_added') });
    } catch (error) {
       toast({ title: 'Error', description: t('error_adding_employee'), variant: 'destructive' });
    }
  }, [employees, toast, t]);

  const removeEmployee = useCallback(async (employeeName: string) => {
    const employeeToRemove = employees.find(e => e.name === employeeName);
    if (!employeeToRemove || !employeeToRemove.id) {
        toast({ title: 'Error', description: t('employee_not_found'), variant: 'destructive' });
        return;
    }
    try {
      await deleteDoc(doc(db, EMPLOYEES_COLLECTION, employeeToRemove.id));
      setEmployees(prev => prev.filter(e => e.name !== employeeName));
      toast({ title: t('employee_deleted') });
    } catch (error) {
       toast({ title: 'Error', description: t('error_deleting_employee'), variant: 'destructive' });
    }
  }, [employees, toast, t]);

  const addUser = useCallback(async (user: User) => {
    if (users.find(u => u.username.toLowerCase() === user.username.toLowerCase())) {
     toast({ title: t('duplicated_user'), variant: 'destructive' });
     return;
   }
   try {
     const newDocRef = await addDoc(collection(db, USERS_COLLECTION), user);
     setUsers(prev => [...prev, {id: newDocRef.id, username: user.username }].sort((a,b) => a.username.localeCompare(b.username)));
     toast({ title: t('user_added') });
   } catch (error) {
      toast({ title: 'Error', description: t('error_adding_user'), variant: 'destructive' });
   }
 }, [users, toast, t]);

 const removeUser = useCallback(async (userId: string) => {
    if(users.length <= 1) {
      toast({ title: t('cannot_delete_last_user'), variant: 'destructive' });
      return;
    }
    try {
     await deleteDoc(doc(db, USERS_COLLECTION, userId));
     setUsers(prev => prev.filter(u => u.id !== userId));
     toast({ title: t('user_deleted') });
    } catch (error) {
      toast({ title: 'Error', description: t('error_deleting_user'), variant: 'destructive' });
    }
 }, [users.length, toast, t]);


  return { loading, departments, employees, users, addDepartment, removeDepartment, addEmployee, removeEmployee, addUser, removeUser, fetchConfig };
};

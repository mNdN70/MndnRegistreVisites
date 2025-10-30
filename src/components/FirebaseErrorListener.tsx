"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/lib/error-emitter";
import { FirestorePermissionError } from "@/lib/errors";

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error("A Firestore permission error was caught:", error.toString());
      
      toast({
        variant: "destructive",
        title: "Error de permisos",
        description: "No tienes permiso para realizar esta acción. Contacta con el administrador.",
        duration: 9000,
      });
    };

    errorEmitter.on("permission-error", handlePermissionError);

    return () => {
      errorEmitter.off("permission-error", handlePermissionError);
    };
  }, [toast]);

  return null;
}

    
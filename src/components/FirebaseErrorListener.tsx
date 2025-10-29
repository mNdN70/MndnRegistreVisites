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
        title: "Error de permisos de Firestore",
        description: "No tienes permiso para realizar esta acción.",
        duration: 9000,
      });

      // In a real app, you might want to throw this error to an error boundary
      // For this prototype, we'll just log it and show a toast.
    };

    errorEmitter.on("permission-error", handlePermissionError);

    return () => {
      errorEmitter.off("permission-error", handlePermissionError);
    };
  }, [toast]);

  return null;
}

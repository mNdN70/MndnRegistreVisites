"use client";

import { VisitsContext } from "@/contexts/VisitsContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from "date-fns";
import { es, ca, enUS } from "date-fns/locale";
import { useContext, useEffect } from "react";

const locales: { [key: string]: Locale } = { es, ca, en: enUS };

export default function ActiveVisitsTable() {
  const context = useContext(VisitsContext);
  
  if (!context) {
    throw new Error("useVisitsContext must be used within a VisitsProvider");
  }

  const { getActiveVisits, loading, fetchVisits } = context;
  
  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const activeVisits = getActiveVisits();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div>
      {activeVisits.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No hi ha visites actives en aquest moment.</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>DNI/NIE</TableHead>
                <TableHead className="hidden md:table-cell">Empresa</TableHead>
                <TableHead>Hora d'Entrada</TableHead>
                <TableHead className="hidden sm:table-cell">Visita a</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeVisits.map((visit) => (
                <TableRow key={visit.docId}>
                  <TableCell className="font-medium">{visit.name}</TableCell>
                  <TableCell>{visit.id}</TableCell>
                  <TableCell className="hidden md:table-cell">{visit.company}</TableCell>
                  <TableCell>
                    <div>{format(new Date(visit.entryTime), "p", { locale: ca })}</div>
                    <div className="text-xs text-muted-foreground">
                      (fa {formatDistanceToNow(new Date(visit.entryTime), { locale: ca })})
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{visit.personToVisit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

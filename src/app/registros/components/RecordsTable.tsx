"use client";

import { useVisits } from "@/hooks/use-visits";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function RecordsTable() {
  const { getAllVisits, exportToCSV, loading } = useVisits();
  const allVisits = getAllVisits();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-40 ml-auto" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Exportar a CSV
        </Button>
      </div>
      {allVisits.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No hay registros de visitas.</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden lg:table-cell">ID</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Salida</TableHead>
                <TableHead className="hidden md:table-cell">Visita a</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allVisits.map((visit) => (
                <TableRow key={visit.id + visit.entryTime}>
                  <TableCell className="font-medium">{visit.name}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{visit.id}</TableCell>
                  <TableCell>{format(new Date(visit.entryTime), "Pp", { locale: es })}</TableCell>
                  <TableCell>
                    {visit.exitTime
                      ? format(new Date(visit.exitTime), "Pp", { locale: es })
                      : "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{visit.personToVisit}</TableCell>
                  <TableCell>
                    {visit.exitTime ? (
                      <Badge variant="outline">Finalizada</Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-600">Activa</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

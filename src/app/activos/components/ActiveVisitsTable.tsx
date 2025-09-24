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
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function ActiveVisitsTable() {
  const { getActiveVisits, loading } = useVisits();
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

  if (activeVisits.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No hay visitas activas en este momento.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden md:table-cell">Empresa</TableHead>
            <TableHead>Hora de Entrada</TableHead>
            <TableHead className="hidden sm:table-cell">Visita a</TableHead>
            <TableHead>Tipo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeVisits.map((visit) => (
            <TableRow key={visit.id + visit.entryTime}>
              <TableCell className="font-medium">{visit.name}</TableCell>
              <TableCell className="hidden md:table-cell">{visit.company}</TableCell>
              <TableCell>
                <div>{format(new Date(visit.entryTime), "p", { locale: es })}</div>
                <div className="text-xs text-muted-foreground">
                  (hace {formatDistanceToNow(new Date(visit.entryTime), { locale: es })})
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{visit.personToVisit}</TableCell>
              <TableCell>
                <Badge variant={visit.type === 'transporter' ? 'secondary' : 'default'}>
                  {visit.type === 'transporter' ? 'Transportista' : 'General'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

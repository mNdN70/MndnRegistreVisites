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
import { format, formatDistanceToNow } from "date-fns";
import { es, ca, enUS } from "date-fns/locale";
import { useTranslation } from "@/hooks/use-translation";

const locales: { [key: string]: Locale } = { es, ca, en: enUS };

export default function ActiveVisitsTable() {
  const { getActiveVisits, exportActiveVisitsToCSV, loading } = useVisits();
  const activeVisits = getActiveVisits();
  const { t, language } = useTranslation();

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
      <div className="flex justify-end mb-4">
          <Button onClick={exportActiveVisitsToCSV} disabled={activeVisits.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              {t('export_to_csv')}
          </Button>
      </div>
      {activeVisits.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">{t('no_active_visits')}</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('company')}</TableHead>
                <TableHead>{t('entry_time')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('visiting')}</TableHead>
                <TableHead>{t('type')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeVisits.map((visit) => (
                <TableRow key={visit.docId}>
                  <TableCell className="font-medium">{visit.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{visit.company}</TableCell>
                  <TableCell>
                    <div>{format(new Date(visit.entryTime), "p", { locale: locales[language] })}</div>
                    <div className="text-xs text-muted-foreground">
                      ({t('ago')} {formatDistanceToNow(new Date(visit.entryTime), { locale: locales[language] })})
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{visit.personToVisit}</TableCell>
                  <TableCell>
                    <Badge variant={visit.type === 'transporter' ? 'secondary' : 'default'}>
                      {visit.type === 'transporter' ? t('transporter') : t('general')}
                    </Badge>
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

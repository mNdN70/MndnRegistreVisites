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
import { Download, Calendar as CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { es, ca, enUS } from "date-fns/locale";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

const locales: { [key: string]: Locale } = { es, ca, en: enUS };

export default function RecordsTable() {
  const { getAllVisits, exportToCSV, loading } = useVisits();
  const allVisits = getAllVisits();
  const { t, language } = useTranslation();

  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  const filteredVisits = allVisits.filter((visit) => {
    if (!date?.from) return true;
    const entryDate = new Date(visit.entryTime);
    const toDate = date.to ?? date.from;
    return isWithinInterval(entryDate, { start: startOfDay(date.from), end: endOfDay(toDate) });
  });

  const handleExport = () => {
    if (filteredVisits.length === 0) {
      alert(t('no_data_to_export'));
      return;
    }
    const from = date?.from ? format(date.from, 'yyyy-MM-dd') : 'inicio';
    const to = date?.to ? format(date.to, 'yyyy-MM-dd') : from;
    exportToCSV(filteredVisits, `registros_visitas_${from}_a_${to}.csv`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div className="grid gap-2">
           <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y", { locale: locales[language] })} -{" "}
                      {format(date.to, "LLL dd, y", { locale: locales[language] })}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y", { locale: locales[language] })
                  )
                ) : (
                  <span>{t('select_range')}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={locales[language]}
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          {t('export_to_csv')}
        </Button>
      </div>
      {filteredVisits.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">{t('no_records_in_range')}</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('id')}</TableHead>
                <TableHead>{t('entry')}</TableHead>
                <TableHead>{t('exit_time')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('visiting')}</TableHead>
                <TableHead>{t('status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisits.map((visit) => (
                <TableRow key={visit.docId}>
                  <TableCell className="font-medium">{visit.name}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{visit.id}</TableCell>
                  <TableCell>{format(new Date(visit.entryTime), "Pp", { locale: locales[language] })}</TableCell>
                  <TableCell>
                    {visit.exitTime
                      ? format(new Date(visit.exitTime), "Pp", { locale: locales[language] })
                      : "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{visit.personToVisit}</TableCell>
                  <TableCell>
                    {visit.exitTime ? (
                      <Badge variant="outline">{t('finished')}</Badge>
                    ) : (
                      <Badge variant="default" className="bg-primary">{t('active')}</Badge>
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

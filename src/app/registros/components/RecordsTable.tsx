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
import { Calendar as CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday } from "date-fns";
import { es, ca, enUS } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/use-translation";

const locales: { [key: string]: Locale } = { es, ca, en: enUS };

export default function RecordsTable() {
  const { 
    loading, 
    date, 
    setDate, 
    getFilteredVisits 
  } = useVisits();

  const filteredVisits = getFilteredVisits();
  const { t, language } = useTranslation();

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
  
  const renderDateLabel = () => {
    if (date?.from) {
      if (date.to) {
        if (isToday(date.from) && isToday(date.to)) {
          return "Hoy";
        }
        return (
          <>
            {format(date.from, "LLL dd, y", { locale: locales[language] })} -{" "}
            {format(date.to, "LLL dd, y", { locale: locales[language] })}
          </>
        );
      }
      if (isToday(date.from)) {
        return "Hoy";
      }
      return format(date.from, "LLL dd, y", { locale: locales[language] });
    }
    return <span>{t('select_range')}</span>;
  };


  return (
    <div>
      <div className="flex justify-start items-center mb-4">
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
              {renderDateLabel()}
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
                    {visit.autoExit ? (
                        <Badge variant="destructive">{t('auto_exit')}</Badge>
                    ) : visit.exitTime ? (
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

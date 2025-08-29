"use client";

import { StudentClass } from "@/types/classes/class";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { Text } from "@/components/ui/Text";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface UserClassesTabProps {
  classes: StudentClass[];
}

// Helper para gerar uma lista de anos para o filtro
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 1; i <= currentYear + 2; i++) {
    years.push(i);
  }
  return years;
};

const monthOptions = [
  { value: 0, label: "Janeiro" },
  { value: 1, label: "Fevereiro" },
  { value: 2, label: "Março" },
  { value: 3, label: "Abril" },
  { value: 4, label: "Maio" },
  { value: 5, label: "Junho" },
  { value: 6, label: "Julho" },
  { value: 7, label: "Agosto" },
  { value: 8, label: "Setembro" },
  { value: 9, label: "Outubro" },
  { value: 10, label: "Novembro" },
  { value: 11, label: "Dezembro" },
];

export default function UserClassesTab({ classes }: UserClassesTabProps) {
  const router = useRouter();
  const yearOptions = useMemo(() => generateYearOptions(), []);

  // Estados para controlar os filtros selecionados
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // Filtra as aulas com base no mês e ano selecionados
  const filteredClasses = useMemo(() => {
    if (!classes) return [];
    return classes.filter((cls) => {
      const classDate = new Date(cls.scheduledAt);
      return (
        classDate.getMonth() === selectedMonth &&
        classDate.getFullYear() === selectedYear
      );
    });
  }, [classes, selectedMonth, selectedYear]);

  if (!classes || classes.length === 0) {
    return <Text>Este utilizador não tem nenhuma aula agendada.</Text>;
  }

  return (
    <div className="space-y-4">
      {/* --- Barra de Filtros --- */}
      <div className="flex flex-col md:flex-row gap-4">
        <Select
          value={String(selectedMonth)}
          onValueChange={(val) => setSelectedMonth(Number(val))}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filtrar por Mês" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((month) => (
              <SelectOption key={month.value} value={String(month.value)}>
                {month.label}
              </SelectOption>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(selectedYear)}
          onValueChange={(val) => setSelectedYear(Number(val))}
        >
          <SelectTrigger className="w-full md:w-[120px]">
            <SelectValue placeholder="Filtrar por Ano" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectOption key={year} value={String(year)}>
                {year}
              </SelectOption>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* --- Tabela de Aulas --- */}
      <div className="rounded-lg border border-surface-2 overflow-hidden">
        <Table>
          <TableHeader className="bg-surface-1">
            <TableRow>
              <TableHead className="text-subtitle">Data e Hora</TableHead>
              <TableHead className="text-subtitle">Status</TableHead>
              <TableHead className="text-subtitle">Tópico da Aula</TableHead>
              <TableHead className="text-right text-subtitle">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-container divide-y divide-surface-2">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((cls) => {
                const classDate = new Date(cls.scheduledAt);
                const formattedDateTime = classDate.toLocaleString("pt-BR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                });

                return (
                  <TableRow key={cls.id}>
                    <TableCell>
                      <Text weight="medium">{formattedDateTime}</Text>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          cls.status === "scheduled" ? "primary" : "secondary"
                        }
                        style="outline"
                      >
                        {cls.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Text variant="placeholder" className="italic">
                        {cls.notes || "Nenhum tópico fornecido"}
                      </Text>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/hub/plataforma/class/${cls.id}`)
                        }
                      >
                        Ver Aula
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <Text>
                    Nenhuma aula encontrada para o período selecionado.
                  </Text>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

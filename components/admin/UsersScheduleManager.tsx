"use client";

import { useState, useEffect } from "react";
import { FullUserDetails } from "@/types/users/user-details";
import { User } from "@/types/users/users";
import { ClassTemplateDay } from "@/types/classes/class";
import { daysOfWeek } from "@/types/time/times";
import { toast } from "sonner";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  Select,
  SelectContent,
  SelectOption,
  SelectTrigger,
  SelectValue,
} from "../ui/Select";
import { Input } from "../ui/Input";
import { Text } from "../ui/Text";
import { Header } from "../ui/Header";
import { Loading } from "../ui/Loading";
import {
  AddSquare,
  Book,
  Calendar,
  Pen,
  TrashBinMinimalistic,
} from "@solar-icons/react";

interface UserScheduleManagerProps {
  user: FullUserDetails;
  allTeachers: User[];
}

const initialNewEntryState = {
  day: "",
  hour: "",
  teacherId: "",
  language: "",
  id: "",
};

const languageOptions = ["Inglês", "Espanhol", "Libras", "Português"];

export default function UserScheduleManager({
  user,
  allTeachers,
}: UserScheduleManagerProps) {
  const [schedule, setSchedule] = useState<ClassTemplateDay[]>([]);
  const [newEntry, setNewEntry] =
    useState<Omit<ClassTemplateDay, "id">>(initialNewEntryState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Validação de pré-requisito
  if (!user.contractStartDate || !user.contractLengthMonths) {
    return (
      <Card className="p-6 text-center">
        <Text variant="subtitle">
          Por favor, defina a <b>Data de Início</b> e a{" "}
          <b>Duração do Contrato</b> na aba "Visão Geral" antes de configurar o
          horário.
        </Text>
      </Card>
    );
  }

  // Efeito para buscar o horário do aluno
  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/class-templates/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setSchedule(data.days || []);
        }
      } catch (error) {
        toast.error("Erro ao carregar o horário do aluno.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchedule();
  }, [user.id]);

  const handleInputChange = (field: keyof typeof newEntry, value: string) => {
    setNewEntry((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddNewEntry = () => {
    if (
      !newEntry.day ||
      !newEntry.hour ||
      !newEntry.teacherId ||
      !newEntry.language
    ) {
      toast.warning(
        "Por favor, preencha todos os campos para adicionar um horário."
      );
      return;
    }
    // Adiciona um ID temporário para a key do React
    const entryWithId = { ...newEntry, id: `temp-${Date.now()}` };
    setSchedule((prev) => [...prev, entryWithId]);
    setNewEntry(initialNewEntryState); // Limpa o formulário
  };

  const getTeacherName = (teacherId: string) => {
    return (
      allTeachers.find((t) => t.id === teacherId)?.name ||
      "Professor não encontrado"
    );
  };

  const handleSaveSchedule = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/class-templates/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: schedule }),
      });
      if (response.ok) {
        toast.success("Horário salvo com sucesso!");
      } else {
        throw new Error("Falha ao salvar o horário.");
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar o horário.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateClasses = async () => {
    if (
      !confirm(
        "Tem certeza que deseja gerar todas as aulas para este aluno? Esta ação criará o cronograma para todo o período do contrato."
      )
    )
      return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/classes/generate-classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: user.id }),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(`Erro ao gerar aulas: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddOrUpdateEntry = () => {
    if (
      !newEntry.day ||
      !newEntry.hour ||
      !newEntry.teacherId ||
      !newEntry.language
    ) {
      toast.warning("Por favor, preencha todos os campos.");
      return;
    }

    if (editingEntryId) {
      // Se está em modo de edição
      setSchedule((prev) =>
        prev.map((entry) =>
          entry.id === editingEntryId
            ? { ...newEntry, id: editingEntryId }
            : entry
        )
      );
      toast.success(
        "Horário atualizado na lista. Clique em 'Salvar' para confirmar."
      );
    } else {
      // Se está adicionando um novo
      const entryWithId = { ...newEntry, id: `temp-${Date.now()}` };
      setSchedule((prev) => [...prev, entryWithId]);
    }

    // Limpa o formulário e sai do modo de edição
    setNewEntry(initialNewEntryState);
    setEditingEntryId(null);
  };

  const handleStartEditing = (entryToEdit: ClassTemplateDay) => {
    setEditingEntryId(entryToEdit.id);
    setNewEntry(entryToEdit); // Preenche o formulário com os dados do item
  };

  const handleCancelEditing = () => {
    setNewEntry(initialNewEntryState);
    setEditingEntryId(null);
  };

  const handleRemoveEntry = (idToRemove: string) => {
    setSchedule((currentSchedule) =>
      currentSchedule.filter((entry) => entry.id !== idToRemove)
    );
    toast.info("Horário removido da lista. Clique em 'Salvar' para confirmar.");
  };

  const handleDeleteSchedule = async () => {
    if (
      !confirm(
        "ATENÇÃO: Esta ação irá deletar o template e TODAS as aulas futuras agendadas. Deseja continuar?"
      )
    )
      return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/class-templates/${user.id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        setSchedule([]); // Limpa o horário na tela
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(`Erro ao deletar horário: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <Header
        heading="Gestão de Horário Fixo"
        icon={
          <Calendar weight="BoldDuotone" className="w-8 h-8 text-primary" />
        }
      />
      <div className="p-6 space-y-6">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {/* --- FORMULÁRIO DE ADIÇÃO/EDIÇÃO --- */}
            <div className="p-4 border border-surface-2 rounded-lg space-y-4">
              <Text weight="semibold">
                {editingEntryId ? "Editando Horário" : "Adicionar Novo Horário"}
              </Text>

              {/* ▼▼▼ GRID COM OS SELECTS E INPUTS ▼▼▼ */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <Select
                  value={newEntry.day}
                  onValueChange={(value) => handleInputChange("day", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Dia da semana" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectOption key={day} value={day}>
                        {day}
                      </SelectOption>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="time"
                  value={newEntry.hour}
                  onChange={(e) => handleInputChange("hour", e.target.value)}
                />
                <Select
                  value={newEntry.teacherId}
                  onValueChange={(value) =>
                    handleInputChange("teacherId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTeachers.map((teacher) => (
                      <SelectOption key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectOption>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={newEntry.language}
                  onValueChange={(value) =>
                    handleInputChange("language", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((lang) => (
                      <SelectOption key={lang} value={lang}>
                        {lang}
                      </SelectOption>
                    ))}
                  </SelectContent>
                </Select>
                {/* O botão de adicionar/atualizar foi movido para fora do grid para melhor responsividade */}
              </div>
              {/* ▲▲▲ FIM DO GRID ▲▲▲ */}

              <div className="flex gap-2">
                <Button onClick={handleAddOrUpdateEntry} className="w-full">
                  {editingEntryId ? (
                    <Pen className="mr-2" />
                  ) : (
                    <AddSquare className="mr-2" />
                  )}
                  {editingEntryId ? "Atualizar Horário" : "Adicionar"}
                </Button>
                {editingEntryId && (
                  <Button onClick={handleCancelEditing}>Cancelar</Button>
                )}
              </div>
            </div>

            {/* --- LISTA DE HORÁRIOS --- */}
            <div className="space-y-3">
              <Text weight="semibold">Horário Semanal Atual</Text>
              {schedule.length === 0 ? (
                <Text variant="placeholder" className="text-center py-4">
                  Nenhum horário definido.
                </Text>
              ) : (
                schedule.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-surface-1 rounded-md border border-surface-2"
                  >
                    {/* ▼▼▼ INFORMAÇÕES DO HORÁRIO ▼▼▼ */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <Text weight="medium" className="min-w-[80px]">
                        {entry.day}
                      </Text>
                      <Text variant="subtitle">{entry.hour}</Text>
                      <Text variant="subtitle">
                        {getTeacherName(entry.teacherId)}
                      </Text>
                      <Text variant="subtitle">({entry.language})</Text>
                    </div>
                    {/* ▲▲▲ FIM DAS INFORMAÇÕES ▲▲▲ */}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartEditing(entry)}
                      >
                        <Pen />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-danger"
                        onClick={() => handleRemoveEntry(entry.id)}
                      >
                        <TrashBinMinimalistic />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* --- BOTÕES DE AÇÃO PRINCIPAIS --- */}
        <div className="flex flex-col md:flex-row justify-end gap-4 pt-6 border-t border-surface-2">
          <Button
            variant="danger"
            onClick={handleDeleteSchedule}
            disabled={isSaving || isLoading || schedule.length === 0}
          >
            {isSaving ? "A Deletar..." : "Deletar Horário Completo"}
          </Button>
          <Button onClick={handleSaveSchedule} disabled={isSaving || isLoading}>
            {isSaving ? "A Salvar..." : "Salvar Alterações"}
          </Button>
          <Button
            onClick={handleGenerateClasses}
            disabled={isSaving || isLoading}
          >
            {isSaving ? "A Gerar..." : "Gerar Aulas"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

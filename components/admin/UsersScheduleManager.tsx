"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ModalClose,
} from "@/components/ui/Modal";
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteOption, setDeleteOption] = useState<
    "all" | "date-range" | "from-date"
  >("all");
  const [deleteFromDate, setDeleteFromDate] = useState("");
  const [deleteToDate, setDeleteToDate] = useState("");
  const [selectedTemplateEntries, setSelectedTemplateEntries] = useState<
    ClassTemplateDay[]
  >([]);

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
      newEntry.teacherId.startsWith("teacher-") ||
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
      newEntry.teacherId.startsWith("teacher-") ||
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
    setIsDeleteModalOpen(true);
  };

  const executeDeleteSchedule = async () => {
    setIsSaving(true);
    setIsDeleteModalOpen(false);

    try {
      let response;

      // Determine which deletion API to call based on selected option
      if (deleteOption === "all") {
        response = await fetch(`/api/class-templates/${user.id}`, {
          method: "DELETE",
        });
      } else {
        // For date-based deletions, we need to call a different API
        response = await fetch(
          `/api/class-templates/${user.id}/delete-classes`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              option: deleteOption,
              fromDate: deleteFromDate,
              toDate: deleteOption === "date-range" ? deleteToDate : undefined,
              templateEntries:
                selectedTemplateEntries.length > 0
                  ? selectedTemplateEntries
                  : undefined,
            }),
          }
        );
      }

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        if (deleteOption === "all") {
          setSchedule([]); // Limpa o horário na tela only if deleting everything
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(`Erro ao deletar horário: ${error.message}`);
    } finally {
      setIsSaving(false);
      // Reset delete options
      setDeleteOption("all");
      setDeleteFromDate("");
      setDeleteToDate("");
      setSelectedTemplateEntries([]);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    // Reset delete options
    setDeleteOption("all");
    setDeleteFromDate("");
    setDeleteToDate("");
    setSelectedTemplateEntries([]);
  };

  return (
    <Card>
      {/* Delete Confirmation Modal */}
      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Opções de Exclusão de Aulas</ModalTitle>
            <ModalDescription>
              Escolha como deseja excluir as aulas do aluno. O histórico não
              será afetado.
            </ModalDescription>
          </ModalHeader>

          <div className="py-4 space-y-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="delete-all"
                name="delete-option"
                checked={deleteOption === "all"}
                onChange={() => setDeleteOption("all")}
                className="mr-2"
              />
              <label htmlFor="delete-all">
                <Text weight="medium">Excluir tudo</Text>
                <Text variant="subtitle" className="block">
                  Remove o template e todas as aulas futuras
                </Text>
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="radio"
                id="delete-from-date"
                name="delete-option"
                checked={deleteOption === "from-date"}
                onChange={() => setDeleteOption("from-date")}
                className="mr-2"
              />
              <label htmlFor="delete-from-date">
                <Text weight="medium">Excluir a partir de uma data</Text>
                <Text variant="subtitle" className="block">
                  Remove aulas futuras a partir de uma data específica
                </Text>
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="radio"
                id="delete-date-range"
                name="delete-option"
                checked={deleteOption === "date-range"}
                onChange={() => setDeleteOption("date-range")}
                className="mr-2"
              />
              <label htmlFor="delete-date-range">
                <Text weight="medium">Excluir em um período</Text>
                <Text variant="subtitle" className="block">
                  Remove aulas futuras dentro de um intervalo de datas
                </Text>
              </label>
            </div>

            {(deleteOption === "from-date" ||
              deleteOption === "date-range") && (
              <div className="space-y-4 mt-2">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Data inicial
                  </label>
                  <Input
                    type="date"
                    value={deleteFromDate}
                    onChange={(e) => setDeleteFromDate(e.target.value)}
                  />
                </div>

                {deleteOption === "date-range" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Data final
                    </label>
                    <Input
                      type="date"
                      value={deleteToDate}
                      onChange={(e) => setDeleteToDate(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Templates (opcional):
                  </label>
                  <Text variant="subtitle" className="text-xs mb-2">
                    Se nenhum for selecionado, todas as aulas serão excluídas
                  </Text>
                  <div className="max-h-40 overflow-y-auto border rounded p-2">
                    {schedule.map((entry) => (
                      <div key={entry.id} className="flex items-center py-1">
                        <input
                          type="checkbox"
                          id={`template-${entry.id}`}
                          checked={selectedTemplateEntries.some(
                            (e) => e.id === entry.id
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTemplateEntries((prev) => [
                                ...prev,
                                entry,
                              ]);
                            } else {
                              setSelectedTemplateEntries((prev) =>
                                prev.filter((e) => e.id !== entry.id)
                              );
                            }
                          }}
                          className="mr-2"
                        />
                        <label
                          htmlFor={`template-${entry.id}`}
                          className="text-sm"
                        >
                          {entry.day} {entry.hour} -{" "}
                          {getTeacherName(entry.teacherId)} ({entry.language})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <ModalFooter>
            <ModalClose asChild>
              <Button variant="secondary" onClick={handleCancelDelete}>
                Cancelar
              </Button>
            </ModalClose>
            <Button
              variant="danger"
              onClick={executeDeleteSchedule}
              disabled={
                (deleteOption === "from-date" && !deleteFromDate) ||
                (deleteOption === "date-range" &&
                  (!deleteFromDate || !deleteToDate))
              }
            >
              Confirmar Exclusão
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
                  value={newEntry.teacherId || ""}
                  onValueChange={(value) =>
                    handleInputChange("teacherId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTeachers.map((teacher, index) => {
                      // Ensure we have a valid value for the SelectOption
                      const teacherValue =
                        teacher.id && teacher.id.trim() !== ""
                          ? teacher.id
                          : `teacher-${index}`;

                      return (
                        <SelectOption key={teacherValue} value={teacherValue}>
                          {teacher.name}
                        </SelectOption>
                      );
                    })}
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
            disabled={isSaving || isLoading}
          >
            <TrashBinMinimalistic className="mr-2" />
            Excluir Aulas
          </Button>

          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={handleGenerateClasses}
              disabled={isSaving || isLoading}
            >
              <Book className="mr-2" />
              Gerar Aulas
            </Button>

            <Button
              onClick={handleSaveSchedule}
              disabled={isSaving || isLoading}
            >
              {isSaving ? (
                <Loading className="mr-2" />
              ) : (
                <Calendar className="mr-2" />
              )}
              Salvar Horário
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

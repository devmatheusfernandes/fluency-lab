"use client";

import { Calendar, CalendarEvent } from "@/components/ui/Calendar";
import { useTeacher } from "@/hooks/useTeacher";
import {
  AvailabilitySlot,
  AvailabilityException,
} from "@/types/time/availability";
import { useMemo, useState } from "react";
import AvailabilityModal from "./AvailabilityModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

import { mapAvailabilityToEvents } from "@/lib/calendar";

export default function TeacherAvailabilityManager() {
  const {
    scheduleData,
    addOrUpdateAvailability,
    deleteAvailability,
    isLoading,
    error,
    successMessage,
  } = useTeacher();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null
  );
  const [selectedOccurrenceDate, setSelectedOccurrenceDate] =
    useState<Date | null>(null);

  const calendarEvents = useMemo(() => {
    // 👇 CORREÇÃO 2: Passamos as listas de dentro de 'scheduleData' para a função
    return mapAvailabilityToEvents(
      scheduleData.slots,
      scheduleData.exceptions,
      scheduleData.bookedClasses
    );
  }, [scheduleData]);

  const handleOpenAddModal = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setIsEditModalOpen(true);
  };

  // Replace your handleEventClick function with this:
  const handleEventClick = (event: CalendarEvent) => {
    if (event.title === "Reservado") {
      alert(
        `Aula agendada para o dia ${event.date.toLocaleDateString()} às ${event.startTime}.`
      );
      return;
    }

    // 👇 CORREÇÃO 3: A busca pelo slot original também usa 'scheduleData.slots'
    const originalSlot = scheduleData.slots.find(
      (slot) => slot.id === event.slotId
    );

    if (originalSlot) {
      setSelectedSlot(originalSlot);
      setSelectedOccurrenceDate(event.date);
      setIsEditModalOpen(true);
    } else {
      console.error("Slot original não encontrado para o evento:", event);
    }
  };
  const handleSave = (
    slotData: Partial<Omit<AvailabilitySlot, "id" | "teacherId">>,
    id?: string
  ) => {
    addOrUpdateAvailability(
      slotData as Omit<AvailabilitySlot, "id" | "teacherId">,
      id
    );
    setIsEditModalOpen(false);
  };

  const handleDeleteTrigger = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (deleteType: "single" | "future") => {
    if (selectedSlot && selectedOccurrenceDate) {
      deleteAvailability(selectedSlot.id!, deleteType, selectedOccurrenceDate);
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <div>
      <p className="mb-4">
        Clique em um dia para adicionar um novo horário ou em um evento
        existente para editar/deletar.
      </p>

      {isLoading && <p>Carregando...</p>}
      {error && <p style={{ color: "red" }}>Erro: {error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      <div className="mt-6">
        <Calendar
          events={calendarEvents}
          onAddEvent={handleOpenAddModal}
          onDateSelect={handleOpenAddModal}
          onEventClick={handleEventClick}
        />
      </div>

      <AvailabilityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
        onDelete={(_slotId) => handleDeleteTrigger()}
        initialDate={selectedDate}
        existingSlot={selectedSlot}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
        isRepeating={!!selectedSlot?.repeating}
      />
    </div>
  );
}

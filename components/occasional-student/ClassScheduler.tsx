//components/occasional-student/ClassScheduler.tsx
"use client";

import { useState, useMemo } from "react";
import { User } from "@/types/users/users";
import { Calendar, CalendarEvent } from "@/components/ui/Calendar";
import { useStudent } from "@/hooks/useStudent";
import { mapAvailabilityToEvents } from "@/lib/calendar";
import BookingConfirmationModal from "./BookingConfirmationModal";
import TeacherCard from "./TeacherCard";
import { useAvailableTeachers } from "@/hooks/useAvailableTeachers";
import TeacherSearchAndFilter from "./TeacherSearchAndFilter";

interface ClassSchedulerProps {
  teachers: User[];
}

export default function ClassScheduler() {
  // Hook para buscar a lista de professores dinamicamente
  const {
    teachers,
    isLoading: isLoadingTeachers,
    setFilters,
  } = useAvailableTeachers({ leadTime: 999 });

  // Hook para a lógica de agendamento (não muda)
  const {
    isLoading: isLoadingSchedule,
    error,
    availability,
    fetchAvailability,
    bookClass,
  } = useStudent();

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  // Estado local para a UI
  const [searchQuery, setSearchQuery] = useState("");

  // Filtro de pesquisa no lado do cliente
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teachers, searchQuery]);

  const handleFilterChange = (newFilters: any) => {
    if (newFilters.searchQuery !== undefined) {
      setSearchQuery(newFilters.searchQuery);
    } else {
      setFilters((prev: any) => ({ ...prev, ...newFilters }));
    }
  };

  const handleTeacherSelect = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    fetchAvailability(teacherId);
  };

  const calendarEvents = useMemo(() => {
    if (!availability) return [];
    // Passa também as aulas já agendadas para o mapeamento
    const events = mapAvailabilityToEvents(
      availability.slots,
      availability.exceptions,
      availability.bookedClasses || [] // Garante que bookedClasses seja um array
    );
    return events;
  }, [availability]);

  const handleEventClick = (event: CalendarEvent) => {
    if (event.title === "Reservado") return;
    setSelectedEvent(event);
    setIsBookingModalOpen(true);
  };
  return (
    <div>
      <TeacherSearchAndFilter onFilterChange={handleFilterChange} />

      {isLoadingTeachers ? (
        <p>Buscando professores...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher as User}
              onSelect={handleTeacherSelect}
              isSelected={selectedTeacherId === teacher.id}
            />
          ))}
        </div>
      )}

      {/* O Calendário só aparece depois que um professor é selecionado */}
      {selectedTeacherId && (
        <>
          <hr />
          <h2 className="text-xl font-bold mt-6">Horários Disponíveis</h2>
          {isLoadingSchedule && <p>Buscando horários...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!isLoadingSchedule && (
            <Calendar events={calendarEvents} onEventClick={handleEventClick} />
          )}
        </>
      )}

      {isLoadingSchedule && <p>Buscando horários...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <BookingConfirmationModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        event={selectedEvent}
        onConfirm={async (classTopic) => {
          // Marca a função como async
          const success = await bookClass({
            teacherId: selectedTeacherId,
            slotId: (selectedEvent!.slotId || selectedEvent!.id).split("-")[0],
            scheduledAt: selectedEvent!.date,
            startTime: selectedEvent!.startTime!,
            classTopic: classTopic,
          });
          // Só fecha o modal se o agendamento for bem-sucedido
          if (success) {
            setIsBookingModalOpen(false);
          }
        }}
        isLoading={isLoadingSchedule}
        error={error} // 👈 Passa o erro para o modal
      />
    </div>
  );
}

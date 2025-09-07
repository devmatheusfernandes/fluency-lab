import { useState, useEffect } from "react";
import { PopulatedStudentClass } from "@/types/classes/class";
import { AvailabilitySlot, AvailabilityException } from "@/types/time/availability";

export const useRescheduleAvailability = (
  isOpen: boolean,
  classToReschedule: PopulatedStudentClass | null
) => {
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    if (!isOpen || !classToReschedule) {
      setAvailableSlots([]);
      return;
    }

    const loadSlots = async () => {
      setIsLoadingSlots(true);
      try {
        // Call the API directly instead of using the hook function
        const response = await fetch(`/api/student/availability?teacherId=${classToReschedule.teacherId}`);
        if (!response.ok) {
          setAvailableSlots([]);
          setIsLoadingSlots(false);
          return;
        }
        const { slots, exceptions, bookedClasses, settings } = await response.json();

        console.log('[useRescheduleAvailability] API Response:', {
          slotsCount: slots?.length || 0,
          exceptionsCount: exceptions?.length || 0,
          bookedClassesCount: bookedClasses?.length || 0,
          settings: settings || {},
          slots: slots // Log the actual slots to see their content
        });

        const concreteSlots: Date[] = [];
        const now = new Date();

        // Aplicar as regras de negócio do professor
        const leadTimeHours = settings?.bookingLeadTimeHours || 24;
        const horizonDays = settings?.bookingHorizonDays || 30;

        const minBookingDate = new Date(
          now.getTime() + leadTimeHours * 60 * 60 * 1000
        );
        const maxBookingDate = new Date(
          now.getTime() + horizonDays * 24 * 60 * 60 * 1000
        );
        maxBookingDate.setHours(23, 59, 59, 999);

        slots.forEach((slot: AvailabilitySlot) => {
          const [hour, minute] = slot.startTime.split(":").map(Number);
          const currentDate = new Date(slot.startDate);

          // Loop para gerar datas concretas com base na recorrência
          while (currentDate <= maxBookingDate) {
            const dayOfWeek = currentDate.getDay(); // 0 = Domingo, 1 = Segunda...

            // Verifica se o dia da semana do slot corresponde ao dia atual no loop
            if (dayOfWeek === new Date(slot.startDate).getDay()) {
              const potentialSlotDate = new Date(currentDate);
              potentialSlotDate.setHours(hour, minute, 0, 0);

              // 1. Validação: Está dentro do horizonte de agendamento?
              if (
                potentialSlotDate > minBookingDate &&
                potentialSlotDate <= maxBookingDate
              ) {
                // 2. Validação: É uma exceção (dia cancelado pelo professor)?
                const isException = exceptions.some(
                  (ex: AvailabilityException) =>
                    new Date(ex.date).toDateString() ===
                    potentialSlotDate.toDateString()
                );

                // 3. Validação: Já existe uma aula agendada neste horário?
                const isBooked = bookedClasses.some(
                  (booked: any) =>
                    new Date(booked.scheduledAt).getTime() ===
                    potentialSlotDate.getTime()
                );

                if (!isException && !isBooked) {
                  concreteSlots.push(potentialSlotDate);
                }
              }
            }

            // Avança para a próxima ocorrência com base na regra de repetição
            if (slot.repeating?.type === "weekly") {
              currentDate.setDate(currentDate.getDate() + 7);
            } else if (slot.repeating?.type === "bi-weekly") {
              currentDate.setDate(currentDate.getDate() + 14);
            } else if (slot.repeating?.type === "monthly") {
              currentDate.setMonth(currentDate.getMonth() + 1);
            } else {
              break; // Se não houver repetição, sai do loop
            }
          }
        });

        setAvailableSlots(concreteSlots);
      } catch (err: any) {
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    loadSlots();
  }, [isOpen, classToReschedule]);

  return {
    availableSlots,
    isLoadingSlots,
  };
};
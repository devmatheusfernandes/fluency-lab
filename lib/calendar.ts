// lib/calendar.ts

import { CalendarEvent } from "@/components/ui/Calendar";
import { StudentClass } from "@/types/classes/class";
import { AvailabilitySlot, AvailabilityException } from "@/types/time/availability";

/**
 * Cria uma chave de texto única e consistente para uma data e hora.
 * Formato: "AAAA-MM-DD-HH:mm"
 */
const createDateTimeKey = (date: Date, time: string): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}-${time}`;
};


/**
 * Mapeia as 'regras' de disponibilidade, exceções e aulas agendadas para
 * 'eventos' concretos a serem exibidos no componente de Calendário.
 */
export function mapAvailabilityToEvents(
  slots: AvailabilitySlot[],
  exceptions: AvailabilityException[],
  bookedClasses: StudentClass[]
): CalendarEvent[] {
  console.log('[mapAvailabilityToEvents] Iniciando mapeamento com:', {
    slots: `${slots.length} regras`,
    exceptions: `${exceptions.length} exceções`,
    bookedClasses: `${bookedClasses.length} aulas agendadas`
  });

  const events: CalendarEvent[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const generationEndDate = new Date();
  generationEndDate.setMonth(today.getMonth() + 3);

  // 1. Prepara as aulas agendadas e as exceções para uma busca rápida e eficiente.
  const bookedKeys = new Map(
    bookedClasses.map(c => {
      const scheduledDate = new Date(c.scheduledAt);
      const hours = scheduledDate.getHours().toString().padStart(2, '0');
      const minutes = scheduledDate.getMinutes().toString().padStart(2, '0');
      const time = `${hours}:${minutes}`;
      return [createDateTimeKey(scheduledDate, time), c];
    })
  );

  const exceptionSet = new Set(
    exceptions.map(ex => `${ex.originalSlotId}-${new Date(ex.date).toDateString()}`)
  );
  
  console.log('[mapAvailabilityToEvents] Chaves de aulas agendadas preparadas:', Array.from(bookedKeys.keys()));


  // 2. Itera sobre cada regra de disponibilidade ('slot').
  slots.forEach((slot) => {
    const slotStartDate = new Date(slot.startDate);
    slotStartDate.setHours(0, 0, 0, 0);

    // Se a regra for de um evento que se repete
    if (slot.repeating) {
      const repeatEndDate = slot.repeating.endDate ? new Date(slot.repeating.endDate) : null;
      if (repeatEndDate) repeatEndDate.setHours(23, 59, 59, 999);
      let currentDate = new Date(slotStartDate);

      while (currentDate <= generationEndDate) {
        if (repeatEndDate && currentDate > repeatEndDate) break;

        if (currentDate >= today) {
          const occurrenceKey = createDateTimeKey(currentDate, slot.startTime);
          const exceptionKey = `${slot.id}-${currentDate.toDateString()}`;
          const bookedClass = bookedKeys.get(occurrenceKey);

          // LÓGICA DE PRIORIDADE CORRIGIDA:
          if (bookedClass) {
            // 1. PRIORIDADE MÁXIMA: Se a aula está agendada, mostra "Reservado".
            events.push({
              id: `booked-${bookedClass.id}`,
              slotId: slot.id,
              title: "Reservado",
              date: new Date(currentDate),
              startTime: slot.startTime,
              endTime: slot.endTime,
              color: "danger",
            });
          } else if (exceptionSet.has(exceptionKey)) {
            // 2. SEGUNDA PRIORIDADE: Se for uma exceção (deletada pelo prof), não mostra nada.
            // A função simplesmente continua para a próxima iteração.
          } else {
            // 3. SE NÃO FOR NENHUMA DAS ANTERIORES: O horário está vago.
            events.push({
              id: `${slot.id}-${currentDate.toISOString()}`,
              slotId: slot.id,
              title: slot.title || "Horário Vago",
              date: new Date(currentDate),
              startTime: slot.startTime,
              endTime: slot.endTime,
              color: slot.color || "success",
              repeating: slot.repeating as CalendarEvent['repeating'],
            });
          }
        }
        
        // Avança para a próxima data
        switch (slot.repeating.type) {
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + (slot.repeating.interval || 1) * 7);
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + (slot.repeating.interval || 1));
            break;
          default:
            currentDate.setDate(generationEndDate.getDate() + 1);
            break;
        }
      }
    } else { 
      // Lógica para eventos únicos
      if (slotStartDate >= today) {
        const occurrenceKey = createDateTimeKey(slotStartDate, slot.startTime);
        const exceptionKey = `${slot.id}-${slotStartDate.toDateString()}`;
        const bookedClass = bookedKeys.get(occurrenceKey);

        if (bookedClass) {
          events.push({
            id: `booked-${bookedClass.id}`,
            slotId: slot.id,
            title: "Reservado",
            date: slotStartDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
            color: "danger",
          });
        } else if (!exceptionSet.has(exceptionKey)) {
          events.push({
            id: slot.id!,
            slotId: slot.id,
            title: slot.title || "Horário Vago",
            date: slotStartDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
            color: slot.color || "success",
          });
        }
      }
    }
  });
  
  console.log(`[mapAvailabilityToEvents] Mapeamento finalizado. Total de eventos visuais gerados: ${events.length}`);
  return events;
}
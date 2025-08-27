'use client';

import { useState, useEffect, useCallback } from "react";
import { AvailabilitySlot, AvailabilityException } from "@/types/time/availability"; // Ajuste o caminho se necessário
import { PopulatedStudentClass, StudentClass } from "@/types/classes/class";

type AddOrUpdatePayload = Partial<Omit<AvailabilitySlot, 'id' | 'teacherId'>>;

export const useTeacher = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [myClasses, setMyClasses] = useState<PopulatedStudentClass[]>([]);

  // A única fonte da verdade para os dados da agenda
  const [scheduleData, setScheduleData] = useState<{
    slots: AvailabilitySlot[];
    exceptions: AvailabilityException[];
    bookedClasses: StudentClass[];
  }>({ slots: [], exceptions: [], bookedClasses: [] });

  const getScheduleData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/teacher/availability');
      if (!response.ok) throw new Error('Falha ao buscar a agenda do professor.');
      
      const data = await response.json();
      
      // 👇 ADICIONE ESTE LOG
      console.log("[HOOK] Dados recebidos da API:", data);
      
      setScheduleData({
        slots: data.slots || [],
        exceptions: data.exceptions || [],
        bookedClasses: data.bookedClasses || [],
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addOrUpdateAvailability = async (payload: AddOrUpdatePayload, id?: string) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const isUpdating = !!id;
      const endpoint = isUpdating ? `/api/teacher/availability/${id}` : '/api/teacher/availability';
      const method = isUpdating ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Falha ao ${isUpdating ? 'atualizar' : 'adicionar'} horário.`);
      
      setSuccessMessage(`Horário ${isUpdating ? 'atualizado' : 'adicionado'} com sucesso!`);
      await getScheduleData(); // Recarrega todos os dados
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAvailability = async (slotId: string, deleteType: 'single' | 'future', occurrenceDate: Date) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`/api/teacher/availability/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, deleteType, occurrenceDate: occurrenceDate.toISOString() }),
      });
      if (!response.ok) throw new Error("Falha ao deletar horário.");
      
      setSuccessMessage("Horário deletado com sucesso.");
      await getScheduleData(); // Recarrega todos os dados
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (settings: any) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch('/api/teacher/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("Falha ao salvar configurações.");
      setSuccessMessage("Configurações salvas com sucesso!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // NOVO ESTADO: para as aulas populadas do professor

  // NOVA FUNÇÃO: para buscar as aulas do professor
  const fetchMyClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/teacher/my-classes');
      if (!response.ok) throw new Error("Falha ao buscar suas aulas.");
      const data = await response.json();
      setMyClasses(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getScheduleData();
  }, [getScheduleData]);
  
  // O retorno do hook agora é limpo e consistente
  return { 
    scheduleData, 
    addOrUpdateAvailability, 
    deleteAvailability, 
    isLoading, 
    error, 
    successMessage,
    updateSettings,
    fetchMyClasses,
    myClasses 
  };
};
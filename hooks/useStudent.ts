'use client';
import { useState, useCallback } from 'react';
import { AvailabilitySlot, AvailabilityException } from '@/types/time/availability';
import { StudentClass } from '@/types/classes/class';

export const useStudent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<{ 
    slots: AvailabilitySlot[], 
    exceptions: AvailabilityException[],
    bookedClasses: StudentClass[] 
  }>({ 
    // 👇 CORREÇÃO 2: Adicione 'bookedClasses' ao estado inicial
    slots: [], 
    exceptions: [],
    bookedClasses: []
  });
  const [myClasses, setMyClasses] = useState<StudentClass[]>([]); // 👈 NOVO ESTADO

  const fetchAvailability = useCallback(async (teacherId: string) => {
    if (!teacherId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/student/availability?teacherId=${teacherId}`);
      if (!response.ok) throw new Error("Falha ao buscar horários.");
      const data = await response.json();
      setAvailability(data); // 'data' já contém as 3 listas, agora o tipo corresponde
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyClasses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/student/my-classes');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao buscar as aulas.");
      }
      const data = await response.json();
      setMyClasses(data);
    } catch (err: any) {
      setError(err.message);
      setMyClasses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const bookClass = async (payload: { 
    teacherId: string; 
    slotId: string; 
    scheduledAt: Date; 
    startTime: string;
    classTopic: string;
  }): Promise<boolean> => { // Adiciona o tipo de retorno para clareza
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/student/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      alert('Aula agendada com sucesso!');
      
      if (payload.teacherId) {
        await fetchAvailability(payload.teacherId);
      }
      
      return true; // 👈 Adicione este retorno em caso de sucesso

    } catch (err: any) {
      setError(err.message);
      // Não mostre o alerta aqui, pois a UI fará isso
      return false; // 👈 Adicione este retorno em caso de falha
    } finally {
      setIsLoading(false);
    }
  };

  const cancelClass = async (classId: string) => { // Remove o parâmetro 'onComplete'
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/student/classes/cancel`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      alert(data.message);
      
      // A função agora chama 'fetchMyClasses' internamente após o sucesso
      await fetchMyClasses(); 
      
    } catch (err: any) {
      setError(err.message);
      alert(`Erro: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, availability, fetchAvailability, bookClass, myClasses, fetchMyClasses, cancelClass };
};
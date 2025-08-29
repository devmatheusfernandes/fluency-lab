'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface SettingsData {
  interfaceLanguage?: string;
  theme?: 'light' | 'dark';
}

export const useSettings = () => {
  const [isLoading, setIsLoading] = useState(false);

  const updateSettings = async (settingsData: SettingsData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao salvar as configurações.');
      }
      
      toast.success('Configurações salvas com sucesso!');
      // Força um recarregamento da página para aplicar o novo idioma/tema
      window.location.reload(); 
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { updateSettings, isLoading };
};

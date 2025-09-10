'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Container } from '@/components/ui/Container';
import { toast } from 'sonner';

export default function ConvertSlotPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const [isConverting, setIsConverting] = useState(false);
  const [isConverted, setIsConverted] = useState(false);

  const handleConvertToSlot = async () => {
    if (!classId) return;

    setIsConverting(true);
    try {
      const response = await fetch(`/api/classes/${classId}/convert-to-slot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao converter aula em slot livre');
      }

      toast.success('Aula convertida em slot disponível com sucesso!');
      setIsConverted(true);
    } catch (error: any) {
      console.error('Erro ao converter aula:', error);
      toast.error(error.message || 'Erro ao converter aula em slot livre');
    } finally {
      setIsConverting(false);
    }
  };

  const handleGoToPlatform = () => {
    router.push('/hub/plataforma');
  };

  if (isConverted) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <Text variant="title" size="xl" className="mb-2">
              Slot Criado com Sucesso!
            </Text>
            <Text className="text-subtitle mb-6">
              Sua aula foi convertida em um slot disponível. Outros alunos agora podem agendar este horário.
            </Text>
          </div>
          <Button onClick={handleGoToPlatform} className="w-full">
            Voltar à Plataforma
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="min-h-screen flex items-center justify-center">
      <Card className="p-8 max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <Text variant="title" size="xl" className="mb-2">
            Converter Aula em Slot Livre
          </Text>
          <Text className="text-subtitle mb-6">
            Deseja converter esta aula cancelada/reagendada em um slot disponível para outros alunos?
          </Text>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleConvertToSlot} 
            disabled={isConverting}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isConverting ? 'Convertendo...' : 'Sim, Tornar Slot Livre'}
          </Button>
          
          <Button 
            onClick={handleGoToPlatform} 
            variant="outline"
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </Card>
    </Container>
  );
}
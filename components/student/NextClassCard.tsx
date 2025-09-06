"use client";

import { useState, useEffect } from "react";
import { StudentClass } from "@/types/classes/class";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Calendar, ClockSquare, Refresh } from "@solar-icons/react/ssr";
import { useStudent } from "@/hooks/useStudent";
import SkeletonLoader from "@/components/shared/Skeleton/SkeletonLoader";

interface NextClassCardProps {
  className?: string;
}

export default function NextClassCard({ className = "" }: NextClassCardProps) {
  const { myClasses, fetchMyClasses, isLoading } = useStudent();
  const [nextClass, setNextClass] = useState<{
    type: string;
    isToday: boolean;
    isTomorrow: boolean;
    formattedDate: string;
    time: string;
    daysUntil: number;
  } | null>(null);

  const findNextClass = () => {
    if (!myClasses || myClasses.length === 0) return null;

    // Filter only scheduled classes and sort by date
    const scheduledClasses = myClasses
      .filter((cls) => cls.status === "scheduled")
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );

    if (scheduledClasses.length === 0) return null;

    const nextClassData = scheduledClasses[0];
    const classDate = new Date(nextClassData.scheduledAt);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time parts for accurate comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const classDateWithoutTime = new Date(classDate);
    classDateWithoutTime.setHours(0, 0, 0, 0);

    const isToday = classDateWithoutTime.getTime() === today.getTime();
    const isTomorrow = classDateWithoutTime.getTime() === tomorrow.getTime();

    // Format date
    const formattedDate = classDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    // Format time
    const time = classDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Calculate days until
    const diffTime = classDateWithoutTime.getTime() - today.getTime();
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      type: nextClassData.rescheduledFrom ? "rescheduled" : "regular",
      isToday,
      isTomorrow,
      formattedDate,
      time,
      daysUntil,
    };
  };

  const handleRefresh = async () => {
    try {
      await fetchMyClasses();
    } catch (error) {
      console.error("Failed to refresh classes:", error);
    }
  };

  useEffect(() => {
    setNextClass(findNextClass());
  }, [myClasses]);

  useEffect(() => {
    fetchMyClasses();
  }, []);

  if (isLoading && !nextClass) {
    return (
      <SkeletonLoader className="p-2">
        <div className="flex justify-between items-start">
          <SkeletonLoader
            variant="text"
            lines={1}
            className="h-5 w-24 rounded"
          />
          <SkeletonLoader variant="rect" className="w-10 h-10 rounded-xl" />
        </div>
        <div className="mt-2 space-y-2">
          <SkeletonLoader
            variant="text"
            lines={1}
            className="h-4 w-32 rounded"
          />
          <SkeletonLoader
            variant="text"
            lines={1}
            className="h-4 w-24 rounded"
          />
        </div>
      </SkeletonLoader>
    );
  }

  if (!nextClass) {
    return (
      <div className="p-2">
        <div className="flex justify-between items-start">
          <Text weight="semibold">Próxima Aula</Text>
          <Button
            variant="glass"
            size="icon"
            onClick={handleRefresh}
            aria-label="Atualizar"
            title="Atualizar"
          >
            <Refresh className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2">
          <Text variant="placeholder">Nenhuma aula agendada</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="flex justify-between items-start">
        <Text weight="semibold">Próxima Aula</Text>
        <Button
          variant="glass"
          size="icon"
          onClick={handleRefresh}
          aria-label="Atualizar"
          title="Atualizar"
        >
          <Refresh className="w-4 h-4" />
        </Button>
      </div>

      <div className="mt-2">
        {nextClass.type === "rescheduled" && (
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 mb-2">
            Aula Remarcada
          </div>
        )}

        <div className="flex items-center text-paragraph mb-1">
          <Calendar className="w-4 h-4 mr-2" />
          <span className="font-medium">
            {nextClass.isToday
              ? "Hoje"
              : nextClass.isTomorrow
                ? "Amanhã"
                : nextClass.formattedDate}
          </span>
        </div>

        <div className="flex items-center text-paragraph">
          <ClockSquare className="w-4 h-4 mr-2" />
          <span>{nextClass.time}</span>
        </div>

        {nextClass.daysUntil > 0 && (
          <div className="mt-2 text-sm text-paragraph">
            {nextClass.daysUntil === 1
              ? "Falta 1 dia"
              : `Faltam ${nextClass.daysUntil} dias`}
          </div>
        )}

        {nextClass.isToday && (
          <div className="mt-2 text-sm font-medium text-teal-500 dark:text-teal-800">
            Sua aula é hoje!
          </div>
        )}
      </div>
    </div>
  );
}

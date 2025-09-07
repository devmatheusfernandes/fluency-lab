// components/teacher/ClientCalendar.tsx
"use client";

import { Calendar } from "@/components/ui/Calendar";
import { useState } from "react";
import ClassDetailsModal from "@/components/teacher/ClassDetailsModal";
import { PopulatedStudentClass } from "@/types/classes/class";
import { CalendarEvent } from "@/types/calendar/calendar";

interface ClientCalendarProps {
  events: CalendarEvent[];
  allClasses: PopulatedStudentClass[];
}

export default function ClientCalendar({
  events,
  allClasses,
}: ClientCalendarProps) {
  const [selectedClass, setSelectedClass] =
    useState<PopulatedStudentClass | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEventClick = (event: CalendarEvent) => {
    // If this is a class event, show the details modal
    if (event.studentInfo) {
      // Find the full class data from allClasses
      const fullClassData = allClasses.find(
        (cls) => cls.id === event.id.replace("class-", "")
      );

      if (fullClassData) {
        setSelectedClass(fullClassData);
        setIsModalOpen(true);
      }
    }
  };

  return (
    <>
      <Calendar events={events} onEventClick={handleEventClick} />
      <ClassDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classData={selectedClass}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { Checkbox } from "@/components/ui/Checkbox"; // Supondo que tem um componente Checkbox
import { User } from "@/types/users/users";

interface TeacherAssociationProps {
  student: User;
  allTeachers: User[];
}

export default function TeacherAssociation({
  student,
  allTeachers,
}: TeacherAssociationProps) {
  // Guarda os IDs dos professores que estão atualmente selecionados
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>(
    student.teachersIds || []
  );
  const { updateStudentTeachers, isLoading } = useAdmin();

  const handleCheckboxChange = (teacherId: string) => {
    setSelectedTeacherIds(
      (prev) =>
        prev.includes(teacherId)
          ? prev.filter((id) => id !== teacherId) // Desmarca: remove o ID
          : [...prev, teacherId] // Marca: adiciona o ID
    );
  };

  const handleSaveChanges = () => {
    updateStudentTeachers(student.id, selectedTeacherIds);
  };

  return (
    <Card className="p-6">
      <Text variant="title" size="lg" weight="semibold" className="mb-4">
        Professores Associados
      </Text>
      <div className="space-y-3 max-h-60 overflow-y-auto border p-4 rounded-lg">
        {allTeachers.map((teacher) => (
          <div key={teacher.id} className="flex items-center space-x-3">
            <Checkbox
              id={`teacher-${teacher.id}`}
              checked={selectedTeacherIds.includes(teacher.id)}
              onCheckedChange={() => handleCheckboxChange(teacher.id)}
            />
            <label htmlFor={`teacher-${teacher.id}`} className="cursor-pointer">
              <Text>{teacher.name}</Text>
            </label>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <Button onClick={handleSaveChanges} disabled={isLoading}>
          {isLoading ? "A Salvar..." : "Salvar Alterações"}
        </Button>
      </div>
    </Card>
  );
}

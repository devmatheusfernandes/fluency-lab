"use client";

import { FullClassDetails } from "@/types/classes/class";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

interface ClassDetailsViewProps {
  classDetails: FullClassDetails;
}

export default function ClassDetailsView({
  classDetails,
}: ClassDetailsViewProps) {
  const classDate = new Date(classDetails.scheduledAt);
  const formattedDate = classDate.toLocaleDateString("pt-BR", {
    dateStyle: "full",
  });
  const formattedTime = classDate.toLocaleTimeString("pt-BR", {
    timeStyle: "short",
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Detalhes da Aula</h1>
          <p className="text-lg text-gray-600">
            {formattedDate} às {formattedTime}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">Status</p>
          <p>{classDetails.status}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card do Professor */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-bold mb-4">Professor</h2>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage
                src={classDetails?.teacher?.avatarUrl}
                alt={classDetails?.teacher?.name}
              />
              <AvatarFallback>
                {classDetails?.teacher?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{classDetails?.teacher?.name}</p>
              <p className="text-sm text-gray-500">
                {classDetails?.teacher?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Card do Aluno */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-bold mb-4">Aluno</h2>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage
                src={classDetails.student.avatarUrl}
                alt={classDetails.student.name}
              />
              <AvatarFallback>
                {classDetails.student.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{classDetails.student.name}</p>
              <p className="text-sm text-gray-500">
                {classDetails.student.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {classDetails.notes && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-semibold text-lg mb-2">Tópico para esta Aula</h3>
          <p className="text-gray-700 italic">"{classDetails.notes}"</p>
        </div>
      )}

      {/* Área para o caderno e vídeo no futuro */}
      <div className="mt-8">
        {/* <VideoCallComponent /> */}
        {/* <CollaborativeEditor /> */}
      </div>
    </div>
  );
}

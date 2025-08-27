import { User } from "@/types/users/users";
import { Avatar } from "@/components/ui/Avatar";

interface TeacherCardProps {
  teacher: User;
  onSelect: (teacherId: string) => void;
  isSelected: boolean;
}

export default function TeacherCard({
  teacher,
  onSelect,
  isSelected,
}: TeacherCardProps) {
  const selectedClasses = isSelected
    ? "border-primary-500 ring-2 ring-primary-500"
    : "border-gray-200";

  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedClasses}`}
      onClick={() => onSelect(teacher.id)}
    >
      <div className="flex items-center space-x-4">
        <div>
          <h3 className="font-bold text-lg">{teacher.name}</h3>
          <p className="text-sm text-gray-600">
            {teacher.profile?.specialties?.join(", ")}
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-700 mt-3">{teacher.profile?.bio}</p>
    </div>
  );
}

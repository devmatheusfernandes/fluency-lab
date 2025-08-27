"use client";

interface Filters {
  searchQuery: string;
  language: string;
  leadTime: number;
}

interface TeacherSearchAndFilterProps {
  onFilterChange: (filters: Partial<Filters>) => void;
}

export default function TeacherSearchAndFilter({
  onFilterChange,
}: TeacherSearchAndFilterProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg bg-gray-50">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Pesquisar por nome
        </label>
        <input
          type="text"
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          placeholder="Digite o nome..."
          className="w-full p-2 border rounded mt-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Idioma
        </label>
        <select
          onChange={(e) => onFilterChange({ language: e.target.value })}
          className="w-full p-2 border rounded mt-1"
        >
          <option value="">Todos</option>
          <option value="Inglês">Inglês</option>
          <option value="Espanhol">Espanhol</option>
          <option value="Francês">Francês</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Preciso de uma aula para...
        </label>
        <select
          onChange={(e) => onFilterChange({ leadTime: Number(e.target.value) })}
          className="w-full p-2 border rounded mt-1"
        >
          <option value={999}>Qualquer data</option>
          <option value={24}>As próximas 24 horas</option>
          <option value={48}>Os próximos 2 dias</option>
          <option value={168}>A próxima semana</option>
        </select>
      </div>
    </div>
  );
}

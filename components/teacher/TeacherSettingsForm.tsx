"use client";

import { useTeacher } from "@/hooks/useTeacher";
import { User } from "@/types/users/users";
import { useState } from "react";

type SettingsData = User["schedulingSettings"];

interface TeacherSettingsFormProps {
  currentSettings: SettingsData;
}

export default function TeacherSettingsForm({
  currentSettings,
}: TeacherSettingsFormProps) {
  const [settings, setSettings] = useState(currentSettings);
  const { updateSettings, isLoading, error, successMessage } = useTeacher();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value ? Number(value) : undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(settings);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        maxWidth: "400px",
      }}
    >
      <div>
        <label>Antecedência mínima para agendamento (em horas):</label>
        <input
          type="number"
          name="bookingLeadTimeHours"
          value={settings?.bookingLeadTimeHours || ""}
          onChange={handleInputChange}
          placeholder="Padrão: 24"
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label>Limite para cancelamento com reembolso (em horas):</label>
        <input
          type="number"
          name="cancellationPolicyHours"
          value={settings?.cancellationPolicyHours || ""}
          onChange={handleInputChange}
          placeholder="Padrão: 24"
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label>Horizonte de agendamento (em dias):</label>
        <input
          type="number"
          name="bookingHorizonDays"
          value={settings?.bookingHorizonDays || ""}
          onChange={handleInputChange}
          placeholder="Padrão: 30"
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label>Limite de aulas avulsas por dia (0 para ilimitado):</label>
        <input
          type="number"
          name="maxOccasionalClassesPerDay"
          value={settings?.maxOccasionalClassesPerDay || ""}
          onChange={handleInputChange}
          placeholder="Padrão: Ilimitado"
          className="w-full p-2 border rounded"
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Salvando..." : "Salvar Configurações"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </form>
  );
}

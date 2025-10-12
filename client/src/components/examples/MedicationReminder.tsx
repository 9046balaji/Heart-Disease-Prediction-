import { useState } from "react";
import MedicationReminder from "../MedicationReminder";

export default function MedicationReminderExample() {
  const [medications, setMedications] = useState([
    { id: "1", name: "Aspirin", dosage: "100mg", time: "8:00 AM", taken: false },
    { id: "2", name: "Lisinopril", dosage: "10mg", time: "8:00 AM", taken: false },
    { id: "3", name: "Atorvastatin", dosage: "20mg", time: "9:00 PM", taken: true },
  ]);

  const handleToggleTaken = (id: string) => {
    setMedications(meds =>
      meds.map(med =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  return (
    <MedicationReminder 
      medications={medications} 
      onToggleTaken={handleToggleTaken} 
    />
  );
}

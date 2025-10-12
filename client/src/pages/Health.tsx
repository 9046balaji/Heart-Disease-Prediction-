import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import HealthDashboard from "@/components/HealthDashboard";
import MedicationReminder from "@/components/MedicationReminder";
import EmergencyButton from "@/components/EmergencyButton";
import ThemeToggle from "@/components/ThemeToggle";
import { useState } from "react";

export default function Health() {
  const [medications, setMedications] = useState([
    { id: "1", name: "Aspirin", dosage: "100mg", time: "8:00 AM", taken: false },
    { id: "2", name: "Lisinopril", dosage: "10mg", time: "8:00 AM", taken: false },
    { id: "3", name: "Atorvastatin", dosage: "20mg", time: "9:00 PM", taken: true },
  ]);

  const mockVitals = [
    {
      name: "Blood Pressure",
      value: "128/82",
      unit: "mmHg",
      status: "warning" as const,
      trend: "up" as const
    },
    {
      name: "Heart Rate",
      value: "72",
      unit: "bpm",
      status: "normal" as const,
      trend: "stable" as const
    },
    {
      name: "Cholesterol",
      value: "195",
      unit: "mg/dL",
      status: "normal" as const,
      trend: "down" as const
    },
    {
      name: "Blood Glucose",
      value: "105",
      unit: "mg/dL",
      status: "normal" as const,
      trend: "stable" as const
    }
  ];

  const handleToggleMedication = (id: string) => {
    setMedications(meds =>
      meds.map(med =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <EmergencyButton />
      
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="font-bold text-xl font-[family-name:var(--font-sans)]">Health Tracking</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-sans)]">
            Your Health Dashboard
          </h2>
          <p className="text-muted-foreground">
            Monitor your vital signs and track your medications
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <HealthDashboard vitals={mockVitals} lastUpdated="Today, 9:30 AM" />
          <MedicationReminder 
            medications={medications} 
            onToggleTaken={handleToggleMedication}
          />
        </div>
      </main>
    </div>
  );
}

import HealthDashboard from "../HealthDashboard";

export default function HealthDashboardExample() {
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

  const mockVitalHistory = [
    { date: "Jan 1", "Blood Pressure": 120, "Heart Rate": 70, "Cholesterol": 200, "Blood Glucose": 100 },
    { date: "Jan 2", "Blood Pressure": 122, "Heart Rate": 72, "Cholesterol": 198, "Blood Glucose": 102 },
    { date: "Jan 3", "Blood Pressure": 125, "Heart Rate": 71, "Cholesterol": 196, "Blood Glucose": 104 },
    { date: "Jan 4", "Blood Pressure": 128, "Heart Rate": 72, "Cholesterol": 195, "Blood Glucose": 105 },
  ];

  return <HealthDashboard vitals={mockVitals} lastUpdated="Today, 9:30 AM" vitalHistory={mockVitalHistory} />;
}
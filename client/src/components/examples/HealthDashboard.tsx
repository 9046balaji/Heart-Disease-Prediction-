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

  return <HealthDashboard vitals={mockVitals} lastUpdated="Today, 9:30 AM" />;
}

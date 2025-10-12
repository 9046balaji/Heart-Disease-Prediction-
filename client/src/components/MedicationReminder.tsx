import { Pill, Clock, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

interface MedicationReminderProps {
  medications: Medication[];
  onToggleTaken: (id: string) => void;
}

export default function MedicationReminder({ medications, onToggleTaken }: MedicationReminderProps) {
  const todayMeds = medications.filter(m => !m.taken);
  const completedMeds = medications.filter(m => m.taken);

  return (
    <Card data-testid="card-medication-reminder">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medications
          </CardTitle>
          {todayMeds.length === 0 ? (
            <Badge variant="outline" className="bg-health-green/10 text-health-green border-health-green/20">
              <Check className="h-3 w-3 mr-1" />
              All Done
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-health-amber/10 text-health-amber border-health-amber/20">
              {todayMeds.length} Pending
            </Badge>
          )}
        </div>
        <CardDescription>Track your daily medication schedule</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {todayMeds.length > 0 ? (
            todayMeds.map((med) => (
              <div
                key={med.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover-elevate"
                data-testid={`medication-${med.id}`}
              >
                <Checkbox
                  id={med.id}
                  checked={med.taken}
                  onCheckedChange={() => onToggleTaken(med.id)}
                  data-testid={`checkbox-medication-${med.id}`}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{med.name}</div>
                  <div className="text-xs text-muted-foreground">{med.dosage}</div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{med.time}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Check className="h-8 w-8 mx-auto mb-2 text-health-green" />
              <p className="text-sm">All medications taken for today!</p>
            </div>
          )}
        </div>

        {completedMeds.length > 0 && (
          <div className="pt-4 border-t space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Completed Today</h4>
            {completedMeds.map((med) => (
              <div
                key={med.id}
                className="flex items-center gap-3 p-2 rounded-lg opacity-50"
              >
                <Check className="h-4 w-4 text-health-green" />
                <div className="flex-1">
                  <div className="font-medium text-sm line-through">{med.name}</div>
                </div>
                <div className="text-xs text-muted-foreground">{med.time}</div>
              </div>
            ))}
          </div>
        )}

        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={() => console.log('Add medication')}
          data-testid="button-add-medication"
        >
          <Pill className="h-4 w-4" />
          Add Medication
        </Button>
      </CardContent>
    </Card>
  );
}

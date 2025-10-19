import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Info,
  CheckCircle,
  Clock,
  Pill
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  startDate: string;
  endDate?: string;
  taken: boolean;
  takenHistory: {
    date: string;
    taken: boolean;
  }[];
}

interface MedicationInteraction {
  id: string;
  medicationA: string;
  medicationB: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
  recommendation: string;
}

interface MedicationInteractionEngineProps {
  userId: string;
  onMedicationAdded?: (medication: Medication) => void;
  onMedicationUpdated?: (medication: Medication) => void;
  onMedicationDeleted?: (medicationId: string) => void;
}

const MedicationInteractionEngine: React.FC<MedicationInteractionEngineProps> = ({ 
  userId,
  onMedicationAdded,
  onMedicationUpdated,
  onMedicationDeleted
}) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [interactions, setInteractions] = useState<MedicationInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "daily",
    time: "08:00"
  });

  // Fetch medications and interactions from API
  useEffect(() => {
    const fetchMedicationsAndInteractions = async () => {
      try {
        setIsLoading(true);
        
        // Fetch medications
        const token = localStorage.getItem('token');
        const medResponse = await fetch('/api/medications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!medResponse.ok) {
          throw new Error('Failed to fetch medications');
        }
        
        const medicationsData = await medResponse.json();
        setMedications(medicationsData);
        
        // Fetch interactions
        const interactionResponse = await fetch('/api/medications/interactions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!interactionResponse.ok) {
          throw new Error('Failed to fetch interactions');
        }
        
        const interactionsData = await interactionResponse.json();
        setInteractions(interactionsData);
      } catch (err) {
        setError("Failed to load medications and interactions");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicationsAndInteractions();
  }, [userId]);

  const handleAddMedication = async () => {
    try {
      if (!newMedication.name) {
        setError("Medication name is required");
        return;
      }
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          ...newMedication, 
          startDate: new Date().toISOString() 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add medication');
      }
      
      const addedMedication: Medication = await response.json();
      
      setMedications([...medications, addedMedication]);
      onMedicationAdded?.(addedMedication);
      setIsAddDialogOpen(false);
      setNewMedication({ name: "", dosage: "", frequency: "daily", time: "08:00" });
      setError(null);
      
      // Refresh interactions after adding new medication
      const interactionResponse = await fetch('/api/medications/interactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (interactionResponse.ok) {
        const interactionsData = await interactionResponse.json();
        setInteractions(interactionsData);
      }
    } catch (err) {
      setError("Failed to add medication");
      console.error("Error adding medication:", err);
    }
  };

  const handleUpdateMedication = async () => {
    try {
      if (!editingMedication) return;
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/medications/${editingMedication.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingMedication)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update medication');
      }
      
      const updatedMedication: Medication = await response.json();
      
      const updatedMedications = medications.map(med => 
        med.id === editingMedication.id ? updatedMedication : med
      );
      
      setMedications(updatedMedications);
      onMedicationUpdated?.(updatedMedication);
      setIsEditDialogOpen(false);
      setEditingMedication(null);
      setError(null);
      
      // Refresh interactions after updating medication
      const interactionResponse = await fetch('/api/medications/interactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (interactionResponse.ok) {
        const interactionsData = await interactionResponse.json();
        setInteractions(interactionsData);
      }
    } catch (err) {
      setError("Failed to update medication");
      console.error("Error updating medication:", err);
    }
  };

  const handleDeleteMedication = async (medicationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/medications/${medicationId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete medication');
      }
      
      const updatedMedications = medications.filter(med => med.id !== medicationId);
      setMedications(updatedMedications);
      onMedicationDeleted?.(medicationId);
      setError(null);
      
      // Refresh interactions after deleting medication
      const interactionResponse = await fetch('/api/medications/interactions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (interactionResponse.ok) {
        const interactionsData = await interactionResponse.json();
        setInteractions(interactionsData);
      }
    } catch (err) {
      setError("Failed to delete medication");
      console.error("Error deleting medication:", err);
    }
  };

  const handleMarkTaken = async (medicationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/medications/${medicationId}/taken`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ taken: true })
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark medication as taken');
      }
      
      const updatedMedication: Medication = await response.json();
      
      const updatedMedications = medications.map(med => 
        med.id === medicationId ? updatedMedication : med
      );
      
      setMedications(updatedMedications);
      
      // Refresh adherence data
      const adherenceResponse = await fetch(`/api/medications/${medicationId}/adherence`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (adherenceResponse.ok) {
        // We could update adherence data here if needed
      }
    } catch (err) {
      setError("Failed to mark medication as taken");
      console.error("Error marking medication as taken:", err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild": return "bg-green-100 text-green-800 border-green-200";
      case "moderate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "severe": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "daily": return "Once daily";
      case "twice": return "Twice daily";
      case "weekly": return "Once weekly";
      default: return frequency;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Pill className="h-8 w-8 text-blue-600" />
            Medication Management
          </h1>
          <p className="text-muted-foreground">
            Track your medications and monitor potential interactions
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
              <DialogDescription>
                Add a new medication to your profile to track and monitor interactions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="medication-name">Medication Name</Label>
                <Input
                  id="medication-name"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                  placeholder="e.g., Lisinopril, Atorvastatin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                  placeholder="e.g., 10mg, 20mg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={newMedication.frequency}
                  onValueChange={(value: string) => 
                    setNewMedication({...newMedication, frequency: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="twice">Twice Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time of Day</Label>
                <Input
                  id="time"
                  type="time"
                  value={newMedication.time}
                  onChange={(e) => setNewMedication({...newMedication, time: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMedication}>
                  Add Medication
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Interaction Warnings */}
      {interactions.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Medication Interaction Alert</AlertTitle>
          <AlertDescription>
            You have {interactions.length} potential medication interaction(s). Please review the details below.
          </AlertDescription>
        </Alert>
      )}

      {/* Interaction Details */}
      {interactions.map((interaction) => (
        <Card key={interaction.id} className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Critical Interaction Detected
            </CardTitle>
            <CardDescription>
              Between {interaction.medicationA} and {interaction.medicationB}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-red-700">Severity</h4>
                <Badge className={getSeverityColor(interaction.severity)}>
                  {interaction.severity.charAt(0).toUpperCase() + interaction.severity.slice(1)}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">{interaction.description}</p>
              </div>
              <div>
                <h4 className="font-medium">Recommendation</h4>
                <p className="text-sm text-muted-foreground">{interaction.recommendation}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4 mr-2" />
                  More Information
                </Button>
                <Button variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Adjust Medication
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Medications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Your Medications
          </CardTitle>
          <CardDescription>
            Track and manage your current medications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {medications.length === 0 ? (
            <div className="text-center py-8">
              <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Medications Registered</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your medications to track and monitor potential interactions.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Medication
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.map((medication) => (
                  <TableRow key={medication.id}>
                    <TableCell className="font-medium">{medication.name}</TableCell>
                    <TableCell>{medication.dosage}</TableCell>
                    <TableCell>{getFrequencyLabel(medication.frequency)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {medication.time}
                      </div>
                    </TableCell>
                    <TableCell>
                      {medication.taken ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Taken Today
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Not Taken
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!medication.taken && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkTaken(medication.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingMedication(medication);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMedication(medication.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Medication Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Medication</DialogTitle>
            <DialogDescription>
              Update your medication information
            </DialogDescription>
          </DialogHeader>
          {editingMedication && (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-medication-name">Medication Name</Label>
                <Input
                  id="edit-medication-name"
                  value={editingMedication.name}
                  onChange={(e) => setEditingMedication({...editingMedication, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dosage">Dosage</Label>
                <Input
                  id="edit-dosage"
                  value={editingMedication.dosage}
                  onChange={(e) => setEditingMedication({...editingMedication, dosage: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-frequency">Frequency</Label>
                <Select
                  value={editingMedication.frequency}
                  onValueChange={(value: string) => 
                    setEditingMedication({...editingMedication, frequency: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="twice">Twice Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Time of Day</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={editingMedication.time}
                  onChange={(e) => setEditingMedication({...editingMedication, time: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateMedication}>
                  Update Medication
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Medication History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Medication History
          </CardTitle>
          <CardDescription>
            Your medication adherence over the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medications.map((medication) => (
              <div key={medication.id}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{medication.name}</h4>
                  <Badge variant="secondary">
                    {medication.takenHistory.filter(h => h.taken).length}/{medication.takenHistory.length} Taken
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {medication.takenHistory.slice(-7).map((history, index) => (
                    <div 
                      key={index} 
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs ${
                        history.taken 
                          ? "bg-green-100 text-green-800 border border-green-200" 
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                      title={`${new Date(history.date).toLocaleDateString()}: ${history.taken ? 'Taken' : 'Missed'}`}
                    >
                      {new Date(history.date).getDate()}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MedicationInteractionEngine;
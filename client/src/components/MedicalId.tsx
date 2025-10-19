import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  BadgeInfo, 
  Plus, 
  Trash2,
  Save,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authenticatedFetch } from "@/utils/auth";

interface MedicalIdData {
  bloodType: string;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  emergencyContacts: string[];
  notes: string;
}

const MedicalId: React.FC = () => {
  const { toast } = useToast();
  const [medicalId, setMedicalId] = useState<MedicalIdData>({
    bloodType: '',
    allergies: [],
    medications: [],
    medicalConditions: [],
    emergencyContacts: [],
    notes: ''
  });
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMedicalId();
  }, []);

  const fetchMedicalId = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/emergency/medical-id');
      
      if (response.ok) {
        const data = await response.json();
        setMedicalId(data.data);
      } else if (response.status === 404) {
        // Medical ID doesn't exist yet, use default empty state
        setMedicalId({
          bloodType: '',
          allergies: [],
          medications: [],
          medicalConditions: [],
          emergencyContacts: [],
          notes: ''
        });
      } else {
        throw new Error('Failed to fetch medical ID');
      }
    } catch (error) {
      console.error('Error fetching medical ID:', error);
      toast({
        title: "Error",
        description: "Failed to fetch medical ID",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveMedicalId = async () => {
    try {
      setSaving(true);
      const response = await authenticatedFetch('/api/emergency/medical-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(medicalId)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Medical ID saved successfully"
        });
      } else {
        throw new Error('Failed to save medical ID');
      }
    } catch (error) {
      console.error('Error saving medical ID:', error);
      toast({
        title: "Error",
        description: "Failed to save medical ID",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !medicalId.allergies.includes(newAllergy.trim())) {
      setMedicalId({
        ...medicalId,
        allergies: [...medicalId.allergies, newAllergy.trim()]
      });
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setMedicalId({
      ...medicalId,
      allergies: medicalId.allergies.filter(a => a !== allergy)
    });
  };

  const addMedication = () => {
    if (newMedication.trim() && !medicalId.medications.includes(newMedication.trim())) {
      setMedicalId({
        ...medicalId,
        medications: [...medicalId.medications, newMedication.trim()]
      });
      setNewMedication('');
    }
  };

  const removeMedication = (medication: string) => {
    setMedicalId({
      ...medicalId,
      medications: medicalId.medications.filter(m => m !== medication)
    });
  };

  const addCondition = () => {
    if (newCondition.trim() && !medicalId.medicalConditions.includes(newCondition.trim())) {
      setMedicalId({
        ...medicalId,
        medicalConditions: [...medicalId.medicalConditions, newCondition.trim()]
      });
      setNewCondition('');
    }
  };

  const removeCondition = (condition: string) => {
    setMedicalId({
      ...medicalId,
      medicalConditions: medicalId.medicalConditions.filter(c => c !== condition)
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BadgeInfo className="h-5 w-5" />
          Medical ID
        </CardTitle>
        <CardDescription>
          Critical health information for emergency situations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-700">
              This information will be shared with emergency contacts during automatic emergency notifications.
            </p>
          </div>
        </div>

        {/* Blood Type */}
        <div className="space-y-2">
          <Label htmlFor="blood-type">Blood Type</Label>
          <Input
            id="blood-type"
            value={medicalId.bloodType}
            onChange={(e) => setMedicalId({...medicalId, bloodType: e.target.value})}
            placeholder="e.g., O+, AB-"
          />
        </div>

        {/* Allergies */}
        <div className="space-y-2">
          <Label>Allergies</Label>
          <div className="flex gap-2">
            <Input
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              placeholder="Add an allergy"
              onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
            />
            <Button onClick={addAllergy} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {medicalId.allergies.map((allergy, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {allergy}
                <button 
                  onClick={() => removeAllergy(allergy)}
                  className="ml-1 hover:bg-secondary-foreground/10 rounded-full p-0.5"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {medicalId.allergies.length === 0 && (
              <p className="text-sm text-muted-foreground">No allergies added</p>
            )}
          </div>
        </div>

        {/* Medications */}
        <div className="space-y-2">
          <Label>Current Medications</Label>
          <div className="flex gap-2">
            <Input
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              placeholder="Add a medication"
              onKeyPress={(e) => e.key === 'Enter' && addMedication()}
            />
            <Button onClick={addMedication} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {medicalId.medications.map((medication, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {medication}
                <button 
                  onClick={() => removeMedication(medication)}
                  className="ml-1 hover:bg-secondary-foreground/10 rounded-full p-0.5"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {medicalId.medications.length === 0 && (
              <p className="text-sm text-muted-foreground">No medications added</p>
            )}
          </div>
        </div>

        {/* Medical Conditions */}
        <div className="space-y-2">
          <Label>Medical Conditions</Label>
          <div className="flex gap-2">
            <Input
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              placeholder="Add a medical condition"
              onKeyPress={(e) => e.key === 'Enter' && addCondition()}
            />
            <Button onClick={addCondition} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {medicalId.medicalConditions.map((condition, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {condition}
                <button 
                  onClick={() => removeCondition(condition)}
                  className="ml-1 hover:bg-secondary-foreground/10 rounded-full p-0.5"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {medicalId.medicalConditions.length === 0 && (
              <p className="text-sm text-muted-foreground">No medical conditions added</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={medicalId.notes}
            onChange={(e) => setMedicalId({...medicalId, notes: e.target.value})}
            placeholder="Any additional information for emergency responders..."
            rows={3}
          />
        </div>

        {/* Save Button */}
        <Button 
          onClick={saveMedicalId} 
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Medical ID
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MedicalId;
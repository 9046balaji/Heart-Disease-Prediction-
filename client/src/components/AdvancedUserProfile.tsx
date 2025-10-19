import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  History, 
  Users, 
  AlertTriangle,
  Calendar,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authenticatedFetch } from "@/utils/auth";

interface HealthHistoryEntry {
  id: string;
  condition: string;
  diagnosisDate?: string;
  status: 'active' | 'resolved' | 'in_remission';
  notes?: string;
  createdAt: string;
}

interface FamilyMedicalHistoryEntry {
  id: string;
  relationship: 'father' | 'mother' | 'sibling' | 'grandparent' | 'other';
  condition: string;
  ageAtDiagnosis?: number;
  notes?: string;
  createdAt: string;
}

interface AdverseReactionEntry {
  id: string;
  substance: string;
  reactionType: 'allergic' | 'side_effect' | 'intolerance';
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string[];
  dateOccurred?: string;
  notes?: string;
  createdAt: string;
}

const AdvancedUserProfile: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [healthHistory, setHealthHistory] = useState<HealthHistoryEntry[]>([]);
  const [familyHistory, setFamilyHistory] = useState<FamilyMedicalHistoryEntry[]>([]);
  const [adverseReactions, setAdverseReactions] = useState<AdverseReactionEntry[]>([]);
  
  // Form states
  const [newHealthHistory, setNewHealthHistory] = useState<Omit<HealthHistoryEntry, 'id' | 'createdAt'>>({ 
    condition: '', 
    status: 'active' 
  });
  
  const [newFamilyHistory, setNewFamilyHistory] = useState<Omit<FamilyMedicalHistoryEntry, 'id' | 'createdAt'>>({ 
    relationship: 'father', 
    condition: '' 
  });
  
  const [newAdverseReaction, setNewAdverseReaction] = useState<Omit<AdverseReactionEntry, 'id' | 'createdAt'>>({ 
    substance: '', 
    reactionType: 'allergic', 
    severity: 'mild',
    symptoms: []
  });
  
  const [symptomInput, setSymptomInput] = useState('');

  // Fetch user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('/api/user/profile/advanced');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const result = await response.json();
      const profile = result.data;
      
      // Set the profile data
      if (profile.healthHistory) {
        setHealthHistory(profile.healthHistory);
      }
      
      if (profile.familyMedicalHistory) {
        setFamilyHistory(profile.familyMedicalHistory);
      }
      
      if (profile.adverseReactions) {
        setAdverseReactions(profile.adverseReactions);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addHealthHistory = async () => {
    if (!newHealthHistory.condition) {
      toast({
        title: "Validation Error",
        description: "Condition is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await authenticatedFetch('/api/user/profile/health-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newHealthHistory)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to add health history entry');
      }
      
      toast({
        title: "Success",
        description: "Health history entry added successfully"
      });
      
      // Reset form
      setNewHealthHistory({ condition: '', status: 'active' });
      
      // Refresh data
      fetchUserProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add health history entry",
        variant: "destructive"
      });
    }
  };

  const removeHealthHistory = async (entryId: string) => {
    try {
      const response = await authenticatedFetch(`/api/user/profile/health-history/${entryId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to remove health history entry');
      }
      
      toast({
        title: "Success",
        description: "Health history entry removed successfully"
      });
      
      // Refresh data
      fetchUserProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove health history entry",
        variant: "destructive"
      });
    }
  };

  const addFamilyHistory = async () => {
    if (!newFamilyHistory.relationship || !newFamilyHistory.condition) {
      toast({
        title: "Validation Error",
        description: "Relationship and condition are required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await authenticatedFetch('/api/user/profile/family-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFamilyHistory)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to add family history entry');
      }
      
      toast({
        title: "Success",
        description: "Family history entry added successfully"
      });
      
      // Reset form
      setNewFamilyHistory({ relationship: 'father', condition: '' });
      
      // Refresh data
      fetchUserProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add family history entry",
        variant: "destructive"
      });
    }
  };

  const removeFamilyHistory = async (entryId: string) => {
    try {
      const response = await authenticatedFetch(`/api/user/profile/family-history/${entryId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to remove family history entry');
      }
      
      toast({
        title: "Success",
        description: "Family history entry removed successfully"
      });
      
      // Refresh data
      fetchUserProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove family history entry",
        variant: "destructive"
      });
    }
  };

  const addAdverseReaction = async () => {
    if (!newAdverseReaction.substance || !newAdverseReaction.reactionType || 
        !newAdverseReaction.severity || newAdverseReaction.symptoms.length === 0) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await authenticatedFetch('/api/user/profile/adverse-reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAdverseReaction)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to add adverse reaction entry');
      }
      
      toast({
        title: "Success",
        description: "Adverse reaction entry added successfully"
      });
      
      // Reset form
      setNewAdverseReaction({ 
        substance: '', 
        reactionType: 'allergic', 
        severity: 'mild',
        symptoms: []
      });
      setSymptomInput('');
      
      // Refresh data
      fetchUserProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add adverse reaction entry",
        variant: "destructive"
      });
    }
  };

  const removeAdverseReaction = async (entryId: string) => {
    try {
      const response = await authenticatedFetch(`/api/user/profile/adverse-reactions/${entryId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to remove adverse reaction entry');
      }
      
      toast({
        title: "Success",
        description: "Adverse reaction entry removed successfully"
      });
      
      // Refresh data
      fetchUserProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove adverse reaction entry",
        variant: "destructive"
      });
    }
  };

  const addSymptom = () => {
    if (symptomInput.trim() && !newAdverseReaction.symptoms.includes(symptomInput.trim())) {
      setNewAdverseReaction({
        ...newAdverseReaction,
        symptoms: [...newAdverseReaction.symptoms, symptomInput.trim()]
      });
      setSymptomInput('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setNewAdverseReaction({
      ...newAdverseReaction,
      symptoms: newAdverseReaction.symptoms.filter(s => s !== symptom)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading profile data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Health History Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Health History
          </CardTitle>
          <CardDescription>
            Track your medical conditions and health history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Health History Form */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">Add New Health History Entry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Input
                  id="condition"
                  value={newHealthHistory.condition}
                  onChange={(e) => setNewHealthHistory({...newHealthHistory, condition: e.target.value})}
                  placeholder="e.g., Hypertension, Diabetes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis-date">Diagnosis Date</Label>
                <Input
                  id="diagnosis-date"
                  type="date"
                  value={newHealthHistory.diagnosisDate || ''}
                  onChange={(e) => setNewHealthHistory({...newHealthHistory, diagnosisDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newHealthHistory.status} 
                  onValueChange={(value) => setNewHealthHistory({...newHealthHistory, status: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="in_remission">In Remission</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="health-notes">Notes</Label>
                <Textarea
                  id="health-notes"
                  value={newHealthHistory.notes || ''}
                  onChange={(e) => setNewHealthHistory({...newHealthHistory, notes: e.target.value})}
                  placeholder="Additional notes about this condition"
                />
              </div>
            </div>
            <Button onClick={addHealthHistory} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Health History Entry
            </Button>
          </div>

          {/* Health History List */}
          <div className="space-y-3">
            <h3 className="font-medium">Your Health History</h3>
            {healthHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No health history entries yet. Add your first entry above.
              </p>
            ) : (
              <div className="space-y-3">
                {healthHistory.map((entry) => (
                  <div key={entry.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{entry.condition}</h4>
                        <div className="flex flex-wrap gap-2 mt-2 text-sm">
                          {entry.diagnosisDate && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(entry.diagnosisDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            entry.status === 'active' 
                              ? 'bg-red-100 text-red-800' 
                              : entry.status === 'resolved' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {entry.status.replace('_', ' ')}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="mt-2 text-sm text-muted-foreground">{entry.notes}</p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeHealthHistory(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Family Medical History Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Family Medical History
          </CardTitle>
          <CardDescription>
            Track medical conditions in your family
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Family History Form */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">Add New Family History Entry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship *</Label>
                <Select 
                  value={newFamilyHistory.relationship} 
                  onValueChange={(value) => setNewFamilyHistory({...newFamilyHistory, relationship: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="grandparent">Grandparent</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="family-condition">Condition *</Label>
                <Input
                  id="family-condition"
                  value={newFamilyHistory.condition}
                  onChange={(e) => setNewFamilyHistory({...newFamilyHistory, condition: e.target.value})}
                  placeholder="e.g., Heart Disease, Cancer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age-at-diagnosis">Age at Diagnosis</Label>
                <Input
                  id="age-at-diagnosis"
                  type="number"
                  value={newFamilyHistory.ageAtDiagnosis || ''}
                  onChange={(e) => setNewFamilyHistory({...newFamilyHistory, ageAtDiagnosis: parseInt(e.target.value) || undefined})}
                  placeholder="Age when diagnosed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="family-notes">Notes</Label>
                <Textarea
                  id="family-notes"
                  value={newFamilyHistory.notes || ''}
                  onChange={(e) => setNewFamilyHistory({...newFamilyHistory, notes: e.target.value})}
                  placeholder="Additional notes about this family history"
                />
              </div>
            </div>
            <Button onClick={addFamilyHistory} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Family History Entry
            </Button>
          </div>

          {/* Family History List */}
          <div className="space-y-3">
            <h3 className="font-medium">Your Family Medical History</h3>
            {familyHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No family history entries yet. Add your first entry above.
              </p>
            ) : (
              <div className="space-y-3">
                {familyHistory.map((entry) => (
                  <div key={entry.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{entry.condition}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {entry.relationship}{entry.ageAtDiagnosis ? ` (Diagnosed at age ${entry.ageAtDiagnosis})` : ''}
                        </p>
                        {entry.notes && (
                          <p className="mt-2 text-sm text-muted-foreground">{entry.notes}</p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeFamilyHistory(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Adverse Reactions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Adverse Reactions
          </CardTitle>
          <CardDescription>
            Track allergies, side effects, and intolerances
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Adverse Reaction Form */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">Add New Adverse Reaction</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="substance">Substance *</Label>
                <Input
                  id="substance"
                  value={newAdverseReaction.substance}
                  onChange={(e) => setNewAdverseReaction({...newAdverseReaction, substance: e.target.value})}
                  placeholder="e.g., Penicillin, Peanuts, Aspirin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reaction-type">Reaction Type *</Label>
                <Select 
                  value={newAdverseReaction.reactionType} 
                  onValueChange={(value) => setNewAdverseReaction({...newAdverseReaction, reactionType: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allergic">Allergic Reaction</SelectItem>
                    <SelectItem value="side_effect">Side Effect</SelectItem>
                    <SelectItem value="intolerance">Intolerance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity *</Label>
                <Select 
                  value={newAdverseReaction.severity} 
                  onValueChange={(value) => setNewAdverseReaction({...newAdverseReaction, severity: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-occurred">Date Occurred</Label>
                <Input
                  id="date-occurred"
                  type="date"
                  value={newAdverseReaction.dateOccurred || ''}
                  onChange={(e) => setNewAdverseReaction({...newAdverseReaction, dateOccurred: e.target.value})}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="symptoms">Symptoms *</Label>
                <div className="flex gap-2">
                  <Input
                    id="symptoms"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    placeholder="Enter a symptom and press Enter or click Add"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSymptom();
                      }
                    }}
                  />
                  <Button onClick={addSymptom} type="button">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newAdverseReaction.symptoms.map((symptom, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {symptom}
                      <button 
                        type="button" 
                        className="ml-1.5 inline-flex items-center"
                        onClick={() => removeSymptom(symptom)}
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="reaction-notes">Notes</Label>
                <Textarea
                  id="reaction-notes"
                  value={newAdverseReaction.notes || ''}
                  onChange={(e) => setNewAdverseReaction({...newAdverseReaction, notes: e.target.value})}
                  placeholder="Additional notes about this reaction"
                />
              </div>
            </div>
            <Button onClick={addAdverseReaction} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Adverse Reaction
            </Button>
          </div>

          {/* Adverse Reactions List */}
          <div className="space-y-3">
            <h3 className="font-medium">Your Adverse Reactions</h3>
            {adverseReactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No adverse reactions recorded yet. Add your first entry above.
              </p>
            ) : (
              <div className="space-y-3">
                {adverseReactions.map((entry) => (
                  <div key={entry.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{entry.substance}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            entry.severity === 'mild' 
                              ? 'bg-green-100 text-green-800' 
                              : entry.severity === 'moderate' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {entry.severity} {entry.reactionType.replace('_', ' ')}
                          </span>
                          {entry.dateOccurred && (
                            <span className="flex items-center gap-1 text-muted-foreground text-xs">
                              <Calendar className="h-3 w-3" />
                              {new Date(entry.dateOccurred).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium">Symptoms:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.symptoms.map((symptom, index) => (
                              <span 
                                key={index} 
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                        {entry.notes && (
                          <p className="mt-2 text-sm text-muted-foreground">{entry.notes}</p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeAdverseReaction(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedUserProfile;
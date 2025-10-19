import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Info,
  CheckCircle
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

interface Allergy {
  id: string;
  name: string;
  severity: "mild" | "moderate" | "severe";
  reaction: string;
  createdAt: string;
  updatedAt: string;
}

interface AllergenInfo {
  id: string;
  name: string;
  category: "food" | "medication" | "environmental";
  commonSources: string[];
  crossReactivity: string[];
}

interface AllergyWarningSystemProps {
  userId: string;
  onAllergyAdded?: (allergy: Allergy) => void;
  onAllergyUpdated?: (allergy: Allergy) => void;
  onAllergyDeleted?: (allergyId: string) => void;
}

const AllergyWarningSystem: React.FC<AllergyWarningSystemProps> = ({ 
  userId,
  onAllergyAdded,
  onAllergyUpdated,
  onAllergyDeleted
}) => {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [allergenInfo, setAllergenInfo] = useState<AllergenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null);
  const [newAllergy, setNewAllergy] = useState({
    name: "",
    severity: "moderate" as "mild" | "moderate" | "severe",
    reaction: ""
  });

  // Simulate fetching allergies from API
  useEffect(() => {
    const fetchAllergies = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        // const response = await fetch(`/api/allergy?userId=${userId}`);
        // const data = await response.json();
        // setAllergies(data.allergies);
        
        // Simulated data for demo
        setAllergies([
          {
            id: "1",
            name: "Peanuts",
            severity: "severe",
            reaction: "Anaphylaxis",
            createdAt: "2023-01-15T10:30:00Z",
            updatedAt: "2023-01-15T10:30:00Z"
          },
          {
            id: "2",
            name: "Shellfish",
            severity: "moderate",
            reaction: "Hives and swelling",
            createdAt: "2023-02-20T14:45:00Z",
            updatedAt: "2023-02-20T14:45:00Z"
          }
        ]);
      } catch (err) {
        setError("Failed to load allergies");
        console.error("Error fetching allergies:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllergies();
  }, [userId]);

  const handleAddAllergy = async () => {
    try {
      if (!newAllergy.name) {
        setError("Allergen name is required");
        return;
      }
      
      // In a real app, this would be an API call
      // const response = await fetch('/api/allergy', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...newAllergy, userId })
      // });
      // const data = await response.json();
      
      // Simulated response
      const addedAllergy: Allergy = {
        id: `allergy-${Date.now()}`,
        ...newAllergy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setAllergies([...allergies, addedAllergy]);
      onAllergyAdded?.(addedAllergy);
      setIsAddDialogOpen(false);
      setNewAllergy({ name: "", severity: "moderate", reaction: "" });
      setError(null);
    } catch (err) {
      setError("Failed to add allergy");
      console.error("Error adding allergy:", err);
    }
  };

  const handleUpdateAllergy = async () => {
    try {
      if (!editingAllergy) return;
      
      // In a real app, this would be an API call
      // const response = await fetch(`/api/allergy/${editingAllergy.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editingAllergy)
      // });
      // const data = await response.json();
      
      // Simulated response
      const updatedAllergies = allergies.map(allergy => 
        allergy.id === editingAllergy.id ? editingAllergy : allergy
      );
      
      setAllergies(updatedAllergies);
      onAllergyUpdated?.(editingAllergy);
      setIsEditDialogOpen(false);
      setEditingAllergy(null);
      setError(null);
    } catch (err) {
      setError("Failed to update allergy");
      console.error("Error updating allergy:", err);
    }
  };

  const handleDeleteAllergy = async (allergyId: string) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/allergy/${allergyId}`, { method: 'DELETE' });
      
      // Simulated response
      const updatedAllergies = allergies.filter(allergy => allergy.id !== allergyId);
      setAllergies(updatedAllergies);
      onAllergyDeleted?.(allergyId);
      setError(null);
    } catch (err) {
      setError("Failed to delete allergy");
      console.error("Error deleting allergy:", err);
    }
  };

  const handleViewAllergenInfo = async (allergenName: string) => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/allergy/info/${allergenName}`);
      // const data = await response.json();
      
      // Simulated response
      setAllergenInfo({
        id: `allergen-${Date.now()}`,
        name: allergenName,
        category: "food",
        commonSources: [
          `${allergenName} products`,
          `Foods containing ${allergenName}`,
          `Processed foods with ${allergenName}`
        ],
        crossReactivity: [
          "Related allergens",
          "Similar proteins"
        ]
      });
      setIsInfoDialogOpen(true);
    } catch (err) {
      setError("Failed to load allergen information");
      console.error("Error fetching allergen info:", err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild": return "bg-green-100 text-green-800";
      case "moderate": return "bg-yellow-100 text-yellow-800";
      case "severe": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            Allergy Management
          </h1>
          <p className="text-muted-foreground">
            Manage your allergies and receive real-time warnings
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Allergy
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Allergy</DialogTitle>
              <DialogDescription>
                Add a new allergen to your profile to receive warnings
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
                <Label htmlFor="allergen-name">Allergen Name</Label>
                <Input
                  id="allergen-name"
                  value={newAllergy.name}
                  onChange={(e) => setNewAllergy({...newAllergy, name: e.target.value})}
                  placeholder="e.g., Peanuts, Shellfish"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={newAllergy.severity}
                  onValueChange={(value: "mild" | "moderate" | "severe") => 
                    setNewAllergy({...newAllergy, severity: value})
                  }
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
                <Label htmlFor="reaction">Typical Reaction</Label>
                <Input
                  id="reaction"
                  value={newAllergy.reaction}
                  onChange={(e) => setNewAllergy({...newAllergy, reaction: e.target.value})}
                  placeholder="e.g., Hives, Anaphylaxis"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAllergy}>
                  Add Allergy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Warning Banner */}
      {allergies.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Allergy Alert Active</AlertTitle>
          <AlertDescription>
            You have {allergies.length} registered allergies. The system will provide real-time warnings for foods and medications containing these allergens.
          </AlertDescription>
        </Alert>
      )}

      {/* Allergies List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Registered Allergies
          </CardTitle>
          <CardDescription>
            Your current allergy profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allergies.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Allergies Registered</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your allergies to receive real-time warnings and safety alerts.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Allergy
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Allergen</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Reaction</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allergies.map((allergy) => (
                  <TableRow key={allergy.id}>
                    <TableCell className="font-medium">{allergy.name}</TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(allergy.severity)}>
                        {allergy.severity.charAt(0).toUpperCase() + allergy.severity.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{allergy.reaction}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAllergenInfo(allergy.name)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingAllergy(allergy);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAllergy(allergy.id)}
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

      {/* Edit Allergy Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Allergy</DialogTitle>
            <DialogDescription>
              Update your allergy information
            </DialogDescription>
          </DialogHeader>
          {editingAllergy && (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-allergen-name">Allergen Name</Label>
                <Input
                  id="edit-allergen-name"
                  value={editingAllergy.name}
                  onChange={(e) => setEditingAllergy({...editingAllergy, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-severity">Severity</Label>
                <Select
                  value={editingAllergy.severity}
                  onValueChange={(value: "mild" | "moderate" | "severe") => 
                    setEditingAllergy({...editingAllergy, severity: value})
                  }
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
                <Label htmlFor="edit-reaction">Typical Reaction</Label>
                <Input
                  id="edit-reaction"
                  value={editingAllergy.reaction}
                  onChange={(e) => setEditingAllergy({...editingAllergy, reaction: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateAllergy}>
                  Update Allergy
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Allergen Information Dialog */}
      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {allergenInfo?.name} Information
            </DialogTitle>
            <DialogDescription>
              Detailed information about this allergen
            </DialogDescription>
          </DialogHeader>
          {allergenInfo && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Category</h4>
                <Badge variant="secondary">
                  {allergenInfo.category.charAt(0).toUpperCase() + allergenInfo.category.slice(1)}
                </Badge>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Common Sources</h4>
                <ul className="list-disc list-inside space-y-1">
                  {allergenInfo.commonSources.map((source, index) => (
                    <li key={index} className="text-sm">{source}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Cross-Reactivity</h4>
                <ul className="list-disc list-inside space-y-1">
                  {allergenInfo.crossReactivity.map((reactant, index) => (
                    <li key={index} className="text-sm">{reactant}</li>
                  ))}
                </ul>
              </div>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Safety Tip</AlertTitle>
                <AlertDescription>
                  Always read food labels carefully and inform restaurant staff about your allergies.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

export default AllergyWarningSystem;
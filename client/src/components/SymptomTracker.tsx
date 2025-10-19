import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, Plus, Calendar, AlertTriangle } from "lucide-react";
import { authenticatedFetch, sanitizeInput, getUserIdFromToken } from "@/utils/auth";
import { validateAndSanitize, checkRateLimit } from "@/utils/security";
import { offlineService } from "@/lib/offlineService";

// Utility function to validate symptom data
const validateSymptomData = (data: any) => {
  const errors: string[] = [];
  
  if (!data.type || data.type.trim() === "") {
    errors.push("Symptom type is required");
  }
  
  if (data.severity < 1 || data.severity > 10) {
    errors.push("Severity must be between 1 and 10");
  }
  
  if (data.timestamp && isNaN(Date.parse(data.timestamp))) {
    errors.push("Invalid date format");
  }
  
  return errors;
};

interface Symptom {
  id: string;
  userId: string;
  type: string;
  severity: number;
  duration: string;
  notes: string;
  timestamp: string;
  createdAt: string;
}

const SymptomTracker: React.FC = () => {
  const { toast } = useToast();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    severity: 5,
    duration: "",
    notes: "",
    timestamp: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState<string[]>([]);

  // Fetch symptoms on component mount
  useEffect(() => {
    fetchSymptoms();
  }, []);

  const fetchSymptoms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Check if token exists
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Rate limiting
      const userId = getUserIdFromToken(token);
      if (userId) {
        const rateLimit = checkRateLimit(userId, 'api');
        if (!rateLimit.allowed) {
          throw new Error(`Rate limit exceeded. Please try again in ${rateLimit.retryAfter} seconds.`);
        }
      }
      
      const response = await authenticatedFetch('/api/symptoms');
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Failed to fetch symptoms: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      setSymptoms(result.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch symptoms. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value }));
    
    // Clear errors when user makes a selection
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSeverityChange = (value: string) => {
    setFormData(prev => ({ ...prev, severity: parseInt(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Sanitize inputs
      const sanitizedData = {
        type: validateAndSanitize.text(formData.type, 100),
        severity: validateAndSanitize.number(formData.severity, 1, 10),
        duration: validateAndSanitize.text(formData.duration, 200),
        notes: validateAndSanitize.text(formData.notes, 1000),
        timestamp: validateAndSanitize.date(formData.timestamp)
      };
      
      // Validate form data
      const validationErrors = validateSymptomData(sanitizedData);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        toast({
          title: "Validation Error",
          description: "Please correct the errors in the form.",
          variant: "destructive"
        });
        return;
      }
      
      const token = localStorage.getItem('token');
      
      // Check if token exists
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Rate limiting
      const userId = getUserIdFromToken(token);
      if (userId) {
        const rateLimit = checkRateLimit(userId, 'api');
        if (!rateLimit.allowed) {
          throw new Error(`Rate limit exceeded. Please try again in ${rateLimit.retryAfter} seconds.`);
        }
      }
      
      // Check if online
      if (navigator.onLine) {
        const response = await authenticatedFetch('/api/symptoms', {
          method: 'POST',
          body: JSON.stringify(sanitizedData)
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expired. Please log in again.');
          }
          
          const errorData = await response.json();
          throw new Error(errorData.error?.message || `Failed to add symptom: ${response.status} ${response.statusText}`);
        }
        
        toast({
          title: "Success",
          description: "Symptom added successfully"
        });
      } else {
        // Store data offline
        offlineService.storeOfflineData('/symptoms', 'POST', sanitizedData);
        
        toast({
          title: "Saved Offline",
          description: "Symptom recorded and will be synced when online."
        });
      }
      
      setIsDialogOpen(false);
      setFormData({
        type: "",
        severity: 5,
        duration: "",
        notes: "",
        timestamp: new Date().toISOString().split('T')[0]
      });
      setErrors([]);
      fetchSymptoms(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add symptom. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      chest_pain: "bg-red-100 text-red-800",
      shortness_of_breath: "bg-orange-100 text-orange-800",
      dizziness: "bg-yellow-100 text-yellow-800",
      fatigue: "bg-blue-100 text-blue-800",
      palpitations: "bg-purple-100 text-purple-800",
      default: "bg-gray-100 text-gray-800"
    };
    
    return typeColors[type] || typeColors.default;
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return "bg-red-500";
    if (severity >= 5) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2">Loading symptoms...</span>
    </div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Symptom Tracker
          </CardTitle>
          <CardDescription>Track your symptoms and monitor patterns over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Your Symptoms</h3>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                // Reset form and errors when closing dialog
                setFormData({
                  type: "",
                  severity: 5,
                  duration: "",
                  notes: "",
                  timestamp: new Date().toISOString().split('T')[0]
                });
                setErrors([]);
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Symptom
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Symptom</DialogTitle>
                  <DialogDescription>
                    Record a new symptom you've experienced. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  {errors.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                        <span className="text-sm font-medium text-red-800">Please correct the following errors:</span>
                      </div>
                      <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        Symptom Type *
                      </Label>
                      <Select value={formData.type} onValueChange={handleSelectChange}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chest_pain">Chest Pain</SelectItem>
                          <SelectItem value="shortness_of_breath">Shortness of Breath</SelectItem>
                          <SelectItem value="dizziness">Dizziness</SelectItem>
                          <SelectItem value="fatigue">Fatigue</SelectItem>
                          <SelectItem value="palpitations">Palpitations</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="severity" className="text-right">
                        Severity *
                      </Label>
                      <div className="col-span-3 flex items-center gap-2">
                        <span className="text-sm">Mild</span>
                        <Input
                          id="severity"
                          name="severity"
                          type="range"
                          min="1"
                          max="10"
                          value={formData.severity}
                          onChange={(e) => handleSeverityChange(e.target.value)}
                          className="flex-1"
                        />
                        <span className="text-sm">Severe</span>
                        <Badge variant="secondary">{formData.severity}</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="duration" className="text-right">
                        Duration
                      </Label>
                      <Input
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="col-span-3"
                        placeholder="e.g., 30 minutes, 2 hours"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="timestamp" className="text-right">
                        Date *
                      </Label>
                      <Input
                        id="timestamp"
                        name="timestamp"
                        type="date"
                        value={formData.timestamp}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="notes" className="text-right">
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        className="col-span-3"
                        placeholder="Any additional details about the symptom..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Symptom</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {symptoms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-4" />
              <p>No symptoms recorded yet</p>
              <p className="text-sm mt-2">Add your first symptom to start tracking</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {symptoms.map((symptom) => (
                    <TableRow key={symptom.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(symptom.timestamp).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(symptom.type)}>
                          {symptom.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getSeverityColor(symptom.severity)}`} />
                          {symptom.severity}/10
                        </div>
                      </TableCell>
                      <TableCell>{symptom.duration || "-"}</TableCell>
                      <TableCell>{symptom.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SymptomTracker;
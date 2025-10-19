import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { offlineService } from "@/lib/offlineService";

interface LabResult {
  id: string;
  userId: string;
  type: "bloodPressure" | "cholesterol" | "hba1c";
  systolic?: number;
  diastolic?: number;
  totalCholesterol?: number;
  ldl?: number;
  hdl?: number;
  triglycerides?: number;
  hba1c?: number;
  date: string;
  notes?: string;
}

interface LabTrend {
  type: "bloodPressure" | "cholesterol" | "hba1c";
  values: Array<{
    date: string;
    value: number;
    systolic?: number;
    diastolic?: number;
  }>;
}

const LabTracker: React.FC = () => {
  const { toast } = useToast();
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [labTrends, setLabTrends] = useState<LabTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "bloodPressure" as "bloodPressure" | "cholesterol" | "hba1c",
    systolic: "",
    diastolic: "",
    totalCholesterol: "",
    ldl: "",
    hdl: "",
    triglycerides: "",
    hba1c: "",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  // Fetch lab results and trends on component mount
  useEffect(() => {
    fetchLabData();
  }, []);

  const fetchLabData = async () => {
    try {
      setLoading(true);
      
      // Fetch lab results
      const resultsResponse = await fetch('/api/lab-tracker/lab-results', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!resultsResponse.ok) {
        throw new Error('Failed to fetch lab results');
      }
      
      const resultsData = await resultsResponse.json();
      setLabResults(resultsData.data || []);
      
      // Fetch lab trends
      const trendsResponse = await fetch('/api/health/trends/lab', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!trendsResponse.ok) {
        throw new Error('Failed to fetch lab trends');
      }
      
      const trendsData = await trendsResponse.json();
      setLabTrends(trendsData.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch lab data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value as any }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data based on type
      if (formData.type === "bloodPressure") {
        if (!formData.systolic || !formData.diastolic) {
          toast({
            title: "Error",
            description: "Both systolic and diastolic values are required for blood pressure",
            variant: "destructive"
          });
          return;
        }
      } else if (formData.type === "cholesterol") {
        if (!formData.totalCholesterol) {
          toast({
            title: "Error",
            description: "Total cholesterol value is required",
            variant: "destructive"
          });
          return;
        }
      } else if (formData.type === "hba1c") {
        if (!formData.hba1c) {
          toast({
            title: "Error",
            description: "HbA1c value is required",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Check if online
      if (navigator.onLine) {
        const response = await fetch('/api/lab-tracker/lab-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...formData,
            date: new Date(formData.date).toISOString()
          })
        });
        
        if (response.ok) {
          toast({
            title: "Success",
            description: "Lab result added successfully"
          });
        } else {
          const errorResult = await response.json();
          throw new Error(errorResult.error?.message || 'Failed to add lab result');
        }
      } else {
        // Store data offline
        const labData = {
          ...formData,
          date: new Date(formData.date).toISOString()
        };
        offlineService.storeOfflineData('/lab-tracker/lab-results', 'POST', labData);
        
        toast({
          title: "Saved Offline",
          description: "Lab result recorded and will be synced when online."
        });
      }
      
      setIsDialogOpen(false);
      setFormData({
        type: "bloodPressure",
        systolic: "",
        diastolic: "",
        totalCholesterol: "",
        ldl: "",
        hdl: "",
        triglycerides: "",
        hba1c: "",
        date: new Date().toISOString().split('T')[0],
        notes: ""
      });
      fetchLabData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add lab result",
        variant: "destructive"
      });
    }
  };

  const getDisplayValue = (result: LabResult) => {
    switch (result.type) {
      case "bloodPressure":
        return `${result.systolic}/${result.diastolic} mmHg`;
      case "cholesterol":
        return `${result.totalCholesterol} mg/dL`;
      case "hba1c":
        return `${result.hba1c}%`;
      default:
        return "";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "bloodPressure":
        return "Blood Pressure";
      case "cholesterol":
        return "Cholesterol";
      case "hba1c":
        return "HbA1c";
      default:
        return type;
    }
  };

  const getTrendData = (type: "bloodPressure" | "cholesterol" | "hba1c") => {
    const trend = labTrends.find(t => t.type === type);
    return trend ? trend.values : [];
  };

  if (loading) {
    return <div>Loading lab data...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lab Tracker</CardTitle>
          <CardDescription>Track your blood pressure, cholesterol, and HbA1c results over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Your Lab Results</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add New Result</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Lab Result</DialogTitle>
                  <DialogDescription>
                    Enter your latest lab results. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-right">
                        Type
                      </Label>
                      <Select value={formData.type} onValueChange={handleSelectChange}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bloodPressure">Blood Pressure</SelectItem>
                          <SelectItem value="cholesterol">Cholesterol</SelectItem>
                          <SelectItem value="hba1c">HbA1c</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {formData.type === "bloodPressure" && (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="systolic" className="text-right">
                            Systolic
                          </Label>
                          <Input
                            id="systolic"
                            name="systolic"
                            type="number"
                            value={formData.systolic}
                            onChange={handleInputChange}
                            className="col-span-3"
                            placeholder="e.g., 120"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="diastolic" className="text-right">
                            Diastolic
                          </Label>
                          <Input
                            id="diastolic"
                            name="diastolic"
                            type="number"
                            value={formData.diastolic}
                            onChange={handleInputChange}
                            className="col-span-3"
                            placeholder="e.g., 80"
                          />
                        </div>
                      </>
                    )}
                    
                    {formData.type === "cholesterol" && (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="totalCholesterol" className="text-right">
                            Total Cholesterol
                          </Label>
                          <Input
                            id="totalCholesterol"
                            name="totalCholesterol"
                            type="number"
                            value={formData.totalCholesterol}
                            onChange={handleInputChange}
                            className="col-span-3"
                            placeholder="e.g., 200"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="ldl" className="text-right">
                            LDL
                          </Label>
                          <Input
                            id="ldl"
                            name="ldl"
                            type="number"
                            value={formData.ldl}
                            onChange={handleInputChange}
                            className="col-span-3"
                            placeholder="e.g., 120"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="hdl" className="text-right">
                            HDL
                          </Label>
                          <Input
                            id="hdl"
                            name="hdl"
                            type="number"
                            value={formData.hdl}
                            onChange={handleInputChange}
                            className="col-span-3"
                            placeholder="e.g., 50"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="triglycerides" className="text-right">
                            Triglycerides
                          </Label>
                          <Input
                            id="triglycerides"
                            name="triglycerides"
                            type="number"
                            value={formData.triglycerides}
                            onChange={handleInputChange}
                            className="col-span-3"
                            placeholder="e.g., 150"
                          />
                        </div>
                      </>
                    )}
                    
                    {formData.type === "hba1c" && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="hba1c" className="text-right">
                          HbA1c
                        </Label>
                        <Input
                          id="hba1c"
                          name="hba1c"
                          type="number"
                          step="0.1"
                          value={formData.hba1c}
                          onChange={handleInputChange}
                          className="col-span-3"
                          placeholder="e.g., 6.0"
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        Date
                      </Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
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
                        placeholder="Any additional notes..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Result</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{new Date(result.date).toLocaleDateString()}</TableCell>
                    <TableCell>{getTypeLabel(result.type)}</TableCell>
                    <TableCell>{getDisplayValue(result)}</TableCell>
                    <TableCell>{result.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Blood Pressure Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={getTrendData("bloodPressure")}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()} 
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value, name) => [`${value} mmHg`, name === 'systolic' ? 'Systolic' : 'Diastolic']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="systolic" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  name="Systolic"
                />
                <Line 
                  type="monotone" 
                  dataKey="diastolic" 
                  stroke="#82ca9d" 
                  name="Diastolic"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Cholesterol Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={getTrendData("cholesterol")}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()} 
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => [`${value} mg/dL`, "Total Cholesterol"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#ffc658" 
                  name="Total Cholesterol"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>HbA1c Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={getTrendData("hba1c")}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()} 
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => [`${value}%`, "HbA1c"]}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#ff7300" 
                  name="HbA1c"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LabTracker;
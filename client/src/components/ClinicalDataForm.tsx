import { useState } from "react";
import { Activity, Heart, Stethoscope, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface ClinicalDataFormProps {
  onSubmit: (data: any) => void;
}

export default function ClinicalDataForm({ onSubmit }: ClinicalDataFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    age: "",
    sex: "",
    height: "",
    weight: "",
    cp: "",
    trestbps: "",
    chol: "",
    fbs: "",
    restecg: "",
    thalach: "",
    exang: "",
    oldpeak: "",
    slope: "",
    ca: "",
    thal: "",
    smokingStatus: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      // Submit clinical data to the API
      const response = await fetch('/api/clinical-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error?.message || 'Failed to submit clinical data');
      }
      
      const result = await response.json();
      
      // Also submit for prediction
      const predictionResponse = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clinicalEntryId: result.data.id
        })
      });
      
      if (!predictionResponse.ok) {
        const errorResult = await predictionResponse.json();
        throw new Error(errorResult.error?.message || 'Failed to generate prediction');
      }
      
      const predictionResult = await predictionResponse.json();
      
      toast({
        title: "Success",
        description: "Clinical data submitted and risk assessment generated successfully!"
      });
      
      onSubmit(predictionResult.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit clinical data",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal" data-testid="tab-personal">
            <User className="h-4 w-4 mr-2" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="vitals" data-testid="tab-vitals">
            <Activity className="h-4 w-4 mr-2" />
            Vitals
          </TabsTrigger>
          <TabsTrigger value="tests" data-testid="tab-tests">
            <Stethoscope className="h-4 w-4 mr-2" />
            Tests
          </TabsTrigger>
          <TabsTrigger value="symptoms" data-testid="tab-symptoms">
            <Heart className="h-4 w-4 mr-2" />
            Symptoms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg">Demographics</CardTitle>
              <CardDescription>Basic personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age (years)</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="45"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    data-testid="input-age"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex">Sex</Label>
                  <Select value={formData.sex} onValueChange={(v) => setFormData({ ...formData, sex: v })}>
                    <SelectTrigger id="sex" data-testid="select-sex">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Male</SelectItem>
                      <SelectItem value="0">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    data-testid="input-height"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    data-testid="input-weight"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smokingStatus">Smoking Status</Label>
                <Select value={formData.smokingStatus} onValueChange={(v) => setFormData({ ...formData, smokingStatus: v })}>
                  <SelectTrigger id="smokingStatus" data-testid="select-smoking">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never smoked</SelectItem>
                    <SelectItem value="former">Former smoker</SelectItem>
                    <SelectItem value="current">Current smoker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Vital Signs
              </CardTitle>
              <CardDescription>Recent measurements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trestbps">Resting Blood Pressure (mmHg)</Label>
                  <Input
                    id="trestbps"
                    type="number"
                    placeholder="120"
                    value={formData.trestbps}
                    onChange={(e) => setFormData({ ...formData, trestbps: e.target.value })}
                    data-testid="input-trestbps"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thalach">Maximum Heart Rate (bpm)</Label>
                  <Input
                    id="thalach"
                    type="number"
                    placeholder="150"
                    value={formData.thalach}
                    onChange={(e) => setFormData({ ...formData, thalach: e.target.value })}
                    data-testid="input-thalach"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chol">Cholesterol (mg/dL)</Label>
                  <Input
                    id="chol"
                    type="number"
                    placeholder="200"
                    value={formData.chol}
                    onChange={(e) => setFormData({ ...formData, chol: e.target.value })}
                    data-testid="input-chol"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oldpeak">ST Depression</Label>
                  <Input
                    id="oldpeak"
                    type="number"
                    step="0.1"
                    placeholder="1.0"
                    value={formData.oldpeak}
                    onChange={(e) => setFormData({ ...formData, oldpeak: e.target.value })}
                    data-testid="input-oldpeak"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Medical Tests
              </CardTitle>
              <CardDescription>Lab results and test findings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fbs">Fasting Blood Sugar</Label>
                <Select value={formData.fbs} onValueChange={(v) => setFormData({ ...formData, fbs: v })}>
                  <SelectTrigger id="fbs" data-testid="select-fbs">
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Normal (&lt;120 mg/dL)</SelectItem>
                    <SelectItem value="1">High (≥120 mg/dL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="restecg">Resting ECG Results</Label>
                <Select value={formData.restecg} onValueChange={(v) => setFormData({ ...formData, restecg: v })}>
                  <SelectTrigger id="restecg" data-testid="select-restecg">
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Normal</SelectItem>
                    <SelectItem value="1">ST-T wave abnormality</SelectItem>
                    <SelectItem value="2">Left ventricular hypertrophy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slope">Slope of Peak Exercise ST Segment</Label>
                <Select value={formData.slope} onValueChange={(v) => setFormData({ ...formData, slope: v })}>
                  <SelectTrigger id="slope" data-testid="select-slope">
                    <SelectValue placeholder="Select slope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Upsloping</SelectItem>
                    <SelectItem value="1">Flat</SelectItem>
                    <SelectItem value="2">Downsloping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ca">Number of Major Vessels Colored</Label>
                <Select value={formData.ca} onValueChange={(v) => setFormData({ ...formData, ca: v })}>
                  <SelectTrigger id="ca" data-testid="select-ca">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 vessels</SelectItem>
                    <SelectItem value="1">1 vessel</SelectItem>
                    <SelectItem value="2">2 vessels</SelectItem>
                    <SelectItem value="3">3 vessels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="thal">Thalassemia</Label>
                <Select value={formData.thal} onValueChange={(v) => setFormData({ ...formData, thal: v })}>
                  <SelectTrigger id="thal" data-testid="select-thal">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Normal</SelectItem>
                    <SelectItem value="1">Fixed defect</SelectItem>
                    <SelectItem value="2">Reversible defect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg">Symptoms & History</CardTitle>
              <CardDescription>Clinical observations and symptoms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cp">Chest Pain Type</Label>
                <Select value={formData.cp} onValueChange={(v) => setFormData({ ...formData, cp: v })}>
                  <SelectTrigger id="cp" data-testid="select-cp">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No chest pain</SelectItem>
                    <SelectItem value="1">Typical angina</SelectItem>
                    <SelectItem value="2">Atypical angina</SelectItem>
                    <SelectItem value="3">Non-anginal pain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exang">Exercise-Induced Angina</Label>
                <Select value={formData.exang} onValueChange={(v) => setFormData({ ...formData, exang: v })}>
                  <SelectTrigger id="exang" data-testid="select-exang">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No</SelectItem>
                    <SelectItem value="1">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button type="submit" className="w-full h-12 text-base" data-testid="button-submit-clinical-data">
        Analyze My Risk
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        All data is encrypted and stored securely for your personalized health recommendations
      </p>
    </form>
  );
}
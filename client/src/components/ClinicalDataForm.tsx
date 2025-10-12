import { useState } from "react";
import { Activity, Heart, Stethoscope, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ClinicalDataFormProps {
  onSubmit: (data: any) => void;
}

export default function ClinicalDataForm({ onSubmit }: ClinicalDataFormProps) {
  const [formData, setFormData] = useState({
    age: "",
    sex: "",
    height: "",
    weight: "",
    systolicBP: "",
    diastolicBP: "",
    cholesterol: "",
    fastingBS: "",
    chestPain: "",
    restingECG: "",
    maxHeartRate: "",
    exerciseAngina: "",
    smokingStatus: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" data-testid="tab-personal">
            <User className="h-4 w-4 mr-2" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="vitals" data-testid="tab-vitals">
            <Activity className="h-4 w-4 mr-2" />
            Vitals
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
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Vital Signs & Labs
              </CardTitle>
              <CardDescription>Recent measurements and test results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systolicBP">Systolic BP (mmHg)</Label>
                  <Input
                    id="systolicBP"
                    type="number"
                    placeholder="120"
                    value={formData.systolicBP}
                    onChange={(e) => setFormData({ ...formData, systolicBP: e.target.value })}
                    data-testid="input-systolic-bp"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diastolicBP">Diastolic BP (mmHg)</Label>
                  <Input
                    id="diastolicBP"
                    type="number"
                    placeholder="80"
                    value={formData.diastolicBP}
                    onChange={(e) => setFormData({ ...formData, diastolicBP: e.target.value })}
                    data-testid="input-diastolic-bp"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cholesterol">Cholesterol (mg/dL)</Label>
                  <Input
                    id="cholesterol"
                    type="number"
                    placeholder="200"
                    value={formData.cholesterol}
                    onChange={(e) => setFormData({ ...formData, cholesterol: e.target.value })}
                    data-testid="input-cholesterol"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fastingBS">Fasting Blood Sugar</Label>
                  <Select value={formData.fastingBS} onValueChange={(v) => setFormData({ ...formData, fastingBS: v })}>
                    <SelectTrigger id="fastingBS" data-testid="select-fasting-bs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal (&lt;120 mg/dL)</SelectItem>
                      <SelectItem value="high">High (≥120 mg/dL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxHeartRate">Max Heart Rate (bpm)</Label>
                <Input
                  id="maxHeartRate"
                  type="number"
                  placeholder="150"
                  value={formData.maxHeartRate}
                  onChange={(e) => setFormData({ ...formData, maxHeartRate: e.target.value })}
                  data-testid="input-max-heart-rate"
                />
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
                <Label htmlFor="chestPain">Chest Pain Type</Label>
                <Select value={formData.chestPain} onValueChange={(v) => setFormData({ ...formData, chestPain: v })}>
                  <SelectTrigger id="chestPain" data-testid="select-chest-pain">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No chest pain</SelectItem>
                    <SelectItem value="typical">Typical angina</SelectItem>
                    <SelectItem value="atypical">Atypical angina</SelectItem>
                    <SelectItem value="non-anginal">Non-anginal pain</SelectItem>
                    <SelectItem value="asymptomatic">Asymptomatic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="restingECG">Resting ECG</Label>
                <Select value={formData.restingECG} onValueChange={(v) => setFormData({ ...formData, restingECG: v })}>
                  <SelectTrigger id="restingECG" data-testid="select-resting-ecg">
                    <SelectValue placeholder="Select result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="st-t-abnormal">ST-T wave abnormality</SelectItem>
                    <SelectItem value="lvh">Left ventricular hypertrophy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exerciseAngina">Exercise-Induced Angina</Label>
                <Select value={formData.exerciseAngina} onValueChange={(v) => setFormData({ ...formData, exerciseAngina: v })}>
                  <SelectTrigger id="exerciseAngina" data-testid="select-exercise-angina">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
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

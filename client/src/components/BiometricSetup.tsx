import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Fingerprint, 
  ScanFace, 
  Mic,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authenticatedFetch } from "@/utils/auth";

interface BiometricSetupProps {
  onSetupComplete: () => void;
}

const BiometricSetup: React.FC<BiometricSetupProps> = ({ onSetupComplete }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'select' | 'setup' | 'complete'>('select');
  const [selectedType, setSelectedType] = useState<'fingerprint' | 'face' | 'voice'>('fingerprint');
  const [isScanning, setIsScanning] = useState(false);
  const [template, setTemplate] = useState('');

  const handleTypeSelect = (type: 'fingerprint' | 'face' | 'voice') => {
    setSelectedType(type);
    setStep('setup');
  };

  const handleScan = async () => {
    try {
      setIsScanning(true);
      
      // Simulate biometric scanning
      // In a real implementation, this would use the Web Authentication API or similar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock template
      const mockTemplate = `mock_${selectedType}_template_${Date.now()}`;
      setTemplate(mockTemplate);
      
      // Store the biometric template
      const response = await authenticatedFetch('/api/biometric/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template: mockTemplate,
          type: selectedType
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to setup biometric authentication');
      }
      
      setStep('complete');
      toast({
        title: "Success",
        description: "Biometric authentication has been successfully enabled"
      });
      
      // Call the callback to notify parent component
      setTimeout(onSetupComplete, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to setup biometric authentication",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const renderSelectType = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Fingerprint className="h-12 w-12 mx-auto text-primary" />
        <h3 className="text-xl font-semibold mt-4">Enable Biometric Authentication</h3>
        <p className="text-muted-foreground mt-2">
          Add an extra layer of security using your biometrics
        </p>
      </div>
      
      <div className="space-y-4">
        <Button 
          onClick={() => handleTypeSelect('fingerprint')} 
          className="w-full flex items-center gap-3 h-16 text-lg"
          variant="outline"
        >
          <Fingerprint className="h-6 w-6" />
          Fingerprint
        </Button>
        
        <Button 
          onClick={() => handleTypeSelect('face')} 
          className="w-full flex items-center gap-3 h-16 text-lg"
          variant="outline"
        >
          <ScanFace className="h-6 w-6" />
          Face Recognition
        </Button>
        
        <Button 
          onClick={() => handleTypeSelect('voice')} 
          className="w-full flex items-center gap-3 h-16 text-lg"
          variant="outline"
        >
          <Mic className="h-6 w-6" />
          Voice Recognition
        </Button>
      </div>
    </div>
  );

  const renderSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center">
          {selectedType === 'fingerprint' ? (
            <Fingerprint className="h-6 w-6 text-primary" />
          ) : selectedType === 'face' ? (
            <ScanFace className="h-6 w-6 text-primary" />
          ) : (
            <Mic className="h-6 w-6 text-primary" />
          )}
        </div>
        <h3 className="text-xl font-semibold mt-4">
          {selectedType === 'fingerprint' 
            ? 'Fingerprint Setup' 
            : selectedType === 'face' 
              ? 'Face Recognition Setup' 
              : 'Voice Recognition Setup'}
        </h3>
      </div>
      
      <div className="space-y-4">
        {selectedType === 'fingerprint' && (
          <div className="text-center">
            <Fingerprint className="h-24 w-24 mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">
              Place your finger on the fingerprint scanner
            </p>
          </div>
        )}
        
        {selectedType === 'face' && (
          <div className="text-center">
            <ScanFace className="h-24 w-24 mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">
              Position your face in front of the camera
            </p>
          </div>
        )}
        
        {selectedType === 'voice' && (
          <div className="text-center">
            <Mic className="h-24 w-24 mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">
              Speak the phrase shown below when ready
            </p>
            <p className="text-lg font-medium mt-2">"HeartGuard secure access"</p>
          </div>
        )}
        
        <Button 
          onClick={handleScan} 
          className="w-full"
          disabled={isScanning}
        >
          {isScanning ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Scanning...
            </div>
          ) : (
            "Start Scan"
          )}
        </Button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="space-y-6 text-center">
      <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
      <h3 className="text-2xl font-semibold">Biometric Authentication Enabled!</h3>
      <p className="text-muted-foreground">
        Your account is now more secure with {selectedType} authentication.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800">
          <strong>Next time you log in,</strong> you can use your {selectedType} to authenticate.
        </p>
      </div>
    </div>
  );

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Biometric Authentication
        </CardTitle>
        <CardDescription>
          Protect your account with your unique biometric data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'select' && renderSelectType()}
        {step === 'setup' && renderSetup()}
        {step === 'complete' && renderComplete()}
      </CardContent>
    </Card>
  );
};

export default BiometricSetup;
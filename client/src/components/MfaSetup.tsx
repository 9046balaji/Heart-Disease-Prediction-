import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, 
  Mail, 
  Smartphone, 
  QrCode,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authenticatedFetch } from "@/utils/auth";

interface MfaSetupProps {
  onSetupComplete: () => void;
}

const MfaSetup: React.FC<MfaSetupProps> = ({ onSetupComplete }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'select' | 'setup' | 'verify' | 'complete'>('select');
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'authenticator' | 'sms'>('authenticator');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMethodSelect = () => {
    if (selectedMethod === 'sms' && !phoneNumber) {
      toast({
        title: "Validation Error",
        description: "Phone number is required for SMS authentication",
        variant: "destructive"
      });
      return;
    }
    
    setStep('setup');
    setupMfa();
  };

  const setupMfa = async () => {
    try {
      setIsLoading(true);
      
      const requestBody: any = { method: selectedMethod };
      if (selectedMethod === 'sms') {
        requestBody.phoneNumber = phoneNumber;
      }
      
      const response = await authenticatedFetch('/api/mfa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to setup MFA');
      }
      
      const result = await response.json();
      
      if (selectedMethod === 'authenticator') {
        setQrCode(result.data.qrCode);
        setSecret(result.data.secret);
      }
      
      setStep('verify');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to setup MFA",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      toast({
        title: "Validation Error",
        description: "Verification code is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await authenticatedFetch('/api/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          method: selectedMethod,
          code: verificationCode
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to verify MFA');
      }
      
      setStep('complete');
      toast({
        title: "Success",
        description: "MFA has been successfully enabled"
      });
      
      // Call the callback to notify parent component
      setTimeout(onSetupComplete, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify MFA code",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderSelectMethod = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-12 w-12 mx-auto text-primary" />
        <h3 className="text-xl font-semibold mt-4">Enable Two-Factor Authentication</h3>
        <p className="text-muted-foreground mt-2">
          Add an extra layer of security to your account
        </p>
      </div>
      
      <div className="space-y-4">
        <Label>Select Authentication Method</Label>
        <Select 
          value={selectedMethod} 
          onValueChange={(value) => setSelectedMethod(value as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="authenticator">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Authenticator App
              </div>
            </SelectItem>
            <SelectItem value="email">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </div>
            </SelectItem>
            <SelectItem value="sms">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                SMS
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        {selectedMethod === 'sms' && (
          <div className="space-y-2">
            <Label htmlFor="phone-number">Phone Number</Label>
            <Input
              id="phone-number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        )}
      </div>
      
      <Button 
        onClick={handleMethodSelect} 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Setting up...
          </div>
        ) : (
          "Continue"
        )}
      </Button>
    </div>
  );

  const renderSetupInstructions = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center">
          {selectedMethod === 'authenticator' ? (
            <Smartphone className="h-6 w-6 text-primary" />
          ) : selectedMethod === 'email' ? (
            <Mail className="h-6 w-6 text-primary" />
          ) : (
            <Smartphone className="h-6 w-6 text-primary" />
          )}
        </div>
        <h3 className="text-xl font-semibold mt-4">
          {selectedMethod === 'authenticator' 
            ? 'Set up Authenticator App' 
            : selectedMethod === 'email' 
              ? 'Email Verification' 
              : 'SMS Verification'}
        </h3>
      </div>
      
      {selectedMethod === 'authenticator' && (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Scan this QR code with your authenticator app (like Google Authenticator or Authy)
          </p>
          
          {qrCode && (
            <div className="flex flex-col items-center">
              <img 
                src={qrCode} 
                alt="QR Code for authenticator app" 
                className="border rounded-lg p-4"
              />
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Can't scan? Enter this code manually: <strong>{secret}</strong>
              </p>
            </div>
          )}
        </div>
      )}
      
      {selectedMethod === 'email' && (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We'll send a verification code to your email address when you log in.
          </p>
          <AlertCircle className="h-12 w-12 mx-auto text-yellow-500" />
          <p className="text-sm text-center">
            Make sure you can access your email account to complete login.
          </p>
        </div>
      )}
      
      {selectedMethod === 'sms' && (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We'll send a verification code to your phone number ending in {phoneNumber.slice(-4)}.
          </p>
          <Smartphone className="h-12 w-12 mx-auto text-primary" />
          <p className="text-sm text-center">
            Message and data rates may apply.
          </p>
        </div>
      )}
      
      <Button 
        onClick={() => setStep('verify')} 
        className="w-full"
      >
        Continue to Verification
      </Button>
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto bg-primary/10 rounded-full p-3 w-12 h-12 flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mt-4">Verify Your Identity</h3>
        <p className="text-muted-foreground mt-2">
          Enter the code from your {selectedMethod === 'authenticator' ? 'authenticator app' : selectedMethod}
        </p>
      </div>
      
      <div className="space-y-4">
        <Label htmlFor="verification-code">Verification Code</Label>
        <Input
          id="verification-code"
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Enter 6-digit code"
          maxLength={6}
          className="text-center text-2xl tracking-widest"
        />
        
        {selectedMethod === 'authenticator' && (
          <p className="text-sm text-muted-foreground text-center">
            Open your authenticator app to get the current code
          </p>
        )}
      </div>
      
      <Button 
        onClick={handleVerify} 
        className="w-full"
        disabled={isLoading || verificationCode.length !== 6}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Verifying...
          </div>
        ) : (
          "Verify & Enable MFA"
        )}
      </Button>
      
      <Button 
        variant="outline" 
        onClick={() => setStep('setup')} 
        className="w-full"
      >
        Back
      </Button>
    </div>
  );

  const renderComplete = () => (
    <div className="space-y-6 text-center">
      <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
      <h3 className="text-2xl font-semibold">Two-Factor Authentication Enabled!</h3>
      <p className="text-muted-foreground">
        Your account is now more secure with two-factor authentication.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-green-800">
          <strong>Next time you log in,</strong> you'll be asked for a verification code.
        </p>
      </div>
    </div>
  );

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Protect your account with an extra layer of security
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'select' && renderSelectMethod()}
        {step === 'setup' && renderSetupInstructions()}
        {step === 'verify' && renderVerification()}
        {step === 'complete' && renderComplete()}
      </CardContent>
    </Card>
  );
};

export default MfaSetup;
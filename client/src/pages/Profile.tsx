import { ArrowLeft, User, Bell, Shield, Info, Phone, FileText, Lock, Fingerprint } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import EmergencyButton from "@/components/EmergencyButton";
import EmergencyContacts from "@/components/EmergencyContacts";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNav from "@/components/BottomNav";
import AdvancedUserProfile from "@/components/AdvancedUserProfile";
import MfaSetup from "@/components/MfaSetup";
import BiometricSetup from "@/components/BiometricSetup";
import PrivacyDashboard from "@/components/PrivacyDashboard";
import MedicalId from "@/components/MedicalId";
import { useState } from "react";

export default function Profile() {
  const [notifications, setNotifications] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false); // Add state for biometric setup

  const handleMfaSetupComplete = () => {
    setShowMfaSetup(false);
  };

  const handleBiometricSetupComplete = () => {
    setShowBiometricSetup(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <EmergencyButton />
      
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="font-bold text-xl font-[family-name:var(--font-sans)]">Profile</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-sans)]">
            Account Settings
          </h2>
          <p className="text-muted-foreground">
            Manage your profile and preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b">
          <Button
            variant={activeTab === "basic" ? "default" : "ghost"}
            onClick={() => setActiveTab("basic")}
            className="px-4"
          >
            Basic Info
          </Button>
          <Button
            variant={activeTab === "advanced" ? "default" : "ghost"}
            onClick={() => setActiveTab("advanced")}
            className="px-4 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Advanced Profile
          </Button>
          <Button
            variant={activeTab === "security" ? "default" : "ghost"}
            onClick={() => setActiveTab("security")}
            className="px-4 flex items-center gap-2"
          >
            <Lock className="h-4 w-4" />
            Security
          </Button>
          <Button
            variant={activeTab === "privacy" ? "default" : "ghost"}
            onClick={() => setActiveTab("privacy")}
            className="px-4 flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Privacy
          </Button>
          <Button
            variant={activeTab === "medical" ? "default" : "ghost"}
            onClick={() => setActiveTab("medical")}
            className="px-4 flex items-center gap-2"
          >
            <Info className="h-4 w-4" />
            Medical ID
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "basic" ? (
          <>
            <Card data-testid="card-profile-info">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Your basic account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">John Doe</h3>
                    <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" data-testid="button-edit-profile">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-emergency-contacts">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Emergency Contacts
                </CardTitle>
                <CardDescription>Manage your emergency contacts for quick access during critical situations</CardDescription>
              </CardHeader>
              <CardContent>
                <EmergencyContacts />
              </CardContent>
            </Card>

            <Card data-testid="card-notifications">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="medication-reminders">Medication Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get notified about medication schedules</p>
                  </div>
                  <Switch 
                    id="medication-reminders" 
                    checked={notifications}
                    onCheckedChange={setNotifications}
                    data-testid="switch-medication-reminders"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="health-tips">Daily Health Tips</Label>
                    <p className="text-sm text-muted-foreground">Receive personalized health guidance</p>
                  </div>
                  <Switch id="health-tips" data-testid="switch-health-tips" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-privacy">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Data
                </CardTitle>
                <CardDescription>Control your data privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-sharing">Research Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">Allow anonymized data for research</p>
                  </div>
                  <Switch 
                    id="data-sharing"
                    checked={dataSharing}
                    onCheckedChange={setDataSharing}
                    data-testid="switch-data-sharing"
                  />
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Your health data is encrypted and stored securely. We never share personally identifiable information.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-about">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">App Version</span>
                    <span className="font-mono">1.0.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Model Version</span>
                    <span className="font-mono">v3.0.0</span>
                  </div>
                </div>
                <div className="pt-4 border-t space-y-2">
                  <Button variant="outline" className="w-full" data-testid="button-terms">
                    Terms of Service
                  </Button>
                  <Button variant="outline" className="w-full" data-testid="button-privacy-policy">
                    Privacy Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : activeTab === "advanced" ? (
          // Advanced Profile Tab
          <AdvancedUserProfile />
        ) : activeTab === "privacy" ? (
          // Privacy Tab
          <PrivacyDashboard />
        ) : activeTab === "medical" ? (
          // Medical ID Tab
          <MedicalId />
        ) : (
          // Security Tab
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and authentication methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account by requiring more than just a password to log in.
                </p>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Currently disabled
                    </p>
                  </div>
                  <Button onClick={() => setShowMfaSetup(true)}>
                    Enable
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Biometric Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Use your fingerprint, face, or voice to quickly and securely access your account.
                </p>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Biometric Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Currently disabled
                    </p>
                  </div>
                  <Button onClick={() => setShowBiometricSetup(true)}>
                    Enable
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Password</h3>
                <Button variant="outline">
                  Change Password
                </Button>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-muted-foreground">This device</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      {/* MFA Setup Modal */}
      {showMfaSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <MfaSetup onSetupComplete={handleMfaSetupComplete} />
        </div>
      )}
      
      {/* Biometric Setup Modal */}
      {showBiometricSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <BiometricSetup onSetupComplete={handleBiometricSetupComplete} />
        </div>
      )}
      
      <BottomNav />
    </div>
  );
}
import { ArrowLeft, User, Bell, Shield, Info } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import EmergencyButton from "@/components/EmergencyButton";
import ThemeToggle from "@/components/ThemeToggle";
import { useState } from "react";

export default function Profile() {
  const [notifications, setNotifications] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

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
                <span className="font-mono">v1.0.2</span>
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
      </main>
    </div>
  );
}

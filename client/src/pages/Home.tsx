import { useState } from "react";
import { Link } from "wouter";
import { Heart, Activity, MessageCircle, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import EmergencyButton from "@/components/EmergencyButton";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(
    localStorage.getItem("disclaimer_accepted") === "true"
  );

  const handleAcceptDisclaimer = () => {
    localStorage.setItem("disclaimer_accepted", "true");
    setDisclaimerAccepted(true);
  };

  const features = [
    {
      icon: Heart,
      title: "AI Risk Assessment",
      description: "Get personalized heart disease risk predictions powered by machine learning",
      link: "/predict"
    },
    {
      icon: Activity,
      title: "Health Tracking",
      description: "Monitor your vitals, medications, and lifestyle progress over time",
      link: "/health"
    },
    {
      icon: MessageCircle,
      title: "Health Assistant",
      description: "Chat with our AI assistant for personalized health guidance and support",
      link: "/chat"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <MedicalDisclaimer open={!disclaimerAccepted} onAccept={handleAcceptDisclaimer} />
      <EmergencyButton />

      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-xl font-[family-name:var(--font-sans)]">HeartGuard</h1>
              <p className="text-xs text-muted-foreground">AI Health Assistant</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-sans)]">
              Welcome to HeartGuard
            </h2>
            <p className="text-lg text-muted-foreground">
              Your comprehensive heart health monitoring and risk assessment platform
            </p>
          </div>

          <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg border">
            <Shield className="h-5 w-5 text-primary" />
            <p className="text-sm">
              <strong className="text-foreground">Privacy Protected:</strong> Your health data is encrypted and secure. For informational use only - not medical advice.
            </p>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover-elevate" data-testid={`feature-card-${index}`}>
                <CardHeader className="space-y-3 pb-4">
                  <div className="p-3 rounded-xl bg-primary/10 w-fit">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={feature.link}>
                    <Button className="w-full gap-2" data-testid={`button-${feature.link.slice(1)}`}>
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-bold font-[family-name:var(--font-sans)]">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Enter Health Data", desc: "Input your clinical information and vitals" },
              { step: "2", title: "AI Analysis", desc: "Our ML model assesses your risk factors" },
              { step: "3", title: "Get Recommendations", desc: "Receive personalized lifestyle guidance" },
              { step: "4", title: "Track Progress", desc: "Monitor your health journey over time" }
            ].map((item, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card space-y-2">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="max-w-2xl space-y-4">
            <h3 className="text-2xl font-bold">Ready to assess your heart health?</h3>
            <p className="text-muted-foreground">
              Take the first step towards better cardiovascular health. Our AI-powered assessment takes just 5 minutes.
            </p>
            <Link href="/predict">
              <Button size="lg" className="gap-2" data-testid="button-start-assessment">
                Start Assessment
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

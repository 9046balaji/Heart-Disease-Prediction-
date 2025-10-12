import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/ChatInterface";
import EmergencyButton from "@/components/EmergencyButton";
import ThemeToggle from "@/components/ThemeToggle";

export default function Chat() {
  const initialMessages = [
    {
      id: "1",
      role: "assistant" as const,
      content: "Hello! I'm your health assistant. I can help explain your risk assessment, suggest lifestyle changes, or answer general health questions. How can I help you today?"
    }
  ];

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
          <h1 className="font-bold text-xl font-[family-name:var(--font-sans)]">Health Assistant</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4 mb-6">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-sans)]">
            Chat with Health Assistant
          </h2>
          <p className="text-muted-foreground">
            Get answers to your health questions and personalized guidance
          </p>
        </div>

        <ChatInterface initialMessages={initialMessages} />
      </main>
    </div>
  );
}

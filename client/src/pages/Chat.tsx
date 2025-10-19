import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/ChatInterface";
import EmergencyButton from "@/components/EmergencyButton";
import ThemeToggle from "@/components/ThemeToggle";
import { useEffect, useState } from "react";

export default function Chat() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };
    
    // Initial check
    checkAuth();
    
    // Listen for storage changes (e.g., login/logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const initialMessages = [
    {
      id: "1",
      role: "assistant" as const,
      content: "Hello! I'm your health assistant. I can help explain your risk assessment, suggest lifestyle changes, or answer general health questions. How can I help you today?",
      timestamp: new Date()
    }
  ];

  return (
    <div className="min-h-screen bg-background">
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

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="space-y-4 mb-6">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-sans)]">
            Chat with Health Assistant
          </h2>
          <p className="text-muted-foreground">
            Get answers to your health questions and personalized guidance
          </p>
        </div>

        {isAuthenticated ? (
          <ChatInterface initialMessages={initialMessages} />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="max-w-md space-y-4">
              <h3 className="text-xl font-semibold">Authentication Required</h3>
              <p className="text-muted-foreground">
                Please sign in to access the health assistant chat.
              </p>
              <div className="flex gap-2 justify-center">
                <Link href="/login">
                  <Button>Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline">Create Account</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
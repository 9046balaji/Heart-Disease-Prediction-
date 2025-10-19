import { useState, useEffect } from "react";
import { Calendar, Clock, User, Users, Play, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { authenticatedFetch } from "@/utils/auth";

interface AMAEvent {
  id: string;
  title: string;
  description: string;
  expertName: string;
  expertTitle: string;
  expertBio: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  categoryId: string;
  maxParticipants: number;
  registeredParticipants: number;
  status: "scheduled" | "live" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export default function ScheduledAMAs() {
  const { toast } = useToast();
  const [amaEvents, setAmaEvents] = useState<AMAEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    fetchAMAEvents();
  }, []);

  const fetchAMAEvents = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch("/api/ama/events?status=scheduled");
      
      if (response.ok) {
        const events = await response.json();
        setAmaEvents(events);
      }
    } catch (error) {
      console.error("Error fetching AMA events:", error);
      toast({
        title: "Error",
        description: "Failed to fetch scheduled AMA events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (amaId: string) => {
    try {
      setRegistering(amaId);
      
      const response = await authenticatedFetch(`/api/ama/events/${amaId}/register`, {
        method: "POST"
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "You have been registered for this AMA event!"
        });
        
        // Update the event to show the user is registered
        setAmaEvents(prev => prev.map(event => 
          event.id === amaId 
            ? { ...event, registeredParticipants: event.registeredParticipants + 1 } 
            : event
        ));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to register for AMA event");
      }
    } catch (error: any) {
      console.error("Error registering for AMA event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to register for AMA event",
        variant: "destructive"
      });
    } finally {
      setRegistering(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "live": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="hover-elevate">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Scheduled Expert AMAs
        </CardTitle>
        <CardDescription>
          Join live Q&A sessions with heart health experts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {amaEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <p>No scheduled AMA events at the moment</p>
            <p className="text-sm mt-2">Check back later for upcoming expert sessions</p>
          </div>
        ) : (
          <div className="space-y-6">
            {amaEvents.map(event => (
              <div key={event.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-lg">{event.title}</h3>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{event.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{event.expertName}</span>
                        <span>•</span>
                        <span>{event.expertTitle}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{event.duration} min</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className="font-medium">
                        {new Date(event.scheduledDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {event.scheduledTime}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{event.registeredParticipants}/{event.maxParticipants}</span>
                      </div>
                      
                      {event.status === "live" ? (
                        <Button size="sm" className="gap-1">
                          <Play className="h-4 w-4" />
                          Join Now
                        </Button>
                      ) : event.status === "scheduled" ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleRegister(event.id)}
                          disabled={registering === event.id}
                        >
                          {registering === event.id ? (
                            <div className="flex items-center gap-1">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                              Registering...
                            </div>
                          ) : (
                            "Register"
                          )}
                        </Button>
                      ) : event.status === "completed" ? (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-4 w-4" />
                          Cancelled
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-sm">
                    <span className="font-medium">About the expert:</span> {event.expertBio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
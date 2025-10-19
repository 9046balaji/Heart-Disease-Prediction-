import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle, Info, X, Phone, Calendar, AlertCircle } from "lucide-react";

// Utility function to sanitize input
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

interface TriageAlert {
  id: string;
  userId: string;
  type: "warning" | "danger" | "info";
  title: string;
  message: string;
  recommendation: string;
  timestamp: string;
  read: boolean;
}

const TriageAlertBanner: React.FC = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<TriageAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch alerts on component mount
  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      // Check if token exists
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/triage/alerts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Failed to fetch alerts: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Validate the response data structure
      if (!result || !result.data) {
        throw new Error('Invalid response format from server');
      }
      
      setAlerts(result.data || []);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setError('Request timeout. Please check your connection and try again.');
        toast({
          title: "Request Timeout",
          description: "The request took too long to complete. Please try again.",
          variant: "destructive"
        });
      } else {
        setError(error.message || 'Failed to fetch health alerts. Please try again.');
        toast({
          title: "Error",
          description: error.message || "Failed to fetch health alerts. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case "danger":
        return "destructive";
      case "warning":
        return "default";
      case "info":
        return "default";
      default:
        return "default";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "danger":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleMarkAsRead = (id: string) => {
    // Sanitize input
    const sanitizedId = sanitizeInput(id);
    
    setAlerts(alerts.map(alert => 
      alert.id === sanitizedId ? { ...alert, read: true } : alert
    ));
  };

  const handleDismiss = (id: string) => {
    // Sanitize input
    const sanitizedId = sanitizeInput(id);
    
    setAlerts(alerts.filter(alert => alert.id !== sanitizedId));
  };

  const handleCallDoctor = () => {
    toast({
      title: "Contacting Doctor",
      description: "Connecting you to your healthcare provider...",
      variant: "default"
    });
    
    // In a real implementation, this would initiate a call or redirect to a contact page
    // For now, we'll just show a notification
  };

  const handleScheduleAppointment = () => {
    toast({
      title: "Schedule Appointment",
      description: "Redirecting to appointment scheduling...",
      variant: "default"
    });
    
    // In a real implementation, this would redirect to an appointment scheduling page
    // For now, we'll just show a notification
  };

  if (loading) {
    return <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      <span className="ml-2">Loading alerts...</span>
    </div>;
  }

  if (error) {
    return (
      <Card className="border-0 shadow-none">
        <CardContent className="p-0">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Alerts</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchAlerts}
                  className="text-destructive-foreground border-destructive-foreground hover:bg-destructive-foreground hover:text-destructive"
                >
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Filter unread alerts
  const unreadAlerts = alerts.filter(alert => !alert.read);
  
  // Show only the most recent alert if not showing all
  const alertsToShow = showAll ? unreadAlerts : unreadAlerts.slice(0, 1);

  if (unreadAlerts.length === 0) {
    return (
      <Card className="border-0 shadow-none">
        <CardContent className="p-0">
          <Alert variant="default" className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">All Clear</AlertTitle>
            <AlertDescription className="text-green-700">
              No immediate health concerns detected. Keep up the good work!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {alertsToShow.map((alert) => (
        <Card key={alert.id} className="border-0 shadow-md">
          <CardContent className="p-0">
            <Alert variant={getAlertVariant(alert.type) as any}>
              <div className="flex items-start">
                <div className={`mt-1 p-2 rounded-full ${getTypeColor(alert.type)}`}>
                  {getAlertIcon(alert.type)}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <AlertTitle className="flex items-center gap-2">
                      {alert.title}
                      <Badge variant="secondary" className={getTypeColor(alert.type)}>
                        {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                      </Badge>
                    </AlertTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(alert.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <AlertDescription className="mt-2">
                    {alert.message}
                  </AlertDescription>
                  {alert.recommendation && (
                    <div className="mt-3 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Recommendation:</p>
                      <p className="text-sm">{alert.recommendation}</p>
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleCallDoctor}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Doctor
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleScheduleAppointment}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDismiss(alert.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </Alert>
          </CardContent>
        </Card>
      ))}
      
      {unreadAlerts.length > 1 && !showAll && (
        <div className="text-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAll(true)}
          >
            View {unreadAlerts.length - 1} More Alerts
          </Button>
        </div>
      )}
      
      {showAll && (
        <div className="text-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAll(false)}
          >
            Show Less
          </Button>
        </div>
      )}
    </div>
  );
};

export default TriageAlertBanner;
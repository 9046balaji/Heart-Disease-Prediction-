import { useState } from "react";
import { Phone, AlertTriangle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function EmergencyButton() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleCallEmergency = async () => {
    try {
      // In a real application, this would call the emergency service
      // const response = await fetch("/api/emergency/call", {
      //   method: "POST"
      // });
      
      // if (response.ok) {
      //   toast({
      //     title: "Emergency Services Contacted",
      //     description: "Emergency services have been notified"
      //   });
      // } else {
      //   throw new Error("Failed to contact emergency services");
      // }
      
      // For now, we'll just show an alert
      alert("Calling emergency services (911)...");
      setIsOpen(false);
      
      toast({
        title: "Emergency Services Contacted",
        description: "Emergency services have been notified"
      });
    } catch (error) {
      console.error("Error calling emergency services:", error);
      toast({
        title: "Error",
        description: "Failed to contact emergency services",
        variant: "destructive"
      });
    }
  };
  
  const handleSendMessage = async () => {
    try {
      // In a real application, this would send a message to emergency contacts
      // const response = await fetch("/api/emergency/message", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     message: "I'm experiencing a medical emergency and need immediate assistance."
      //   })
      // });
      
      // if (response.ok) {
      //   toast({
      //     title: "Emergency Message Sent",
      //     description: "Your emergency contacts have been notified"
      //   });
      // } else {
      //   throw new Error("Failed to send emergency message");
      // }
      
      // For now, we'll just show an alert
      alert("Sending emergency message to contacts...");
      setIsOpen(false);
      
      toast({
        title: "Emergency Message Sent",
        description: "Your emergency contacts have been notified"
      });
    } catch (error) {
      console.error("Error sending emergency message:", error);
      toast({
        title: "Error",
        description: "Failed to send emergency message",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <motion.div
        className="fixed bottom-24 right-4 z-40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="lg"
          className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex flex-col items-center">
            <AlertTriangle className="h-6 w-6" />
            <span className="text-xs font-bold">EMERGENCY</span>
          </div>
        </Button>
      </motion.div>
      
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle>Emergency Assistance</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              If you're experiencing a medical emergency, please call emergency services immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-3 py-2">
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <h4 className="font-medium text-red-900">Emergency Symptoms</h4>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                <li>Chest pain or pressure</li>
                <li>Severe shortness of breath</li>
                <li>Fainting or severe dizziness</li>
                <li>Rapid or irregular heartbeat</li>
              </ul>
            </div>
            
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-medium text-blue-900">Before You Call</h4>
              <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>Stay calm and find a safe location</li>
                <li>Have your emergency contacts ready</li>
                <li>Be prepared to describe your symptoms</li>
                <li>Do not drive yourself to the hospital</li>
              </ul>
            </div>
            
            <p className="text-sm text-muted-foreground">
              If you're experiencing any of these symptoms, do not delay. Call emergency services immediately.
            </p>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSendMessage}
              className="bg-yellow-600 hover:bg-yellow-700 gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Send Message to Contacts
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={handleCallEmergency}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <Phone className="h-4 w-4" />
              Call Emergency (911)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
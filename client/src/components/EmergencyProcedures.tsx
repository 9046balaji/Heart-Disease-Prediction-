import React, { useState, useEffect } from "react";
import { 
  Phone, 
  PhoneOff, 
  UserPlus, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  Heart,
  Ambulance,
  MapPin,
  Clock,
  CheckCircle,
  X,
  Settings
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  isPrimary: boolean;
  createdAt: string;
}

interface EmergencyConfiguration {
  autoNotificationEnabled: boolean;
  notificationDelayMs: number;
  emergencyInstructions: string;
  customMessageTemplate: string;
}

interface EmergencyProceduresProps {
  userId: string;
  onEmergencyContactAdded?: (contact: EmergencyContact) => void;
  onEmergencyContactUpdated?: (contact: EmergencyContact) => void;
  onEmergencyContactDeleted?: (contactId: string) => void;
  onEmergencyCall?: () => void;
  onEmergencyMessage?: (message: string) => void;
}

const EmergencyProcedures: React.FC<EmergencyProceduresProps> = ({ 
  userId,
  onEmergencyContactAdded,
  onEmergencyContactUpdated,
  onEmergencyContactDeleted,
  onEmergencyCall,
  onEmergencyMessage
}) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [newContact, setNewContact] = useState({
    name: "",
    phoneNumber: "",
    relationship: "",
    isPrimary: false
  });
  const [emergencyConfig, setEmergencyConfig] = useState<EmergencyConfiguration>({
    autoNotificationEnabled: false,
    notificationDelayMs: 0,
    emergencyInstructions: "In case of a medical emergency, call 911 immediately. If you're unable to make a call, use the emergency message feature to notify your emergency contacts.",
    customMessageTemplate: "EMERGENCY: This is an automatic emergency notification. Please contact emergency services immediately."
  });
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  // Simulate fetching emergency contacts from API
  useEffect(() => {
    const fetchEmergencyContacts = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        // const response = await fetch(`/api/emergency/contacts?userId=${userId}`);
        // const data = await response.json();
        // setContacts(data.contacts);
        
        // Simulated data for demo
        const mockContacts: EmergencyContact[] = [
          {
            id: "1",
            name: "Dr. Sarah Johnson",
            phoneNumber: "+1 (555) 123-4567",
            relationship: "Doctor",
            isPrimary: true,
            createdAt: "2023-01-15T10:30:00Z"
          },
          {
            id: "2",
            name: "John Smith",
            phoneNumber: "+1 (555) 987-6543",
            relationship: "Spouse",
            isPrimary: false,
            createdAt: "2023-02-20T14:45:00Z"
          }
        ];
        
        setContacts(mockContacts);
      } catch (err) {
        setError("Failed to load emergency contacts");
        console.error("Error fetching emergency contacts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmergencyContacts();
  }, [userId]);

  // Fetch emergency configuration
  useEffect(() => {
    const fetchEmergencyConfiguration = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch(`/api/emergency/configuration?userId=${userId}`);
        // const data = await response.json();
        // setEmergencyConfig(data);
        
        // Simulated data for demo
        const mockConfig: EmergencyConfiguration = {
          autoNotificationEnabled: true,
          notificationDelayMs: 5000,
          emergencyInstructions: "In case of a medical emergency, call 911 immediately. If you're unable to make a call, use the emergency message feature to notify your emergency contacts.",
          customMessageTemplate: "EMERGENCY: This is an automatic emergency notification. Please contact emergency services immediately."
        };
        
        setEmergencyConfig(mockConfig);
      } catch (err) {
        console.error("Error fetching emergency configuration:", err);
      }
    };

    fetchEmergencyConfiguration();
  }, [userId]);

  const handleAddContact = async () => {
    try {
      if (!newContact.name || !newContact.phoneNumber) {
        setError("Name and phone number are required");
        return;
      }
      
      // In a real app, this would be an API call
      // const response = await fetch('/api/emergency/contacts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...newContact, userId })
      // });
      // const data = await response.json();
      
      // Simulated response
      const addedContact: EmergencyContact = {
        id: `contact-${Date.now()}`,
        ...newContact,
        createdAt: new Date().toISOString()
      };
      
      setContacts([...contacts, addedContact]);
      onEmergencyContactAdded?.(addedContact);
      setIsAddDialogOpen(false);
      setNewContact({ name: "", phoneNumber: "", relationship: "", isPrimary: false });
      setError(null);
    } catch (err) {
      setError("Failed to add emergency contact");
      console.error("Error adding emergency contact:", err);
    }
  };

  const handleUpdateContact = async () => {
    try {
      if (!editingContact) return;
      
      if (!editingContact.name || !editingContact.phoneNumber) {
        setError("Name and phone number are required");
        return;
      }
      
      // In a real app, this would be an API call
      // const response = await fetch(`/api/emergency/contacts/${editingContact.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editingContact)
      // });
      // const data = await response.json();
      
      // Simulated response
      const updatedContacts = contacts.map(contact => 
        contact.id === editingContact.id ? editingContact : contact
      );
      
      setContacts(updatedContacts);
      onEmergencyContactUpdated?.(editingContact);
      setIsEditDialogOpen(false);
      setEditingContact(null);
      setError(null);
    } catch (err) {
      setError("Failed to update emergency contact");
      console.error("Error updating emergency contact:", err);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/emergency/contacts/${contactId}`, { method: 'DELETE' });
      
      // Simulated response
      const updatedContacts = contacts.filter(contact => contact.id !== contactId);
      setContacts(updatedContacts);
      onEmergencyContactDeleted?.(contactId);
      setError(null);
    } catch (err) {
      setError("Failed to delete emergency contact");
      console.error("Error deleting emergency contact:", err);
    }
  };

  const handleCallEmergencyServices = () => {
    // In a real app, this would initiate a phone call
    // window.location.href = "tel:911";
    
    onEmergencyCall?.();
    setIsEmergencyDialogOpen(false);
  };

  const handleSendEmergencyMessage = async () => {
    try {
      if (!emergencyMessage.trim()) {
        setError("Please enter an emergency message");
        return;
      }
      
      // In a real app, this would be an API call
      // const response = await fetch('/api/emergency/message', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, message: emergencyMessage })
      // });
      
      onEmergencyMessage?.(emergencyMessage);
      setIsEmergencyDialogOpen(false);
      setEmergencyMessage("");
      setError(null);
    } catch (err) {
      setError("Failed to send emergency message");
      console.error("Error sending emergency message:", err);
    }
  };

  const handleEnhancedEmergencyNotification = async () => {
    try {
      // In a real app, this would be an API call to the enhanced notification endpoint
      // const response = await fetch('/api/emergency/enhanced-notification', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      // });
      // const data = await response.json();
      
      // For demo purposes, we'll simulate the enhanced notification
      const mockEnhancedMessage = "ENHANCED EMERGENCY: This is an automatic emergency notification with medical information and location. Please contact emergency services immediately.";
      
      onEmergencyMessage?.(mockEnhancedMessage);
      setIsEmergencyDialogOpen(false);
      setError(null);
      
      // Show success message
      alert("Enhanced emergency notification sent to all contacts with medical information and location data.");
    } catch (err) {
      setError("Failed to send enhanced emergency notification");
      console.error("Error sending enhanced emergency notification:", err);
    }
  };

  const handleUpdateConfiguration = async () => {
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/emergency/configuration', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...emergencyConfig, userId })
      // });
      // const data = await response.json();
      
      // Simulated response
      console.log("Emergency configuration updated:", emergencyConfig);
      setIsConfigDialogOpen(false);
      setError(null);
    } catch (err) {
      setError("Failed to update emergency configuration");
      console.error("Error updating emergency configuration:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Ambulance className="h-8 w-8 text-red-600" />
            Emergency Procedures
          </h1>
          <p className="text-muted-foreground">
            Manage emergency contacts and procedures
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Emergency Configuration</DialogTitle>
                <DialogDescription>
                  Configure your emergency notification settings and preferences
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-notification">Automatic Emergency Notification</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable automatic notification to emergency contacts during critical situations
                      </p>
                    </div>
                    <Switch
                      id="auto-notification"
                      checked={emergencyConfig.autoNotificationEnabled}
                      onCheckedChange={(checked) => 
                        setEmergencyConfig({...emergencyConfig, autoNotificationEnabled: checked})
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notification-delay">Notification Delay (seconds)</Label>
                    <Input
                      id="notification-delay"
                      type="number"
                      min="0"
                      max="300"
                      value={emergencyConfig.notificationDelayMs / 1000}
                      onChange={(e) => 
                        setEmergencyConfig({
                          ...emergencyConfig, 
                          notificationDelayMs: parseInt(e.target.value) * 1000 || 0
                        })
                      }
                      placeholder="0"
                    />
                    <p className="text-sm text-muted-foreground">
                      Delay before sending automatic notifications (0 = immediate)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="custom-message">Custom Message Template</Label>
                    <textarea
                      id="custom-message"
                      value={emergencyConfig.customMessageTemplate}
                      onChange={(e) => 
                        setEmergencyConfig({...emergencyConfig, customMessageTemplate: e.target.value})
                      }
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter your custom emergency message template..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateConfiguration}>
                    Save Configuration
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Emergency Contact</DialogTitle>
                <DialogDescription>
                  Add a new emergency contact to your profile
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Full Name</Label>
                  <Input
                    id="contact-name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    placeholder="e.g., Dr. Sarah Johnson"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <Input
                    id="phone-number"
                    value={newContact.phoneNumber}
                    onChange={(e) => setNewContact({...newContact, phoneNumber: e.target.value})}
                    placeholder="e.g., +1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                    placeholder="e.g., Doctor, Spouse, Friend"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-primary"
                    checked={newContact.isPrimary}
                    onChange={(e) => setNewContact({...newContact, isPrimary: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="is-primary">Primary Emergency Contact</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddContact}>
                    Add Contact
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isEmergencyDialogOpen} onOpenChange={setIsEmergencyDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Emergency Services
                </DialogTitle>
                <DialogDescription>
                  Contact emergency services or send an emergency message to your contacts
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    variant="destructive" 
                    size="lg"
                    onClick={handleCallEmergencyServices}
                    className="h-20 flex flex-col gap-2"
                  >
                    <Phone className="h-6 w-6" />
                    <span>Call 911</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => {
                      setEmergencyMessage("I'm having a medical emergency and need immediate assistance.");
                    }}
                    className="h-20 flex flex-col gap-2"
                  >
                    <PhoneOff className="h-6 w-6" />
                    <span>Send Message</span>
                  </Button>
                </div>
                
                {/* Enhanced notification button */}
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={handleEnhancedEmergencyNotification}
                  className="w-full h-16 flex flex-col gap-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
                >
                  <AlertTriangle className="h-6 w-6" />
                  <span>Enhanced Notification</span>
                </Button>
                
                <div className="space-y-2">
                  <Label htmlFor="emergency-message">Emergency Message</Label>
                  <textarea
                    id="emergency-message"
                    value={emergencyMessage}
                    onChange={(e) => setEmergencyMessage(e.target.value)}
                    placeholder="Enter your emergency message..."
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    This message will be sent to all your emergency contacts
                  </p>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEmergencyDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSendEmergencyMessage}
                    disabled={!emergencyMessage.trim()}
                  >
                    Send Message
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Emergency Instructions */}
      <Alert>
        <Heart className="h-4 w-4" />
        <AlertTitle>Emergency Instructions</AlertTitle>
        <AlertDescription>
          {emergencyConfig.emergencyInstructions}
        </AlertDescription>
      </Alert>

      {/* Emergency Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Emergency Contacts
          </CardTitle>
          <CardDescription>
            Your designated emergency contacts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No Emergency Contacts</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add emergency contacts to notify in case of an emergency.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Your First Contact
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {contact.isPrimary && (
                          <Badge variant="default" className="text-xs">
                            Primary
                          </Badge>
                        )}
                        {contact.name}
                      </div>
                    </TableCell>
                    <TableCell>{contact.phoneNumber}</TableCell>
                    <TableCell>{contact.relationship}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingContact(contact);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Emergency Contact</DialogTitle>
            <DialogDescription>
              Update your emergency contact information
            </DialogDescription>
          </DialogHeader>
          {editingContact && (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="edit-contact-name">Full Name</Label>
                <Input
                  id="edit-contact-name"
                  value={editingContact.name}
                  onChange={(e) => setEditingContact({...editingContact, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone-number">Phone Number</Label>
                <Input
                  id="edit-phone-number"
                  value={editingContact.phoneNumber}
                  onChange={(e) => setEditingContact({...editingContact, phoneNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-relationship">Relationship</Label>
                <Input
                  id="edit-relationship"
                  value={editingContact.relationship}
                  onChange={(e) => setEditingContact({...editingContact, relationship: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-is-primary"
                  checked={editingContact.isPrimary}
                  onChange={(e) => setEditingContact({...editingContact, isPrimary: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="edit-is-primary">Primary Emergency Contact</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateContact}>
                  Update Contact
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Emergency Procedures Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Emergency Procedures Guide
          </CardTitle>
          <CardDescription>
            Steps to take during a medical emergency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-800 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium">Call 911 Immediately</h4>
                <p className="text-sm text-muted-foreground">
                  If you're experiencing chest pain, difficulty breathing, or severe symptoms, 
                  call 911 right away.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-800 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium">Notify Emergency Contacts</h4>
                <p className="text-sm text-muted-foreground">
                  If you're unable to call 911, use the emergency message feature to 
                  notify your emergency contacts.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-800 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium">Stay Calm and Follow Instructions</h4>
                <p className="text-sm text-muted-foreground">
                  Follow instructions from emergency responders and try to remain calm 
                  while waiting for help to arrive.
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Important Notes
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-yellow-700">
                <li>• Keep your emergency contacts updated with current information</li>
                <li>• Store this app on your home screen for quick access</li>
                <li>• Ensure your phone can make emergency calls even when locked</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EmergencyProcedures;
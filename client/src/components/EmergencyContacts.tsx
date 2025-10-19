import { useState, useEffect } from "react";
import { Phone, User, Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  isPrimary: boolean;
  createdAt: string;
}

export default function EmergencyContacts() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    relationship: "",
    isPrimary: false
  });

  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  const fetchEmergencyContacts = async () => {
    try {
      // In a real implementation, this would fetch from the API
      // const response = await fetch("/api/emergency/contacts");
      // const data = await response.json();
      // setContacts(data);
      
      // For now, using mock data
      setTimeout(() => {
        setContacts([
          {
            id: "1",
            name: "Sarah Johnson",
            phoneNumber: "+1 (555) 123-4567",
            relationship: "spouse",
            isPrimary: true,
            createdAt: "2025-10-01T10:00:00Z"
          },
          {
            id: "2",
            name: "Dr. Michael Chen",
            phoneNumber: "+1 (555) 987-6543",
            relationship: "doctor",
            isPrimary: false,
            createdAt: "2025-10-01T10:00:00Z"
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch emergency contacts",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real implementation, this would call the API
      // const response = await fetch("/api/emergency/contacts", {
      //   method: editingContact ? "PUT" : "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     ...formData,
      //     ...(editingContact && { contactId: editingContact.id })
      //   })
      // });
      
      // if (!response.ok) {
      //   throw new Error("Failed to save emergency contact");
      // }
      
      // Reset form and refresh contacts
      setFormData({
        name: "",
        phoneNumber: "",
        relationship: "",
        isPrimary: false
      });
      setEditingContact(null);
      setIsDialogOpen(false);
      
      // Refresh contacts
      fetchEmergencyContacts();
      
      toast({
        title: "Success",
        description: editingContact 
          ? "Emergency contact updated successfully" 
          : "Emergency contact added successfully"
      });
    } catch (error) {
      console.error("Error saving emergency contact:", error);
      toast({
        title: "Error",
        description: "Failed to save emergency contact",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (contactId: string) => {
    try {
      // In a real implementation, this would call the API
      // const response = await fetch(`/api/emergency/contacts/${contactId}`, {
      //   method: "DELETE"
      // });
      
      // if (!response.ok) {
      //   throw new Error("Failed to delete emergency contact");
      // }
      
      // Refresh contacts
      fetchEmergencyContacts();
      
      toast({
        title: "Success",
        description: "Emergency contact deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting emergency contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete emergency contact",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      relationship: contact.relationship,
      isPrimary: contact.isPrimary
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingContact(null);
    setFormData({
      name: "",
      phoneNumber: "",
      relationship: "",
      isPrimary: false
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Emergency Contacts</h3>
          <p className="text-sm text-muted-foreground">
            Manage your emergency contacts for quick access during critical situations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingContact ? "Edit Emergency Contact" : "Add Emergency Contact"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Select 
                  value={formData.relationship} 
                  onValueChange={(value) => setFormData({...formData, relationship: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse/Partner</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({...formData, isPrimary: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isPrimary">Primary Emergency Contact</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingContact ? "Update Contact" : "Add Contact"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Emergency contacts will be notified during critical situations. Make sure to keep this 
          information up to date and inform your contacts that they may receive emergency messages 
          from this application.
        </AlertDescription>
      </Alert>
      
      {loading ? (
        <div className="p-8 text-center">
          <p>Loading emergency contacts...</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="p-8 text-center border rounded-lg">
          <User className="h-12 w-12 mx-auto text-muted-foreground" />
          <h4 className="mt-2 font-medium">No emergency contacts</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Add emergency contacts for quick access during critical situations
          </p>
          <Button onClick={openAddDialog} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Add First Contact
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Relationship</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {contact.phoneNumber}
                  </div>
                </TableCell>
                <TableCell>
                  {contact.relationship.charAt(0).toUpperCase() + contact.relationship.slice(1)}
                </TableCell>
                <TableCell>
                  {contact.isPrimary ? (
                    <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                      Primary
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                      Secondary
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditDialog(contact)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(contact.id)}
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
    </div>
  );
}
import { useState, useEffect } from "react";
import { Calendar, Clock, User, Phone, MapPin, Star, Plus, Edit, Trash2, FileText, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ClinicalSummaryExport from "@/components/ClinicalSummaryExport";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  address: string;
  phone: string;
  availableDays: string[];
  rating: number;
}

interface TeleConsultBooking {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  appointmentDate: string;
  appointmentTime: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TeleConsultBooking() {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookings, setBookings] = useState<TeleConsultBooking[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isVirtualVisit, setIsVirtualVisit] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    doctorName: "",
    doctorSpecialty: "",
    appointmentDate: "",
    appointmentTime: "",
    notes: ""
  });
  
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate fetching doctors
    const mockDoctors: Doctor[] = [
      {
        id: "1",
        name: "Dr. Rajesh Sharma",
        specialty: "Cardiologist",
        hospital: "Apollo Hospitals",
        address: "Plot No. 10, Financial District, Hyderabad",
        phone: "+91 40 2360 7777",
        availableDays: ["Monday", "Wednesday", "Friday"],
        rating: 4.8
      },
      {
        id: "2",
        name: "Dr. Priya Patel",
        specialty: "Interventional Cardiologist",
        hospital: "Fortis Hospital",
        address: "Sector 62, Noida",
        phone: "+91 120 475 7777",
        availableDays: ["Tuesday", "Thursday", "Saturday"],
        rating: 4.9
      },
      {
        id: "3",
        name: "Dr. Amit Kumar",
        specialty: "Pediatric Cardiologist",
        hospital: "Medanta - The Medicity",
        address: "Sector 38, Gurgaon",
        phone: "+91 124 414 1414",
        availableDays: ["Monday", "Tuesday", "Thursday"],
        rating: 4.7
      }
    ];
    
    // Simulate fetching bookings
    const mockBookings: TeleConsultBooking[] = [
      {
        id: "1",
        doctorName: "Dr. Rajesh Sharma",
        doctorSpecialty: "Cardiologist",
        appointmentDate: "2025-10-20",
        appointmentTime: "10:30",
        status: "scheduled",
        notes: "Follow-up on blood pressure medication",
        createdAt: "2025-10-10T09:30:00Z",
        updatedAt: "2025-10-10T09:30:00Z"
      }
    ];
    
    setDoctors(mockDoctors);
    setBookings(mockBookings);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDoctorSelect = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
      setFormData(prev => ({
        ...prev,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.doctorName || !formData.appointmentDate || !formData.appointmentTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isEditing && editingBookingId) {
        // Update existing booking
        const response = await fetch(`/api/tele-consult/bookings/${editingBookingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update booking");
        }
        
        const updatedBooking = await response.json();
        
        setBookings(prev => prev.map(booking => 
          booking.id === editingBookingId ? updatedBooking : booking
        ));
        
        toast({
          title: "Success",
          description: "Tele-consult booking updated successfully"
        });
      } else {
        // Add new booking or virtual visit
        const endpoint = isVirtualVisit 
          ? "/api/tele-consult/virtual-visit" 
          : "/api/tele-consult/bookings";
          
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create booking");
        }
        
        const newBooking = await response.json();
        
        setBookings(prev => [...prev, newBooking]);
        
        toast({
          title: "Success",
          description: isVirtualVisit 
            ? "Virtual visit scheduled successfully" 
            : "Tele-consult booking created successfully"
        });
      }
      
      // Reset form
      setFormData({
        doctorName: "",
        doctorSpecialty: "",
        appointmentDate: "",
        appointmentTime: "",
        notes: ""
      });
      setSelectedDoctor(null);
      setIsDialogOpen(false);
      setIsEditing(false);
      setIsVirtualVisit(false);
      setEditingBookingId(null);
    } catch (error: any) {
      console.error("Error handling booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process booking request",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (booking: TeleConsultBooking) => {
    setFormData({
      doctorName: booking.doctorName,
      doctorSpecialty: booking.doctorSpecialty,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      notes: booking.notes || ""
    });
    
    // Find and select the doctor
    const doctor = doctors.find(d => d.name === booking.doctorName);
    if (doctor) {
      setSelectedDoctor(doctor);
    }
    
    setIsEditing(true);
    setEditingBookingId(booking.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (bookingId: string) => {
    setBookings(prev => prev.filter(booking => booking.id !== bookingId));
    toast({
      title: "Success",
      description: "Tele-consult booking deleted successfully"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover-elevate">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Tele-consult Booking
            </CardTitle>
            <CardDescription>
              Schedule appointments with cardiologists
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div className="flex gap-2">
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  onClick={() => {
                    setIsEditing(false);
                    setIsVirtualVisit(false);
                    setEditingBookingId(null);
                    setFormData({
                      doctorName: "",
                      doctorSpecialty: "",
                      appointmentDate: "",
                      appointmentTime: "",
                      notes: ""
                    });
                    setSelectedDoctor(null);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </DialogTrigger>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setIsVirtualVisit(true);
                    setEditingBookingId(null);
                    setFormData({
                      doctorName: "",
                      doctorSpecialty: "Cardiologist",
                      appointmentDate: "",
                      appointmentTime: "",
                      notes: ""
                    });
                    setSelectedDoctor(null);
                  }}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Virtual Visit
                </Button>
              </DialogTrigger>
            </div>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {isEditing 
                    ? "Edit Booking" 
                    : isVirtualVisit 
                      ? "Schedule Virtual Visit" 
                      : "Book Tele-consult"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing 
                    ? "Update your appointment details" 
                    : isVirtualVisit 
                      ? "Schedule a new virtual visit with your cardiologist" 
                      : "Schedule a new tele-consult appointment"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor">Select Doctor</Label>
                  <Select 
                    value={selectedDoctor?.id || ""} 
                    onValueChange={handleDoctorSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map(doctor => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{doctor.name}</div>
                              <div className="text-xs text-muted-foreground">{doctor.specialty}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedDoctor && (
                  <div className="p-3 rounded-lg bg-muted space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{selectedDoctor.rating}</span>
                    </div>
                    <div className="text-sm">{selectedDoctor.hospital}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{selectedDoctor.address}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{selectedDoctor.phone}</span>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointmentDate">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="appointmentDate"
                        name="appointmentDate"
                        type="date"
                        value={formData.appointmentDate}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="appointmentTime">Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="appointmentTime"
                        name="appointmentTime"
                        type="time"
                        value={formData.appointmentTime}
                        onChange={handleInputChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any specific concerns or questions for the doctor..."
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditing 
                      ? "Update Booking" 
                      : isVirtualVisit 
                        ? "Schedule Virtual Visit" 
                        : "Book Appointment"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <ClinicalSummaryExport />
        </div>
        {bookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-4" />
            <p>No tele-consult appointments booked yet</p>
            <p className="text-sm mt-2">Schedule your first appointment with a cardiologist</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{booking.doctorName}</h4>
                    <Badge variant="outline" className="text-xs">
                      {booking.doctorSpecialty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{booking.appointmentDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{booking.appointmentTime}</span>
                    </div>
                  </div>
                  {booking.notes && (
                    <p className="text-sm mt-2">{booking.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                  <div className="flex gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleEdit(booking)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleDelete(booking.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
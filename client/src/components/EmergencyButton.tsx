import { AlertCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function EmergencyButton() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="destructive"
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-xl z-50 hover:scale-105 transition-transform"
          data-testid="button-emergency"
        >
          <AlertCircle className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl" data-testid="sheet-emergency">
        <SheetHeader>
          <SheetTitle className="text-xl text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Emergency Actions
          </SheetTitle>
          <SheetDescription className="text-base pt-2">
            If you're experiencing severe symptoms, take immediate action
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-3 pt-6 pb-4">
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-sm font-medium mb-3">
              Call emergency services immediately if experiencing:
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Chest pain or pressure</li>
              <li>• Severe shortness of breath</li>
              <li>• Dizziness or fainting</li>
              <li>• Rapid or irregular heartbeat</li>
            </ul>
          </div>

          <Button 
            variant="destructive" 
            className="w-full h-14 text-lg gap-2"
            onClick={() => window.open('tel:911', '_self')}
            data-testid="button-call-emergency"
          >
            <Phone className="h-5 w-5" />
            Call Emergency Services
          </Button>

          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => console.log('Notify emergency contact')}
            data-testid="button-notify-contact"
          >
            <Phone className="h-4 w-4" />
            Notify Emergency Contact
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

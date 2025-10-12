import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MedicalDisclaimerProps {
  open: boolean;
  onAccept: () => void;
}

export default function MedicalDisclaimer({ open, onAccept }: MedicalDisclaimerProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl" data-testid="modal-disclaimer">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-2xl">Important Medical Disclaimer</DialogTitle>
          </div>
          <DialogDescription className="text-base leading-relaxed space-y-4 pt-4">
            <p className="font-medium text-foreground">
              This application is for informational and educational purposes only. It is NOT a medical device and should NOT be used as a substitute for professional medical advice, diagnosis, or treatment.
            </p>
            
            <div className="space-y-3 text-muted-foreground">
              <p>
                <strong className="text-foreground">Risk Predictions:</strong> The AI-powered risk assessments are based on statistical models and may not account for all individual health factors. They should be considered as general guidance only.
              </p>
              
              <p>
                <strong className="text-foreground">Always Seek Professional Care:</strong> If you experience chest pain, shortness of breath, or other concerning symptoms, seek immediate medical attention. Call emergency services right away.
              </p>
              
              <p>
                <strong className="text-foreground">Lifestyle Recommendations:</strong> Diet, exercise, and medication guidance provided are general suggestions. Consult your healthcare provider before making any changes to your health routine.
              </p>
              
              <p>
                <strong className="text-foreground">Data Privacy:</strong> Your health information is stored securely and used only for providing personalized recommendations. You can opt out of research data sharing in settings.
              </p>
            </div>

            <p className="font-semibold text-foreground pt-2">
              By continuing, you acknowledge that you understand this tool is for informational purposes only and will consult healthcare professionals for medical decisions.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button 
            onClick={onAccept}
            className="w-full sm:w-auto"
            data-testid="button-accept-disclaimer"
          >
            I Understand and Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

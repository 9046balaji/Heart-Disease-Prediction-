import { useState, useEffect } from "react";
import { AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface MedicalDisclaimerProps {
  open: boolean;
  onAccept: () => void;
}

export default function MedicalDisclaimer({ open, onAccept }: MedicalDisclaimerProps) {
  const [accepted, setAccepted] = useState(false);
  
  // Check if user has already accepted the disclaimer
  useEffect(() => {
    const hasAccepted = localStorage.getItem("disclaimer_accepted") === "true";
    if (hasAccepted) {
      setAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("disclaimer_accepted", "true");
    setAccepted(true);
    onAccept();
  };

  if (!open || accepted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-yellow-100">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle className="text-xl">Medical Disclaimer</CardTitle>
          </div>
          <CardDescription>
            Important information about the use of this application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900">Informational Use Only</h3>
                <p className="text-sm text-blue-700 mt-1">
                  This application provides heart disease risk assessments for informational purposes only. 
                  It is not a substitute for professional medical advice, diagnosis, or treatment.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium">Important:</span> The information provided by this application 
              should not be used as a sole basis for making medical decisions. Always consult with a 
              qualified healthcare professional for any medical concerns.
            </p>
            
            <div className="space-y-2">
              <h4 className="font-medium">Limitations</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>The risk assessment is based on a predictive model and cannot guarantee accuracy</li>
                <li>Individual results may vary and should be interpreted by a healthcare professional</li>
                <li>This application does not replace regular medical check-ups and screenings</li>
                <li>Emergency situations require immediate professional medical attention</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Emergency Situations</h4>
              <p>
                If you experience any of the following symptoms, seek immediate medical attention:
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Chest pain or pressure</li>
                <li>Severe shortness of breath</li>
                <li>Fainting or severe dizziness</li>
                <li>Rapid or irregular heartbeat</li>
                <li>Severe nausea or sweating</li>
              </ul>
            </div>
            
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Warning:</span> This application is not a medical device 
                and has not been evaluated by regulatory authorities for medical use. 
                The developers are not responsible for any decisions made based on the information provided.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <Checkbox 
              id="accept-disclaimer" 
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
            />
            <label 
              htmlFor="accept-disclaimer" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and understood this disclaimer
            </label>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleAccept}
            disabled={!accepted}
            className="w-full"
          >
            Accept and Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
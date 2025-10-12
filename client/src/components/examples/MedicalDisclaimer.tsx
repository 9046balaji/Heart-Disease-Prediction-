import { useState } from "react";
import MedicalDisclaimer from "../MedicalDisclaimer";

export default function MedicalDisclaimerExample() {
  const [open, setOpen] = useState(true);
  
  return (
    <>
      <MedicalDisclaimer 
        open={open} 
        onAccept={() => {
          setOpen(false);
          console.log("Disclaimer accepted");
        }} 
      />
      {!open && (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Disclaimer accepted</p>
        </div>
      )}
    </>
  );
}

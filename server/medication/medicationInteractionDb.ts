// Medication interaction database
// This file contains known medication interactions that could be dangerous

export interface MedicationInteraction {
  id: string;
  medicationA: string;
  medicationB: string;
  severity: "mild" | "moderate" | "severe";
  description: string;
  recommendation: string;
  clinicianVerificationRequired: boolean;
}

// Known medication interactions
export const MEDICATION_INTERACTIONS: MedicationInteraction[] = [
  {
    id: "1",
    medicationA: "Warfarin",
    medicationB: "Aspirin",
    severity: "severe",
    description: "Increased risk of bleeding",
    recommendation: "Avoid concurrent use or monitor closely with regular INR checks",
    clinicianVerificationRequired: true
  },
  {
    id: "2",
    medicationA: "Lisinopril",
    medicationB: "Potassium Supplements",
    severity: "severe",
    description: "Increased risk of hyperkalemia",
    recommendation: "Avoid concurrent use or monitor potassium levels closely",
    clinicianVerificationRequired: true
  },
  {
    id: "3",
    medicationA: "Simvastatin",
    medicationB: "Grapefruit Juice",
    severity: "moderate",
    description: "Increased risk of statin-induced myopathy",
    recommendation: "Avoid grapefruit juice or reduce statin dose",
    clinicianVerificationRequired: false
  },
  {
    id: "4",
    medicationA: "Metformin",
    medicationB: "Contrast Dye",
    severity: "moderate",
    description: "Risk of lactic acidosis",
    recommendation: "Hold metformin before and after contrast procedure",
    clinicianVerificationRequired: true
  },
  {
    id: "5",
    medicationA: "Digoxin",
    medicationB: "Amiodarone",
    severity: "severe",
    description: "Increased digoxin levels, risk of toxicity",
    recommendation: "Reduce digoxin dose by 50% and monitor levels",
    clinicianVerificationRequired: true
  },
  {
    id: "6",
    medicationA: "Clopidogrel",
    medicationB: "Omeprazole",
    severity: "moderate",
    description: "Reduced effectiveness of clopidogrel",
    recommendation: "Consider alternative PPI or monitor for reduced efficacy",
    clinicianVerificationRequired: true
  },
  {
    id: "7",
    medicationA: "Fluconazole",
    medicationB: "Warfarin",
    severity: "moderate",
    description: "Increased INR, risk of bleeding",
    recommendation: "Monitor INR closely and adjust warfarin dose",
    clinicianVerificationRequired: true
  },
  {
    id: "8",
    medicationA: "Sertraline",
    medicationB: "Tramadol",
    severity: "moderate",
    description: "Increased risk of serotonin syndrome",
    recommendation: "Monitor for signs of serotonin syndrome",
    clinicianVerificationRequired: true
  },
  {
    id: "9",
    medicationA: "Allopurinol",
    medicationB: "Azathioprine",
    severity: "severe",
    description: "Increased risk of myelosuppression",
    recommendation: "Reduce azathioprine dose by 75%",
    clinicianVerificationRequired: true
  },
  {
    id: "10",
    medicationA: "Calcium Carbonate",
    medicationB: "Levothyroxine",
    severity: "mild",
    description: "Reduced absorption of levothyroxine",
    recommendation: "Separate administration by at least 4 hours",
    clinicianVerificationRequired: false
  }
];

// Function to check for interactions between two medications
export function checkMedicationInteraction(medicationA: string, medicationB: string): MedicationInteraction | null {
  // Normalize medication names to lowercase for comparison
  const normalizedA = medicationA.toLowerCase().trim();
  const normalizedB = medicationB.toLowerCase().trim();
  
  // Check for direct interactions
  for (const interaction of MEDICATION_INTERACTIONS) {
    const medA = interaction.medicationA.toLowerCase().trim();
    const medB = interaction.medicationB.toLowerCase().trim();
    
    if ((medA === normalizedA && medB === normalizedB) || 
        (medA === normalizedB && medB === normalizedA)) {
      return interaction;
    }
  }
  
  return null;
}

// Function to check for interactions in a list of medications
export function checkMultipleMedicationInteractions(medications: string[]): MedicationInteraction[] {
  const interactions: MedicationInteraction[] = [];
  
  // Check all pairs of medications
  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const interaction = checkMedicationInteraction(medications[i], medications[j]);
      if (interaction) {
        interactions.push(interaction);
      }
    }
  }
  
  return interactions;
}

// Function to get interactions that require clinician verification
export function getClinicianVerificationInteractions(medications: string[]): MedicationInteraction[] {
  const allInteractions = checkMultipleMedicationInteractions(medications);
  return allInteractions.filter(interaction => interaction.clinicianVerificationRequired);
}
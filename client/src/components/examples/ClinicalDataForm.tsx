import ClinicalDataForm from "../ClinicalDataForm";

export default function ClinicalDataFormExample() {
  return (
    <ClinicalDataForm 
      onSubmit={(data) => console.log('Form submitted:', data)} 
    />
  );
}

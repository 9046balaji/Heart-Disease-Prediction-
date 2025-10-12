import ShapExplanation from "../ShapExplanation";

export default function ShapExplanationExample() {
  const mockFeatures = [
    {
      feature: "Systolic Blood Pressure",
      contribution: 15.2,
      direction: "positive" as const,
      explanation: "Your blood pressure of 160 mmHg is elevated. High blood pressure is a major risk factor for heart disease. Reducing salt intake and regular exercise can help lower it."
    },
    {
      feature: "Age",
      contribution: 12.8,
      direction: "positive" as const,
      explanation: "Age is a non-modifiable risk factor. As we age, the risk of heart disease naturally increases due to cumulative exposure to risk factors and arterial changes."
    },
    {
      feature: "Cholesterol Level",
      contribution: -8.5,
      direction: "negative" as const,
      explanation: "Your cholesterol level of 180 mg/dL is within the healthy range, which helps reduce cardiovascular risk. Continue maintaining a heart-healthy diet."
    }
  ];

  return <ShapExplanation features={mockFeatures} />;
}

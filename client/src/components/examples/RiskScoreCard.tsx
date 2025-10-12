import RiskScoreCard from "../RiskScoreCard";

export default function RiskScoreCardExample() {
  return (
    <div className="grid gap-6">
      <RiskScoreCard score={28} category="low" />
      <RiskScoreCard score={55} category="medium" />
      <RiskScoreCard score={82} category="high" />
    </div>
  );
}

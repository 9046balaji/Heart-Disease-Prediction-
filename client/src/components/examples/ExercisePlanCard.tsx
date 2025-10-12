import ExercisePlanCard from "../ExercisePlanCard";

export default function ExercisePlanCardExample() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <ExercisePlanCard
        level="beginner"
        duration={15}
        weeklyGoal="3x per week"
        exercises={[
          "Day 1: 10-minute brisk walk",
          "Day 2: Gentle stretching (10 min)",
          "Day 3: 15-minute walk at comfortable pace",
          "Day 4: Rest day",
          "Day 5: Light chair exercises"
        ]}
      />
      <ExercisePlanCard
        level="intermediate"
        duration={30}
        weeklyGoal="5x per week"
        exercises={[
          "Day 1: 20-minute brisk walk + light strength",
          "Day 2: 30-minute moderate cardio",
          "Day 3: Resistance training",
          "Day 4: 25-minute interval walking",
          "Day 5: Flexibility and balance exercises"
        ]}
      />
    </div>
  );
}

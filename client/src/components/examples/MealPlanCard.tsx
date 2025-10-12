import MealPlanCard from "../MealPlanCard";

export default function MealPlanCardExample() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <MealPlanCard
        title="Heart-Healthy DASH Diet"
        description="Low-sodium meal plan designed for cardiovascular health"
        calories={1800}
        prepTime={30}
        tags={["Low Sodium", "High Fiber", "Vegetarian"]}
        meals={[
          "Oat porridge with berries and flaxseed",
          "Grilled salmon with quinoa and steamed broccoli",
          "Mixed bean salad with olive oil dressing",
          "Greek yogurt with almonds"
        ]}
      />
      <MealPlanCard
        title="Mediterranean Diet Plan"
        description="Heart-protective diet rich in healthy fats and whole grains"
        calories={2000}
        prepTime={35}
        tags={["Heart-Healthy", "Anti-inflammatory", "Pescatarian"]}
        meals={[
          "Whole grain toast with avocado and tomatoes",
          "Lentil soup with whole wheat bread",
          "Baked fish with roasted vegetables",
          "Fresh fruit and unsalted nuts"
        ]}
      />
    </div>
  );
}

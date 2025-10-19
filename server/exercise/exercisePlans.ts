import { storage } from "../storage";
import { ClinicalEntry, Prediction } from "@shared/schema";

// Define exercise plan types
export interface Exercise {
  name: string;
  description: string;
  duration: number; // in minutes
  intensity: "low" | "moderate" | "high";
  equipmentNeeded: string[];
  instructions: string[];
  safetyNotes: string[];
  videoUrl?: string;
}

export interface DailyExercisePlan {
  day: number;
  exercises: Exercise[];
  totalDuration: number;
  focus: string; // e.g., "cardio", "strength", "flexibility"
  warmup: Exercise[];
  cooldown: Exercise[];
}

export interface PersonalizedExercisePlan {
  id: string;
  userId: string;
  level: "beginner" | "intermediate" | "advanced";
  name: string;
  description: string;
  duration: number; // in weeks
  dailyPlans: DailyExercisePlan[];
  healthConditions: string[]; // e.g., "hypertension", "diabetes"
  createdAt: Date;
}

// Exercise plan generator service
export class ExercisePlanService {
  // Generate a personalized exercise plan based on user data
  public async generatePersonalizedExercisePlan(
    userId: string,
    clinicalEntry: ClinicalEntry,
    prediction: Prediction,
    healthConditions: string[] = []
  ): Promise<PersonalizedExercisePlan> {
    // Determine exercise level based on risk factors and health conditions
    const level = this.determineExerciseLevel(prediction, healthConditions, clinicalEntry);
    
    // Generate 4-week exercise plan (progressive)
    const dailyPlans: DailyExercisePlan[] = [];
    const weeks = 4;
    
    for (let week = 1; week <= weeks; week++) {
      // Generate 7 days per week
      for (let day = 1; day <= 7; day++) {
        const dayNumber = (week - 1) * 7 + day;
        const focus = this.determineDailyFocus(day);
        const plan = this.generateDailyPlan(level, focus, healthConditions, week);
        
        dailyPlans.push({
          day: dayNumber,
          ...plan
        });
      }
    }
    
    // Create personalized exercise plan
    const exercisePlan: PersonalizedExercisePlan = {
      id: this.generateId(),
      userId,
      level,
      name: this.generateExercisePlanName(level, healthConditions),
      description: this.generateExercisePlanDescription(level, healthConditions),
      duration: weeks,
      dailyPlans,
      healthConditions,
      createdAt: new Date()
    };
    
    // Save to database
    await storage.createExercisePlan({
      userId,
      level,
      duration: exercisePlan.dailyPlans.reduce((sum, day) => sum + day.totalDuration, 0),
      weeklyGoal: `Complete ${Math.round(weeks * 3.5)} exercise sessions`,
      exercises: exercisePlan.dailyPlans.map(day => ({
        day: day.day,
        exercises: day.exercises.map(exercise => ({
          name: exercise.name,
          description: exercise.description,
          duration: exercise.duration,
          intensity: exercise.intensity,
          equipmentNeeded: exercise.equipmentNeeded,
          instructions: exercise.instructions,
          safetyNotes: exercise.safetyNotes,
          videoUrl: exercise.videoUrl
        })),
        totalDuration: day.totalDuration,
        focus: day.focus,
        warmup: day.warmup.map(exercise => ({
          name: exercise.name,
          description: exercise.description,
          duration: exercise.duration,
          intensity: exercise.intensity,
          equipmentNeeded: exercise.equipmentNeeded,
          instructions: exercise.instructions,
          safetyNotes: exercise.safetyNotes,
          videoUrl: exercise.videoUrl
        })),
        cooldown: day.cooldown.map(exercise => ({
          name: exercise.name,
          description: exercise.description,
          duration: exercise.duration,
          intensity: exercise.intensity,
          equipmentNeeded: exercise.equipmentNeeded,
          instructions: exercise.instructions,
          safetyNotes: exercise.safetyNotes,
          videoUrl: exercise.videoUrl
        }))
      })),
      createdAt: exercisePlan.createdAt
    });
    
    return exercisePlan;
  }
  
  // Determine exercise level based on risk factors and health conditions
  private determineExerciseLevel(prediction: Prediction, healthConditions: string[], clinicalEntry: ClinicalEntry): "beginner" | "intermediate" | "advanced" {
    // Start with beginner for high-risk individuals
    if (prediction.label === "high") {
      return "beginner";
    }
    
    // Consider health conditions
    if (healthConditions.includes("hypertension") || 
        healthConditions.includes("diabetes") || 
        clinicalEntry.exang === 1) {
      return "beginner";
    }
    
    // Consider age
    if (clinicalEntry.age >= 65) {
      return "beginner";
    }
    
    // Consider risk level
    if (prediction.label === "medium") {
      return "intermediate";
    }
    
    // Default to beginner for safety, but could be intermediate for healthy individuals
    return "beginner";
  }
  
  // Determine daily focus
  private determineDailyFocus(day: number): string {
    const focusAreas = ["cardio", "strength", "flexibility", "cardio", "strength", "flexibility", "rest"];
    return focusAreas[(day - 1) % focusAreas.length];
  }
  
  // Generate daily exercise plan
  private generateDailyPlan(
    level: "beginner" | "intermediate" | "advanced",
    focus: string,
    healthConditions: string[],
    week: number
  ): Omit<DailyExercisePlan, "day"> {
    // Adjust intensity based on week (progressive)
    const weekIntensity = this.getWeekIntensity(week);
    
    // Rest day
    if (focus === "rest") {
      return {
        exercises: [],
        totalDuration: 0,
        focus: "rest",
        warmup: [],
        cooldown: []
      };
    }
    
    // Generate warmup
    const warmup: Exercise[] = this.generateWarmup(level, weekIntensity);
    
    // Generate main exercises based on focus
    let exercises: Exercise[] = [];
    switch (focus) {
      case "cardio":
        exercises = this.generateCardioExercises(level, weekIntensity, healthConditions);
        break;
      case "strength":
        exercises = this.generateStrengthExercises(level, weekIntensity, healthConditions);
        break;
      case "flexibility":
        exercises = this.generateFlexibilityExercises(level, weekIntensity);
        break;
      default:
        exercises = this.generateCardioExercises(level, weekIntensity, healthConditions);
    }
    
    // Generate cooldown
    const cooldown: Exercise[] = this.generateCooldown(level, weekIntensity);
    
    // Calculate total duration
    const totalDuration = warmup.reduce((sum, ex) => sum + ex.duration, 0) +
                         exercises.reduce((sum, ex) => sum + ex.duration, 0) +
                         cooldown.reduce((sum, ex) => sum + ex.duration, 0);
    
    return {
      exercises,
      totalDuration,
      focus,
      warmup,
      cooldown
    };
  }
  
  // Get intensity modifier based on week
  private getWeekIntensity(week: number): number {
    // Progressive increase: 1.0 for week 1, 1.2 for week 2, 1.4 for week 3, 1.6 for week 4
    return 1.0 + (week - 1) * 0.2;
  }
  
  // Generate warmup exercises
  private generateWarmup(level: "beginner" | "intermediate" | "advanced", intensity: number): Exercise[] {
    const baseDuration = level === "beginner" ? 5 : level === "intermediate" ? 7 : 10;
    const duration = Math.round(baseDuration * intensity);
    
    return [
      {
        name: "Gentle Walking",
        description: "Start with slow walking to gradually increase heart rate",
        duration,
        intensity: "low",
        equipmentNeeded: [],
        instructions: [
          "Walk at a comfortable pace",
          "Keep shoulders relaxed",
          "Breathe naturally"
        ],
        safetyNotes: [
          "Stop if you experience chest pain or severe shortness of breath",
          "Maintain good posture"
        ]
      }
    ];
  }
  
  // Generate cardio exercises
  private generateCardioExercises(
    level: "beginner" | "intermediate" | "advanced",
    intensity: number,
    healthConditions: string[]
  ): Exercise[] {
    const isLowImpact = healthConditions.includes("joint-problems") || healthConditions.includes("arthritis");
    
    if (level === "beginner") {
      const baseDuration = isLowImpact ? 10 : 15;
      const duration = Math.round(baseDuration * intensity);
      
      return [
        {
          name: isLowImpact ? "Seated Marching" : "Brisk Walking",
          description: isLowImpact 
            ? "March in place while seated to get your heart rate up" 
            : "Walk at a pace that makes you breathe harder but still able to talk",
          duration,
          intensity: "moderate",
          equipmentNeeded: isLowImpact ? ["chair"] : [],
          instructions: isLowImpact 
            ? [
                "Sit upright in chair with feet flat on floor",
                "Lift one knee at a time as if marching",
                "Move arms in opposition to legs",
                "Maintain steady rhythm"
              ]
            : [
                "Start with normal walking pace",
                "Gradually increase speed",
                "Swing arms naturally",
                "Keep head up and look ahead"
              ],
          safetyNotes: [
            "Stop if you feel dizzy or short of breath",
            "Stay hydrated",
            "Wear comfortable shoes"
          ]
        }
      ];
    } else if (level === "intermediate") {
      const baseDuration = isLowImpact ? 15 : 20;
      const duration = Math.round(baseDuration * intensity);
      
      return [
        {
          name: isLowImpact ? "Seated Boxing" : "Jogging",
          description: isLowImpact 
            ? "Perform seated boxing movements to elevate heart rate" 
            : "Jog at a steady pace",
          duration,
          intensity: "moderate",
          equipmentNeeded: isLowImpact ? ["chair"] : [],
          instructions: isLowImpact 
            ? [
                "Sit upright in chair",
                "Extend arms forward at shoulder height",
                "Punch forward alternately with each arm",
                "Increase speed gradually"
              ]
            : [
                "Start with gentle jogging",
                "Maintain steady rhythm",
                "Land on midfoot rather than heel",
                "Keep arms relaxed at sides"
              ],
          safetyNotes: [
            "Listen to your body",
            "Slow down if you feel chest pain",
            "Stay on even surfaces"
          ]
        }
      ];
    } else {
      const baseDuration = isLowImpact ? 20 : 25;
      const duration = Math.round(baseDuration * intensity);
      
      return [
        {
          name: isLowImpact ? "Resistance Band Cardio" : "Running",
          description: isLowImpact 
            ? "Use resistance bands for cardio workout while seated" 
            : "Run at a comfortable pace",
          duration,
          intensity: "high",
          equipmentNeeded: isLowImpact ? ["resistance band"] : [],
          instructions: isLowImpact 
            ? [
                "Sit upright with band under feet",
                "Perform overhead presses with band",
                "Add leg extensions while seated",
                "Maintain steady pace"
              ]
            : [
                "Start with easy run pace",
                "Gradually increase intensity",
                "Focus on breathing rhythm",
                "Stay hydrated"
              ],
          safetyNotes: [
            "Warm up properly before starting",
            "Cool down gradually",
            "Run on safe, well-lit paths"
          ]
        }
      ];
    }
  }
  
  // Generate strength exercises
  private generateStrengthExercises(
    level: "beginner" | "intermediate" | "advanced",
    intensity: number,
    healthConditions: string[]
  ): Exercise[] {
    const hasJointProblems = healthConditions.includes("joint-problems") || healthConditions.includes("arthritis");
    const hasHypertension = healthConditions.includes("hypertension");
    
    if (level === "beginner") {
      const baseDuration = hasJointProblems ? 15 : 20;
      const duration = Math.round(baseDuration * intensity);
      
      return [
        {
          name: "Wall Push-ups",
          description: "Beginner-friendly upper body exercise using a wall for support",
          duration,
          intensity: "low",
          equipmentNeeded: ["wall"],
          instructions: [
            "Stand arm's length from wall",
            "Place hands on wall at shoulder height",
            "Lean forward and bend elbows to bring chest toward wall",
            "Push back to starting position",
            "Keep body straight from head to heels"
          ],
          safetyNotes: [
            "Don't hold your breath during exertion",
            "Move slowly and with control",
            "Stop if you feel pain"
          ]
        },
        {
          name: "Seated Leg Extensions",
          description: "Strengthen leg muscles while seated",
          duration: Math.round(10 * intensity),
          intensity: "low",
          equipmentNeeded: ["chair"],
          instructions: [
            "Sit upright in chair",
            "Extend one leg straight out",
            "Hold for 2-3 seconds",
            "Lower leg slowly",
            "Repeat with other leg"
          ],
          safetyNotes: [
            "Keep movements controlled",
            "Don't bounce legs",
            "Maintain good posture"
          ]
        }
      ];
    } else if (level === "intermediate") {
      const baseDuration = hasJointProblems ? 20 : 25;
      const duration = Math.round(baseDuration * intensity);
      
      return [
        {
          name: "Modified Push-ups",
          description: "Push-ups performed on knees for moderate difficulty",
          duration,
          intensity: "moderate",
          equipmentNeeded: [],
          instructions: [
            "Start in plank position on knees",
            "Place hands slightly wider than shoulders",
            "Lower chest toward floor by bending elbows",
            "Push back up to starting position",
            "Keep core engaged"
          ],
          safetyNotes: [
            "Keep neck in neutral position",
            "Don't arch back",
            "Modify by doing wall push-ups if needed"
          ]
        },
        {
          name: "Bodyweight Squats",
          description: "Strengthen legs and glutes with bodyweight squats",
          duration: Math.round(15 * intensity),
          intensity: "moderate",
          equipmentNeeded: [],
          instructions: [
            "Stand with feet hip-width apart",
            "Lower body by bending knees and hips",
            "Keep chest up and knees tracking over toes",
            "Descend until thighs are parallel to floor",
            "Push through heels to return to start"
          ],
          safetyNotes: [
            "Knees should not cave inward",
            "Keep weight in heels",
            "Don't go too deep if it causes pain"
          ]
        }
      ];
    } else {
      const baseDuration = hasJointProblems ? 25 : 30;
      const duration = Math.round(baseDuration * intensity);
      
      return [
        {
          name: "Standard Push-ups",
          description: "Full push-ups for advanced strength training",
          duration,
          intensity: "high",
          equipmentNeeded: [],
          instructions: [
            "Start in plank position",
            "Place hands slightly wider than shoulders",
            "Lower chest toward floor by bending elbows",
            "Push back up to starting position",
            "Keep body straight from head to heels"
          ],
          safetyNotes: [
            "Engage core throughout movement",
            "Don't let hips sag",
            "Modify by doing knee push-ups if needed"
          ]
        },
        {
          name: "Jump Squats",
          description: "Explosive squats with jump for cardio and strength",
          duration: Math.round(20 * intensity),
          intensity: "high",
          equipmentNeeded: [],
          instructions: [
            "Stand with feet hip-width apart",
            "Lower into squat position",
            "Explode upward into jump",
            "Land softly with knees slightly bent",
            "Lower immediately into next squat"
          ],
          safetyNotes: [
            "Land softly to protect joints",
            "Keep knees aligned with toes",
            "Skip jumps if you have joint problems"
          ]
        }
      ];
    }
  }
  
  // Generate flexibility exercises
  private generateFlexibilityExercises(level: "beginner" | "intermediate" | "advanced", intensity: number): Exercise[] {
    const baseDuration = level === "beginner" ? 15 : level === "intermediate" ? 20 : 25;
    const duration = Math.round(baseDuration * intensity);
    
    return [
      {
        name: "Seated Spinal Twist",
        description: "Gentle spinal twist to improve mobility and digestion",
        duration: Math.round(10 * intensity),
        intensity: "low",
        equipmentNeeded: ["chair"],
        instructions: [
          "Sit upright in chair with feet flat on floor",
          "Place right hand on left knee",
          "Place left hand on chair back",
          "Gently twist torso to the left",
          "Hold for 15-30 seconds",
          "Repeat on other side"
        ],
        safetyNotes: [
          "Move slowly and gently",
          "Don't force the twist",
          "Breathe deeply throughout stretch"
        ]
      },
      {
        name: "Shoulder Rolls",
        description: "Improve shoulder mobility and reduce tension",
        duration: Math.round(5 * intensity),
        intensity: "low",
        equipmentNeeded: [],
        instructions: [
          "Sit or stand with arms relaxed at sides",
          "Slowly roll shoulders backward in circular motion",
          "Complete 10 circles",
          "Repeat rolling forward for 10 circles"
        ],
        safetyNotes: [
          "Keep movements smooth and controlled",
          "Don't roll too quickly",
          "Stop if you feel pain"
        ]
      },
      {
        name: "Neck Stretches",
        description: "Relieve tension in neck and upper back",
        duration: Math.round(10 * intensity),
        intensity: "low",
        equipmentNeeded: [],
        instructions: [
          "Sit or stand with good posture",
          "Gently tilt head to right shoulder",
          "Hold for 15-30 seconds",
          "Return to center and tilt to left shoulder",
          "Slowly drop chin to chest and hold"
        ],
        safetyNotes: [
          "Never rotate neck in circles",
          "Move gently without bouncing",
          "Stop if you feel dizzy"
        ]
      }
    ];
  }
  
  // Generate cooldown exercises
  private generateCooldown(level: "beginner" | "intermediate" | "advanced", intensity: number): Exercise[] {
    const baseDuration = level === "beginner" ? 5 : level === "intermediate" ? 7 : 10;
    const duration = Math.round(baseDuration * intensity);
    
    return [
      {
        name: "Deep Breathing",
        description: "Slow, deep breaths to lower heart rate and promote relaxation",
        duration,
        intensity: "low",
        equipmentNeeded: [],
        instructions: [
          "Sit or lie down comfortably",
          "Place one hand on chest and one on belly",
          "Breathe in slowly through nose for 4 counts",
          "Hold for 4 counts",
          "Exhale slowly through mouth for 6 counts",
          "Repeat for duration"
        ],
        safetyNotes: [
          "Breathe naturally, don't force it",
          "Focus on relaxation",
          "Let go of tension with each exhale"
        ]
      }
    ];
  }
  
  // Generate exercise plan name based on level and conditions
  private generateExercisePlanName(level: string, healthConditions: string[]): string {
    const conditionNames = healthConditions.length > 0 
      ? `${healthConditions.join(" & ")}-Friendly`
      : "General";
      
    const levelNames: Record<string, string> = {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced"
    };
    
    return `${conditionNames} ${levelNames[level] || "Beginner"} Cardiovascular Exercise Plan`;
  }
  
  // Generate exercise plan description
  private generateExercisePlanDescription(level: string, healthConditions: string[]): string {
    const conditionDescription = healthConditions.length > 0 
      ? `designed for those with ${healthConditions.join(" and ")}`
      : "for general cardiovascular health";
      
    const levelDescriptions: Record<string, string> = {
      beginner: "This gentle, progressive exercise plan is perfect for beginners or those with health concerns",
      intermediate: "This moderate-intensity exercise plan builds on basic fitness for improved cardiovascular health",
      advanced: "This challenging exercise plan is designed for those with established fitness levels"
    };
    
    return `${levelDescriptions[level] || "This gentle, progressive exercise plan"} ${conditionDescription}. It focuses on safe, effective exercises that improve heart health while minimizing injury risk.`;
  }
  
  // Generate a unique ID
  private generateId(): string {
    return `ep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export a singleton instance of the exercise plan service
export const exercisePlanService = new ExercisePlanService();
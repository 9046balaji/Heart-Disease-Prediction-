import { randomUUID } from "crypto";

// Define the tip structure
export interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: string; // e.g., "diet", "exercise", "medication", "stress", "sleep"
  tags: string[]; // e.g., ["heart-healthy", "quick", "beginner"]
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

// Define the user tip interaction structure
export interface UserTipInteraction {
  id: string;
  userId: string;
  tipId: string;
  completed: boolean;
  liked: boolean;
  completionDate?: Date;
  createdAt: Date;
}

export class MicroLessonService {
  private tips: Map<string, HealthTip>;
  private userInteractions: Map<string, UserTipInteraction[]>;

  constructor() {
    this.tips = new Map();
    this.userInteractions = new Map();
    this.initializeDefaultTips();
  }

  // Initialize with some default tips
  private initializeDefaultTips() {
    // Diet tips
    this.addTip({
      title: "Heart-Healthy Breakfast",
      content: "Start your day with oatmeal topped with berries and nuts. Oats help lower cholesterol, while berries provide antioxidants and nuts offer healthy fats.",
      category: "diet",
      tags: ["heart-healthy", "breakfast", "quick"],
      difficulty: "beginner",
      estimatedTime: 5
    });

    this.addTip({
      title: "Reduce Sodium Intake",
      content: "Use herbs and spices instead of salt to flavor your food. Try garlic, onion powder, paprika, or lemon juice to add flavor without raising your blood pressure.",
      category: "diet",
      tags: ["heart-healthy", "cooking", "salt"],
      difficulty: "beginner",
      estimatedTime: 2
    });

    // Exercise tips
    this.addTip({
      title: "Walking for Heart Health",
      content: "Start with a 10-minute walk daily and gradually increase to 30 minutes. Walking is a low-impact exercise that strengthens your heart and improves circulation.",
      category: "exercise",
      tags: ["walking", "beginner", "cardio"],
      difficulty: "beginner",
      estimatedTime: 3
    });

    this.addTip({
      title: "Strength Training Basics",
      content: "Incorporate light strength training twice a week using resistance bands or light weights. Focus on major muscle groups and allow rest days between sessions.",
      category: "exercise",
      tags: ["strength", "beginner", "muscle"],
      difficulty: "beginner",
      estimatedTime: 5
    });

    // Medication tips
    this.addTip({
      title: "Medication Adherence",
      content: "Use a pill organizer with compartments for each day of the week. Set daily phone reminders to take your medications at the same time each day.",
      category: "medication",
      tags: ["adherence", "organization", "reminder"],
      difficulty: "beginner",
      estimatedTime: 3
    });

    // Stress management tips
    this.addTip({
      title: "Deep Breathing Exercise",
      content: "Practice the 4-7-8 technique: Inhale for 4 counts, hold for 7, exhale for 8. This activates your body's relaxation response and can help lower blood pressure.",
      category: "stress",
      tags: ["breathing", "relaxation", "quick"],
      difficulty: "beginner",
      estimatedTime: 3
    });

    // Sleep tips
    this.addTip({
      title: "Sleep Hygiene",
      content: "Maintain a consistent sleep schedule by going to bed and waking up at the same time daily. Keep your bedroom cool, dark, and quiet for optimal rest.",
      category: "sleep",
      tags: ["sleep", "routine", "environment"],
      difficulty: "beginner",
      estimatedTime: 2
    });
  }

  // Add a new tip
  public async addTip(tipData: Omit<HealthTip, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthTip> {
    const now = new Date();
    const tip: HealthTip = {
      id: randomUUID(),
      ...tipData,
      createdAt: now,
      updatedAt: now
    };

    this.tips.set(tip.id, tip);
    return tip;
  }

  // Get all tips
  public async getAllTips(): Promise<HealthTip[]> {
    return Array.from(this.tips.values());
  }

  // Get tips by category
  public async getTipsByCategory(category: string): Promise<HealthTip[]> {
    const tips = Array.from(this.tips.values());
    return tips.filter(tip => tip.category === category);
  }

  // Get tips by tag
  public async getTipsByTag(tag: string): Promise<HealthTip[]> {
    const tips = Array.from(this.tips.values());
    return tips.filter(tip => tip.tags.includes(tag));
  }

  // Get tips by difficulty
  public async getTipsByDifficulty(difficulty: "beginner" | "intermediate" | "advanced"): Promise<HealthTip[]> {
    const tips = Array.from(this.tips.values());
    return tips.filter(tip => tip.difficulty === difficulty);
  }

  // Get a specific tip by ID
  public async getTipById(id: string): Promise<HealthTip | undefined> {
    return this.tips.get(id);
  }

  // Search tips by title or content
  public async searchTips(query: string): Promise<HealthTip[]> {
    const tips = Array.from(this.tips.values());
    const lowerQuery = query.toLowerCase();
    return tips.filter(tip => 
      tip.title.toLowerCase().includes(lowerQuery) || 
      tip.content.toLowerCase().includes(lowerQuery)
    );
  }

  // Get personalized tips for a user based on their interactions
  public async getPersonalizedTips(userId: string): Promise<HealthTip[]> {
    // Get user's completed tips
    const userInteractions = this.userInteractions.get(userId) || [];
    const completedTipIds = userInteractions
      .filter(interaction => interaction.completed)
      .map(interaction => interaction.tipId);
    
    // Get user's preferred categories based on completed tips
    const categoryCount: Record<string, number> = {};
    completedTipIds.forEach(tipId => {
      const tip = this.tips.get(tipId);
      if (tip) {
        categoryCount[tip.category] = (categoryCount[tip.category] || 0) + 1;
      }
    });
    
    // Find the most preferred category
    let preferredCategory = "";
    let maxCount = 0;
    for (const [category, count] of Object.entries(categoryCount)) {
      if (count > maxCount) {
        maxCount = count;
        preferredCategory = category;
      }
    }
    
    // Get tips from the preferred category, excluding completed ones
    const allTips = Array.from(this.tips.values());
    const recommendedTips = allTips.filter(tip => 
      tip.category === preferredCategory && !completedTipIds.includes(tip.id)
    );
    
    // If no preferred category or not enough tips, get beginner tips
    if (recommendedTips.length < 3) {
      const beginnerTips = await this.getTipsByDifficulty("beginner");
      return beginnerTips.filter(tip => !completedTipIds.includes(tip.id)).slice(0, 5);
    }
    
    return recommendedTips.slice(0, 5);
  }

  // Record user interaction with a tip
  public async recordUserInteraction(
    userId: string, 
    tipId: string, 
    interactionData: Partial<Omit<UserTipInteraction, 'id' | 'userId' | 'tipId' | 'createdAt'>>
  ): Promise<UserTipInteraction> {
    const interaction: UserTipInteraction = {
      id: randomUUID(),
      userId,
      tipId,
      completed: interactionData.completed || false,
      liked: interactionData.liked || false,
      completionDate: interactionData.completionDate,
      createdAt: new Date()
    };

    if (!this.userInteractions.has(userId)) {
      this.userInteractions.set(userId, []);
    }

    const userInteractions = this.userInteractions.get(userId) || [];
    userInteractions.push(interaction);
    this.userInteractions.set(userId, userInteractions);

    return interaction;
  }

  // Get user's completed tips
  public async getUserCompletedTips(userId: string): Promise<HealthTip[]> {
    const userInteractions = this.userInteractions.get(userId) || [];
    const completedTipIds = userInteractions
      .filter(interaction => interaction.completed)
      .map(interaction => interaction.tipId);
    
    return completedTipIds
      .map(tipId => this.tips.get(tipId))
      .filter((tip): tip is HealthTip => tip !== undefined);
  }

  // Get daily tip for a user
  public async getDailyTip(userId: string): Promise<HealthTip | null> {
    const tips = await this.getAllTips();
    if (tips.length === 0) return null;
    
    // Simple algorithm: get a random tip that the user hasn't completed
    const userInteractions = this.userInteractions.get(userId) || [];
    const completedTipIds = userInteractions
      .filter(interaction => interaction.completed)
      .map(interaction => interaction.tipId);
    
    const uncompletedTips = tips.filter(tip => !completedTipIds.includes(tip.id));
    if (uncompletedTips.length === 0) return tips[0]; // If all tips completed, return first one
    
    // Return a random uncompleted tip
    const randomIndex = Math.floor(Math.random() * uncompletedTips.length);
    return uncompletedTips[randomIndex];
  }
}

// Export a singleton instance of the micro lesson service
export const microLessonService = new MicroLessonService();
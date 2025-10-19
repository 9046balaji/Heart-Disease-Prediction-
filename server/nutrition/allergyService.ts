// Allergy service for the HeartGuard application
// This service handles allergy management and real-time checking for food and medication interactions

import { randomUUID } from "crypto";

export interface Allergy {
  id: string;
  userId: string;
  name: string; // Name of the allergen (e.g., "Peanuts", "Shellfish")
  severity: "mild" | "moderate" | "severe";
  reaction: string; // Description of typical reaction
  createdAt: Date;
  updatedAt: Date;
}

export interface Allergen {
  id: string;
  name: string; // Name of the allergen
  category: "food" | "medication" | "environmental";
  commonSources: string[]; // Common foods or medications containing this allergen
  crossReactivity: string[]; // Related allergens that might cause reactions
}

export interface FoodIngredient {
  name: string;
  allergens: string[]; // List of allergens in this ingredient
}

export interface RecipeWithAllergens {
  id: string;
  title: string;
  ingredients: FoodIngredient[];
  allergenWarnings: string[]; // List of allergen warnings for this recipe
}

export class AllergyService {
  private allergies: Map<string, Allergy>;
  private allergenDatabase: Map<string, Allergen>;

  constructor() {
    this.allergies = new Map();
    this.allergenDatabase = new Map();
    
    // Initialize with common allergens
    this.initializeAllergenDatabase();
  }

  // Initialize the allergen database with common allergens
  private initializeAllergenDatabase(): void {
    const commonAllergens: Allergen[] = [
      {
        id: "allergen-1",
        name: "Peanuts",
        category: "food",
        commonSources: ["Peanut butter", "Peanut oil", "Mixed nuts", "Cookies", "Candy"],
        crossReactivity: ["Tree nuts"]
      },
      {
        id: "allergen-2",
        name: "Tree nuts",
        category: "food",
        commonSources: ["Almonds", "Walnuts", "Pecans", "Cashews", "Hazelnuts"],
        crossReactivity: ["Peanuts"]
      },
      {
        id: "allergen-3",
        name: "Milk",
        category: "food",
        commonSources: ["Cheese", "Yogurt", "Ice cream", "Butter", "Cream"],
        crossReactivity: []
      },
      {
        id: "allergen-4",
        name: "Eggs",
        category: "food",
        commonSources: ["Cake", "Cookies", "Mayonnaise", "Pasta", "Bread"],
        crossReactivity: []
      },
      {
        id: "allergen-5",
        name: "Fish",
        category: "food",
        commonSources: ["Salmon", "Tuna", "Cod", "Sardines", "Anchovies"],
        crossReactivity: ["Shellfish"]
      },
      {
        id: "allergen-6",
        name: "Shellfish",
        category: "food",
        commonSources: ["Shrimp", "Crab", "Lobster", "Scallops", "Mussels"],
        crossReactivity: ["Fish"]
      },
      {
        id: "allergen-7",
        name: "Soy",
        category: "food",
        commonSources: ["Tofu", "Soy sauce", "Edamame", "Tempeh", "Vegetable oil"],
        crossReactivity: []
      },
      {
        id: "allergen-8",
        name: "Wheat",
        category: "food",
        commonSources: ["Bread", "Pasta", "Cookies", "Cake", "Cereal"],
        crossReactivity: ["Barley", "Rye"]
      },
      {
        id: "allergen-9",
        name: "Sulfites",
        category: "food",
        commonSources: ["Dried fruits", "Wine", "Shrimp", "Pickled foods", "Bottled lemon juice"],
        crossReactivity: []
      },
      {
        id: "allergen-10",
        name: "Aspirin",
        category: "medication",
        commonSources: ["Aspirin", "Bayer", "Bufferin", "Ecotrin"],
        crossReactivity: ["NSAIDs"]
      }
    ];

    commonAllergens.forEach(allergen => {
      this.allergenDatabase.set(allergen.id, allergen);
    });
  }

  // Add a new allergy for a user
  public async addAllergy(
    userId: string, 
    allergyData: Omit<Allergy, "id" | "userId" | "createdAt" | "updatedAt">
  ): Promise<Allergy> {
    try {
      // Validate required fields
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      if (!allergyData.name) {
        throw new Error("Allergen name is required");
      }
      
      if (!allergyData.severity) {
        throw new Error("Severity level is required");
      }
      
      const validSeverities: ("mild" | "moderate" | "severe")[] = ["mild", "moderate", "severe"];
      if (!validSeverities.includes(allergyData.severity)) {
        throw new Error("Invalid severity level. Must be 'mild', 'moderate', or 'severe'");
      }
      
      const allergy: Allergy = {
        id: randomUUID(),
        userId,
        ...allergyData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.allergies.set(allergy.id, allergy);
      return allergy;
    } catch (error) {
      console.error("Error adding allergy:", error);
      throw new Error(`Failed to add allergy: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Get all allergies for a user
  public async getAllergies(userId: string): Promise<Allergy[]> {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      const userAllergies: Allergy[] = [];
      const allergies = Array.from(this.allergies.values());
      
      for (const allergy of allergies) {
        if (allergy.userId === userId) {
          userAllergies.push(allergy);
        }
      }
      
      return userAllergies;
    } catch (error) {
      console.error("Error retrieving allergies:", error);
      throw new Error(`Failed to retrieve allergies: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Get a specific allergy by ID
  public async getAllergy(allergyId: string, userId: string): Promise<Allergy | undefined> {
    try {
      if (!allergyId) {
        throw new Error("Allergy ID is required");
      }
      
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      const allergy = this.allergies.get(allergyId);
      if (allergy && allergy.userId === userId) {
        return allergy;
      }
      
      return undefined;
    } catch (error) {
      console.error("Error retrieving allergy:", error);
      throw new Error(`Failed to retrieve allergy: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Update an allergy
  public async updateAllergy(
    allergyId: string, 
    userId: string, 
    updateData: Partial<Omit<Allergy, "id" | "userId" | "createdAt">>
  ): Promise<Allergy | undefined> {
    try {
      if (!allergyId) {
        throw new Error("Allergy ID is required");
      }
      
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      const allergy = await this.getAllergy(allergyId, userId);
      if (!allergy) {
        throw new Error("Allergy not found");
      }
      
      // Validate severity if provided
      if (updateData.severity) {
        const validSeverities: ("mild" | "moderate" | "severe")[] = ["mild", "moderate", "severe"];
        if (!validSeverities.includes(updateData.severity)) {
          throw new Error("Invalid severity level. Must be 'mild', 'moderate', or 'severe'");
        }
      }
      
      Object.assign(allergy, updateData, { updatedAt: new Date() });
      this.allergies.set(allergyId, allergy);
      
      return allergy;
    } catch (error) {
      console.error("Error updating allergy:", error);
      throw new Error(`Failed to update allergy: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Delete an allergy
  public async deleteAllergy(allergyId: string, userId: string): Promise<boolean> {
    try {
      if (!allergyId) {
        throw new Error("Allergy ID is required");
      }
      
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      const allergy = await this.getAllergy(allergyId, userId);
      if (!allergy) {
        return false;
      }
      
      this.allergies.delete(allergyId);
      return true;
    } catch (error) {
      console.error("Error deleting allergy:", error);
      throw new Error(`Failed to delete allergy: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Check if a recipe contains allergens that the user is allergic to
  public async checkRecipeForAllergens(userId: string, recipe: RecipeWithAllergens): Promise<{
    hasAllergens: boolean;
    allergenWarnings: {
      allergen: string;
      severity: "mild" | "moderate" | "severe";
      reaction: string;
    }[];
  }> {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      // Get user's allergies
      const userAllergies = await this.getAllergies(userId);
      
      // Check if recipe contains any allergens the user is allergic to
      const warnings: {
        allergen: string;
        severity: "mild" | "moderate" | "severe";
        reaction: string;
      }[] = [];
      
      // Check direct allergen warnings in recipe
      for (const warning of recipe.allergenWarnings) {
        const matchingAllergy = userAllergies.find(a => 
          a.name.toLowerCase() === warning.toLowerCase()
        );
        
        if (matchingAllergy) {
          warnings.push({
            allergen: matchingAllergy.name,
            severity: matchingAllergy.severity,
            reaction: matchingAllergy.reaction
          });
        }
      }
      
      // Check ingredients for allergens
      for (const ingredient of recipe.ingredients) {
        for (const allergenName of ingredient.allergens) {
          const matchingAllergy = userAllergies.find(a => 
            a.name.toLowerCase() === allergenName.toLowerCase()
          );
          
          if (matchingAllergy) {
            // Check if this is already in warnings to avoid duplicates
            const alreadyWarned = warnings.some(w => w.allergen === matchingAllergy.name);
            if (!alreadyWarned) {
              warnings.push({
                allergen: matchingAllergy.name,
                severity: matchingAllergy.severity,
                reaction: matchingAllergy.reaction
              });
            }
          }
        }
      }
      
      return {
        hasAllergens: warnings.length > 0,
        allergenWarnings: warnings
      };
    } catch (error) {
      console.error("Error checking recipe for allergens:", error);
      throw new Error(`Failed to check recipe for allergens: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Get allergen information from the database
  public async getAllergenInfo(allergenName: string): Promise<Allergen | undefined> {
    try {
      if (!allergenName) {
        throw new Error("Allergen name is required");
      }
      
      // Search for allergen by name
      const allergens = Array.from(this.allergenDatabase.values());
      for (const allergen of allergens) {
        if (allergen.name.toLowerCase() === allergenName.toLowerCase()) {
          return allergen;
        }
      }
      
      return undefined;
    } catch (error) {
      console.error("Error retrieving allergen info:", error);
      throw new Error(`Failed to retrieve allergen info: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Get cross-reactivity information for an allergen
  public async getCrossReactivity(allergenName: string): Promise<string[]> {
    try {
      if (!allergenName) {
        throw new Error("Allergen name is required");
      }
      
      const allergen = await this.getAllergenInfo(allergenName);
      return allergen?.crossReactivity || [];
    } catch (error) {
      console.error("Error retrieving cross-reactivity info:", error);
      throw new Error(`Failed to retrieve cross-reactivity info: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Get common sources of an allergen
  public async getCommonSources(allergenName: string): Promise<string[]> {
    try {
      if (!allergenName) {
        throw new Error("Allergen name is required");
      }
      
      const allergen = await this.getAllergenInfo(allergenName);
      return allergen?.commonSources || [];
    } catch (error) {
      console.error("Error retrieving common sources:", error);
      throw new Error(`Failed to retrieve common sources: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

// Export a singleton instance of the allergy service
export const allergyService = new AllergyService();
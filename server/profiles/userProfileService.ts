import { db } from '../db';
import { userProfiles } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Function to generate UUID using crypto API
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface UserProfileData {
  userId: string;
  dob?: Date;
  sex?: 'male' | 'female' | 'other';
  heightCm?: number;
  weightKg?: number;
  dietPreference?: 'vegetarian' | 'non-veg' | 'vegan' | 'pescatarian';
  allergies?: string[];
  medicalConditions?: string[];
  medications?: string[];
  mobilityLimitations?: 'none' | 'knee_pain' | 'balance_issues';
  calorieTarget?: number;
  // Add new fields for advanced profile management
  healthHistory?: HealthHistoryEntry[];
  familyMedicalHistory?: FamilyMedicalHistoryEntry[];
  adverseReactions?: AdverseReactionEntry[];
}

// Interface for health history entries
export interface HealthHistoryEntry {
  id: string;
  condition: string;
  diagnosisDate?: Date;
  status: 'active' | 'resolved' | 'in_remission';
  notes?: string;
  createdAt: Date;
}

// Interface for family medical history entries
export interface FamilyMedicalHistoryEntry {
  id: string;
  relationship: 'father' | 'mother' | 'sibling' | 'grandparent' | 'other';
  condition: string;
  ageAtDiagnosis?: number;
  notes?: string;
  createdAt: Date;
}

// Interface for adverse reaction entries
export interface AdverseReactionEntry {
  id: string;
  substance: string; // Medication, food, or environmental trigger
  reactionType: 'allergic' | 'side_effect' | 'intolerance';
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string[];
  dateOccurred?: Date;
  notes?: string;
  createdAt: Date;
}

export async function createUserProfile(profileData: UserProfileData) {
  const dbInstance = await db;
  
  const newProfile = {
    id: generateUUID(),
    userId: profileData.userId,
    dob: profileData.dob,
    sex: profileData.sex,
    heightCm: profileData.heightCm,
    weightKg: profileData.weightKg,
    dietPreference: profileData.dietPreference,
    allergies: profileData.allergies ? JSON.stringify(profileData.allergies) : null,
    medicalConditions: profileData.medicalConditions ? JSON.stringify(profileData.medicalConditions) : null,
    medications: profileData.medications ? JSON.stringify(profileData.medications) : null,
    mobilityLimitations: profileData.mobilityLimitations,
    calorieTarget: profileData.calorieTarget,
    // Add new fields
    healthHistory: profileData.healthHistory ? JSON.stringify(profileData.healthHistory) : null,
    familyMedicalHistory: profileData.familyMedicalHistory ? JSON.stringify(profileData.familyMedicalHistory) : null,
    adverseReactions: profileData.adverseReactions ? JSON.stringify(profileData.adverseReactions) : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const result = await dbInstance.insert(userProfiles).values(newProfile);
  return result;
}

export async function getUserProfile(userId: string) {
  const dbInstance = await db;
  
  const profile = await dbInstance.select().from(userProfiles).where(eq(userProfiles.userId, userId));
  let userProfile = profile[0] || null;
  
  // If no profile exists, create a default one
  if (!userProfile) {
    const defaultProfileData: UserProfileData = {
      userId: userId,
      healthHistory: [],
      familyMedicalHistory: [],
      adverseReactions: []
    };
    
    await createUserProfile(defaultProfileData);
    
    // Fetch the newly created profile
    const newProfile = await dbInstance.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    userProfile = newProfile[0] || null;
  }
  
  // Parse JSON fields if they exist
  if (userProfile) {
    if (userProfile.allergies && typeof userProfile.allergies === 'string') {
      try {
        userProfile.allergies = JSON.parse(userProfile.allergies);
      } catch (e) {
        userProfile.allergies = [];
      }
    }
    
    if (userProfile.medicalConditions && typeof userProfile.medicalConditions === 'string') {
      try {
        userProfile.medicalConditions = JSON.parse(userProfile.medicalConditions);
      } catch (e) {
        userProfile.medicalConditions = [];
      }
    }
    
    if (userProfile.medications && typeof userProfile.medications === 'string') {
      try {
        userProfile.medications = JSON.parse(userProfile.medications);
      } catch (e) {
        userProfile.medications = [];
      }
    }
    
    // Parse new fields
    if (userProfile.healthHistory && typeof userProfile.healthHistory === 'string') {
      try {
        userProfile.healthHistory = JSON.parse(userProfile.healthHistory);
      } catch (e) {
        userProfile.healthHistory = [];
      }
    }
    
    if (userProfile.familyMedicalHistory && typeof userProfile.familyMedicalHistory === 'string') {
      try {
        userProfile.familyMedicalHistory = JSON.parse(userProfile.familyMedicalHistory);
      } catch (e) {
        userProfile.familyMedicalHistory = [];
      }
    }
    
    if (userProfile.adverseReactions && typeof userProfile.adverseReactions === 'string') {
      try {
        userProfile.adverseReactions = JSON.parse(userProfile.adverseReactions);
      } catch (e) {
        userProfile.adverseReactions = [];
      }
    }
  }
  
  return userProfile;
}

export async function updateUserProfile(userId: string, profileData: Partial<UserProfileData>) {
  const dbInstance = await db;
  
  const updateData: any = {
    ...profileData,
    updatedAt: new Date(),
  };
  
  // Handle JSON fields
  if (profileData.allergies) {
    updateData.allergies = JSON.stringify(profileData.allergies);
  }
  
  if (profileData.medicalConditions) {
    updateData.medicalConditions = JSON.stringify(profileData.medicalConditions);
  }
  
  if (profileData.medications) {
    updateData.medications = JSON.stringify(profileData.medications);
  }
  
  // Handle new fields
  if (profileData.healthHistory) {
    updateData.healthHistory = JSON.stringify(profileData.healthHistory);
  }
  
  if (profileData.familyMedicalHistory) {
    updateData.familyMedicalHistory = JSON.stringify(profileData.familyMedicalHistory);
  }
  
  if (profileData.adverseReactions) {
    updateData.adverseReactions = JSON.stringify(profileData.adverseReactions);
  }
  
  const result = await dbInstance.update(userProfiles).set(updateData).where(eq(userProfiles.userId, userId));
  return result;
}

// Add specific functions for managing health history
export async function addHealthHistoryEntry(userId: string, entry: HealthHistoryEntry) {
  const profile = await getUserProfile(userId);
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const healthHistory = Array.isArray(profile.healthHistory) ? profile.healthHistory : [];
  healthHistory.push(entry);
  
  return await updateUserProfile(userId, { healthHistory });
}

export async function updateHealthHistoryEntry(userId: string, entryId: string, updates: Partial<HealthHistoryEntry>) {
  const profile = await getUserProfile(userId);
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const healthHistory = Array.isArray(profile.healthHistory) ? profile.healthHistory : [];
  const entryIndex = healthHistory.findIndex(entry => entry.id === entryId);
  
  if (entryIndex === -1) {
    throw new Error('Health history entry not found');
  }
  
  healthHistory[entryIndex] = { ...healthHistory[entryIndex], ...updates };
  
  return await updateUserProfile(userId, { healthHistory });
}

export async function removeHealthHistoryEntry(userId: string, entryId: string) {
  const profile = await getUserProfile(userId);
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const healthHistory = Array.isArray(profile.healthHistory) ? profile.healthHistory : [];
  const updatedHealthHistory = healthHistory.filter(entry => entry.id !== entryId);
  
  return await updateUserProfile(userId, { healthHistory: updatedHealthHistory });
}

// Add specific functions for managing family medical history
export async function addFamilyMedicalHistoryEntry(userId: string, entry: FamilyMedicalHistoryEntry) {
  const profile = await getUserProfile(userId);
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const familyMedicalHistory = Array.isArray(profile.familyMedicalHistory) ? profile.familyMedicalHistory : [];
  familyMedicalHistory.push(entry);
  
  return await updateUserProfile(userId, { familyMedicalHistory });
}

export async function updateFamilyMedicalHistoryEntry(userId: string, entryId: string, updates: Partial<FamilyMedicalHistoryEntry>) {
  const profile = await getUserProfile(userId);
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const familyMedicalHistory = Array.isArray(profile.familyMedicalHistory) ? profile.familyMedicalHistory : [];
  const entryIndex = familyMedicalHistory.findIndex(entry => entry.id === entryId);
  
  if (entryIndex === -1) {
    throw new Error('Family medical history entry not found');
  }
  
  familyMedicalHistory[entryIndex] = { ...familyMedicalHistory[entryIndex], ...updates };
  
  return await updateUserProfile(userId, { familyMedicalHistory });
}

export async function removeFamilyMedicalHistoryEntry(userId: string, entryId: string) {
  const profile = await getUserProfile(userId);
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const familyMedicalHistory = Array.isArray(profile.familyMedicalHistory) ? profile.familyMedicalHistory : [];
  const updatedFamilyMedicalHistory = familyMedicalHistory.filter(entry => entry.id !== entryId);
  
  return await updateUserProfile(userId, { familyMedicalHistory: updatedFamilyMedicalHistory });
}

// Add specific functions for managing adverse reactions
export async function addAdverseReactionEntry(userId: string, entry: AdverseReactionEntry) {
  const profile = await getUserProfile(userId);
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const adverseReactions = Array.isArray(profile.adverseReactions) ? profile.adverseReactions : [];
  adverseReactions.push(entry);
  
  return await updateUserProfile(userId, { adverseReactions });
}

export async function updateAdverseReactionEntry(userId: string, entryId: string, updates: Partial<AdverseReactionEntry>) {
  const profile = await getUserProfile(userId);
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const adverseReactions = Array.isArray(profile.adverseReactions) ? profile.adverseReactions : [];
  const entryIndex = adverseReactions.findIndex(entry => entry.id === entryId);
  
  if (entryIndex === -1) {
    throw new Error('Adverse reaction entry not found');
  }
  
  adverseReactions[entryIndex] = { ...adverseReactions[entryIndex], ...updates };
  
  return await updateUserProfile(userId, { adverseReactions });
}

export async function removeAdverseReactionEntry(userId: string, entryId: string) {
  const profile = await getUserProfile(userId);
  if (!profile) {
    throw new Error('User profile not found');
  }
  
  const adverseReactions = Array.isArray(profile.adverseReactions) ? profile.adverseReactions : [];
  const updatedAdverseReactions = adverseReactions.filter(entry => entry.id !== entryId);
  
  return await updateUserProfile(userId, { adverseReactions: updatedAdverseReactions });
}
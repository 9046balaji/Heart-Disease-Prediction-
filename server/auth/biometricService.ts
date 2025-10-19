import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { biometricTemplates } from '@shared/schema';
import crypto from 'crypto';

export interface BiometricTemplate {
  id: string;
  userId: string;
  template: string; // Hashed biometric template
  type: 'fingerprint' | 'face' | 'voice';
  createdAt: Date;
  updatedAt: Date;
}

export class BiometricService {
  // Register a new biometric template for a user
  public async registerBiometricTemplate(
    userId: string,
    template: string,
    type: 'fingerprint' | 'face' | 'voice'
  ): Promise<BiometricTemplate> {
    const dbInstance = await db;
    
    // Hash the biometric template for security
    const hashedTemplate = crypto.createHash('sha256').update(template).digest('hex');
    
    const newTemplate: BiometricTemplate = {
      id: `bt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      template: hashedTemplate,
      type,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await dbInstance.insert(biometricTemplates).values(newTemplate).execute();
    
    return newTemplate;
  }

  // Verify a biometric template against stored templates
  public async verifyBiometricTemplate(
    userId: string,
    template: string,
    type: 'fingerprint' | 'face' | 'voice'
  ): Promise<boolean> {
    const dbInstance = await db;
    
    // Hash the provided template
    const hashedTemplate = crypto.createHash('sha256').update(template).digest('hex');
    
    // Get the user's biometric template of the specified type
    const templates = await dbInstance
      .select()
      .from(biometricTemplates)
      .where(eq(biometricTemplates.userId, userId))
      .execute();
    
    // Check if any stored template matches
    for (const storedTemplate of templates) {
      if (storedTemplate.type === type && storedTemplate.template === hashedTemplate) {
        return true;
      }
    }
    
    return false;
  }

  // Get all biometric templates for a user
  public async getUserBiometricTemplates(userId: string): Promise<BiometricTemplate[]> {
    const dbInstance = await db;
    
    return await dbInstance
      .select()
      .from(biometricTemplates)
      .where(eq(biometricTemplates.userId, userId))
      .execute();
  }

  // Delete a biometric template
  public async deleteBiometricTemplate(templateId: string, userId: string): Promise<boolean> {
    const dbInstance = await db;
    
    try {
      await dbInstance
        .delete(biometricTemplates)
        .where(
          eq(biometricTemplates.id, templateId) && 
          eq(biometricTemplates.userId, userId)
        )
        .execute();
      
      return true;
    } catch (error) {
      console.error('Error deleting biometric template:', error);
      return false;
    }
  }
}

// Export a singleton instance of the biometric service
export const biometricService = new BiometricService();
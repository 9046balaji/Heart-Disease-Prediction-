import { db } from '../db';
import { eq } from 'drizzle-orm';
import { 
  userProfiles, 
  privacyConsents, 
  dataExportRequests, 
  dataDeletionRequests 
} from '@shared/schema';
import { AppError, NotFoundError, ValidationError } from '../utils/errors';

// Function to generate UUID using crypto API
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Privacy settings interface
export interface PrivacySettings {
  researchDataSharing: boolean;
  analyticsDataSharing: boolean;
  marketingCommunications: boolean;
  profileVisibility: 'private' | 'friends' | 'public';
  healthDataVisibility: 'private' | 'clinicians' | 'research';
}

// Data sharing preferences interface
export interface DataSharingPreferences {
  [key: string]: boolean; // Custom data sharing permissions
}

// Consent record interface
export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  granted: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class PrivacyService {
  // Get user privacy settings
  public async getUserPrivacySettings(userId: string) {
    try {
      // Validate input
      if (!userId) {
        throw new ValidationError('User ID is required');
      }
      
      const dbInstance = await db;
      
      const profiles = await dbInstance.select().from(userProfiles).where(eq(userProfiles.userId, userId));
      const profile = profiles[0];
      
      if (!profile) {
        throw new NotFoundError('User profile not found');
      }
      
      // Parse privacy settings if they exist
      let privacySettings: PrivacySettings = {
        researchDataSharing: false,
        analyticsDataSharing: false,
        marketingCommunications: false,
        profileVisibility: 'private',
        healthDataVisibility: 'private'
      };
      
      if (profile.privacySettings && typeof profile.privacySettings === 'string') {
        try {
          privacySettings = { ...privacySettings, ...JSON.parse(profile.privacySettings) };
        } catch (e) {
          console.warn('Failed to parse privacy settings JSON for user:', userId);
          // Use default settings if parsing fails
        }
      } else if (profile.privacySettings && typeof profile.privacySettings === 'object') {
        privacySettings = { ...privacySettings, ...profile.privacySettings };
      }
      
      // Parse data sharing preferences if they exist
      let dataSharingPreferences: DataSharingPreferences = {};
      
      if (profile.dataSharingPreferences && typeof profile.dataSharingPreferences === 'string') {
        try {
          dataSharingPreferences = JSON.parse(profile.dataSharingPreferences);
        } catch (e) {
          console.warn('Failed to parse data sharing preferences JSON for user:', userId);
          // Use empty object if parsing fails
        }
      } else if (profile.dataSharingPreferences && typeof profile.dataSharingPreferences === 'object' && profile.dataSharingPreferences !== null) {
        // Safely convert the object to DataSharingPreferences
        const prefs = profile.dataSharingPreferences as Record<string, unknown>;
        for (const key in prefs) {
          if (typeof prefs[key] === 'boolean') {
            dataSharingPreferences[key] = prefs[key] as boolean;
          }
        }
      }
      
      return {
        privacySettings,
        dataSharingPreferences
      };
    } catch (error) {
      // Re-throw known errors
      if (error instanceof AppError) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw new AppError('Failed to retrieve user privacy settings', 500, { userId, error: (error as Error).message });
    }
  }

  // Update user privacy settings
  public async updateUserPrivacySettings(
    userId: string, 
    privacySettings: PrivacySettings,
    dataSharingPreferences: DataSharingPreferences
  ) {
    try {
      // Validate inputs
      if (!userId) {
        throw new ValidationError('User ID is required');
      }
      
      if (!privacySettings || typeof privacySettings !== 'object') {
        throw new ValidationError('Privacy settings must be a valid object');
      }
      
      if (!dataSharingPreferences || typeof dataSharingPreferences !== 'object') {
        throw new ValidationError('Data sharing preferences must be a valid object');
      }
      
      const dbInstance = await db;
      
      // Check if user profile exists
      const profiles = await dbInstance.select().from(userProfiles).where(eq(userProfiles.userId, userId));
      if (profiles.length === 0) {
        throw new NotFoundError('User profile not found');
      }
      
      const updateData: any = {
        privacySettings: JSON.stringify(privacySettings),
        dataSharingPreferences: JSON.stringify(dataSharingPreferences),
        updatedAt: new Date()
      };
      
      await dbInstance.update(userProfiles).set(updateData).where(eq(userProfiles.userId, userId));
      
      return {
        privacySettings,
        dataSharingPreferences
      };
    } catch (error) {
      // Re-throw known errors
      if (error instanceof AppError) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw new AppError('Failed to update user privacy settings', 500, { userId, error: (error as Error).message });
    }
  }

  // Record user consent
  public async recordConsent(
    userId: string, 
    consentType: string, 
    granted: boolean,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ConsentRecord> {
    try {
      // Validate inputs
      if (!userId) {
        throw new ValidationError('User ID is required');
      }
      
      if (!consentType) {
        throw new ValidationError('Consent type is required');
      }
      
      if (typeof granted !== 'boolean') {
        throw new ValidationError('Granted must be a boolean value');
      }
      
      const dbInstance = await db;
      
      const consentRecord = {
        id: generateUUID(),
        userId,
        consentType,
        granted,
        timestamp: new Date(),
        ipAddress,
        userAgent
      };
      
      await dbInstance.insert(privacyConsents).values(consentRecord);
      
      return consentRecord;
    } catch (error) {
      // Re-throw known errors
      if (error instanceof AppError) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw new AppError('Failed to record user consent', 500, { userId, consentType, error: (error as Error).message });
    }
  }

  // Get user consent history
  public async getConsentHistory(userId: string): Promise<ConsentRecord[]> {
    try {
      // Validate input
      if (!userId) {
        throw new ValidationError('User ID is required');
      }
      
      const dbInstance = await db;
      
      const consents = await dbInstance.select().from(privacyConsents).where(eq(privacyConsents.userId, userId));
      
      return consents.map(consent => ({
        id: consent.id,
        userId: consent.userId,
        consentType: consent.consentType,
        granted: consent.granted,
        timestamp: consent.timestamp,
        ipAddress: consent.ipAddress || undefined,
        userAgent: consent.userAgent || undefined
      }));
    } catch (error) {
      // Re-throw known errors
      if (error instanceof AppError) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw new AppError('Failed to retrieve consent history', 500, { userId, error: (error as Error).message });
    }
  }

  // Request data export
  public async requestDataExport(
    userId: string, 
    fileType: 'json' | 'csv' | 'pdf'
  ) {
    try {
      // Validate inputs
      if (!userId) {
        throw new ValidationError('User ID is required');
      }
      
      if (!fileType) {
        throw new ValidationError('File type is required');
      }
      
      const validFileTypes = ['json', 'csv', 'pdf'];
      if (!validFileTypes.includes(fileType)) {
        throw new ValidationError(`Invalid file type. Must be one of: ${validFileTypes.join(', ')}`);
      }
      
      const dbInstance = await db;
      
      const exportRequest = {
        id: generateUUID(),
        userId,
        requestId: generateUUID(),
        fileType,
        requestedAt: new Date(),
        status: 'pending' as const
      };
      
      await dbInstance.insert(dataExportRequests).values(exportRequest);
      
      return exportRequest;
    } catch (error) {
      // Re-throw known errors
      if (error instanceof AppError) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw new AppError('Failed to request data export', 500, { userId, fileType, error: (error as Error).message });
    }
  }

  // Get data export requests
  public async getDataExportRequests(userId: string) {
    try {
      // Validate input
      if (!userId) {
        throw new ValidationError('User ID is required');
      }
      
      const dbInstance = await db;
      
      return await dbInstance.select().from(dataExportRequests).where(eq(dataExportRequests.userId, userId));
    } catch (error) {
      // Re-throw known errors
      if (error instanceof AppError) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw new AppError('Failed to retrieve data export requests', 500, { userId, error: (error as Error).message });
    }
  }

  // Request data deletion
  public async requestDataDeletion(userId: string, reason?: string) {
    try {
      // Validate input
      if (!userId) {
        throw new ValidationError('User ID is required');
      }
      
      const dbInstance = await db;
      
      const deletionRequest = {
        id: generateUUID(),
        userId,
        requestId: generateUUID(),
        requestedAt: new Date(),
        status: 'pending' as const,
        reason
      };
      
      await dbInstance.insert(dataDeletionRequests).values(deletionRequest);
      
      return deletionRequest;
    } catch (error) {
      // Re-throw known errors
      if (error instanceof AppError) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw new AppError('Failed to request data deletion', 500, { userId, error: (error as Error).message });
    }
  }

  // Get data deletion requests
  public async getDataDeletionRequests(userId: string) {
    try {
      // Validate input
      if (!userId) {
        throw new ValidationError('User ID is required');
      }
      
      const dbInstance = await db;
      
      return await dbInstance.select().from(dataDeletionRequests).where(eq(dataDeletionRequests.userId, userId));
    } catch (error) {
      // Re-throw known errors
      if (error instanceof AppError) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw new AppError('Failed to retrieve data deletion requests', 500, { userId, error: (error as Error).message });
    }
  }

  // Get all user data for export
  public async getUserDataForExport(userId: string): Promise<any> {
    try {
      // Validate input
      if (!userId) {
        throw new ValidationError('User ID is required');
      }
      
      const dbInstance = await db;
      
      // Get user profile
      const profiles = await dbInstance.select().from(userProfiles).where(eq(userProfiles.userId, userId));
      const profile = profiles[0];
      
      if (!profile) {
        throw new NotFoundError('User profile not found');
      }
      
      // In a real implementation, you would collect all user data from all tables
      // This is a simplified version for demonstration
      const userData: any = {
        profile: profile,
        createdAt: new Date()
      };
      
      return userData;
    } catch (error) {
      // Re-throw known errors
      if (error instanceof AppError) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw new AppError('Failed to retrieve user data for export', 500, { userId, error: (error as Error).message });
    }
  }
}

// Export a singleton instance of the privacy service
export const privacyService = new PrivacyService();
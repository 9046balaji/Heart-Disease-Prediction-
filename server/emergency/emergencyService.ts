// Emergency service for the HeartGuard application
// This service handles emergency contact management and escalation

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  relationship: string; // e.g., "spouse", "child", "friend", "doctor"
  isPrimary: boolean;
  createdAt: Date;
}

export interface EmergencyMessage {
  id: string;
  userId: string;
  contacts: string[]; // Array of contact IDs
  message: string;
  timestamp: Date;
  status: "sent" | "failed" | "pending";
}

// Medical ID interface
export interface MedicalId {
  id: string;
  userId: string;
  bloodType: string;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  emergencyContacts: string[];
  notes: string;
  updatedAt: Date;
}

// Location data interface
export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
}

export interface EmergencyConfiguration {
  id: string;
  userId: string;
  autoNotificationEnabled: boolean;
  notificationDelayMs: number; // Delay before auto-notification (0 = immediate)
  emergencyInstructions: string;
  customMessageTemplate: string;
  updatedAt: Date;
}

export class EmergencyService {
  private emergencyContacts: Map<string, EmergencyContact[]>;
  private emergencyMessages: Map<string, EmergencyMessage[]>;
  private medicalIds: Map<string, MedicalId>;
  private locations: Map<string, LocationData>;
  private emergencyConfigurations: Map<string, EmergencyConfiguration>;

  constructor() {
    this.emergencyContacts = new Map();
    this.emergencyMessages = new Map();
    this.medicalIds = new Map();
    this.locations = new Map();
    this.emergencyConfigurations = new Map();
  }

  // Add emergency contact for a user
  public async addEmergencyContact(
    userId: string, 
    contactData: Omit<EmergencyContact, "id" | "userId" | "createdAt">
  ): Promise<EmergencyContact> {
    const contact: EmergencyContact = {
      id: this.generateId(),
      userId,
      ...contactData,
      createdAt: new Date()
    };

    if (!this.emergencyContacts.has(userId)) {
      this.emergencyContacts.set(userId, []);
    }

    const userContacts = this.emergencyContacts.get(userId) || [];
    userContacts.push(contact);
    this.emergencyContacts.set(userId, userContacts);

    return contact;
  }

  // Get all emergency contacts for a user
  public async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    return this.emergencyContacts.get(userId) || [];
  }

  // Get primary emergency contact for a user
  public async getPrimaryEmergencyContact(userId: string): Promise<EmergencyContact | undefined> {
    const contacts = this.emergencyContacts.get(userId) || [];
    return contacts.find(contact => contact.isPrimary);
  }

  // Update emergency contact
  public async updateEmergencyContact(
    userId: string, 
    contactId: string, 
    updateData: Partial<Omit<EmergencyContact, "id" | "userId" | "createdAt">>
  ): Promise<EmergencyContact | undefined> {
    const contacts = this.emergencyContacts.get(userId) || [];
    const contactIndex = contacts.findIndex(c => c.id === contactId);
    
    if (contactIndex === -1) {
      return undefined;
    }

    // If setting this contact as primary, unset other primary contacts
    if (updateData.isPrimary) {
      contacts.forEach((c, index) => {
        if (c.isPrimary && index !== contactIndex) {
          contacts[index] = { ...c, isPrimary: false };
        }
      });
    }

    contacts[contactIndex] = { ...contacts[contactIndex], ...updateData };
    this.emergencyContacts.set(userId, contacts);

    return contacts[contactIndex];
  }

  // Delete emergency contact
  public async deleteEmergencyContact(userId: string, contactId: string): Promise<boolean> {
    const contacts = this.emergencyContacts.get(userId) || [];
    const contactIndex = contacts.findIndex(c => c.id === contactId);
    
    if (contactIndex === -1) {
      return false;
    }

    contacts.splice(contactIndex, 1);
    this.emergencyContacts.set(userId, contacts);
    return true;
  }

  // Send emergency message to contacts
  public async sendEmergencyMessage(
    userId: string, 
    message: string, 
    contactIds?: string[]
  ): Promise<EmergencyMessage> {
    // Get contacts to send message to
    let contactsToSend: EmergencyContact[] = [];
    
    if (contactIds && contactIds.length > 0) {
      // Send to specific contacts
      const allContacts = this.emergencyContacts.get(userId) || [];
      contactsToSend = allContacts.filter(c => contactIds.includes(c.id));
    } else {
      // Send to all contacts
      contactsToSend = this.emergencyContacts.get(userId) || [];
    }

    // In a real implementation, this would integrate with an SMS service
    // For now, we'll simulate sending messages
    console.log(`Sending emergency message to ${contactsToSend.length} contacts:`, message);
    
    // Log the message
    const emergencyMessage: EmergencyMessage = {
      id: this.generateId(),
      userId,
      contacts: contactsToSend.map(c => c.id),
      message,
      timestamp: new Date(),
      status: "sent" // In a real implementation, this would depend on SMS service response
    };

    if (!this.emergencyMessages.has(userId)) {
      this.emergencyMessages.set(userId, []);
    }

    const userMessages = this.emergencyMessages.get(userId) || [];
    userMessages.push(emergencyMessage);
    this.emergencyMessages.set(userId, userMessages);

    return emergencyMessage;
  }

  // Get emergency message history for a user
  public async getEmergencyMessageHistory(userId: string): Promise<EmergencyMessage[]> {
    return this.emergencyMessages.get(userId) || [];
  }

  // Call emergency services (911)
  public async callEmergencyServices(userId: string): Promise<boolean> {
    // In a real implementation, this would integrate with a telephony service
    // For now, we'll just log the call
    console.log(`Calling emergency services for user ${userId}`);
    
    // In a browser environment, we could use:
    // window.location.href = "tel:911";
    
    return true;
  }

  // Automatic emergency notification - sends message to all contacts with medical ID
  public async automaticEmergencyNotification(userId: string): Promise<EmergencyMessage> {
    // Get user's medical ID
    const medicalId = this.medicalIds.get(userId);
    
    // Create emergency message with medical information
    let message = "EMERGENCY: This is an automatic emergency notification. ";
    
    // Always include medical info section
    if (medicalId) {
      message += `Medical info - Blood Type: ${medicalId.bloodType || 'N/A'}, `;
      message += `Allergies: ${medicalId.allergies?.join(', ') || 'None'}, `;
      message += `Conditions: ${medicalId.medicalConditions?.join(', ') || 'None'}. `;
    } else {
      message += `Medical info - Blood Type: N/A, `;
      message += `Allergies: None, `;
      message += `Conditions: None. `;
    }
    
    message += "Please contact emergency services immediately.";
    
    // Get user's location if available
    const location = this.locations.get(userId);
    if (location) {
      message += ` Location: https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    }
    
    // Send message to all emergency contacts
    return this.sendEmergencyMessage(userId, message);
  }

  // Update user's location
  public async updateLocation(userId: string, locationData: Omit<LocationData, "timestamp">): Promise<LocationData> {
    const location: LocationData = {
      ...locationData,
      timestamp: new Date()
    };
    
    this.locations.set(userId, location);
    return location;
  }

  // Get user's latest location
  public async getLocation(userId: string): Promise<LocationData | undefined> {
    return this.locations.get(userId);
  }

  // Create or update user's medical ID
  public async upsertMedicalId(userId: string, medicalData: Omit<MedicalId, "id" | "userId" | "updatedAt">): Promise<MedicalId> {
    const medicalId: MedicalId = {
      id: this.generateId(),
      userId,
      ...medicalData,
      updatedAt: new Date()
    };
    
    this.medicalIds.set(userId, medicalId);
    return medicalId;
  }

  // Get user's medical ID
  public async getMedicalId(userId: string): Promise<MedicalId | undefined> {
    return this.medicalIds.get(userId);
  }

  // Create or update emergency configuration
  public async upsertEmergencyConfiguration(
    userId: string, 
    configData: Omit<EmergencyConfiguration, "id" | "userId" | "updatedAt">
  ): Promise<EmergencyConfiguration> {
    const config: EmergencyConfiguration = {
      id: this.generateId(),
      userId,
      ...configData,
      updatedAt: new Date()
    };
    
    this.emergencyConfigurations.set(userId, config);
    return config;
  }

  // Get user's emergency configuration
  public async getEmergencyConfiguration(userId: string): Promise<EmergencyConfiguration | undefined> {
    return this.emergencyConfigurations.get(userId);
  }

  // Enhanced automatic emergency notification with configuration
  public async enhancedAutomaticEmergencyNotification(userId: string): Promise<EmergencyMessage> {
    // Get user's emergency configuration
    const config = this.emergencyConfigurations.get(userId);
    
    // Create emergency message
    let message = "";
    
    if (config && config.customMessageTemplate) {
      // Use custom template if available
      message = config.customMessageTemplate;
    } else {
      // Use default message
      message = "EMERGENCY: This is an automatic emergency notification. ";
    }
    
    // Get user's medical ID
    const medicalId = this.medicalIds.get(userId);
    
    if (medicalId) {
      // Replace placeholders in custom message template
      message = message.replace('{bloodType}', medicalId.bloodType || 'N/A');
      message = message.replace('{allergies}', medicalId.allergies?.join(', ') || 'None');
      message = message.replace('{conditions}', medicalId.medicalConditions?.join(', ') || 'None');
      
      // If using default message, append medical info
      if (!config || !config.customMessageTemplate) {
        message += `Medical info - Blood Type: ${medicalId.bloodType || 'N/A'}, `;
        message += `Allergies: ${medicalId.allergies?.join(', ') || 'None'}, `;
        message += `Conditions: ${medicalId.medicalConditions?.join(', ') || 'None'}. `;
      } else {
        // For custom templates, append medical details after template
        message += `. Allergies: ${medicalId.allergies?.join(', ') || 'None'}, `;
        message += `Conditions: ${medicalId.medicalConditions?.join(', ') || 'None'}`;
      }
    } else {
      // If using default message and no medical ID, append default info
      if (!config || !config.customMessageTemplate) {
        message += `Medical info - Blood Type: N/A, `;
        message += `Allergies: None, `;
        message += `Conditions: None. `;
      }
    }
    
    // Append emergency instruction if not in custom template
    if (!config || !config.customMessageTemplate) {
      message += "Please contact emergency services immediately.";
    } else {
      message += ". Please contact emergency services immediately.";
    }
    
    // Get user's location if available
    const location = this.locations.get(userId);
    if (location) {
      message += ` Location: https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    }
    
    // Apply delay if configured
    if (config && config.notificationDelayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, config.notificationDelayMs));
    }
    
    // Send message to all emergency contacts
    return this.sendEmergencyMessage(userId, message);
  }

  // Generate a unique ID
  private generateId(): string {
    return `ec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export a singleton instance of the emergency service
export const emergencyService = new EmergencyService();
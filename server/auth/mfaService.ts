import { db } from '../db';
import { eq } from 'drizzle-orm';
import { createTransport } from 'nodemailer';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { users } from '@shared/schema';
import twilio from 'twilio';

// Function to generate UUID using crypto API
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// MFA methods
export type MfaMethod = 'email' | 'authenticator' | 'sms';

export interface MfaSetup {
  id: string;
  userId: string;
  method: MfaMethod;
  secret?: string; // For authenticator app
  phoneNumber?: string; // For SMS
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MfaChallenge {
  id: string;
  userId: string;
  method: MfaMethod;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

export class MfaService {
  // Generate a secret for authenticator app
  public generateAuthenticatorSecret() {
    return speakeasy.generateSecret({
      name: 'HeartGuard',
      issuer: 'HeartGuard App'
    });
  }

  // Generate QR code for authenticator app
  public async generateQrCode(secret: string): Promise<string> {
    try {
      return await QRCode.toDataURL(secret);
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  // Verify authenticator token
  public verifyAuthenticatorToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow for time drift
    });
  }

  // Generate a random 6-digit code
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Setup MFA for a user
  public async setupMfa(userId: string, method: MfaMethod, options?: { phoneNumber?: string }): Promise<{ secret?: string }> {
    const dbInstance = await db;
    
    // Update user's MFA fields directly in the users table
    const updateData: any = {
      mfaMethod: method,
      updatedAt: new Date()
    };
    
    let secret: string | undefined;
    
    // Generate secret for authenticator app
    if (method === 'authenticator') {
      const secretObj = this.generateAuthenticatorSecret();
      secret = secretObj.base32;
      updateData.mfaSecret = secret;
    }
    
    // Set phone number for SMS
    if (method === 'sms' && options?.phoneNumber) {
      updateData.phoneNumber = options.phoneNumber;
    }
    
    await dbInstance.update(users).set(updateData).where(eq(users.id, userId));
    
    return { secret };
  }

  // Generate MFA challenge
  public async generateChallenge(userId: string, method: MfaMethod): Promise<MfaChallenge> {
    const dbInstance = await db;
    
    // Get user's MFA setup
    const userResult = await dbInstance.select().from(users).where(eq(users.id, userId));
    if (userResult.length === 0) {
      throw new Error('User not found');
    }
    
    const user = userResult[0];
    if (!user.mfaMethod) {
      throw new Error('MFA not setup for user');
    }
    
    // Generate code
    const code = this.generateCode();
    
    // Update user with the new code and expiration
    await dbInstance.update(users).set({
      mfaCode: code,
      mfaExpiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    }).where(eq(users.id, userId));
    
    // Create challenge object to return
    const challenge: MfaChallenge = {
      id: generateUUID(),
      userId,
      method,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      createdAt: new Date()
    };
    
    // Send code based on method
    switch (method) {
      case 'email':
        if (user.email) {
          await this.sendEmailCode(user.email, code);
        }
        break;
      case 'sms':
        if (user.phoneNumber) {
          await this.sendSmsCode(user.phoneNumber, code);
        }
        break;
      case 'authenticator':
        // For authenticator, the user generates the code in their app
        break;
    }
    
    return challenge;
  }

  // Verify MFA challenge
  public async verifyChallenge(userId: string, method: MfaMethod, code: string, challengeId?: string): Promise<boolean> {
    const dbInstance = await db;
    
    // Get user
    const userResult = await dbInstance.select().from(users).where(eq(users.id, userId));
    if (userResult.length === 0) {
      throw new Error('User not found');
    }
    
    const user = userResult[0];
    
    // For authenticator, verify the token directly
    if (method === 'authenticator') {
      if (!user.mfaSecret) {
        throw new Error('MFA not setup for user');
      }
      
      return this.verifyAuthenticatorToken(user.mfaSecret, code);
    }
    
    // For email/SMS, verify against stored challenge
    // Check if code exists, is not expired, and matches
    if (!user.mfaCode || !user.mfaExpiresAt) {
      return false;
    }
    
    // Check if code is expired
    if (new Date() > new Date(user.mfaExpiresAt)) {
      return false;
    }
    
    // Check if code matches
    if (user.mfaCode !== code) {
      return false;
    }
    
    // Clear the used code
    await dbInstance.update(users).set({
      mfaCode: null,
      mfaExpiresAt: null
    }).where(eq(users.id, userId));
    
    return true;
  }

  // Send email code
  private async sendEmailCode(email: string, code: string): Promise<void> {
    // Check if email is provided
    if (!email) {
      throw new Error('Email address is required to send email');
    }
    
    console.log(`Sending MFA code ${code} to ${email}`);
    
    try {
      // Check if email service credentials are configured
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const fromEmail = process.env.FROM_EMAIL || 'noreply@heartguard.com';
      
      // If SMTP is configured, use nodemailer to send real emails
      if (smtpHost && smtpUser && smtpPass) {
        const transporter = createTransport({
          host: smtpHost,
          port: smtpPort || 587,
          secure: smtpPort === 465, // true for 465, false for other ports
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });
        
        await transporter.sendMail({
          from: fromEmail,
          to: email,
          subject: 'HeartGuard Verification Code',
          text: `Your verification code is: ${code}\n\nThis code will expire in 5 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">HeartGuard Verification Code</h2>
              <p>Your verification code is:</p>
              <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">
                ${code}
              </div>
              <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes.</p>
              <hr style="margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </div>
          `
        });
        
        console.log(`Email sent successfully to ${email}`);
      } else {
        // Mock implementation - in production, use a real email service
        console.log(`No email service configured. Would send email with code ${code} to ${email}`);
        // For testing purposes, you might want to log the code somewhere accessible
        console.log(`TESTING ONLY - Verification code: ${code}`);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email verification code');
    }
  }

  // Send SMS code
  private async sendSmsCode(phoneNumber: string | null, code: string): Promise<void> {
    // Check if phoneNumber is provided
    if (!phoneNumber) {
      throw new Error('Phone number is required to send SMS');
    }
    
    // In a real implementation, you would use an SMS service
    console.log(`Sending MFA code ${code} to ${phoneNumber}`);
    
    try {
      // Check if Twilio credentials are configured
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;
      
      if (accountSid && authToken && fromNumber) {
        const client = twilio(accountSid, authToken);
        
        await client.messages.create({
          body: `Your HeartGuard verification code is: ${code}`,
          from: fromNumber,
          to: phoneNumber
        });
        
        console.log(`SMS sent successfully to ${phoneNumber} via Twilio`);
      } else {
        // Mock implementation - in production, use a real SMS service
        console.log(`No SMS service configured. Would send SMS with code ${code} to ${phoneNumber}`);
        // For testing purposes, you might want to log the code somewhere accessible
        console.log(`TESTING ONLY - Verification code: ${code}`);
      }
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw new Error('Failed to send SMS verification code');
    }
  }

  // Disable MFA for a user
  public async disableMfa(userId: string): Promise<void> {
    const dbInstance = await db;
    
    await dbInstance.update(users).set({
      mfaMethod: null,
      mfaSecret: null,
      phoneNumber: null,
      mfaCode: null,
      mfaExpiresAt: null,
      updatedAt: new Date()
    }).where(eq(users.id, userId));
  }
}

// Export a singleton instance of the MFA service
export const mfaService = new MfaService();
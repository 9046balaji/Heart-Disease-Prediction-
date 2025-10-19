import { Router } from 'express';
import { privacyService } from './privacyService';
import { authenticateUser } from '../auth/authMiddleware';
import { catchAsync } from '../utils/errors';
import { AppError, ValidationError, NotFoundError, InternalServerError } from '../utils/errors';

export function setupPrivacyRoutes(app: Router) {
  const router = Router();

  // Get user privacy settings
  router.get('/privacy/settings', authenticateUser, catchAsync(async (req: any, res: any) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        throw new AppError('User ID is missing from request', 400);
      }
      
      const privacyData = await privacyService.getUserPrivacySettings(userId);
      
      res.status(200).json({
        success: true,
        data: privacyData
      });
    } catch (error: any) {
      console.error('Error retrieving privacy settings:', {
        userId: req.userId,
        error: error.message,
        stack: error.stack
      });
      
      // Handle specific error types
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            statusCode: error.statusCode,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
          }
        });
      }
      
      // Handle database errors or other unexpected errors
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve privacy settings',
          statusCode: 500,
          ...(process.env.NODE_ENV === 'development' && { details: error.message })
        }
      });
    }
  }));

  // Update user privacy settings
  router.post('/privacy/settings', authenticateUser, catchAsync(async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { privacySettings, dataSharingPreferences } = req.body;
      
      // Validate required parameters
      if (!userId) {
        throw new ValidationError('User ID is missing from request');
      }
      
      if (!privacySettings) {
        throw new ValidationError('Privacy settings are required');
      }
      
      // Validate privacy settings structure
      if (typeof privacySettings !== 'object' || privacySettings === null) {
        throw new ValidationError('Privacy settings must be an object');
      }
      
      // Validate data sharing preferences if provided
      if (dataSharingPreferences && typeof dataSharingPreferences !== 'object') {
        throw new ValidationError('Data sharing preferences must be an object');
      }
      
      const updatedSettings = await privacyService.updateUserPrivacySettings(
        userId, 
        privacySettings, 
        dataSharingPreferences || {}
      );
      
      res.status(200).json({
        success: true,
        data: updatedSettings
      });
    } catch (error: any) {
      console.error('Error updating privacy settings:', {
        userId: req.userId,
        body: req.body,
        error: error.message,
        stack: error.stack
      });
      
      // Handle validation errors
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            message: error.message,
            statusCode: 400,
            ...(error.details && { details: error.details })
          }
        });
      }
      
      // Handle other application errors
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            statusCode: error.statusCode,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
          }
        });
      }
      
      // Handle database errors or other unexpected errors
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update privacy settings',
          statusCode: 500,
          ...(process.env.NODE_ENV === 'development' && { details: error.message })
        }
      });
    }
  }));

  // Get user consent history
  router.get('/privacy/consents', authenticateUser, catchAsync(async (req: any, res: any) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        throw new AppError('User ID is missing from request', 400);
      }
      
      const consents = await privacyService.getConsentHistory(userId);
      
      res.status(200).json({
        success: true,
        data: consents
      });
    } catch (error: any) {
      console.error('Error retrieving consent history:', {
        userId: req.userId,
        error: error.message,
        stack: error.stack
      });
      
      // Handle specific error types
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            statusCode: error.statusCode,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
          }
        });
      }
      
      // Handle database errors or other unexpected errors
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve consent history',
          statusCode: 500,
          ...(process.env.NODE_ENV === 'development' && { details: error.message })
        }
      });
    }
  }));

  // Record user consent
  router.post('/privacy/consents', authenticateUser, catchAsync(async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { consentType, granted } = req.body;
      
      // Validate required parameters
      if (!userId) {
        throw new ValidationError('User ID is missing from request');
      }
      
      if (!consentType) {
        throw new ValidationError('Consent type is required');
      }
      
      if (typeof granted !== 'boolean') {
        throw new ValidationError('Granted must be a boolean value');
      }
      
      // Get IP address and user agent for consent logging
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];
      
      const consentRecord = await privacyService.recordConsent(
        userId, 
        consentType, 
        granted,
        ipAddress as string,
        userAgent
      );
      
      res.status(201).json({
        success: true,
        data: consentRecord
      });
    } catch (error: any) {
      console.error('Error recording consent:', {
        userId: req.userId,
        body: req.body,
        error: error.message,
        stack: error.stack
      });
      
      // Handle validation errors
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            message: error.message,
            statusCode: 400,
            ...(error.details && { details: error.details })
          }
        });
      }
      
      // Handle other application errors
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            statusCode: error.statusCode,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
          }
        });
      }
      
      // Handle database errors or other unexpected errors
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to record consent',
          statusCode: 500,
          ...(process.env.NODE_ENV === 'development' && { details: error.message })
        }
      });
    }
  }));

  // Request data export
  router.post('/privacy/export-request', authenticateUser, catchAsync(async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { fileType } = req.body;
      
      // Validate required parameters
      if (!userId) {
        throw new ValidationError('User ID is missing from request');
      }
      
      if (!fileType) {
        throw new ValidationError('File type is required');
      }
      
      // Validate file type
      const validFileTypes = ['json', 'csv', 'pdf'];
      if (!validFileTypes.includes(fileType)) {
        throw new ValidationError(`Invalid file type. Must be one of: ${validFileTypes.join(', ')}`);
      }
      
      const exportRequest = await privacyService.requestDataExport(userId, fileType as 'json' | 'csv' | 'pdf');
      
      res.status(201).json({
        success: true,
        data: exportRequest
      });
    } catch (error: any) {
      console.error('Error requesting data export:', {
        userId: req.userId,
        body: req.body,
        error: error.message,
        stack: error.stack
      });
      
      // Handle validation errors
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            message: error.message,
            statusCode: 400,
            ...(error.details && { details: error.details })
          }
        });
      }
      
      // Handle other application errors
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            statusCode: error.statusCode,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
          }
        });
      }
      
      // Handle database errors or other unexpected errors
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to request data export',
          statusCode: 500,
          ...(process.env.NODE_ENV === 'development' && { details: error.message })
        }
      });
    }
  }));

  // Get data export requests
  router.get('/privacy/export-requests', authenticateUser, catchAsync(async (req: any, res: any) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        throw new AppError('User ID is missing from request', 400);
      }
      
      const exportRequests = await privacyService.getDataExportRequests(userId);
      
      res.status(200).json({
        success: true,
        data: exportRequests
      });
    } catch (error: any) {
      console.error('Error retrieving export requests:', {
        userId: req.userId,
        error: error.message,
        stack: error.stack
      });
      
      // Handle specific error types
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            statusCode: error.statusCode,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
          }
        });
      }
      
      // Handle database errors or other unexpected errors
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve export requests',
          statusCode: 500,
          ...(process.env.NODE_ENV === 'development' && { details: error.message })
        }
      });
    }
  }));

  // Request data deletion
  router.post('/privacy/deletion-request', authenticateUser, catchAsync(async (req: any, res: any) => {
    try {
      const userId = req.userId;
      const { reason } = req.body;
      
      // Validate required parameters
      if (!userId) {
        throw new ValidationError('User ID is missing from request');
      }
      
      const deletionRequest = await privacyService.requestDataDeletion(userId, reason);
      
      res.status(201).json({
        success: true,
        data: deletionRequest
      });
    } catch (error: any) {
      console.error('Error requesting data deletion:', {
        userId: req.userId,
        body: req.body,
        error: error.message,
        stack: error.stack
      });
      
      // Handle validation errors
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          error: {
            message: error.message,
            statusCode: 400,
            ...(error.details && { details: error.details })
          }
        });
      }
      
      // Handle other application errors
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            statusCode: error.statusCode,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
          }
        });
      }
      
      // Handle database errors or other unexpected errors
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to request data deletion',
          statusCode: 500,
          ...(process.env.NODE_ENV === 'development' && { details: error.message })
        }
      });
    }
  }));

  // Get data deletion requests
  router.get('/privacy/deletion-requests', authenticateUser, catchAsync(async (req: any, res: any) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        throw new AppError('User ID is missing from request', 400);
      }
      
      const deletionRequests = await privacyService.getDataDeletionRequests(userId);
      
      res.status(200).json({
        success: true,
        data: deletionRequests
      });
    } catch (error: any) {
      console.error('Error retrieving deletion requests:', {
        userId: req.userId,
        error: error.message,
        stack: error.stack
      });
      
      // Handle specific error types
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            statusCode: error.statusCode,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
          }
        });
      }
      
      // Handle database errors or other unexpected errors
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve deletion requests',
          statusCode: 500,
          ...(process.env.NODE_ENV === 'development' && { details: error.message })
        }
      });
    }
  }));

  // Get all user data for export
  router.get('/privacy/user-data', authenticateUser, catchAsync(async (req: any, res: any) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        throw new AppError('User ID is missing from request', 400);
      }
      
      const userData = await privacyService.getUserDataForExport(userId);
      
      res.status(200).json({
        success: true,
        data: userData
      });
    } catch (error: any) {
      console.error('Error retrieving user data:', {
        userId: req.userId,
        error: error.message,
        stack: error.stack
      });
      
      // Handle specific error types
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            statusCode: error.statusCode,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
          }
        });
      }
      
      // Handle database errors or other unexpected errors
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve user data',
          statusCode: 500,
          ...(process.env.NODE_ENV === 'development' && { details: error.message })
        }
      });
    }
  }));

  app.use('/api', router);
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  Download, 
  Trash2, 
  History,
  FileText,
  Users,
  BarChart3,
  Mail,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authenticatedFetch } from "@/utils/auth";

interface PrivacySettings {
  researchDataSharing: boolean;
  analyticsDataSharing: boolean;
  marketingCommunications: boolean;
  profileVisibility: 'private' | 'friends' | 'public';
  healthDataVisibility: 'private' | 'clinicians' | 'research';
}

interface DataSharingPreferences {
  [key: string]: boolean;
}

interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  granted: boolean;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

interface ExportRequest {
  id: string;
  userId: string;
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileType: 'json' | 'csv' | 'pdf';
  requestedAt: string;
  completedAt?: string;
  filePath?: string;
}

interface DeletionRequest {
  id: string;
  userId: string;
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
  reason?: string;
}

const PrivacyDashboard: React.FC = () => {
  const { toast } = useToast();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    researchDataSharing: false,
    analyticsDataSharing: false,
    marketingCommunications: false,
    profileVisibility: 'private',
    healthDataVisibility: 'private'
  });
  
  const [dataSharingPreferences, setDataSharingPreferences] = useState<DataSharingPreferences>({});
  const [consentHistory, setConsentHistory] = useState<ConsentRecord[]>([]);
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [deletionReason, setDeletionReason] = useState('');
  const [selectedExportFormat, setSelectedExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [activeTab, setActiveTab] = useState<'settings' | 'consents' | 'requests'>('settings');
  const [isLoading, setIsLoading] = useState(true);

  // Load privacy data on component mount
  useEffect(() => {
    loadPrivacyData();
  }, []);

  const loadPrivacyData = async () => {
    try {
      setIsLoading(true);
      
      // Load privacy settings
      const settingsResponse = await authenticatedFetch('/api/privacy/settings');
      if (settingsResponse.ok) {
        const result = await settingsResponse.json();
        setPrivacySettings(result.data.privacySettings);
        setDataSharingPreferences(result.data.dataSharingPreferences);
      }
      
      // Load consent history
      const consentsResponse = await authenticatedFetch('/api/privacy/consents');
      if (consentsResponse.ok) {
        const result = await consentsResponse.json();
        setConsentHistory(result.data);
      }
      
      // Load export requests
      const exportsResponse = await authenticatedFetch('/api/privacy/export-requests');
      if (exportsResponse.ok) {
        const result = await exportsResponse.json();
        setExportRequests(result.data);
      }
      
      // Load deletion requests
      const deletionsResponse = await authenticatedFetch('/api/privacy/deletion-requests');
      if (deletionsResponse.ok) {
        const result = await deletionsResponse.json();
        setDeletionRequests(result.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load privacy data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacySettingsChange = async () => {
    try {
      const response = await authenticatedFetch('/api/privacy/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          privacySettings,
          dataSharingPreferences
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update privacy settings');
      }
      
      toast({
        title: "Success",
        description: "Privacy settings updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update privacy settings",
        variant: "destructive"
      });
    }
  };

  const handleDataExportRequest = async () => {
    try {
      const response = await authenticatedFetch('/api/privacy/export-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileType: selectedExportFormat
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to request data export');
      }
      
      // Reload export requests
      const exportsResponse = await authenticatedFetch('/api/privacy/export-requests');
      if (exportsResponse.ok) {
        const result = await exportsResponse.json();
        setExportRequests(result.data);
      }
      
      toast({
        title: "Success",
        description: "Data export request submitted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to request data export",
        variant: "destructive"
      });
    }
  };

  const handleDataDeletionRequest = async () => {
    try {
      const response = await authenticatedFetch('/api/privacy/deletion-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: deletionReason
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to request data deletion');
      }
      
      // Reload deletion requests
      const deletionsResponse = await authenticatedFetch('/api/privacy/deletion-requests');
      if (deletionsResponse.ok) {
        const result = await deletionsResponse.json();
        setDeletionRequests(result.data);
      }
      
      setDeletionReason('');
      toast({
        title: "Success",
        description: "Data deletion request submitted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to request data deletion",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Privacy Dashboard</h2>
      </div>
      
      <p className="text-muted-foreground">
        Manage your privacy settings, view consent history, and control your data
      </p>
      
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b">
        <Button
          variant={activeTab === 'settings' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('settings')}
          className="px-4"
        >
          <Shield className="h-4 w-4 mr-2" />
          Privacy Settings
        </Button>
        <Button
          variant={activeTab === 'consents' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('consents')}
          className="px-4"
        >
          <History className="h-4 w-4 mr-2" />
          Consent History
        </Button>
        <Button
          variant={activeTab === 'requests' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('requests')}
          className="px-4"
        >
          <FileText className="h-4 w-4 mr-2" />
          Data Requests
        </Button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'settings' ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Sharing Preferences</CardTitle>
              <CardDescription>
                Control how your data is used and shared
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="research-sharing">Research Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow anonymized data for medical research
                    </p>
                  </div>
                  <Switch
                    id="research-sharing"
                    checked={privacySettings.researchDataSharing}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, researchDataSharing: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analytics-sharing">Analytics Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Help us improve the app through usage analytics
                    </p>
                  </div>
                  <Switch
                    id="analytics-sharing"
                    checked={privacySettings.analyticsDataSharing}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, analyticsDataSharing: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-communications">Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails and updates
                    </p>
                  </div>
                  <Switch
                    id="marketing-communications"
                    checked={privacySettings.marketingCommunications}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, marketingCommunications: checked }))
                    }
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-4">Visibility Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <div className="flex flex-wrap gap-2">
                      {(['private', 'friends', 'public'] as const).map((visibility) => (
                        <Button
                          key={visibility}
                          variant={privacySettings.profileVisibility === visibility ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => 
                            setPrivacySettings(prev => ({ ...prev, profileVisibility: visibility }))
                          }
                        >
                          {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Health Data Visibility</Label>
                    <div className="flex flex-wrap gap-2">
                      {(['private', 'clinicians', 'research'] as const).map((visibility) => (
                        <Button
                          key={visibility}
                          variant={privacySettings.healthDataVisibility === visibility ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => 
                            setPrivacySettings(prev => ({ ...prev, healthDataVisibility: visibility }))
                          }
                        >
                          {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <Button onClick={handlePrivacySettingsChange} className="w-full">
                Save Privacy Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : activeTab === 'consents' ? (
        <Card>
          <CardHeader>
            <CardTitle>Consent History</CardTitle>
            <CardDescription>
              View your consent records and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {consentHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No consent records found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {consentHistory.map((consent) => (
                  <div key={consent.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{consent.consentType}</h3>
                        <p className="text-sm text-muted-foreground">
                          {consent.granted ? 'Granted' : 'Revoked'} on {formatDate(consent.timestamp)}
                        </p>
                        {consent.ipAddress && (
                          <p className="text-xs text-muted-foreground mt-1">
                            IP: {consent.ipAddress}
                          </p>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        consent.granted 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {consent.granted ? 'Granted' : 'Revoked'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Your Data</CardTitle>
              <CardDescription>
                Request a copy of your personal data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <div className="flex flex-wrap gap-2">
                    {(['json', 'csv', 'pdf'] as const).map((format) => (
                      <Button
                        key={format}
                        variant={selectedExportFormat === format ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedExportFormat(format)}
                      >
                        {format.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <Button onClick={handleDataExportRequest} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Request Data Export
              </Button>
              
              {exportRequests.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Recent Export Requests</h3>
                  <div className="space-y-2">
                    {exportRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{request.fileType.toUpperCase()} Export</p>
                          <p className="text-xs text-muted-foreground">
                            Requested: {formatDate(request.requestedAt)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          request.status === 'completed' ? 'bg-green-100 text-green-800' :
                          request.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Delete Your Data</CardTitle>
              <CardDescription>
                Request deletion of your account and personal data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deletion-reason">Reason for Deletion (Optional)</Label>
                <Textarea
                  id="deletion-reason"
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  placeholder="Tell us why you're deleting your account..."
                  rows={3}
                />
              </div>
              
              <div className="p-4 bg-destructive/10 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-destructive">Important Notice</h4>
                    <p className="text-sm text-destructive/80 mt-1">
                      This action cannot be undone. All your personal data will be permanently deleted 
                      from our systems within 30 days. This includes your profile, health data, and 
                      activity history.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="destructive" 
                onClick={handleDataDeletionRequest}
                disabled={!deletionReason.trim() && deletionReason !== ''}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Request Account Deletion
              </Button>
              
              {deletionRequests.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Recent Deletion Requests</h3>
                  <div className="space-y-2">
                    {deletionRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">Account Deletion</p>
                          <p className="text-xs text-muted-foreground">
                            Requested: {formatDate(request.requestedAt)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          request.status === 'completed' ? 'bg-green-100 text-green-800' :
                          request.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PrivacyDashboard;
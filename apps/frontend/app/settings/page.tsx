'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [profileSettings, setProfileSettings] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Software Developer',
    timezone: 'UTC',
    language: 'en'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: false,
    analysis_complete: true,
    proposal_updates: true,
    security_alerts: true,
    weekly_digest: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    session_timeout: '24h',
    api_access: false
  });

  const [analysisSettings, setAnalysisSettings] = useState({
    default_analysis_type: 'full',
    confidence_threshold: 0.7,
    auto_apply_low_risk: false,
    max_file_size: 10,
    preferred_languages: ['javascript', 'typescript', 'python']
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Profile settings saved successfully');
    } catch (err: any) {
      setError('Failed to save profile settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Notification settings saved successfully');
    } catch (err: any) {
      setError('Failed to save notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Security settings saved successfully');
    } catch (err: any) {
      setError('Failed to save security settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAnalysis = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Analysis settings saved successfully');
    } catch (err: any) {
      setError('Failed to save analysis settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-muted-foreground">
            Configure your RefactorIQ preferences and account settings
          </p>
        </div>

        {/* Success/Error Alerts */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6" variant="default">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-primary" />
                <CardTitle>Profile Settings</CardTitle>
              </div>
              <CardDescription>
                Manage your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileSettings.name}
                  onChange={(e) => setProfileSettings({...profileSettings, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileSettings.email}
                  onChange={(e) => setProfileSettings({...profileSettings, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  placeholder="Tell us about yourself"
                  value={profileSettings.bio}
                  onChange={(e) => setProfileSettings({...profileSettings, bio: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={profileSettings.timezone} 
                    onValueChange={(value) => setProfileSettings({...profileSettings, timezone: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="GMT">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={profileSettings.language} 
                    onValueChange={(value) => setProfileSettings({...profileSettings, language: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-primary" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive updates via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.email_notifications}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings, 
                      email_notifications: e.target.checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analysis Complete</Label>
                    <p className="text-xs text-muted-foreground">When code analysis finishes</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.analysis_complete}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings, 
                      analysis_complete: e.target.checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Proposal Updates</Label>
                    <p className="text-xs text-muted-foreground">When proposals are created or applied</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.proposal_updates}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings, 
                      proposal_updates: e.target.checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Security Alerts</Label>
                    <p className="text-xs text-muted-foreground">Critical security findings</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.security_alerts}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings, 
                      security_alerts: e.target.checked
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Digest</Label>
                    <p className="text-xs text-muted-foreground">Summary of weekly activity</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.weekly_digest}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings, 
                      weekly_digest: e.target.checked
                    })}
                  />
                </div>
              </div>
              <Button onClick={handleSaveNotifications} disabled={loading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>
                Manage your account security and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-xs text-muted-foreground">Add extra security to your account</p>
                  </div>
                  <Badge variant={securitySettings.two_factor_enabled ? "default" : "secondary"}>
                    {securitySettings.two_factor_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Session Timeout</Label>
                  <Select 
                    value={securitySettings.session_timeout} 
                    onValueChange={(value) => setSecuritySettings({...securitySettings, session_timeout: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="8h">8 hours</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="7d">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>API Access</Label>
                    <p className="text-xs text-muted-foreground">Allow API key generation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={securitySettings.api_access}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings, 
                      api_access: e.target.checked
                    })}
                  />
                </div>
              </div>
              <Button onClick={handleSaveSecurity} disabled={loading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Security
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                <CardTitle>Analysis Preferences</CardTitle>
              </div>
              <CardDescription>
                Configure default analysis behavior and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default_analysis_type">Default Analysis Type</Label>
                <Select 
                  value={analysisSettings.default_analysis_type} 
                  onValueChange={(value) => setAnalysisSettings({...analysisSettings, default_analysis_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Analysis</SelectItem>
                    <SelectItem value="security">Security Focus</SelectItem>
                    <SelectItem value="performance">Performance Focus</SelectItem>
                    <SelectItem value="quality">Code Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confidence_threshold">Confidence Threshold</Label>
                <Input
                  id="confidence_threshold"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={analysisSettings.confidence_threshold}
                  onChange={(e) => setAnalysisSettings({
                    ...analysisSettings, 
                    confidence_threshold: parseFloat(e.target.value)
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum confidence score for showing proposals (0.0 - 1.0)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_file_size">Max File Size (MB)</Label>
                <Input
                  id="max_file_size"
                  type="number"
                  min="1"
                  max="100"
                  value={analysisSettings.max_file_size}
                  onChange={(e) => setAnalysisSettings({
                    ...analysisSettings, 
                    max_file_size: parseInt(e.target.value)
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-apply Low Risk Fixes</Label>
                  <p className="text-xs text-muted-foreground">Automatically apply fixes with high confidence</p>
                </div>
                <input
                  type="checkbox"
                  checked={analysisSettings.auto_apply_low_risk}
                  onChange={(e) => setAnalysisSettings({
                    ...analysisSettings, 
                    auto_apply_low_risk: e.target.checked
                  })}
                />
              </div>
              <Button onClick={handleSaveAnalysis} disabled={loading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Analysis Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

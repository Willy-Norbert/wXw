
import React, { useContext, useState } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Bell, Shield, Palette, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: false,
    darkMode: false,
    language: 'en',
    timezone: 'UTC',
  });

  const handleSave = () => {
    // TODO: Implement settings save functionality
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully",
    });
  };

  const handleReset = () => {
    setSettings({
      emailNotifications: true,
      pushNotifications: false,
      marketingEmails: false,
      darkMode: false,
      language: 'en',
      timezone: 'UTC',
    });
    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values",
    });
  };

  return (
    <DashboardLayout currentPage="settings">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Settings
          </h1>
        </div>

        {/* Notifications Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <Bell className="w-5 h-5 text-purple-600" />
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, emailNotifications: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-gray-500">Receive push notifications in browser</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, pushNotifications: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Marketing Emails</Label>
                <p className="text-sm text-gray-500">Receive promotional emails and updates</p>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, marketingEmails: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <Palette className="w-5 h-5 text-purple-600" />
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-gray-500">Switch to dark theme</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, darkMode: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <Globe className="w-5 h-5 text-purple-600" />
            <CardTitle>Regional Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Input
                  value={settings.language}
                  onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                  placeholder="English"
                />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Input
                  value={settings.timezone}
                  onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                  placeholder="UTC"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              <Button variant="outline" className="w-full sm:w-auto">
                Enable 2FA
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Change Password</Label>
              <p className="text-sm text-gray-500">Update your account password</p>
              <Button variant="outline" className="w-full sm:w-auto">
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

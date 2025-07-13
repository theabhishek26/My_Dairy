import { useState } from "react";
import { Header } from "@/components/header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Palette, 
  Volume2, 
  FileText,
  Download,
  Upload,
  Trash2,
  HandHelping
} from "lucide-react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [voiceTranscription, setVoiceTranscription] = useState(true);
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your diary entries are being exported. This may take a moment.",
    });
  };

  const handleImport = () => {
    toast({
      title: "Import Feature",
      description: "Import functionality will be available soon.",
    });
  };

  const handleClearData = () => {
    toast({
      title: "Clear Data",
      description: "This action cannot be undone. Please confirm to continue.",
      variant: "destructive",
    });
  };

  return (
    <div className="relative z-10 min-h-screen">
      <Header />
      <main className="pb-24">
        <div className="p-4 pt-6">
          {/* Settings Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-playfair font-semibold text-foreground">Settings</h2>
          </div>

          {/* Profile Settings */}
          <Card className="glass-effect border-0 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-primary" />
                <span>Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="font-medium">Diary User</p>
                  <p className="text-sm text-muted-foreground">diary@example.com</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="glass-effect border-0 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Privacy & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>App Lock</Label>
                  <p className="text-sm text-muted-foreground">Require PIN to open app</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Biometric Authentication</Label>
                  <p className="text-sm text-muted-foreground">Use fingerprint or face ID</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Private Mode</Label>
                  <p className="text-sm text-muted-foreground">Hide sensitive entries</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="glass-effect border-0 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-primary" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                </div>
                <Switch 
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              <Separator />
              <Button variant="outline" className="w-full">
                Choose Theme Color
              </Button>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card className="glass-effect border-0 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-primary" />
                <span>Audio</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications</Label>
                  <p className="text-sm text-muted-foreground">Enable reminder notifications</p>
                </div>
                <Switch 
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Voice Transcription</Label>
                  <p className="text-sm text-muted-foreground">Auto-convert speech to text</p>
                </div>
                <Switch 
                  checked={voiceTranscription}
                  onCheckedChange={setVoiceTranscription}
                />
              </div>
              <Separator />
              <Button variant="outline" className="w-full">
                Audio Quality Settings
              </Button>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="glass-effect border-0 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Data Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Backup</Label>
                  <p className="text-sm text-muted-foreground">Automatically backup to cloud</p>
                </div>
                <Switch 
                  checked={autoBackup}
                  onCheckedChange={setAutoBackup}
                />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" onClick={handleImport}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
              </div>
              <Button variant="destructive" onClick={handleClearData} className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </CardContent>
          </Card>

          {/* HandHelping & Support */}
          <Card className="glass-effect border-0 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HandHelping className="w-5 h-5 text-primary" />
                <span>HandHelping & Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <HandHelping className="w-4 h-4 mr-2" />
                HandHelping Center
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Privacy Policy
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Terms of Service
              </Button>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card className="glass-effect border-0">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Creative Diary App v1.0.0
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Made with ❤️ for capturing memories
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}

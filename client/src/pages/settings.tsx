import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "@/components/ui/theme-provider";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/db";
import { 
  Settings as SettingsIcon, 
  User, 
  Palette, 
  Globe, 
  Mic, 
  Bell, 
  Download, 
  Upload, 
  Trash2, 
  Info,
  Moon,
  Sun,
  Smartphone
} from "lucide-react";
import type { Settings } from "@shared/schema";

const currencies = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "JPY", label: "Japanese Yen (¥)" },
  { value: "CAD", label: "Canadian Dollar (C$)" },
  { value: "AUD", label: "Australian Dollar (A$)" },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showClearDialog, setShowClearDialog] = useState(false);

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<Settings>) => {
      const response = await apiRequest("PUT", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ description: "Settings updated successfully!" });
    },
    onError: () => {
      toast({ description: "Failed to update settings", variant: "destructive" });
    },
  });

  const handleSettingChange = (key: keyof Settings, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const handleThemeChange = (isDark: boolean) => {
    setTheme(isDark ? "dark" : "light");
    handleSettingChange("darkMode", isDark);
  };

  const handleExportData = async () => {
    try {
      // Get all data from IndexedDB
      const notes = await db.getAll("notes");
      const expenses = await db.getAll("expenses");
      const reminders = await db.getAll("reminders");
      const settingsData = await db.getAll("settings");

      const exportData = {
        notes,
        expenses,
        reminders,
        settings: settingsData,
        exportDate: new Date().toISOString(),
        version: "1.0.0"
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json"
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quickpyx-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ description: "Data exported successfully!" });
    } catch (error) {
      toast({ description: "Failed to export data", variant: "destructive" });
    }
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importData = JSON.parse(text);

        // Validate the structure
        if (!importData.notes || !importData.expenses || !importData.reminders) {
          throw new Error("Invalid backup file format");
        }

        // Clear existing data first
        await Promise.all([
          db.clear("notes"),
          db.clear("expenses"),
          db.clear("reminders"),
        ]);

        // Import new data
        await Promise.all([
          ...importData.notes.map((note: any) => db.put("notes", note)),
          ...importData.expenses.map((expense: any) => db.put("expenses", expense)),
          ...importData.reminders.map((reminder: any) => db.put("reminders", reminder)),
        ]);

        // Invalidate all queries to refresh data
        queryClient.invalidateQueries();
        
        toast({ description: "Data imported successfully!" });
      } catch (error) {
        toast({ description: "Failed to import data. Please check the file format.", variant: "destructive" });
      }
    };

    input.click();
  };

  const handleClearAllData = async () => {
    try {
      await Promise.all([
        db.clear("notes"),
        db.clear("expenses"),
        db.clear("reminders"),
      ]);

      // Also clear server data
      await Promise.all([
        apiRequest("DELETE", "/api/notes/all"),
        apiRequest("DELETE", "/api/expenses/all"),
        apiRequest("DELETE", "/api/reminders/all"),
      ].map(p => p.catch(() => {}))); // Ignore errors for non-existent endpoints

      queryClient.invalidateQueries();
      setShowClearDialog(false);
      
      toast({ description: "All data cleared successfully!" });
    } catch (error) {
      toast({ description: "Failed to clear data", variant: "destructive" });
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-medium">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 px-4">
        {/* Profile Section */}
        <div className="py-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Quickpyx User</h3>
                  <p className="text-sm text-muted-foreground">Local Account</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                disabled
              >
                Profile management coming soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* App Preferences */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="w-4 h-4" />
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={handleThemeChange}
                  />
                  <Moon className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Regional Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Default Currency</p>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred currency for expenses
                  </p>
                </div>
                <Select
                  value={settings.defaultCurrency}
                  onValueChange={(value) => handleSettingChange("defaultCurrency", value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5" />
                <span>App Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Voice Recognition</p>
                  <p className="text-sm text-muted-foreground">
                    Enable voice-to-text features for notes
                  </p>
                </div>
                <Switch
                  checked={settings.voiceRecognitionEnabled}
                  onCheckedChange={(checked) => 
                    handleSettingChange("voiceRecognitionEnabled", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Enable reminder notifications
                  </p>
                </div>
                <Switch
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => 
                    handleSettingChange("notificationsEnabled", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Data Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleExportData}
              >
                <Download className="w-4 h-4 mr-3" />
                Export Data
                <span className="ml-auto text-xs text-muted-foreground">JSON</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleImportData}
              >
                <Upload className="w-4 h-4 mr-3" />
                Import Data
                <span className="ml-auto text-xs text-muted-foreground">JSON</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setShowClearDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Clear All Data
                <span className="ml-auto text-xs opacity-60">Permanent</span>
              </Button>
            </CardContent>
          </Card>

          {/* App Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span>App Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Version</span>
                  <p className="font-medium">1.0.0</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Build</span>
                  <p className="font-medium">100</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Developer</span>
                  <p className="font-medium">Quickpyx Team</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated</span>
                  <p className="font-medium">
                    {new Date(settings.updatedAt!).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full" disabled>
                  <Info className="w-4 h-4 mr-2" />
                  About & Privacy Policy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AdMob Integration Info */}
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-medium mb-2">AdMob Integration</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Advertisement services ready for deployment
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>App ID: ca-app-pub-7343855983956816~1901011628</p>
                <p>Banner ID: ca-app-pub-7343855983956816/4966992810</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Clear Data Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              <span>Clear All Data</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This action will permanently delete all your notes, expenses, and reminders. 
              This cannot be undone.
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive font-medium">
                ⚠️ Make sure to export your data first if you want to keep it!
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowClearDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearAllData}
              >
                Clear All Data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

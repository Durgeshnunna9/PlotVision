import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Mail, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const Settings = () => {
  const [openModal, setOpenModal] = useState<null | "privacy" | "terms" | "support">(null);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    marketing: false,
  });

  const [companyProfile, setCompanyProfile] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    website: "",
  });

  const [system, setSystem] = useState({
    timezone: "",
    dateFormat: "",
    currency: "",
    language: "",
    theme: "",
  });
  const handleSaveCompanyProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
  
      const { error } = await supabase.from("company_profile").upsert(
        {
          user_id: user.id,
          company_name: companyProfile.companyName,
          company_email: companyProfile.companyEmail,
          company_phone: companyProfile.companyPhone,
          address: companyProfile.address,
          city: companyProfile.city,
          state: companyProfile.state,
          zip_code: companyProfile.zipCode,
          website: companyProfile.website,
        },
        { onConflict: "user_id" }
      );
  
      if (error) throw error;
  
      toast({ title: "Success", description: "Company profile saved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };
  const handleSaveNotifications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
  
      const { error } = await supabase.from("notification_settings").upsert(
        {
          user_id: user.id,
          email: notifications.email,
          push: notifications.push,
          sms: notifications.sms,
          marketing: notifications.marketing,
        },
        { onConflict: "user_id" }
      );
  
      if (error) throw error;
  
      toast({ title: "Success", description: "Notification settings saved" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };
  // const handleSaveSystemSettings = async () => {
  //   try {
  //     const {
  //       data: { user },
  //     } = await supabase.auth.getUser();
  //     if (!user) throw new Error("Not logged in");
  
  //     const { error } = await supabase.from("system_settings").upsert(
  //       {
  //         user_id: user.id,
  //         timezone: system.timezone,
  //         date_format: system.dateFormat,
  //         currency: system.currency,
  //         language: system.language,
  //         theme: system.theme,
  //       },
  //       { onConflict: "user_id" }
  //     );
  
  //     if (error) throw error;
  
  //     toast({ title: "Success", description: "System settings saved" });
  //   } catch (error: any) {
  //     toast({ title: "Error", description: error.message, variant: "destructive" });
  //   }
  // };
  useEffect(() => {
    const fetchData = async () => {
      const { data: notifData, error: notifError } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!notifError && notifData) {
        setNotifications({
          email: notifData.email,
          push: notifData.push,
          sms: notifData.sms,
          marketing: notifData.marketing,
        });
      }

      const { data: profileData, error: profileError } = await supabase
        .from("company_profile")
        .select("*")
        .eq("id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profileError && profileData) {
        setCompanyProfile({
          companyName: profileData.company_name,
          companyEmail: profileData.company_email,
          companyPhone: profileData.company_phone,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zipCode: profileData.zip_code,
          website: profileData.website,
        });
      }

      const { data: sysData, error: sysError } = await supabase
        .from("system_settings")
        .select("*")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!sysError && sysData) {
        setSystem({
          timezone: sysData.timezone,
          dateFormat: sysData.date_format,
          currency: sysData.currency,
          language: sysData.language,
          theme: sysData.theme,
        });
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and preferences
        </p>
      </div>

      {/* Company Profile */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Company Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyProfile.companyName}
                onChange={(e) =>
                  setCompanyProfile({ ...companyProfile, companyName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="companyEmail">Company Email</Label>
              <Input
                id="companyEmail"
                type="email"
                value={companyProfile.companyEmail}
                onChange={(e) =>
                  setCompanyProfile({ ...companyProfile, companyEmail: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="companyPhone">Phone Number</Label>
              <Input
                id="companyPhone"
                value={companyProfile.companyPhone}
                onChange={(e) =>
                  setCompanyProfile({ ...companyProfile, companyPhone: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={companyProfile.website}
                onChange={(e) =>
                  setCompanyProfile({ ...companyProfile, website: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={companyProfile.address}
              onChange={(e) =>
                setCompanyProfile({ ...companyProfile, address: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={companyProfile.city}
                onChange={(e) => setCompanyProfile({ ...companyProfile, city: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={companyProfile.state}
                onChange={(e) =>
                  setCompanyProfile({ ...companyProfile, state: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={companyProfile.zipCode}
                onChange={(e) =>
                  setCompanyProfile({ ...companyProfile, zipCode: e.target.value })
                }
              />
            </div>
          </div>

          <Button className="btn-primary" onClick={handleSaveCompanyProfile}>Save Profile</Button>
        </CardContent>
      </Card>

      {/* System Settings */}
      {/* <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            System Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={system.timezone}
                onValueChange={(value) =>
                  setSystem({ ...system, timezone: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">
                    Eastern Time (EST/EDT)
                  </SelectItem>
                  <SelectItem value="America/Chicago">
                    Central Time (CST/CDT)
                  </SelectItem>
                  <SelectItem value="America/Denver">
                    Mountain Time (MST/MDT)
                  </SelectItem>
                  <SelectItem value="America/Los_Angeles">
                    Pacific Time (PST/PDT)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={system.dateFormat}
                onValueChange={(value) =>
                  setSystem({ ...system, dateFormat: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={system.currency}
                onValueChange={(value) =>
                  setSystem({ ...system, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                  <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Select
                value={system.language}
                onValueChange={(value) =>
                  setSystem({ ...system, language: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
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

          <Button className="btn-primary" onClick={handleSaveNotifications}>Save Preferences</Button>
        </CardContent>
      </Card> */}

      {/* Notification Settings */}
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            {
              key: 'email',
              label: 'Email Notifications',
              desc: 'Receive notifications via email',
            },
            {
              key: 'push',
              label: 'Push Notifications',
              desc: 'Receive push notifications in browser',
            },
            {
              key: 'sms',
              label: 'SMS Notifications',
              desc: 'Receive important updates via SMS',
            },
            {
              key: 'marketing',
              label: 'Marketing Communications',
              desc: 'Receive product updates and tips',
            },
          ].map((item, idx) => (
            <div key={item.key}>
              {idx > 0 && <Separator />}
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label>{item.label}</Label>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={notifications[item.key as keyof typeof notifications]}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, [item.key]: checked })
                  }
                />
              </div>
            </div>
          ))}
          <Button className="btn-primary" onClick={handleSaveNotifications}>Save Notification Settings</Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      {/* <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Session Management</Label>
                <p className="text-sm text-muted-foreground">
                  Manage active sessions
                </p>
              </div>
              <Button variant="outline">View Sessions</Button>
            </div>
          </div>

          <Button className="btn-primary">Update Security Settings</Button>
        </CardContent>
      </Card> */}

      {/* Data Management */}
      {/* <Card className="card-premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Database className="h-8 w-8 mb-2" />
              Backup Data
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Mail className="h-8 w-8 mb-2" />
              Export Data
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Globe className="h-8 w-8 mb-2" />
              Import Data
            </Button>
            <Button variant="outline" className="h-20 flex-col text-destructive">
              <Database className="h-8 w-8 mb-2" />
              Delete All Data
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold mb-2">Data Retention Policy</h4>
            <p className="text-sm text-muted-foreground">
              Your data is automatically backed up daily and retained for 90
              days. You can manually export your data at any time. Deleted data
              cannot be recovered after 30 days.
            </p>
          </div>
        </CardContent>
      </Card> */}

      {/* Footer */}
      <Card className="card-premium">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            RealtyPro v1.1.0 • Last updated: October 2025
          </p>
          <div className="flex justify-center gap-4 mt-4">
            {/* Privacy Policy */}
            <Button variant="ghost" size="sm" onClick={() => setOpenModal("privacy")}>
              Privacy Policy
            </Button>
            <Dialog open={openModal === "privacy"} onOpenChange={() => setOpenModal(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Privacy Policy</DialogTitle>
                  <DialogDescription>
                    This is a sample Privacy Policy. Your data will be stored securely and only used for service improvements.
                  </DialogDescription>
                </DialogHeader>
                <p className="text-sm mt-2">
                  Example: We do not sell or share your personal data with third parties without your consent.
                </p>
              </DialogContent>
            </Dialog>

            {/* Terms of Service */}
            <Button variant="ghost" size="sm" onClick={() => setOpenModal("terms")}>
              Terms of Service
            </Button>
            <Dialog open={openModal === "terms"} onOpenChange={() => setOpenModal(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Terms of Service</DialogTitle>
                  <DialogDescription>
                    These are sample Terms of Service. By using this application, you agree to follow these terms.
                  </DialogDescription>
                </DialogHeader>
                <p className="text-sm mt-2">
                  Example: Misuse of services or violation of laws may result in account suspension.
                </p>
              </DialogContent>
            </Dialog>

            {/* Support */}
            <Button variant="ghost" size="sm" onClick={() => setOpenModal("support")}>
              Support
            </Button>
            <Dialog open={openModal === "support"} onOpenChange={() => setOpenModal(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Support</DialogTitle>
                  <DialogDescription>
                    Need help? This is sample support information.
                  </DialogDescription>
                </DialogHeader>
                <p className="text-sm mt-2">
                  Example: Contact us at <span className="font-medium">support@example.com</span> or call +1 (555) 987-6543.
                </p>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;


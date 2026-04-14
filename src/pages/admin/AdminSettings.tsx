import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Store, Phone, MapPin, Clock, Globe } from "lucide-react";

interface SettingsRow {
  id: string;
  restaurant_name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  opening_hours_weekday: string;
  opening_hours_weekend: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  delivery_charges: number;
  free_delivery_above: number;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("website_settings" as any).select("*").limit(1).single();
      if (data) setSettings(data as unknown as SettingsRow);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const { id, ...payload } = settings;
    const { error } = await supabase
      .from("website_settings" as any)
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: "Settings saved! ✅" });
    setSaving(false);
  };

  const update = (field: keyof SettingsRow, value: string | number) => {
    if (settings) setSettings({ ...settings, [field]: value });
  };

  if (loading) return <AdminLayout title="Website Settings"><p className="text-center py-12 text-muted-foreground">Loading...</p></AdminLayout>;
  if (!settings) return <AdminLayout title="Website Settings"><p className="text-center py-12 text-muted-foreground">No settings found.</p></AdminLayout>;

  return (
    <AdminLayout title="Website Settings">
      <div className="max-w-3xl space-y-6">
        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Store className="w-5 h-5" /> General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Restaurant Name</Label>
              <Input value={settings.restaurant_name} onChange={(e) => update("restaurant_name", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Contact Email</Label>
                <Input value={settings.contact_email} onChange={(e) => update("contact_email", e.target.value)} />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input value={settings.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input value={settings.address} onChange={(e) => update("address", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Clock className="w-5 h-5" /> Opening Hours</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Weekday (Mon–Fri)</Label>
              <Input value={settings.opening_hours_weekday} onChange={(e) => update("opening_hours_weekday", e.target.value)} />
            </div>
            <div>
              <Label>Weekend (Sat–Sun)</Label>
              <Input value={settings.opening_hours_weekend} onChange={(e) => update("opening_hours_weekend", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Social */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Globe className="w-5 h-5" /> Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Facebook URL</Label><Input value={settings.facebook_url} onChange={(e) => update("facebook_url", e.target.value)} /></div>
            <div><Label>Instagram URL</Label><Input value={settings.instagram_url} onChange={(e) => update("instagram_url", e.target.value)} /></div>
            <div><Label>Twitter URL</Label><Input value={settings.twitter_url} onChange={(e) => update("twitter_url", e.target.value)} /></div>
          </CardContent>
        </Card>

        {/* Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><MapPin className="w-5 h-5" /> Delivery</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Delivery Charges (Rs.)</Label>
              <Input type="number" value={settings.delivery_charges} onChange={(e) => update("delivery_charges", parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Free Delivery Above (Rs.)</Label>
              <Input type="number" value={settings.free_delivery_above} onChange={(e) => update("free_delivery_above", parseFloat(e.target.value) || 0)} />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto gap-2">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;

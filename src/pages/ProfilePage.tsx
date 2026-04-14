import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, MapPin, Mail, ShoppingBag, Save, Package, Clock, CheckCircle2, XCircle, Truck, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Profile {
  full_name: string | null;
  phone: string | null;
  address: string | null;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
}

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
  confirmed: { icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-100" },
  preparing: { icon: ChefHat, color: "text-purple-600", bg: "bg-purple-100" },
  "out for delivery": { icon: Truck, color: "text-orange-600", bg: "bg-orange-100" },
  delivered: { icon: Package, color: "text-green-600", bg: "bg-green-100" },
  cancelled: { icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
};

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile>({ full_name: "", phone: "", address: "" });
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    const [profileRes, ordersRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    if (profileRes.data) {
      const d = profileRes.data as any;
      setProfile({ full_name: d.full_name || "", phone: d.phone || "", address: d.address || "" });
    }
    if (ordersRes.data) setOrders(ordersRes.data as unknown as Order[]);
    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
      } as any)
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile Updated! ✅" });
    }
    setSaving(false);
  };

  const toggleOrderDetails = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);
    if (!orderItems[orderId]) {
      const { data } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);
      if (data) {
        setOrderItems((prev) => ({ ...prev, [orderId]: data as unknown as OrderItem[] }));
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-5 lg:px-12 max-w-4xl space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-5 lg:px-12 max-w-4xl">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-2">My Account</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-card rounded-xl p-1.5 shadow-sm border border-border/50 w-fit">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all text-sm ${
                activeTab === "profile"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all text-sm ${
                activeTab === "orders"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingBag className="w-4 h-4 inline mr-2" />
              Orders ({orders.length})
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "profile" ? (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Profile Card */}
                <div className="bg-card rounded-2xl shadow-lg border border-border/50 p-6 md:p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-heading font-bold text-foreground">
                        {profile.full_name || "Your Name"}
                      </h2>
                      <p className="text-muted-foreground text-sm flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> {user?.email}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <Label htmlFor="p-name" className="flex items-center gap-2 mb-1.5">
                          <User className="w-4 h-4" /> Full Name
                        </Label>
                        <Input
                          id="p-name"
                          value={profile.full_name || ""}
                          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                          placeholder="Your full name"
                          className="h-12 rounded-xl"
                          maxLength={100}
                        />
                      </div>
                      <div>
                        <Label htmlFor="p-phone" className="flex items-center gap-2 mb-1.5">
                          <Phone className="w-4 h-4" /> Phone Number
                        </Label>
                        <Input
                          id="p-phone"
                          type="tel"
                          value={profile.phone || ""}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          placeholder="+92 300 1234567"
                          className="h-12 rounded-xl"
                          maxLength={20}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="p-address" className="flex items-center gap-2 mb-1.5">
                        <MapPin className="w-4 h-4" /> Delivery Address
                      </Label>
                      <Input
                        id="p-address"
                        value={profile.address || ""}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        placeholder="Your delivery address"
                        className="h-12 rounded-xl"
                        maxLength={255}
                      />
                    </div>
                    <Button type="submit" className="h-12 rounded-xl px-8 gap-2 font-bold" disabled={saving}>
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50 text-center">
                    <p className="text-2xl font-bold text-foreground">{orders.length}</p>
                    <p className="text-muted-foreground text-sm">Total Orders</p>
                  </div>
                  <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50 text-center">
                    <p className="text-2xl font-bold text-primary">
                      Rs. {orders.reduce((s, o) => s + Number(o.total), 0).toLocaleString()}
                    </p>
                    <p className="text-muted-foreground text-sm">Total Spent</p>
                  </div>
                  <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50 text-center col-span-2 md:col-span-1">
                    <p className="text-2xl font-bold text-green-600">
                      {orders.filter((o) => o.status === "delivered").length}
                    </p>
                    <p className="text-muted-foreground text-sm">Delivered</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {orders.length === 0 ? (
                  <div className="text-center py-20 bg-card rounded-2xl shadow-sm border border-border/50">
                    <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-xl text-muted-foreground mb-4">No orders yet</p>
                    <Button onClick={() => navigate("/menu")} className="rounded-full px-8">
                      Browse Menu
                    </Button>
                  </div>
                ) : (
                  orders.map((order) => {
                    const cfg = statusConfig[order.status] || statusConfig.pending;
                    const StatusIcon = cfg.icon;
                    return (
                      <motion.div
                        key={order.id}
                        layout
                        className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleOrderDetails(order.id)}
                          className="w-full p-5 flex items-center justify-between hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                              <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-foreground">Order #{order.id.slice(0, 8)}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary text-lg">Rs. {Number(order.total).toLocaleString()}</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${cfg.bg} ${cfg.color}`}>
                              {order.status}
                            </span>
                          </div>
                        </button>

                        <AnimatePresence>
                          {expandedOrder === order.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 pb-5 border-t border-border/50">
                                <p className="text-sm font-semibold text-muted-foreground mb-3 mt-4">Order Items</p>
                                {!orderItems[order.id] ? (
                                  <div className="space-y-2">
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-3/4" />
                                  </div>
                                ) : orderItems[order.id].length === 0 ? (
                                  <p className="text-muted-foreground text-sm">No items found</p>
                                ) : (
                                  <div className="space-y-2">
                                    {orderItems[order.id].map((item) => (
                                      <div key={item.id} className="flex justify-between text-sm py-2 border-b border-border/30 last:border-0">
                                        <span className="text-foreground">
                                          {item.title} <span className="text-muted-foreground">× {item.quantity}</span>
                                        </span>
                                        <span className="font-semibold text-foreground">
                                          Rs. {(Number(item.price) * item.quantity).toLocaleString()}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;

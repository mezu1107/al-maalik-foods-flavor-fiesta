import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Minus, Plus, Trash2, ShoppingBag, MapPin, Phone, User, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CartPage = () => {
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
        if (data) {
          setCustomerName((data as any).full_name || "");
          setPhone((data as any).phone || "");
          setAddress((data as any).address || "");
        }
      });
    }
  }, [user]);

  const handleProceedToCheckout = () => {
    if (!user) {
      toast({ title: "Please sign in to place an order", variant: "destructive" });
      navigate("/auth");
      return;
    }
    setShowCheckout(true);
  };

  const generateWhatsAppMessage = () => {
    const itemsList = items.map((i) => `- ${i.title} x${i.quantity} = Rs.${(i.price * i.quantity).toLocaleString()}`).join("\n");
    return encodeURIComponent(
      `🛒 *New Order - Al Maalik Foods*\n\n👤 *Name:* ${customerName || "Guest"}\n📞 *Phone:* ${phone || "N/A"}\n📍 *Address:* ${address || "N/A"}\n\n📋 *Order:*\n${itemsList}\n\n💰 *Total: Rs.${totalPrice.toLocaleString()}*\n\n💵 Payment: Cash on Delivery`
    );
  };

  const handleWhatsAppOrder = () => {
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      toast({ title: "Please fill all delivery details first", variant: "destructive" });
      setShowCheckout(true);
      return;
    }
    window.open(`https://wa.me/923431497982?text=${generateWhatsAppMessage()}`, "_blank");
    toast({ title: "Order sent to WhatsApp! 📱" });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      toast({ title: "Please fill all delivery details", variant: "destructive" });
      return;
    }
    setPlacing(true);
    try {
      await supabase.from("profiles").update({ full_name: customerName, phone, address } as any).eq("user_id", user.id);
      const { data: order, error: orderError } = await supabase.from("orders").insert({
        user_id: user.id, total: totalPrice, status: "pending",
        customer_name: customerName.trim(), customer_phone: phone.trim(),
        customer_email: user.email || "", customer_address: address.trim(),
      } as any).select().single();
      if (orderError) throw orderError;
      const orderItems = items.map((item) => ({
        order_id: (order as any).id, food_id: item.id, title: item.title, quantity: item.quantity, price: item.price,
      }));
      const { error: itemsError } = await supabase.from("order_items").insert(orderItems as any);
      if (itemsError) throw itemsError;

      // Also send to WhatsApp
      window.open(`https://wa.me/923431497982?text=${generateWhatsAppMessage()}`, "_blank");
      clearCart();
      toast({ title: "Order Placed Successfully! 🎉" });
      navigate("/order-success");
    } catch (err: any) {
      toast({ title: "Order Failed", description: err.message, variant: "destructive" });
    }
    setPlacing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-5 lg:px-12 max-w-4xl">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-heading font-extrabold text-foreground mb-8 flex items-center gap-3">
            <ShoppingBag className="w-9 h-9 text-primary" /> Your Cart
          </motion.h1>

          {items.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <ShoppingBag className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6" />
              <p className="text-xl text-muted-foreground mb-6">Your cart is empty</p>
              <Link to="/menu"><Button className="rounded-full px-8">Browse Menu</Button></Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div key={item.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="bg-card rounded-2xl shadow-md p-4 flex items-center gap-4">
                      <img src={item.imageUrl} alt={item.title} className="w-20 h-20 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground truncate">{item.title}</h3>
                        <p className="text-primary font-semibold">Rs. {item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="font-bold text-foreground w-24 text-right hidden sm:block">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeItem(item.id)}>
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="space-y-6">
                <div className="bg-card rounded-2xl shadow-md p-6">
                  <h3 className="text-lg font-heading font-bold text-foreground mb-4">Order Summary</h3>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Items ({totalItems})</span>
                    <span className="font-semibold">Rs. {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="border-t border-border my-4" />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-primary">Rs. {totalPrice.toLocaleString()}</span>
                  </div>

                  {!showCheckout && (
                    <div className="space-y-3 mt-6">
                      <Button className="w-full h-12 rounded-full font-bold" onClick={handleProceedToCheckout}>
                        Proceed to Checkout
                      </Button>
                      <Button variant="outline" className="w-full h-12 rounded-full font-bold gap-2 border-green-500 text-green-600 hover:bg-green-50" onClick={() => { setShowCheckout(true); }}>
                        <MessageCircle className="w-5 h-5" /> Order via WhatsApp
                      </Button>
                    </div>
                  )}
                </div>

                {showCheckout && (
                  <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    onSubmit={handlePlaceOrder} className="bg-card rounded-2xl shadow-md p-6 space-y-4">
                    <h3 className="text-lg font-heading font-bold text-foreground mb-2">Delivery Details</h3>
                    <div>
                      <Label htmlFor="name" className="flex items-center gap-2 mb-1"><User className="w-4 h-4" /> Full Name</Label>
                      <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Your name" required />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-2 mb-1"><Phone className="w-4 h-4" /> Phone Number</Label>
                      <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 343 1497982" required />
                    </div>
                    <div>
                      <Label htmlFor="address" className="flex items-center gap-2 mb-1"><MapPin className="w-4 h-4" /> Delivery Address</Label>
                      <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your delivery address" required />
                    </div>
                    <div className="bg-muted/30 rounded-xl p-3 text-sm text-muted-foreground">
                      💵 Payment: <span className="font-semibold text-foreground">Cash on Delivery</span>
                    </div>
                    <div className="space-y-3">
                      <Button type="submit" className="w-full h-12 rounded-full font-bold" disabled={placing}>
                        {placing ? "Placing Order..." : "Place Order & Send to WhatsApp"}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleWhatsAppOrder}
                        className="w-full h-12 rounded-full font-bold gap-2 border-green-500 text-green-600 hover:bg-green-50">
                        <MessageCircle className="w-5 h-5" /> WhatsApp Only (No Account)
                      </Button>
                    </div>
                  </motion.form>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;

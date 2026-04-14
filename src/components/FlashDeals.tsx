import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Deal = {
  id: string;
  title: string;
  description: string;
  price: number;
  old_price?: number;
  image_url: string;
  badge?: string;
  discount_text?: string;
};

const FlashDeals = () => {
  const { addItem } = useCart();
  const { toast } = useToast();

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ SUPABASE FETCH (REAL DB)
  useEffect(() => {
    const fetchDeals = async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase Error:", error.message);
        setDeals([]);
      } else {
        setDeals((data as Deal[]) || []);
      }

      setLoading(false);
    };

    fetchDeals();
  }, []);

  const handleGrab = (deal: Deal) => {
    addItem({
      id: deal.product_id, // ✅ real product id
      title: deal.title,
      price: deal.price,
      imageUrl: deal.image_url,
    });

    toast({ title: `${deal.title} added to cart!` });
  };

  return (
    <section className="py-14 md:py-20 bg-gradient-to-b from-card to-background">
      <div className="container mx-auto px-5 lg:px-12">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-foreground">
            🔥 Flash Deals & Limited Offers
          </h2>

          <Link
            to="/deals"
            className="text-primary font-semibold flex items-center gap-2 text-lg group"
          >
            View All Deals
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* LOADING */}
        {loading ? (
          <p className="text-muted-foreground">Loading deals...</p>
        ) : deals.length === 0 ? (
          <p className="text-muted-foreground">
            No deals available right now.
          </p>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory">

            {deals.map((deal, i) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="min-w-[300px] bg-card rounded-3xl shadow-lg overflow-hidden"
              >

                {/* IMAGE */}
                <div className="relative">
                  <img
                    src={deal.image_url}
                    alt={deal.title}
                    className="w-full h-52 object-cover"
                  />

                  {deal.discount_text && (
                    <div className="absolute top-5 right-5 bg-primary text-white px-3 py-1 rounded-full text-sm">
                      {deal.discount_text}
                    </div>
                  )}

                  <div className="absolute bottom-5 left-5 text-white">
                    <h3 className="text-xl font-bold">{deal.title}</h3>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <p className="text-sm text-muted-foreground mb-3">
                    {deal.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xl font-bold text-primary">
                        Rs. {deal.price.toLocaleString()}
                      </span>

                      {deal.old_price && (
                        <span className="line-through ml-2 text-sm text-muted-foreground">
                          Rs. {deal.old_price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleGrab(deal)}
                      className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full"
                    >
                      Grab Deal
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FlashDeals;
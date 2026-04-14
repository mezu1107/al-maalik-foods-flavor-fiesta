import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Food = {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  rating: number;
  badge?: string;
};

const renderStars = (rating: number) => {
  const full = Math.floor(rating);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < full
              ? "fill-accent-foreground text-accent-foreground"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">({rating})</span>
    </div>
  );
};

const PopularFoods = () => {
  const { addItem } = useCart();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlist();
  const { toast } = useToast();

  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH FROM SUPABASE
  useEffect(() => {
    const fetchFoods = async () => {
      const { data, error } = await supabase
        .from("foods")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6); // 🔥 popular only

      if (error) {
        console.error("Foods error:", error.message);
        setFoods([]);
      } else {
        setFoods((data as Food[]) || []);
      }

      setLoading(false);
    };

    fetchFoods();
  }, []);

  const handleAddToCart = (food: Food) => {
    addItem({
      id: food.id,
      title: food.title,
      price: food.price,
      imageUrl: food.image_url,
    });

    toast({ title: `${food.title} added to cart!` });
  };

  const toggleWishlist = (food: Food) => {
    if (isInWishlist(food.id)) {
      removeFromWishlist(food.id);
      toast({ title: `${food.title} removed from wishlist` });
    } else {
      addToWishlist({
        id: food.id,
        title: food.title,
        price: food.price,
        imageUrl: food.image_url,
        description: food.description,
        rating: food.rating,
      });

      toast({ title: `${food.title} added to wishlist! ❤️` });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-5 lg:px-12">

        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-foreground mb-4">
            Popular Dishes
          </h2>
          <p className="text-muted-foreground">
            Customer favorites – fresh & tasty every day
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <p className="text-center text-muted-foreground">
            Loading popular foods...
          </p>
        ) : foods.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No foods found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {foods.map((food) => (
              <div
                key={food.id}
                className="bg-card rounded-2xl shadow-lg overflow-hidden"
              >
                {/* IMAGE */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={food.image_url}
                    alt={food.title}
                    className="w-full h-full object-cover"
                  />

                  <button
                    onClick={() => toggleWishlist(food)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/70 flex items-center justify-center"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isInWishlist(food.id) ? "fill-red-500" : ""
                      }`}
                    />
                  </button>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <h4 className="text-xl font-bold mb-2">
                    {food.title}
                  </h4>

                  <p className="text-sm text-muted-foreground mb-3">
                    {food.description}
                  </p>

                  <div className="mb-3">
                    {renderStars(food.rating)}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-primary">
                      Rs. {food.price.toLocaleString()}
                    </span>

                    <button
                      onClick={() => handleAddToCart(food)}
                      className="bg-primary text-white px-4 py-2 rounded-full flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Order
                    </button>
                  </div>
                </div>
              </div>
            ))}

          </div>
        )}

        {/* Button */}
        <div className="text-center mt-12">
          <Link
            to="/menu"
            className="bg-black text-white px-8 py-3 rounded-full inline-block"
          >
            View Full Menu →
          </Link>
        </div>

      </div>
    </section>
  );
};

export default PopularFoods;
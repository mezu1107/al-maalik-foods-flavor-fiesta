import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Star, Loader2 } from "lucide-react";

const Reviews = () => {
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(0);

  // =========================
  // SUBMIT REVIEW
  // =========================
  const submitReview = async () => {
    if (!name.trim() || !text.trim()) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("testimonials").insert({
      name: name.trim(),
      text: text.trim(),
      rating,
      role: "Customer",
      avatar: `https://i.pravatar.cc/150?u=${name}`,
      is_approved: false
    });

    setLoading(false);

    if (error) {
      console.log("SUPABASE ERROR:", error);
      alert(error.message);
      return;
    }

    setName("");
    setText("");
    setRating(5);

    alert("Review submitted! Waiting for admin approval.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">

      {/* ================= HEADER ================= */}
      <Header />

      {/* ================= HERO ================= */}
      <section className="pt-28 pb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
          Share Your Experience ⭐
        </h1>
        <p className="text-gray-500 mt-3">
          Help others by reviewing your experience with us
        </p>
      </section>

      {/* ================= FORM ================= */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-xl bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">

          {/* NAME */}
          <input
            className="w-full mb-4 p-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* REVIEW */}
          <textarea
            className="w-full mb-4 p-3 border rounded-xl h-28 resize-none focus:ring-2 focus:ring-primary outline-none"
            placeholder="Write your review..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* STAR RATING */}
          <div className="flex items-center gap-2 mb-6">
            {Array.from({ length: 5 }).map((_, i) => {
              const starValue = i + 1;

              return (
                <Star
                  key={i}
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHover(starValue)}
                  onMouseLeave={() => setHover(0)}
                  className={`w-7 h-7 cursor-pointer transition-all ${
                    starValue <= (hover || rating)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              );
            })}
          </div>

          {/* BUTTON */}
          <button
            onClick={submitReview}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </button>

          {/* NOTE */}
          <p className="text-xs text-gray-400 mt-4 text-center">
            Your review will appear after admin approval
          </p>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
};

export default Reviews;
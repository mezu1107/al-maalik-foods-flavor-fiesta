import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Review = {
  id: string;
  name: string;
  text: string;
  rating: number;
  is_approved: boolean;
};

const AdminTestimonials = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  // =========================
  // FETCH ALL REVIEWS
  // =========================
  const fetchReviews = async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setReviews(data);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // =========================
  // APPROVE REVIEW
  // =========================
  const approveReview = async (id: string) => {
    await supabase
      .from("testimonials")
      .update({ is_approved: true })
      .eq("id", id);

    fetchReviews();
  };

  // =========================
  // DELETE REVIEW
  // =========================
  const deleteReview = async (id: string) => {
    await supabase
      .from("testimonials")
      .delete()
      .eq("id", id);

    fetchReviews();
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">
        Admin Testimonials Panel
      </h1>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="border p-4 rounded-xl flex justify-between items-center"
          >
            <div>
              <h2 className="font-bold">{r.name}</h2>
              <p className="text-sm text-gray-500">{r.text}</p>
              <p className="text-xs">
                Status:{" "}
                {r.is_approved ? "Approved ✅" : "Pending ⏳"}
              </p>
            </div>

            <div className="flex gap-2">
              {!r.is_approved && (
                <button
                  onClick={() => approveReview(r.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>
              )}

              <button
                onClick={() => deleteReview(r.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTestimonials;
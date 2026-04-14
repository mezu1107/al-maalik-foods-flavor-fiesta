import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Phone, Mail, Clock,
  Facebook, Instagram, Twitter,
  ArrowUp, ChefHat
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Settings {
  restaurant_name: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  opening_hours_weekday: string;
  opening_hours_weekend: string;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
}

const Footer = () => {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    supabase
      .from("website_settings")
      .select("*")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setSettings(data as unknown as Settings);
      });
  }, []);

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-white text-black dark:bg-black dark:text-white relative">

      {/* Scroll Top Button */}
      <button
        onClick={scrollToTop}
        className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="w-8 h-8 text-primary" />
              <h3 className="font-bold text-2xl">
                {settings?.restaurant_name?.split(" ").slice(0, 2).join(" ") || "AL Maalik"}{" "}
                <span className="text-primary">
                  {settings?.restaurant_name?.split(" ").slice(2).join(" ") || "Foods"}
                </span>
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Delicious food delivered to your doorstep. Fresh ingredients,
              amazing taste every time.
            </p>

            <div className="flex gap-3">
              {[
                { icon: Facebook, url: settings?.facebook_url },
                { icon: Instagram, url: settings?.instagram_url },
                { icon: Twitter, url: settings?.twitter_url },
              ].map((s, i) => (
                <motion.a
                  key={i}
                  href={s.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-primary flex items-center justify-center transition"
                >
                  <s.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: "Home", to: "/" },
                { label: "Menu", to: "/menu" },
                { label: "Deals", to: "/deals" },
                { label: "About", to: "/about" },
                { label: "Contact", to: "/contact" },
                { label: "FAQ", to: "/faq" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary transition text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4">Contact</h4>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{settings?.address || "Lahore, Pakistan"}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span>{settings?.contact_phone || "+92 300 1234567"}</span>
              </li>
              <li className="flex gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span>{settings?.contact_email || "info@email.com"}</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-bold text-lg mb-4">Opening Hours</h4>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex gap-3">
                <Clock className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-black dark:text-white">Mon – Fri</p>
                  <p>{settings?.opening_hours_weekday || "11 AM – 11 PM"}</p>
                </div>
              </li>

              <li className="flex gap-3">
                <Clock className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium text-black dark:text-white">Sat – Sun</p>
                  <p>{settings?.opening_hours_weekend || "12 PM – 12 AM"}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-gray-300 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">

          <p>
            © {new Date().getFullYear()}{" "}
            {settings?.restaurant_name || "AL Maalik Foods"}.
            All rights reserved.
          </p>

          <p className="text-center">
            Website Design and Developed by <span className="font-semibold text-primary">AM Enterprises</span> 
              <span className="font-semibold text-primary"> <br />Your Digital Growth Partner  </span> ({new Date().getFullYear()})</p>

          <div className="flex gap-5">
            <Link to="/about" className="hover:text-primary">About</Link>
            <Link to="/faq" className="hover:text-primary">FAQ</Link>
            <Link to="/contact" className="hover:text-primary">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
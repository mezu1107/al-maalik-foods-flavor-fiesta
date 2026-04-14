import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const FloatingWhatsApp = () => (
  <motion.a
    href="https://wa.me/923431497982?text=Assalam%20o%20Alaikum!%20I%20want%20to%20order%20from%20Al%20Maalik%20Foods"
    target="_blank"
    rel="noopener noreferrer"
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay: 1, type: "spring" }}
    whileHover={{ scale: 1.15 }}
    whileTap={{ scale: 0.9 }}
    className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-2xl"
    aria-label="Chat on WhatsApp"
  >
    <MessageCircle className="w-7 h-7" />
    <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full animate-ping" />
  </motion.a>
);

export default FloatingWhatsApp;

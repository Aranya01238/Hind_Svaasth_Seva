import { motion } from "framer-motion";
import { Bot } from "lucide-react";

const CHATBOT_REDIRECT_URL = "https://hsschatbot-64rp.vercel.app/";

export const AvatarChatbot = () => {
  const handleRedirect = () => {
    window.location.assign(CHATBOT_REDIRECT_URL);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleRedirect}
        className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow"
        aria-label="Open chatbot"
      >
        <Bot />
      </motion.button>
    </div>
  );
};

import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, CornerDownLeft, Loader, Send, User, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

const GEMINI_API_KEY = (
  import.meta.env.VITE_GEMINI_API_KEY ??
  import.meta.env.VITE_GOOGLE_API_KEY ??
  ""
).trim();
const GEMINI_MODEL = "gemini-1.5-flash";

const WELCOME_MESSAGE =
  "Hello! I'm your AI Healthcare Assistant powered by Gemini. I can help you with health information, first aid tips, and general medical guidance. How can I assist you today?";

if (!GEMINI_API_KEY) {
  console.warn(
    "Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env.local file.",
  );
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

type Message = {
  role: "user" | "model";
  text: string;
};

export const AvatarChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<Message[]>([
    {
      role: "model",
      text: WELCOME_MESSAGE,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !genAI) return;

    const userInput: Message = { role: "user", text: input };
    setHistory((prev) => [...prev, userInput]);
    setInput("");
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

      const apiHistory = history
        .filter((msg) => msg.text !== WELCOME_MESSAGE)
        .map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        }));

      while (apiHistory.length && apiHistory[0].role !== "user") {
        apiHistory.shift();
      }

      const chat = model.startChat({
        history: apiHistory,
      });
      const result = await chat.sendMessage(input);
      const response = result.response;
      const text = response.text();

      const modelResponse: Message = { role: "model", text };
      setHistory((prev) => [...prev, modelResponse]);
    } catch (error) {
      console.error("Gemini API error:", error);
      const errorResponse: Message = {
        role: "model",
        text: "Sorry, I couldn't get a response right now. Please verify your Gemini API key and try again.",
      };
      setHistory((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow"
        >
          {isOpen ? <X /> : <Bot />}
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-28 right-8 w-96 h-[32rem] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
          >
            <div className="p-4 bg-card border-b border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <Bot className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Health Assistant
                </h3>
                <p className="text-xs text-muted-foreground">
                  Powered by Gemini
                </p>
              </div>
            </div>

            <div
              ref={chatContainerRef}
              className="flex-1 p-4 space-y-4 overflow-y-auto"
            >
              {history.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "model" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-secondary text-secondary-foreground">
                    <Loader className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-4 bg-card border-t border-border"
            >
              <div className="relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    GEMINI_API_KEY
                      ? "Ask something..."
                      : "Set VITE_GEMINI_API_KEY to enable chat"
                  }
                  disabled={!GEMINI_API_KEY}
                  className="w-full px-3 py-2 pr-10 rounded-lg bg-background text-sm border border-border outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim() || !GEMINI_API_KEY}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {!GEMINI_API_KEY && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Chatbot is disabled until VITE_GEMINI_API_KEY is configured.
                </p>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

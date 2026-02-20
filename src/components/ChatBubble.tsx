import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Volume2, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
}

const ChatBubble = ({ message, isUser }: ChatBubbleProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/robo-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: message.replace(/[*#_~`>]/g, "").slice(0, 500) }),
        }
      );
      if (!response.ok) throw new Error("TTS failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (e) {
      console.error("TTS error:", e);
      setIsSpeaking(false);
    }
  }, [message, isSpeaking]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-start" : "justify-end"} mb-3`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-base leading-relaxed shadow-sm ${
          isUser
            ? "bg-bubble-user text-bubble-user-foreground rounded-br-sm"
            : "bg-bubble-bot text-bubble-bot-foreground rounded-bl-sm border border-border"
        }`}
      >
        <ReactMarkdown components={{ p: ({ children }) => <p className="m-0">{children}</p> }}>
          {message}
        </ReactMarkdown>

        {!isUser && (
          <button
            onClick={speak}
            disabled={isSpeaking}
            className="mt-2 flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {isSpeaking ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            {isSpeaking ? "מדבר..." : "השמע"}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ChatBubble;

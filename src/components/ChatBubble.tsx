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

  const speak = useCallback(() => {
    if (isSpeaking) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    let cleanText = message
      .replace(/[*#_~`>]/g, "")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, ", ")
      .replace(/(\d+)\./g, "$1,")
      .replace(/([א-ת])(\?)/g, "$1 $2")
      .replace(/([א-ת])(!)/g, "$1 $2")
      .replace(/😊|🎉|🌟|💪|🔢|📖|🇬🇧|🎮|🤖|👋|✨|😅|🤔|👨‍👩‍👧/g, "")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 600);

    if (cleanText && !/[.!?]$/.test(cleanText)) cleanText += ".";

    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
    const voices = window.speechSynthesis.getVoices();
    const hebrewVoice = voices.find(v => v.lang.startsWith("he"));

    let completed = 0;
    const total = sentences.length;

    sentences.forEach((sentence) => {
      const trimmed = sentence.trim();
      if (!trimmed) return;

      const isQuestion = trimmed.endsWith("?");
      const isExclamation = trimmed.endsWith("!");

      const spokenText = trimmed.replace(/[.!?,;:"""()–\-]/g, " ").replace(/\s{2,}/g, " ").trim();
      if (!spokenText) return;

      const utterance = new SpeechSynthesisUtterance(spokenText);
      if (hebrewVoice) utterance.voice = hebrewVoice;
      utterance.lang = "he-IL";
      utterance.rate = isQuestion ? 0.7 : 0.75;
      utterance.pitch = isQuestion ? 1.8 : isExclamation ? 1.6 : 1.5;

      utterance.onend = () => { completed++; if (completed >= total) setIsSpeaking(false); };
      utterance.onerror = () => { completed++; if (completed >= total) setIsSpeaking(false); };
      window.speechSynthesis.speak(utterance);
    });
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

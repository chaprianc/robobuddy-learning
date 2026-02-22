import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Volume2, Loader2, BookOpen, Calculator, Languages, HelpCircle } from "lucide-react";
import { useState, useCallback } from "react";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  onModuleSwitch?: (module: string) => void;
}

const moduleButtons: Record<string, { label: string; icon: React.ReactNode }> = {
  math: { label: "בוא נתרגל חשבון! 🔢", icon: <Calculator className="w-4 h-4" /> },
  reading: { label: "בוא נקרא ביחד! 📖", icon: <BookOpen className="w-4 h-4" /> },
  english: { label: "Let's learn English! 🇬🇧", icon: <Languages className="w-4 h-4" /> },
  quiz: { label: "בוא לחידון ידע! 🎮", icon: <HelpCircle className="w-4 h-4" /> },
};

const ChatBubble = ({ message, isUser, onModuleSwitch }: ChatBubbleProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Extract module suggestion tag
  const moduleMatch = message.match(/\[MODULE:(math|reading|english|quiz)\]/);
  const suggestedModule = moduleMatch ? moduleMatch[1] : null;
  const displayMessage = message
    .replace(/\[MODULE:(math|reading|english|quiz)\]/g, "")
    .replace(/\[CORRECT\]/g, "")
    .replace(/\[WRONG\]/g, "")
    .replace(/\[AGE:\d+\]/g, "")
    .replace(/\[MOOD:\w+\]/g, "")
    .trim();

  const speak = useCallback(() => {
    if (isSpeaking) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    let cleanText = displayMessage
      .replace(/[*#_~`>]/g, "")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, ", ")
      .replace(/(\d+)\.\s/g, "$1: ")
      .replace(/\(([^)]+)\)/g, ", $1, ")
      .replace(/[-–—]/g, ", ")
      .replace(/["""]/g, "")
      .replace(/[^\u0590-\u05FFa-zA-Z0-9\s.!?,:']/g, "")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 800);

    if (cleanText && !/[.!?]$/.test(cleanText)) cleanText += ".";

    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
    const voices = window.speechSynthesis.getVoices();
    const hebrewVoice = voices.find(v => v.lang.startsWith("he"));

    const validSentences: { text: string; isQuestion: boolean; isExclamation: boolean }[] = [];
    for (const s of sentences) {
      const trimmed = s.trim();
      if (!trimmed) continue;
      const isQuestion = trimmed.endsWith("?");
      const isExclamation = trimmed.endsWith("!");
      const spokenText = trimmed.replace(/[.!?,;:]/g, " ").replace(/\s{2,}/g, " ").trim();
      if (spokenText.length > 1) validSentences.push({ text: spokenText, isQuestion, isExclamation });
    }

    if (validSentences.length === 0) { setIsSpeaking(false); return; }

    const speakNext = (i: number) => {
      if (i >= validSentences.length) { setIsSpeaking(false); return; }
      const { text, isQuestion, isExclamation } = validSentences[i];
      const delay = i === 0 ? 0 : 300;
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        if (hebrewVoice) utterance.voice = hebrewVoice;
        utterance.lang = "he-IL";
        utterance.pitch = isQuestion ? 1.8 : isExclamation ? 1.6 : 1.5;
        utterance.rate = isQuestion ? 0.7 : isExclamation ? 0.8 : 0.75;
        utterance.onend = () => speakNext(i + 1);
        utterance.onerror = () => speakNext(i + 1);
        window.speechSynthesis.speak(utterance);
      }, delay);
    };
    speakNext(0);
  }, [displayMessage, isSpeaking]);

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
        <ReactMarkdown components={{
          p: ({ children }) => <p className="m-0">{children}</p>,
          pre: ({ children }) => <pre dir="ltr" className="my-2 bg-black/5 rounded-lg p-3 overflow-x-auto text-left">{children}</pre>,
          code: ({ children, className }) => {
            const isBlock = className || (typeof children === 'string' && children.includes('\n'));
            if (isBlock) return <code className="font-mono text-sm whitespace-pre">{children}</code>;
            return <code className="font-mono bg-black/5 px-1 rounded text-sm">{children}</code>;
          }
        }}>
          {displayMessage}
        </ReactMarkdown>

        {suggestedModule && onModuleSwitch && moduleButtons[suggestedModule] && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => onModuleSwitch(suggestedModule)}
            className="mt-3 flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity w-full justify-center"
          >
            {moduleButtons[suggestedModule].icon}
            {moduleButtons[suggestedModule].label}
          </motion.button>
        )}

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

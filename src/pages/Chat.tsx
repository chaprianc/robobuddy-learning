import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, ArrowRight, Loader2, Mic, MicOff } from "lucide-react";
import RoboAvatar from "@/components/RoboAvatar";
import ChatBubble from "@/components/ChatBubble";
import { useRobo } from "@/lib/robo-context";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const moduleGreetings: Record<string, string> = {
  homework: "שלום! 📚 אני רובו. ספר לי מה השיעור שאתה צריך עזרה בו, ואני אעזור לך להבין שלב אחר שלב!",
  english: "Hi there! 🇬🇧 I'm Robo. Let's practice English together! What would you like to learn today?",
  quiz: "מוכן לחידון? 🎮 אני אשאל אותך 5 שאלות. בוא נתחיל! \n\nבאיזה נושא תרצה לשחק?\n1. חשבון\n2. ידע כללי\n3. מדע\n4. מילים",
};

const Chat = () => {
  const { age, module } = useRobo();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!age || !module) {
      navigate("/");
      return;
    }
    const greeting = moduleGreetings[module] || "היי! אני רובו 🤖";
    setMessages([{ role: "assistant", content: greeting }]);
  }, [age, module, navigate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    const userMsg: Msg = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("robo-chat", {
        body: { messages: newMessages, age, module },
      });
      if (error) throw error;
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (e) {
      console.error("Chat error:", e);
      setMessages((prev) => [...prev, { role: "assistant", content: "אופס, משהו השתבש 😅 בוא ננסה שוב!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("הדפדפן שלך לא תומך בזיהוי דיבור. נסה Chrome.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = module === "english" ? "en-US" : "he-IL";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      const transcript = last[0].transcript;
      if (last.isFinal) {
        setInput("");
        sendMessage(transcript);
        setIsListening(false);
      } else {
        setInput(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [isListening, module, messages, age, isLoading]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border shadow-sm">
        <button onClick={() => navigate("/menu")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight className="w-5 h-5" />
        </button>
        <RoboAvatar size="sm" animate={false} />
        <div>
          <p className="font-bold text-foreground text-sm">רובו 🤖</p>
          <p className="text-xs text-muted-foreground">
            {module === "homework" ? "שיעורי בית" : module === "english" ? "אנגלית" : "משחק ידע"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg.content} isUser={msg.role === "user"} />
        ))}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end mb-3">
            <div className="bg-bubble-bot border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Listening indicator */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-2 flex items-center justify-center gap-2"
        >
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive rounded-full px-4 py-2 text-sm font-medium">
            <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            מקשיב... דבר עכשיו!
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="px-4 py-3 bg-card border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="כתוב הודעה..."
            className="flex-1 bg-muted rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={toggleListening}
            disabled={isLoading}
            className={`rounded-xl p-3 transition-all ${
              isListening
                ? "bg-destructive text-destructive-foreground animate-pulse-glow"
                : "bg-secondary text-secondary-foreground hover:opacity-90"
            } disabled:opacity-40`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-primary text-primary-foreground rounded-xl p-3 hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;

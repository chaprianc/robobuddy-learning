import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, ArrowRight, Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import RoboAvatar from "@/components/RoboAvatar";
import ChatBubble from "@/components/ChatBubble";
import StreakCounter from "@/components/StreakCounter";
import XpLevelBar from "@/components/XpLevelBar";
import XpPopup from "@/components/XpPopup";
import BadgePopup from "@/components/BadgePopup";
import { useRobo } from "@/lib/robo-context";
import { useRoboTTS } from "@/hooks/use-robo-tts";
import { supabase } from "@/integrations/supabase/client";
import { getLevelFromXp, XP_REWARDS, checkNewBadges, type BadgeCheckStats } from "@/lib/xp-system";

type Msg = { role: "user" | "assistant"; content: string };

const MOOD_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  happy: { emoji: "😊", label: "שמח", color: "text-chart-3" },
  excited: { emoji: "🤩", label: "נלהב", color: "text-chart-4" },
  sad: { emoji: "😢", label: "עצוב", color: "text-chart-2" },
  frustrated: { emoji: "😤", label: "מתוסכל", color: "text-destructive" },
  tired: { emoji: "😴", label: "עייף", color: "text-muted-foreground" },
  neutral: { emoji: "😐", label: "רגוע", color: "text-muted-foreground" },
};

const MoodIndicator = ({ mood }: { mood: string }) => {
  const config = MOOD_CONFIG[mood] || MOOD_CONFIG.neutral;
  if (mood === "neutral") return null;
  return (
    <motion.span
      key={mood}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 10 }}
      className={`text-xs ${config.color} flex items-center gap-0.5`}
      title={`מצב רוח: ${config.label}`}
    >
      <span>{config.emoji}</span>
    </motion.span>
  );
};

const moduleGreetings: Record<string, string> = {
  math: "שלום! 🔢 אני רובו! בוא נתרגל חשבון ביחד. אני אתן לך תרגילים ואעזור לך להצליח! מוכן?",
  reading: "שלום! 📖 אני רובו! בוא נקרא ונלמד מילים חדשות ביחד! מוכן להתחיל?",
  english: "Hi there! 🇬🇧 I'm Robo. Let's practice English together! What would you like to learn today?",
  quiz: "מוכן לחידון? 🎮 אני אשאל אותך 5 שאלות. בוא נתחיל!\n\nבאיזה נושא תרצה לשחק?\n1. חשבון\n2. ידע כללי\n3. מדע\n4. מילים",
  free: "היי חבר! 😊 אני רובו! בן כמה אתה? ספר לי ואני אדאג שנלמד בדיוק מה שמתאים לך! 🤖",
};

const moduleLabels: Record<string, string> = {
  math: "חשבון",
  reading: "קריאה",
  english: "אנגלית",
  quiz: "חידון ידע",
  free: "שיחה חופשית 🎤",
};

const Chat = () => {
  const { age, module, difficulty, setModule, setDifficulty, setAge, childId, xp, addXp, setXp, level, setLevel, totalCorrect, setTotalCorrect, earnedBadgeKeys, setEarnedBadgeKeys } = useRobo();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { isTalking, speak, stop } = useRoboTTS();
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [xpPopup, setXpPopup] = useState({ amount: 0, show: false });
  const [badgePopup, setBadgePopup] = useState<{ name: string; icon: string } | null>(null);
  const [currentMood, setCurrentMood] = useState<string>("neutral");
  const modulesPlayedRef = useRef<string[]>([]);

  // Track modules played for badge checks
  useEffect(() => {
    if (module && !modulesPlayedRef.current.includes(module)) {
      modulesPlayedRef.current.push(module);
    }
  }, [module]);

  // Load XP from DB if childId available
  useEffect(() => {
    if (!childId) return;
    (async () => {
      const { data } = await supabase.from("children").select("xp, level").eq("id", childId).single();
      if (data) {
        setXp(data.xp);
        setLevel(data.level);
      }
      // Load earned badges
      const { data: badges } = await supabase.from("badges").select("badge_key").eq("child_id", childId);
      if (badges) setEarnedBadgeKeys(badges.map((b: any) => b.badge_key));
    })();
  }, [childId]);

  useEffect(() => {
    if (!module) {
      navigate("/");
      return;
    }
    const greeting = moduleGreetings[module] || "היי! אני רובו 🤖";
    setMessages([{ role: "assistant", content: greeting }]);
    if (autoSpeak) {
      speak(greeting);
    }
  }, [age, module, navigate]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Save learning memory when leaving or switching modules
  const saveMemory = useCallback(async (msgs: Msg[], currentStreak: number) => {
    if (!childId || !module || msgs.length < 3) return;
    try {
      await supabase.functions.invoke("save-memory", {
        body: { childId, module, messages: msgs, streak: currentStreak, difficulty },
      });
    } catch (e) {
      console.error("Save memory error:", e);
    }
  }, [childId, module, difficulty]);


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
        body: { messages: newMessages, age, module, difficulty, childId },
      });
      if (error) throw error;
      const reply = data.reply as string;
      
      // Detect age tag
      const ageMatch = reply.match(/\[AGE:(\d+)\]/);
      if (ageMatch) {
        const ageNum = parseInt(ageMatch[1]);
        if (ageNum <= 6) setAge("5-6");
        else if (ageNum <= 9) setAge("7-9");
        else if (ageNum <= 12) setAge("10-12");
        else setAge("13-14");
      }

      // Detect mood tag
      const moodMatch = reply.match(/\[MOOD:(\w+)\]/);
      if (moodMatch) {
        setCurrentMood(moodMatch[1]);
      }

      // Detect streak tags and award XP
      if (reply.includes("[CORRECT]")) {
        const newTotalCorrect = totalCorrect + 1;
        setTotalCorrect(newTotalCorrect);

        setStreak(prev => {
          const next = prev + 1;
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 1500);

          // Calculate XP reward
          let xpGain = XP_REWARDS.correct;
          if (next >= 7) xpGain += XP_REWARDS.streak7;
          else if (next >= 5) xpGain += XP_REWARDS.streak5;
          else if (next >= 3) xpGain += XP_REWARDS.streak3;

          const newXp = xp + xpGain;
          addXp(xpGain);

          // Show XP popup
          setXpPopup({ amount: xpGain, show: true });
          setTimeout(() => setXpPopup({ amount: 0, show: false }), 1500);

          // Check level up
          const newLevel = getLevelFromXp(newXp);
          if (newLevel > level) {
            setLevel(newLevel);
            setShowLevelUp(true);
            setTimeout(() => setShowLevelUp(false), 3000);
          }

          // Check badges
          const stats: BadgeCheckStats = {
            totalCorrect: newTotalCorrect,
            highestStreak: Math.max(next, streak),
            level: newLevel,
            xp: newXp,
            modulesPlayed: modulesPlayedRef.current,
          };
          const newBadges = checkNewBadges(stats, earnedBadgeKeys);
          if (newBadges.length > 0) {
            const allKeys = [...earnedBadgeKeys, ...newBadges.map(b => b.key)];
            setEarnedBadgeKeys(allKeys);
            // Show first new badge
            setBadgePopup({ name: newBadges[0].name, icon: newBadges[0].icon });
            setTimeout(() => setBadgePopup(null), 3000);
            // Save badges to DB
            if (childId) {
              newBadges.forEach(b => {
                supabase.from("badges").insert({ child_id: childId, badge_key: b.key, badge_name: b.name, badge_icon: b.icon }).then();
              });
            }
          }

          // Save XP to DB
          if (childId) {
            supabase.from("children").update({ xp: newXp, level: newLevel }).eq("id", childId).then();
          }

          return next;
        });
      } else if (reply.includes("[WRONG]")) {
        setStreak(0);
      }
      
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (autoSpeak) {
        speak(reply);
      }
    } catch (e) {
      console.error("Chat error:", e);
      const errMsg = "אופס, משהו השתבש 😅 בוא ננסה שוב!";
      setMessages((prev) => [...prev, { role: "assistant", content: errMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModuleSwitch = useCallback((newModule: string) => {
    // Save memory for current module before switching
    saveMemory(messages, streak);
    setModule(newModule as any);
    setStreak(0);
    const greeting = moduleGreetings[newModule] || "בוא נתחיל! 🚀";
    setMessages([{ role: "assistant", content: greeting }]);
    if (autoSpeak) speak(greeting);
  }, [setModule, autoSpeak, speak, saveMemory, messages, streak]);

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
      <div className="flex flex-col px-4 py-3 bg-card border-b border-border shadow-sm gap-2">
        <div className="flex items-center gap-3">
          <button onClick={() => {
            saveMemory(messages, streak);
            navigate(module === "free" ? "/" : "/menu");
          }} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowRight className="w-5 h-5" />
          </button>
          <RoboAvatar size="sm" animate={false} isTalking={isTalking} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-foreground text-sm">רובו 🤖</p>
              <MoodIndicator mood={currentMood} />
            </div>
            <p className="text-xs text-muted-foreground">
              {moduleLabels[module || ""] || ""}
            </p>
          </div>
          {module !== "free" && <StreakCounter streak={streak} showCelebration={showCelebration} />}
          <button
            onClick={() => {
              setAutoSpeak(!autoSpeak);
              if (autoSpeak) {
                stop();
              }
            }}
            className={`p-2 rounded-lg transition-colors ${autoSpeak ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
            title={autoSpeak ? "כבה קול" : "הפעל קול"}
          >
            {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
        {module !== "free" && (
          <XpLevelBar xp={xp} level={level} showLevelUp={showLevelUp} />
        )}
      </div>

      {/* Popups */}
      <XpPopup amount={xpPopup.amount} show={xpPopup.show} />
      <BadgePopup badge={badgePopup} />

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg.content} isUser={msg.role === "user"} onModuleSwitch={module === "free" ? handleModuleSwitch : undefined} />
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

      {/* Talking indicator */}
      {isTalking && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-2 flex items-center justify-center gap-2"
        >
          <div className="flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium">
            <Volume2 className="w-4 h-4 animate-pulse" />
            רובו מדבר...
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

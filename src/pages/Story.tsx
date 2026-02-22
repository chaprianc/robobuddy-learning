import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Volume2, VolumeX, Loader2, BookOpen } from "lucide-react";
import RoboAvatar from "@/components/RoboAvatar";
import { useRobo } from "@/lib/robo-context";
import { useRoboTTS } from "@/hooks/use-robo-tts";
import { supabase } from "@/integrations/supabase/client";

interface StorySegment {
  text: string;
  choices?: string[];
  isEnding?: boolean;
}

const STORY_THEMES = [
  { emoji: "🏰", label: "הרפתקה בטירה קסומה", theme: "castle_adventure" },
  { emoji: "🚀", label: "מסע בחלל", theme: "space_journey" },
  { emoji: "🌊", label: "הרפתקה מתחת למים", theme: "underwater" },
  { emoji: "🦁", label: "סיפור בג'ונגל", theme: "jungle" },
  { emoji: "🧙", label: "קוסם צעיר", theme: "wizard" },
  { emoji: "🏴‍☠️", label: "אי המטמון", theme: "pirate" },
];

const Story = () => {
  const { age, childId } = useRobo();
  const navigate = useNavigate();
  const { isTalking, speak, stop } = useRoboTTS();
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [phase, setPhase] = useState<"pick" | "story">("pick");
  const [segments, setSegments] = useState<StorySegment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [segments, isLoading]);

  const startStory = async (theme: string, label: string) => {
    setPhase("story");
    setIsLoading(true);

    const userMsg = { role: "user" as const, content: `התחל סיפור בנושא: ${label}` };
    const newMessages = [userMsg];
    setMessages(newMessages);

    try {
      const { data, error } = await supabase.functions.invoke("robo-chat", {
        body: { messages: newMessages, age, module: "story", difficulty: "medium", childId },
      });
      if (error) throw error;

      const reply = data.reply as string;
      const parsed = parseStoryResponse(reply);
      setSegments([parsed]);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);

      if (autoSpeak) speak(parsed.text);
    } catch (e) {
      console.error("Story error:", e);
      setSegments([{ text: "אופס, לא הצלחתי להתחיל את הסיפור 😅 בוא ננסה שוב!", choices: [] }]);
    } finally {
      setIsLoading(false);
    }
  };

  const chooseOption = async (choice: string) => {
    if (isLoading) return;
    setIsLoading(true);

    const userMsg = { role: "user" as const, content: choice };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    try {
      const { data, error } = await supabase.functions.invoke("robo-chat", {
        body: { messages: newMessages, age, module: "story", difficulty: "medium", childId },
      });
      if (error) throw error;

      const reply = data.reply as string;
      const parsed = parseStoryResponse(reply);
      setSegments(prev => [...prev, parsed]);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);

      if (autoSpeak) speak(parsed.text);
    } catch (e) {
      console.error("Story continue error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const parseStoryResponse = (reply: string): StorySegment => {
    // Extract choices marked as 1. 2. 3. or א. ב. ג. patterns
    const lines = reply.split("\n").map(l => l.trim()).filter(Boolean);
    const choicePattern = /^(?:\d+[.):]|[א-ת][.):])\s*(.+)/;
    
    const choices: string[] = [];
    const textLines: string[] = [];
    let inChoices = false;

    for (const line of lines) {
      const match = line.match(choicePattern);
      if (match && (inChoices || lines.indexOf(line) > lines.length / 2)) {
        choices.push(match[1].trim());
        inChoices = true;
      } else if (!inChoices) {
        textLines.push(line);
      }
    }

    // Check if it's an ending
    const isEnding = reply.includes("[END]") || reply.includes("סוף הסיפור") || (choices.length === 0 && segments.length > 2);

    return {
      text: textLines.join("\n"),
      choices: choices.length > 0 ? choices : undefined,
      isEnding,
    };
  };

  const resetStory = () => {
    setPhase("pick");
    setSegments([]);
    setMessages([]);
    stop();
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-background to-muted" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border shadow-sm">
        <button
          onClick={() => { stop(); navigate("/menu"); }}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <RoboAvatar size="sm" animate={false} isTalking={isTalking} />
        <div className="flex-1">
          <p className="font-bold text-foreground text-sm">רובו מספר סיפור 📖</p>
          <p className="text-xs text-muted-foreground">סיפור אינטראקטיבי</p>
        </div>
        <button
          onClick={() => { setAutoSpeak(!autoSpeak); if (autoSpeak) stop(); }}
          className={`p-2 rounded-lg transition-colors ${autoSpeak ? "text-primary bg-primary/10" : "text-muted-foreground"}`}
        >
          {autoSpeak ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        {phase === "pick" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <BookOpen className="w-16 h-16 mx-auto text-primary mb-3" />
              </motion.div>
              <h2 className="text-xl font-bold text-foreground">בחר סיפור!</h2>
              <p className="text-sm text-muted-foreground mt-1">אתה תבחר מה קורה בסיפור 🎭</p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              {STORY_THEMES.map((t, i) => (
                <motion.button
                  key={t.theme}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.08, type: "spring", damping: 12 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => startStory(t.theme, t.label)}
                  className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <span className="text-4xl">{t.emoji}</span>
                  <span className="text-sm font-medium text-foreground text-center">{t.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "story" && (
          <div className="space-y-6 max-w-md mx-auto">
            <AnimatePresence>
              {segments.map((seg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="space-y-4"
                >
                  {/* Story text */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card rounded-2xl p-5 border border-border shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-1 flex-shrink-0">📖</span>
                      <p className="text-foreground leading-relaxed whitespace-pre-line text-sm">{seg.text}</p>
                    </div>
                  </motion.div>

                  {/* Choices - only show for the latest segment */}
                  {i === segments.length - 1 && seg.choices && !isLoading && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground text-center">מה תבחר? 🤔</p>
                      {seg.choices.map((choice, ci) => (
                        <motion.button
                          key={ci}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + ci * 0.15, type: "spring" }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => chooseOption(choice)}
                          className="w-full bg-primary/5 hover:bg-primary/15 border border-primary/20 hover:border-primary/40 rounded-xl px-4 py-3 text-sm text-foreground text-right flex items-center gap-3 transition-all"
                        >
                          <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {String.fromCharCode(1488 + ci) /* א, ב, ג */}
                          </span>
                          <span>{choice}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Ending */}
                  {i === segments.length - 1 && seg.isEnding && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-center space-y-3"
                    >
                      <motion.p
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-3xl"
                      >
                        🎉
                      </motion.p>
                      <p className="font-bold text-foreground">סוף הסיפור!</p>
                      <button
                        onClick={resetStory}
                        className="bg-primary text-primary-foreground rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-opacity"
                      >
                        סיפור חדש 📖
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-3 py-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Loader2 className="w-6 h-6 text-primary" />
                </motion.div>
                <span className="text-sm text-muted-foreground font-medium">רובו חושב על ההמשך...</span>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Footer - restart button when in story */}
      {phase === "story" && !isLoading && segments.length > 0 && !segments[segments.length - 1]?.isEnding && (
        <div className="px-4 py-3 bg-card border-t border-border">
          <button
            onClick={resetStory}
            className="w-full text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
          >
            🔄 התחל סיפור חדש
          </button>
        </div>
      )}
    </div>
  );
};

export default Story;

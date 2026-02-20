import { useState, useRef, useCallback } from "react";

export const useRoboTTS = () => {
  const [isTalking, setIsTalking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(async (text: string) => {
    try {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      setIsTalking(true);

      // Clean markdown and normalize punctuation for natural speech
      let cleanText = text
        .replace(/[*#_~`>]/g, "")        // Remove markdown
        .replace(/\n{2,}/g, ". ")         // Double newlines → pause
        .replace(/\n/g, ", ")             // Single newlines → short pause
        .replace(/\.{3,}/g, "... ")       // Normalize ellipsis
        .replace(/!{2,}/g, "! ")          // Multiple exclamation → single
        .replace(/\?{2,}/g, "? ")         // Multiple question → single
        .replace(/(\d+)\./g, "$1,")       // "1." list items → comma pause
        .replace(/([א-ת])(\?)/g, "$1 $2") // Space before ? for Hebrew
        .replace(/([א-ת])(!)/g, "$1 $2")  // Space before ! for Hebrew  
        .replace(/😊|🎉|🌟|💪|🔢|📖|🇬🇧|🎮|🤖|👋|✨|😅|🤔|👨‍👩‍👧/g, "") // Remove emojis
        .replace(/\s{2,}/g, " ")          // Collapse multiple spaces
        .trim()
        .slice(0, 600);

      // Ensure text ends with punctuation for proper intonation
      if (cleanText && !/[.!?]$/.test(cleanText)) {
        cleanText += ".";
      }
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utteranceRef.current = utterance;
      
      // Try to find a Hebrew voice, fallback to default
      const voices = window.speechSynthesis.getVoices();
      const hebrewVoice = voices.find(v => v.lang.startsWith("he"));
      if (hebrewVoice) {
        utterance.voice = hebrewVoice;
      }
      utterance.lang = "he-IL";
      utterance.rate = 0.75;
      utterance.pitch = 1.5;
      
      utterance.onend = () => {
        setIsTalking(false);
        utteranceRef.current = null;
      };
      utterance.onerror = () => {
        setIsTalking(false);
        utteranceRef.current = null;
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("TTS error:", e);
      setIsTalking(false);
    }
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsTalking(false);
    utteranceRef.current = null;
  }, []);

  return { isTalking, speak, stop };
};

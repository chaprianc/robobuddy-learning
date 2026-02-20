import { useState, useRef, useCallback } from "react";

export const useRoboTTS = () => {
  const [isTalking, setIsTalking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(async (text: string) => {
    try {
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      setIsTalking(true);
      const cleanText = text.replace(/[*#_~`>]/g, "").replace(/\n/g, ". ").slice(0, 500);
      
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utteranceRef.current = utterance;
      
      // Try to find a Hebrew voice, fallback to default
      const voices = window.speechSynthesis.getVoices();
      const hebrewVoice = voices.find(v => v.lang.startsWith("he"));
      if (hebrewVoice) {
        utterance.voice = hebrewVoice;
      }
      utterance.lang = "he-IL";
      utterance.rate = 0.75; // Slower for kids to follow easily
      utterance.pitch = 1.5; // Higher pitch — friendly, childlike tone
      
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

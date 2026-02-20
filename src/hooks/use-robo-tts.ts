import { useState, useRef, useCallback } from "react";

export const useRoboTTS = () => {
  const [isTalking, setIsTalking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(async (text: string) => {
    try {
      window.speechSynthesis.cancel();
      setIsTalking(true);

      let cleanText = text
        .replace(/[*#_~`>]/g, "")
        .replace(/\n{2,}/g, ". ")
        .replace(/\n/g, ", ")
        .replace(/\.{3,}/g, ". ")
        .replace(/!{2,}/g, "! ")
        .replace(/\?{2,}/g, "? ")
        .replace(/(\d+)\.\s/g, "$1: ")        // "1. item" → "1: item" (no "נקודה")
        .replace(/\(([^)]+)\)/g, ", $1, ")     // Parentheses → natural pauses
        .replace(/[-–—]/g, ", ")               // Dashes → pause
        .replace(/["""]/g, "")                 // Remove quotes
        .replace(/[^\u0590-\u05FFa-zA-Z0-9\s.!?,:']/g, "") // Remove emojis & symbols
        .replace(/\s{2,}/g, " ")
        .trim()
        .slice(0, 800);

      if (cleanText && !/[.!?]$/.test(cleanText)) cleanText += ".";

      // Split into sentences, keeping the delimiter
      const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];

      const voices = window.speechSynthesis.getVoices();
      const hebrewVoice = voices.find(v => v.lang.startsWith("he"));

      let completed = 0;
      const validSentences: { text: string; isQuestion: boolean; isExclamation: boolean }[] = [];

      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (!trimmed) continue;
        const isQuestion = trimmed.endsWith("?");
        const isExclamation = trimmed.endsWith("!");
        // Strip punctuation from spoken text
        const spokenText = trimmed
          .replace(/[.!?,;:]/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim();
        if (spokenText.length > 1) {
          validSentences.push({ text: spokenText, isQuestion, isExclamation });
        }
      }

      if (validSentences.length === 0) {
        setIsTalking(false);
        return;
      }

      const total = validSentences.length;

      // Speak sentences sequentially with pauses between them
      const speakNext = (index: number) => {
        if (index >= total) {
          setIsTalking(false);
          utteranceRef.current = null;
          return;
        }

        const { text: spokenText, isQuestion, isExclamation } = validSentences[index];

        // Add a small silence pause between sentences for natural rhythm
        const delay = index === 0 ? 0 : 300;

        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(spokenText);
          utteranceRef.current = utterance;

          if (hebrewVoice) utterance.voice = hebrewVoice;
          utterance.lang = "he-IL";

          if (isQuestion) {
            utterance.pitch = 1.8;
            utterance.rate = 0.7;
          } else if (isExclamation) {
            utterance.pitch = 1.6;
            utterance.rate = 0.8;
          } else {
            utterance.pitch = 1.5;
            utterance.rate = 0.75;
          }

          utterance.onend = () => speakNext(index + 1);
          utterance.onerror = () => speakNext(index + 1);

          window.speechSynthesis.speak(utterance);
        }, delay);
      };

      speakNext(0);
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

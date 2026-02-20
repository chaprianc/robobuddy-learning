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
        .replace(/😊|🎉|🌟|💪|🔢|📖|🇬🇧|🎮|🤖|👋|✨|😅|🤔|👨‍👩‍👧/g, "") // Remove emojis
        .replace(/\s{2,}/g, " ")          // Collapse multiple spaces
        .trim()
        .slice(0, 600);

      // Ensure text ends with punctuation for proper intonation
      if (cleanText && !/[.!?]$/.test(cleanText)) {
        cleanText += ".";
      }

      // Split into sentences to apply different intonation per sentence type
      const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];

      const voices = window.speechSynthesis.getVoices();
      const hebrewVoice = voices.find(v => v.lang.startsWith("he"));

      let completed = 0;
      const total = sentences.length;

      sentences.forEach((sentence, index) => {
        const trimmed = sentence.trim();
        if (!trimmed) return;

        const isQuestion = trimmed.endsWith("?");
        const isExclamation = trimmed.endsWith("!");

        // Remove punctuation so it won't be read aloud
        const spokenText = trimmed.replace(/[.!?,;:"""()–\-]/g, " ").replace(/\s{2,}/g, " ").trim();
        if (!spokenText) return;

        const utterance = new SpeechSynthesisUtterance(spokenText);
        utteranceRef.current = utterance;

        if (hebrewVoice) {
          utterance.voice = hebrewVoice;
        }
        utterance.lang = "he-IL";
        utterance.rate = 0.75;

        // Raise pitch for questions, slightly higher for exclamations, normal for statements
        if (isQuestion) {
          utterance.pitch = 1.8;   // Rising intonation for questions
          utterance.rate = 0.7;    // Slightly slower for clarity
        } else if (isExclamation) {
          utterance.pitch = 1.6;   // Excited tone
        } else {
          utterance.pitch = 1.5;   // Normal friendly tone
        }

        utterance.onend = () => {
          completed++;
          if (completed >= total) {
            setIsTalking(false);
            utteranceRef.current = null;
          }
        };
        utterance.onerror = () => {
          completed++;
          if (completed >= total) {
            setIsTalking(false);
            utteranceRef.current = null;
          }
        };

        window.speechSynthesis.speak(utterance);
      });
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

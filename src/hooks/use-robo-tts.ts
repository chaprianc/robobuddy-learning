import { useState, useRef, useCallback } from "react";

export const useRoboTTS = () => {
  const [isTalking, setIsTalking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsTalking(true);
      const cleanText = text.replace(/[*#_~`>]/g, "").slice(0, 500);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/robo-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: cleanText }),
        }
      );
      if (!response.ok) throw new Error("TTS failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setIsTalking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsTalking(false);
        audioRef.current = null;
      };
      await audio.play();
    } catch (e) {
      console.error("TTS error:", e);
      setIsTalking(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsTalking(false);
    }
  }, []);

  return { isTalking, speak, stop };
};

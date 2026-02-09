import { useState, useCallback, useRef, useEffect } from "react";

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stripMarkdown = (text: string): string => {
    return text
      .replace(/```[\s\S]*?```/g, "") // code blocks
      .replace(/`[^`]*`/g, "") // inline code
      .replace(/#{1,6}\s/g, "") // headings
      .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
      .replace(/\*([^*]+)\*/g, "$1") // italic
      .replace(/~~([^~]+)~~/g, "$1") // strikethrough
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "") // images
      .replace(/^[-*+]\s/gm, "") // list items
      .replace(/^\d+\.\s/gm, "") // numbered lists
      .replace(/^>\s/gm, "") // blockquotes
      .replace(/---/g, "") // horizontal rules
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .trim();
  };

  const speak = useCallback((text: string, messageId: string, lang: string = "uz") => {
    if (!window.speechSynthesis) return;

    // If already speaking same message, stop
    if (isSpeaking && speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const cleanText = stripMarkdown(text);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Map language codes
    const langMap: Record<string, string> = {
      uz: "uz-UZ",
      en: "en-US",
      ru: "ru-RU",
      ar: "ar-SA",
    };
    utterance.lang = langMap[lang] || "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingMessageId(messageId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSpeaking, speakingMessageId]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeakingMessageId(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return { speak, stop, isSpeaking, speakingMessageId };
};

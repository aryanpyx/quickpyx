import { useState, useEffect, useCallback } from "react";

interface SpeechRecognitionHook {
  isRecording: boolean;
  transcript: string;
  startRecording: () => void;
  stopRecording: () => void;
  isSupported: boolean;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  const isSupported = typeof window !== "undefined" && 
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        setTranscript(prevTranscript => prevTranscript + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    setRecognition(recognition);

    return () => {
      recognition.stop();
    };
  }, [isSupported]);

  const startRecording = useCallback(() => {
    if (!recognition) return;
    
    setTranscript("");
    setIsRecording(true);
    recognition.start();
  }, [recognition]);

  const stopRecording = useCallback(() => {
    if (!recognition) return;
    
    recognition.stop();
    setIsRecording(false);
  }, [recognition]);

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    isSupported,
  };
}

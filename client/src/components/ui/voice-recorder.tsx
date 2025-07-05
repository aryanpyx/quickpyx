import { useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  className?: string;
}

export function VoiceRecorder({ onTranscription, className }: VoiceRecorderProps) {
  const {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    isSupported
  } = useSpeechRecognition();

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
      if (transcript) {
        onTranscription(transcript);
      }
    } else {
      startRecording();
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Voice recognition is not supported in this browser</p>
      </div>
    );
  }

  return (
    <div className={cn("text-center", className)}>
      <h2 className="text-lg font-medium mb-4">Quick Voice Note</h2>
      <div className="flex justify-center mb-4">
        <Button
          onClick={handleToggleRecording}
          className={cn(
            "material-ripple w-16 h-16 rounded-full transition-all duration-300",
            isRecording 
              ? "bg-destructive hover:bg-destructive/90 voice-pulse" 
              : "bg-primary hover:bg-primary/90"
          )}
        >
          {isRecording ? (
            <Square className="w-6 h-6 text-primary-foreground" />
          ) : (
            <Mic className="w-6 h-6 text-primary-foreground" />
          )}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {isRecording ? "Recording... Tap to stop" : "Tap to start recording"}
      </p>
      {transcript && (
        <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
          <p className="font-medium mb-1">Transcription:</p>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceInput({ onVoiceResult }) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true; // important for silence detection
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');

      // Reset silence timer when voice is detected
      resetSilenceTimer();

      // Only handle finalized transcript
      const isFinal = event.results[event.results.length - 1].isFinal;
      if (isFinal) {
        onVoiceResult(transcript.trim());
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      clearTimeout(silenceTimerRef.current);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event);
      setIsRecording(false);
      clearTimeout(silenceTimerRef.current);
    };

    recognitionRef.current = recognition;
  }, [onVoiceResult]);

  const resetSilenceTimer = () => {
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop(); // stop after 3s of silence
      }
    }, 3000); // 3 seconds
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      clearTimeout(silenceTimerRef.current);
    } else {
      recognitionRef.current.start();
      resetSilenceTimer();
    }

    setIsRecording(prev => !prev);
  };

  return (
    <button
      onClick={toggleRecording}
      className={`p-3 rounded-2xl transition-all duration-300 flex-shrink-0 ${
        isRecording
          ? 'bg-red-500/30 border-2 border-red-400 text-red-400 animate-pulse'
          : 'bg-white/10 hover:bg-white/20 border border-white/20 text-slate-400 hover:text-white'
      }`}
      title={isRecording ? 'Stop recording' : 'Voice input'}
    >
      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </button>
  );
}

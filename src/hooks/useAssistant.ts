import { useState, useRef, useEffect, useCallback } from 'react';

interface UseAssistantReturn {
    isSpeaking: boolean;
    isListening: boolean;
    transcript: string;
    speak: (text: string, onEnd?: () => void) => void;
    listen: (onResult: (text: string) => void) => void;
    stop: () => void;
    cancel: () => void;
}

export const useAssistant = (): UseAssistantReturn => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');

    const speechSynthRef = useRef<SpeechSynthesis | null>(null);
    const recognitionRef = useRef<any>(null); // Type as any for WebSpeech API
    const mountedRef = useRef(true);

    useEffect(() => {
        speechSynthRef.current = window.speechSynthesis;

        // Initialize SpeechRecognition if available
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';
        }

        return () => {
            mountedRef.current = false;
            cancel();
        };
    }, []);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const speak = useCallback(async (text: string, onEnd?: () => void) => {
        // Cancel any existing speech
        if (speechSynthRef.current) speechSynthRef.current.cancel();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }

        try {
            // Attempt ElevenLabs TTS
            const { elevenLabsService } = await import('../services/elevenLabsService');
            const audioUrl = await elevenLabsService.textToSpeech(text);

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onplay = () => {
                if (mountedRef.current) setIsSpeaking(true);
            };

            audio.onended = () => {
                if (mountedRef.current) setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
                if (onEnd) onEnd();
            };

            audio.onerror = () => {
                console.error('Audio playback error, falling back to native TTS');
                if (mountedRef.current) setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
                speakNative(text, onEnd);
            };

            audio.play();
        } catch (error) {
            console.warn('ElevenLabs TTS failed, falling back to native TTS:', error);
            speakNative(text, onEnd);
        }
    }, []);

    const speakNative = (text: string, onEnd?: () => void) => {
        if (!speechSynthRef.current) return;

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = speechSynthRef.current.getVoices();
        const preferredVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = 1;
        utterance.onstart = () => {
            if (mountedRef.current) setIsSpeaking(true);
        };
        utterance.onend = () => {
            if (mountedRef.current) setIsSpeaking(false);
            if (onEnd) onEnd();
        };
        utterance.onerror = () => {
            if (mountedRef.current) setIsSpeaking(false);
        };

        speechSynthRef.current.speak(utterance);
    };

    const listen = useCallback((onResult: (text: string) => void) => {
        if (!recognitionRef.current) {
            console.warn('Speech Recognition not supported in this browser.');
            return;
        }

        if (isListening) return; // Already listening

        try {
            recognitionRef.current.start();
            setIsListening(true);
            setTranscript('');

            recognitionRef.current.onresult = (event: any) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                onResult(text);
            };

            recognitionRef.current.onend = () => {
                if (mountedRef.current) setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                if (mountedRef.current) setIsListening(false);
            };

        } catch (e) {
            console.error('Failed to start recognition', e);
            setIsListening(false);
        }
    }, [isListening]);

    const stop = useCallback(() => {
        if (speechSynthRef.current) speechSynthRef.current.cancel();
        if (recognitionRef.current) recognitionRef.current.stop();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
        setIsSpeaking(false);
        setIsListening(false);
    }, []);

    const cancel = useCallback(() => {
        stop();
    }, [stop]);

    return {
        isSpeaking,
        isListening,
        transcript,
        speak,
        listen,
        stop,
        cancel
    };
};

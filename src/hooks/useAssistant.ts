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

    const speak = useCallback((text: string, onEnd?: () => void) => {
        if (!speechSynthRef.current) return;

        // Cancel any existing speech
        speechSynthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Optional: Select a specific voice preference (e.g., Google US English)
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
    }, []);

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

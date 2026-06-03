'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { LiveClient } from '../lib/live-client';

interface UseAssistantReturn {
    status: 'connected' | 'disconnected' | 'connecting';
    startSession: (context: any, onToolUpdate: (data: any) => void) => void;
    stopSession: () => void;
    volume: number;
}

export const useAssistant = (): UseAssistantReturn => {
    const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
    const [volume, setVolume] = useState(0);
    const clientRef = useRef<LiveClient | null>(null);
    const lastSpokeTimeRef = useRef<number>(Date.now());
    const lastProgressTimeRef = useRef<number>(Date.now());
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

    const startSession = useCallback((context: any, onToolUpdate: (data: any) => void) => {
        if (clientRef.current) return;

        setStatus('connecting');
        // Serialize Context into URL 
        const contextStr = encodeURIComponent(JSON.stringify(context || {}));
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

        // Retrieve token for WebSocket authentication
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        const tokenParam = token ? `&token=${encodeURIComponent(token)}` : '';

        // Match the FastAPI Router path for Voice
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/caepy/api/v1';
        let wsUrl = '';
        if (apiUrl.startsWith('http')) {
            wsUrl = apiUrl.replace(/^http/, 'ws') + `/voice/ws?context=${contextStr}${tokenParam}`;
        } else {
            wsUrl = `${protocol}//${window.location.hostname}:8000/caepy/api/v1/voice/ws?context=${contextStr}${tokenParam}`;
        }

        const client = new LiveClient(wsUrl);

        client.on('open', () => {
            setStatus('connected');
        });

        client.on('volume', (vol: number) => {
            setVolume(vol);
            // Only reset timer if volume is high AND fluctuating (ignores constant background hum/noise)
            if (vol > 0.05 && Math.abs(vol - (client as any)._lastVol || 0) > 0.01) {
                lastSpokeTimeRef.current = Date.now();
            }
            (client as any)._lastVol = vol;
        });

        client.on('bot_audio', () => {
            lastSpokeTimeRef.current = Date.now();
            lastProgressTimeRef.current = Date.now();
        });

        client.on('message', (msg: any) => {
            if (msg.type === 'tool_update') {
                onToolUpdate(msg.data);
                lastProgressTimeRef.current = Date.now();
            } else if (msg.type === 'error') {
                console.error("LiveClient Backend Error:", msg.message);
            } else if (msg.type === 'session_complete') {
                // After session is complete, wait for the AI's final audio to finish playing then stop tracking
                setTimeout(() => {
                    // Only cleanup if this client is still the active one
                    if (clientRef.current === client) {
                        clientRef.current.disconnect();
                        clientRef.current = null;
                        setStatus('disconnected');
                        setVolume(0);
                    }
                }, 9000); // 9 sec buffer for the final TTS audio
            }
        });

        client.on('close', () => {
            // Only update state if this is the active client (prevents old closures from killing new sessions)
            if (clientRef.current === client) {
                setStatus('disconnected');
                setVolume(0);
                clientRef.current = null;
            }
        });

        client.on('error', (err: any) => {
            console.error("LiveClient WS Error:", err);
            if (clientRef.current === client) {
                setStatus('disconnected');
                setVolume(0);
            }
        });

        client.connect();
        clientRef.current = client;
    }, []);

    const stopSession = useCallback(() => {
        if (clientRef.current) {
            clientRef.current.disconnect();
            clientRef.current = null;
        }
        setStatus('disconnected');
        setVolume(0);
    }, []);

    // Inactivity timeout effect
    useEffect(() => {
        if (status === 'connected') {
            lastSpokeTimeRef.current = Date.now();
            lastProgressTimeRef.current = Date.now();
            inactivityTimerRef.current = setInterval(() => {
                // If the bot is still speaking, constantly reset the inactivity timer
                if (clientRef.current && (clientRef.current as any).isBotSpeaking?.()) {
                    lastSpokeTimeRef.current = Date.now();
                    lastProgressTimeRef.current = Date.now();
                }

                if (Date.now() - lastSpokeTimeRef.current > 9000) {
                    console.log('Mic auto-off due to 9 seconds of inactivity.');
                    stopSession();
                } else if (Date.now() - lastProgressTimeRef.current > 13000) {
                    console.log('Mic auto-off due to 13 seconds of no progress/decoding.');
                    stopSession();
                }
            }, 1000);
        } else {
            if (inactivityTimerRef.current) {
                clearInterval(inactivityTimerRef.current);
                inactivityTimerRef.current = null;
            }
        }

        return () => {
            if (inactivityTimerRef.current) {
                clearInterval(inactivityTimerRef.current);
            }
        };
    }, [status, stopSession]);

    return {
        status,
        startSession,
        stopSession,
        volume
    };
};

import api from '../lib/api';
import { StepContext, VOICE_CONFIG } from '../lib/voiceContext';

export interface StartSessionResponse {
    session_id: string;
    greeting: string;
}

export interface ChatResponse {
    bot_response: string;
    turn_number: number;
}

export const voiceService = {
    async startSession(language: string = 'en', context?: any): Promise<StartSessionResponse> {
        try {
            const response = await api.post<StartSessionResponse>('/voice/start', {
                language,
                context
            });
            return response.data;
        } catch (error) {
            console.error('Failed to start voice session:', error);
            throw error;
        }
    },

    async sendChatMessage(sessionId: string, transcript: string, context?: any): Promise<ChatResponse> {
        try {
            const response = await api.post<ChatResponse>('/voice/chat', {
                session_id: sessionId,
                user_transcript: transcript,
                context
            });
            return response.data;
        } catch (error) {
            console.error('Failed to send chat message:', error);
            throw error;
        }
    },

    async getConfig(): Promise<{ context: Record<string, StepContext>, instructions: Record<string, string> }> {
        return VOICE_CONFIG as any;
    }
};

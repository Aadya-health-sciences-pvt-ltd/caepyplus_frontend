import api, { parseResponse } from '../lib/api';
import { StepContext, VOICE_CONFIG } from '../lib/voiceContext';

const API_BASE_URL = '/api/v1/voice';

export interface StartSessionResponse {
    session_id: string;
    status: string;
    greeting: string;
    fields_total: number;
    created_at: string;
}

export interface ChatResponse {
    session_id: string;
    status: string;
    ai_response: string;
    fields_collected: number;
    fields_total: number;
    fields_status: any[];
    current_data: Record<string, any>;
    is_complete: boolean;
    turn_number: number;
}


export const voiceService = {
    async startSession(language: string = 'en', context?: any): Promise<StartSessionResponse> {
        try {
            const response = await api.post<StartSessionResponse>('/voice/start', {
                language,
                context
            });
            // api instance returns AxiosResponse, we can use parseResponse or just response.data
            // Since the response is just a direct JSON based on StartSessionResponse shape
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
        return VOICE_CONFIG;
    }
};

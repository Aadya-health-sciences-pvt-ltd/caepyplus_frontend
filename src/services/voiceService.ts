import type { StepContext } from '../lib/voiceContext';

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

const getHeaders = () => {
    const token = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `${tokenType} ${token}`;
    }
    return headers;
};

export const voiceService = {
    async startSession(language: string = 'en', context?: StepContext): Promise<StartSessionResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/start`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    language,
                    context
                }),
            });

            if (!response.ok) {
                throw new Error(`Voice service error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to start voice session:', error);
            throw error;
        }
    },

    async sendChatMessage(sessionId: string, transcript: string, context?: StepContext): Promise<ChatResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    session_id: sessionId,
                    user_transcript: transcript,
                    context
                }),
            });

            if (!response.ok) {
                throw new Error(`Voice service error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to send chat message:', error);
            throw error;
        }
    }
};

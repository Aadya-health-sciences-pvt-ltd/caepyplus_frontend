
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID;
const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

export const elevenLabsService = {
    async textToSpeech(text: string): Promise<string> {
        if (!ELEVENLABS_API_KEY || !VOICE_ID) {
            console.warn('ElevenLabs API Key or Voice ID missing. Falling back to native TTS.');
            throw new Error('Missing ElevenLabs configuration');
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'xi-api-key': ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json',
                    'accept': 'audio/mpeg',
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error(`ElevenLabs API error: ${response.statusText}`);
            }

            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('ElevenLabs TTS failed:', error);
            throw error;
        }
    }
};

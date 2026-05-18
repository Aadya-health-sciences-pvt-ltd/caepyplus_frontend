type LiveClientEvents = {
    'open': () => void;
    'close': () => void;
    'message': (data: any) => void;
    'error': (err: any) => void;
    'volume': (level: number) => void;
    'bot_audio': () => void;
};

export class LiveClient {
    private ws: WebSocket | null = null;
    private audioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private processor: ScriptProcessorNode | AudioWorkletNode | null = null;
    private source: MediaStreamAudioSourceNode | null = null;
    private nextStartTime: number = 0;
    private listeners: { [K in keyof LiveClientEvents]?: LiveClientEvents[K][] } = {};

    constructor(private url: string) { }

    on<K extends keyof LiveClientEvents>(event: K, listener: LiveClientEvents[K]) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event]!.push(listener);
    }

    private emit<K extends keyof LiveClientEvents>(event: K, ...args: Parameters<LiveClientEvents[K]>) {
        if (this.listeners[event]) {
            this.listeners[event]!.forEach(listener => (listener as any)(...args));
        }
    }

    connect() {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            this.emit('open');
            this.startAudioInput();
        };

        this.ws.onmessage = async (event) => {
            const data = event.data;
            if (data instanceof Blob) {
                // Audio data
                this.emit('bot_audio');
                this.playAudio(await data.arrayBuffer());
            } else {
                // Text/Control data
                try {
                    const parsed = JSON.parse(data);
                    this.emit('message', parsed);
                } catch (e) {
                    console.error("Failed to parse message", e);
                }
            }
        };

        this.ws.onclose = () => {
            this.emit('close');
            this.stopAudioInput();
        };

        this.ws.onerror = (error) => {
            this.emit('error', error);
        };
    }

    disconnect() {
        this.stopAudioInput();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    private async startAudioInput() {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    sampleRate: 16000
                }
            });

            this.audioContext = new AudioContext({ sampleRate: 16000 });
            console.log(`AudioContext created. State: ${this.audioContext.state}, SampleRate: ${this.audioContext.sampleRate}`);

            if (this.audioContext.state === 'suspended') {
                console.log("AudioContext suspended. Resuming...");
                await this.audioContext.resume();
            }

            if (this.audioContext.sampleRate !== 16000) {
                console.warn("WARNING: AudioContext sample rate is NOT 16000Hz. Audio may be pitch-shifted.");
            }
            // Create source and STORE IT to prevent Garbage Collection
            this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
            console.log("MediaStreamSource created.");

            // Load the audio processor worklet
            try {
                console.log("Loading audio-processor.js...");
                // Cache-busting to ensure we load the latest version (with correct buffer size)
                const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
                await this.audioContext.audioWorklet.addModule(`${basePath}/audio-processor.js?v=${Date.now()}`);
                console.log("AudioWorklet loaded. creating node...");

                const workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor', {
                    numberOfInputs: 1,
                    numberOfOutputs: 1,
                    outputChannelCount: [1]
                });

                // Store in matching types or the union type property
                this.processor = workletNode;

                let packetCount = 0;
                workletNode.port.onmessage = (event) => {
                    const pcmData = event.data;

                    if (packetCount < 5) {
                        console.log(`Received audio packet ${packetCount++} size=${pcmData.byteLength}`);
                    }

                    // Simple volume calc
                    const int16 = new Int16Array(pcmData);
                    let sum = 0;
                    // Optimization: Sample every 10th value for volume to save CPU
                    for (let i = 0; i < int16.length; i += 10) {
                        sum += (int16[i] / 32768) ** 2;
                    }
                    // Adjusted normalization since we're skipping samples? No, RMS is average.
                    const rms = Math.sqrt(sum / (int16.length / 10));
                    const volume = Math.min(1, rms * 5);
                    this.emit('volume', volume);

                    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                        this.ws.send(pcmData);
                    }
                };

                workletNode.onprocessorerror = (err) => {
                    console.error("AudioWorklet processor error:", err);
                };

                // Connect the graph
                this.source!.connect(workletNode);
                workletNode.connect(this.audioContext.destination);
                // but for now let's just use a new property or cast to any to keep simple diff
                (this.processor as any) = workletNode;

            } catch (err) {
                console.error("AudioWorklet setup failed:", err);
                this.emit('error', err);
            }

        } catch (e) {
            console.error("Error accessing microphone", e);
            this.emit('error', e);
        }
    }

    private stopAudioInput() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }
        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.nextStartTime = 0;
    }

    private async playAudio(arrayBuffer: ArrayBuffer) {
        if (!this.audioContext) return;

        // We need to convert PCM 16-bit Int (ArrayBuffer) to Float32 for AudioContext
        const int16Array = new Int16Array(arrayBuffer);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768;
        }

        // Create buffer
        // Assuming 24kHz output from Gemini Live
        const buffer = this.audioContext.createBuffer(1, float32Array.length, 24000);
        buffer.getChannelData(0).set(float32Array);

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);

        // Time-based scheduling for low latency and gapless playback
        const currentTime = this.audioContext.currentTime;

        // If nextStartTime is in the past (e.g. first chunk or network lag), reset to now
        if (this.nextStartTime < currentTime) {
            this.nextStartTime = currentTime;
        }

        source.start(this.nextStartTime);

        // Advance time for next chunk
        this.nextStartTime += buffer.duration;
    }

    public isBotSpeaking(): boolean {
        if (!this.audioContext) return false;
        // The bot is speaking if the next scheduled chunk ends in the future
        // Add a small buffer (0.5s) to account for natural pauses between chunks
        return this.audioContext.currentTime < (this.nextStartTime + 0.5);
    }
}

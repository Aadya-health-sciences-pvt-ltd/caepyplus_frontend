class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 1024; // ~64ms latency @ 16kHz, balanced stability/latency
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
        this.hasLogged = false;
        console.log("AudioProcessor initialized");
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input && input.length > 0) {
            if (!this.hasLogged) {
                console.log("AudioProcessor receiving input data");
                this.hasLogged = true;
            }
            const channelData = input[0];

            for (let i = 0; i < channelData.length; i++) {
                this.buffer[this.bufferIndex++] = channelData[i];

                // When buffer is full, send to main thread
                if (this.bufferIndex >= this.bufferSize) {
                    this.flush();
                }
            }
        }
        return true; // Keep processor alive
    }

    flush() {
        // Send the buffer content to the main thread
        const dataToSend = this.buffer.slice(0, this.bufferIndex);

        // Convert to Int16 PCM before sending!
        const int16Data = this.floatTo16BitPCM(dataToSend);

        this.port.postMessage(int16Data);
        this.bufferIndex = 0;
    }

    floatTo16BitPCM(input) {
        const output = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
            // Multiply by 0x7fff (32767) to scale float to 16-bit range
            // This is faster than maintaining min/max checks, but assumes input is -1..1
            // We'll keep a simple clamp just in case to avoid wrap-around distortion
            const s = Math.max(-1, Math.min(1, input[i]));
            output[i] = s * 0x7FFF;
        }
        return output.buffer;
    }
}

registerProcessor('audio-processor', AudioProcessor);

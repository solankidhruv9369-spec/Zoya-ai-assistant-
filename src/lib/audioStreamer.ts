import { voiceBiometrics, VoiceFeatures } from "./voiceBiometrics";

export class AudioStreamer {
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private outputGainNode: GainNode | null = null;
  private micStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private inputAnalyser: AnalyserNode | null = null;
  private outputAnalyser: AnalyserNode | null = null;

  private nextStartTime = 0;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private outputAnalyserBuffer: Uint8Array = new Uint8Array(0);
  private inputAnalyserBuffer: Uint8Array = new Uint8Array(0);
  private masterVolume: number = 1;
  private onRawAudioCallback: ((features: VoiceFeatures, rawBuffer: Float32Array) => void) | null = null;

  constructor() {}

  /**
   * Register a listener for real-time acoustic features & raw audio frames
   */
  public setRawAudioListener(callback: ((features: VoiceFeatures, rawBuffer: Float32Array) => void) | null) {
    this.onRawAudioCallback = callback;
  }

  /**
   * Initializes microphone capture at 16000 Hz, processes it to 16-bit PCM,
   * extracts voice biometrics, and invokes the callback with base64 encoded audio chunks.
   */
  async startInput(onAudio: (base64PCM: string) => void) {
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });

      this.micSource = this.inputAudioCtx.createMediaStreamSource(this.micStream);
      this.inputAnalyser = this.inputAudioCtx.createAnalyser();
      this.inputAnalyser.fftSize = 256;
      this.inputAnalyserBuffer = new Uint8Array(this.inputAnalyser.frequencyBinCount);

      // Create a script processor to process audio in chunks of 4096 samples
      this.scriptProcessor = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);

      this.scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Extract real-time voice biometric features
        const features = voiceBiometrics.processAudioBuffer(inputData, 16000);
        if (this.onRawAudioCallback) {
          this.onRawAudioCallback(features, inputData);
        }

        const pcm16Base64 = this.float32ToPCM16Base64(inputData);
        if (pcm16Base64) {
          onAudio(pcm16Base64);
        }
      };

      this.micSource.connect(this.inputAnalyser);
      this.micSource.connect(this.scriptProcessor);
      
      const muteGain = this.inputAudioCtx.createGain();
      muteGain.gain.value = 0;
      this.scriptProcessor.connect(muteGain);
      muteGain.connect(this.inputAudioCtx.destination);
    } catch (err) {
      console.warn("Failed to initialize input audio (this is expected if permission is denied or running in a sandboxed iframe):", err);
      throw err;
    }
  }

  resume() {
    this.initOutput();
    if (this.outputAudioCtx?.state === "suspended") {
      this.outputAudioCtx.resume();
    }
  }

  /**
   * Initializes the output audio context for 24kHz response playback.
   */
  initOutput() {
    if (this.outputAudioCtx) return;

    this.outputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000,
    });

    this.outputAnalyser = this.outputAudioCtx.createAnalyser();
    this.outputAnalyser.fftSize = 256;
    this.outputAnalyserBuffer = new Uint8Array(this.outputAnalyser.frequencyBinCount);

    this.outputGainNode = this.outputAudioCtx.createGain();
    this.outputGainNode.gain.value = this.masterVolume;
    
    // Connect chain: source -> analyser -> gain -> destination
    this.outputAnalyser.connect(this.outputGainNode);
    this.outputGainNode.connect(this.outputAudioCtx.destination);
    this.nextStartTime = 0;
  }

  /**
   * Sets the master output volume.
   * @param volume - A value between 0.0 (mute) and 1.0 (max)
   */
  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.outputGainNode) {
      // Clamp between 0 and 1
      this.outputGainNode.gain.value = this.masterVolume;
    }
  }

  /**
   * Enqueues a base64 encoded 24kHz PCM16 response chunk for gapless playback.
   */
  playChunk(base64PCM: string) {
    this.initOutput();

    if (!this.outputAudioCtx || !this.outputAnalyser) return;

    if (this.outputAudioCtx.state === "suspended") {
      this.outputAudioCtx.resume();
    }

    const float32Array = this.base64ToFloat32PCM(base64PCM);
    const buffer = this.outputAudioCtx.createBuffer(1, float32Array.length, 24000);
    buffer.copyToChannel(float32Array, 0);

    const source = this.outputAudioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputAnalyser);

    const currentTime = this.outputAudioCtx.currentTime;
    // Add a tiny buffer (50ms) to ensure smooth playback across packet deliveries
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime + 0.05;
    }

    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;

    source.onended = () => {
      this.activeSources.delete(source);
    };
    this.activeSources.add(source);
  }

  /**
   * Instantly stops all playing audio response nodes and resets timing.
   */
  interrupt() {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
      } catch (e) {}
    });
    this.activeSources.clear();
    this.nextStartTime = 0;
  }

  /**
   * Closes all audio contexts and releases the mic stream.
   */
  close() {
    this.interrupt();

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }

    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }

    if (this.inputAudioCtx) {
      this.inputAudioCtx.close();
      this.inputAudioCtx = null;
    }

    if (this.outputAudioCtx) {
      this.outputAudioCtx.close();
      this.outputAudioCtx = null;
    }

    this.inputAnalyser = null;
    this.outputAnalyser = null;
  }

  /**
   * Returns current mic input volume level (0 to 100)
   */
  getInputVolume(): number {
    if (!this.inputAnalyser) return 0;
    this.inputAnalyser.getByteFrequencyData(this.inputAnalyserBuffer);
    let sum = 0;
    for (let i = 0; i < this.inputAnalyserBuffer.length; i++) {
      sum += this.inputAnalyserBuffer[i];
    }
    const average = sum / this.inputAnalyserBuffer.length;
    return Math.min(100, Math.round((average / 128) * 100));
  }

  /**
   * Returns current AI output speaker volume level (0 to 100)
   */
  getOutputVolume(): number {
    if (!this.outputAnalyser) return 0;
    this.outputAnalyser.getByteFrequencyData(this.outputAnalyserBuffer);
    let sum = 0;
    for (let i = 0; i < this.outputAnalyserBuffer.length; i++) {
      sum += this.outputAnalyserBuffer[i];
    }
    const average = sum / this.outputAnalyserBuffer.length;
    return Math.min(100, Math.round((average / 128) * 100));
  }

  /**
   * Returns the output frequency data array for visualizer waveform drawing.
   */
  getOutputFrequencyData(): Uint8Array {
    if (!this.outputAnalyser) return new Uint8Array(128);
    this.outputAnalyser.getByteFrequencyData(this.outputAnalyserBuffer);
    return this.outputAnalyserBuffer;
  }

  /**
   * Returns the input frequency data array for visualizer waveform drawing.
   */
  getInputFrequencyData(): Uint8Array {
    if (!this.inputAnalyser) return new Uint8Array(128);
    this.inputAnalyser.getByteFrequencyData(this.inputAnalyserBuffer);
    return this.inputAnalyserBuffer;
  }

  /**
   * Converts a Float32Array into base64 encoded little-endian 16-bit signed integers.
   */
  private float32ToPCM16Base64(float32Array: Float32Array): string {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      const sample = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(i * 2, sample, true); // true = little-endian
    }
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Decodes a base64 encoded little-endian 16-bit PCM into Float32Array.
   */
  private base64ToFloat32PCM(base64: string): Float32Array {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }
    return float32Array;
  }
}

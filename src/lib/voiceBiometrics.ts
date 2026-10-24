/**
 * Audio Analysis & Voice Biometrics Library
 * 
 * Provides digital signal processing (DSP) acoustic feature extraction:
 * - Fundamental Frequency (F0 / Pitch) via Normalized Autocorrelation & YIN
 * - Spectral Centroid (timbre brightness)
 * - Spectral Rolloff & Spectral Flux
 * - Zero-Crossing Rate (ZCR)
 * - Subband Filterbank Energy Vectors (Formant / Vocal Tract Geometry)
 * - Voice Activity Detection (VAD)
 * - Speaker Voiceprint Verification & Multi-Feature Matching Score
 */

export interface VoiceFeatures {
  f0: number; // Fundamental frequency in Hz (0 if unvoiced)
  spectralCentroid: number; // Hz
  spectralRolloff: number; // Hz
  spectralFlux: number;
  zcr: number; // 0 to 1
  energyRMS: number; // 0 to 1
  subbandEnergies: number[]; // 10 normalized filterbank bins
  isVoiced: boolean;
  timestamp: number;
}

export interface VoiceProfile {
  name: string;
  enrolledAt: string;
  sampleCount: number;
  f0Mean: number;
  f0Std: number;
  spectralCentroidMean: number;
  spectralCentroidStd: number;
  spectralRolloffMean: number;
  zcrMean: number;
  subbandEnergies: number[];
  sensitivity: "strict" | "balanced" | "relaxed";
  passcodeFallback?: string;
}

export interface VerificationResult {
  verified: boolean;
  confidence: number; // 0 to 100
  speaker: string;
  reason: string;
  status: "VERIFIED" | "REJECTED_UNAUTHORIZED" | "INSUFFICIENT_AUDIO" | "NO_SPEECH";
  metrics: {
    pitchHz: number;
    targetPitchHz: number;
    centroidHz: number;
    timbreMatch: number;
    pitchMatch: number;
    energyLevel: number;
  };
}

export interface BiometricLogEntry {
  id: string;
  timestamp: string;
  command: string;
  verified: boolean;
  confidence: number;
  speaker: string;
  reason: string;
}

// Default baseline profile for Dhruv (calibrated for standard male voice ~110-145 Hz F0)
export const DEFAULT_DHRUV_PROFILE: VoiceProfile = {
  name: "Dhruv (Authorized Owner)",
  enrolledAt: "Pre-calibrated Baseline",
  sampleCount: 15,
  f0Mean: 128.5,
  f0Std: 18.2,
  spectralCentroidMean: 1450,
  spectralCentroidStd: 240,
  spectralRolloffMean: 2850,
  zcrMean: 0.055,
  subbandEnergies: [0.28, 0.32, 0.22, 0.14, 0.09, 0.06, 0.04, 0.03, 0.02, 0.01],
  sensitivity: "balanced",
  passcodeFallback: "0934",
};

const STORAGE_PROFILE_KEY = "zoya_voice_biometric_profile";
const STORAGE_LOGS_KEY = "zoya_voice_biometric_logs";

export class VoiceBiometricsEngine {
  private profile: VoiceProfile;
  private recentFeatureHistory: VoiceFeatures[] = [];
  private readonly historyWindowSize = 18; // ~3-4 seconds of audio frames
  private sampleRate: number = 16000;
  private prevSpectrum: Float32Array | null = null;

  constructor() {
    this.profile = this.loadProfile();
  }

  /**
   * Load saved profile or fallback to Dhruv baseline
   */
  public loadProfile(): VoiceProfile {
    try {
      const data = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("[VoiceBiometrics] Failed to read saved profile:", e);
    }
    return { ...DEFAULT_DHRUV_PROFILE };
  }

  /**
   * Save profile to storage
   */
  public saveProfile(newProfile: VoiceProfile) {
    this.profile = newProfile;
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(newProfile));
    } catch (e) {
      console.warn("[VoiceBiometrics] Failed to save profile:", e);
    }
  }

  public getProfile(): VoiceProfile {
    return this.profile;
  }

  public resetToDefault() {
    this.saveProfile({ ...DEFAULT_DHRUV_PROFILE });
    this.recentFeatureHistory = [];
  }

  /**
   * Process a chunk of Float32Array PCM audio (at 16000Hz)
   */
  public processAudioBuffer(buffer: Float32Array, sampleRate: number = 16000): VoiceFeatures {
    this.sampleRate = sampleRate;
    const features = this.extractAcousticFeatures(buffer, sampleRate);
    
    // If voiced or has enough energy, keep in rolling history
    if (features.isVoiced || features.energyRMS > 0.015) {
      this.recentFeatureHistory.push(features);
      if (this.recentFeatureHistory.length > this.historyWindowSize) {
        this.recentFeatureHistory.shift();
      }
    }

    return features;
  }

  /**
   * Instantly evaluate a single incoming acoustic feature frame with zero delay (<5ms)
   */
  public verifyInstantaneous(feature: VoiceFeatures): VerificationResult {
    if (!feature.isVoiced || feature.f0 < 50) {
      return {
        verified: false,
        confidence: 0,
        speaker: "Listening...",
        reason: "No voiced speech in frame",
        status: "NO_SPEECH",
        metrics: {
          pitchHz: 0,
          targetPitchHz: this.profile.f0Mean,
          centroidHz: feature.spectralCentroid,
          timbreMatch: 0,
          pitchMatch: 0,
          energyLevel: Math.round(feature.energyRMS * 100),
        },
      };
    }

    return this.verifyOwner([feature]);
  }

  /**
   * Extract comprehensive DSP acoustic features from raw time-domain samples
   */
  public extractAcousticFeatures(buffer: Float32Array, sampleRate: number): VoiceFeatures {
    const N = buffer.length;
    if (N === 0) {
      return {
        f0: 0,
        spectralCentroid: 0,
        spectralRolloff: 0,
        spectralFlux: 0,
        zcr: 0,
        energyRMS: 0,
        subbandEnergies: new Array(10).fill(0),
        isVoiced: false,
        timestamp: Date.now(),
      };
    }

    // 1. RMS Energy Calculation
    let sumSquares = 0;
    for (let i = 0; i < N; i++) {
      sumSquares += buffer[i] * buffer[i];
    }
    const energyRMS = Math.sqrt(sumSquares / N);

    // 2. Zero-Crossing Rate (ZCR)
    let zeroCrossings = 0;
    for (let i = 1; i < N; i++) {
      if ((buffer[i] >= 0 && buffer[i - 1] < 0) || (buffer[i] < 0 && buffer[i - 1] >= 0)) {
        zeroCrossings++;
      }
    }
    const zcr = zeroCrossings / (N - 1);

    // 3. Fundamental Frequency (F0) Estimation via Normalized Autocorrelation
    const f0 = this.estimatePitchAutocorrelation(buffer, sampleRate);
    const isVoiced = f0 > 60 && f0 < 450 && energyRMS > 0.012;

    // 4. Magnitude Spectrum (Fast Approximation / Discrete Fourier Transform across key bands)
    const { spectrum, centroid, rolloff, subbands, flux } = this.computeSpectralMetrics(buffer, sampleRate);

    return {
      f0,
      spectralCentroid: centroid,
      spectralRolloff: rolloff,
      spectralFlux: flux,
      zcr,
      energyRMS,
      subbandEnergies: subbands,
      isVoiced,
      timestamp: Date.now(),
    };
  }

  /**
   * Estimate Fundamental Pitch (F0) using Autocorrelation Peak Detection with Parabolic Interpolation
   */
  private estimatePitchAutocorrelation(buffer: Float32Array, sampleRate: number): number {
    const N = buffer.length;
    const minPitch = 65; // Min human pitch in Hz
    const maxPitch = 400; // Max human pitch in Hz
    const minLag = Math.floor(sampleRate / maxPitch);
    const maxLag = Math.floor(sampleRate / minPitch);

    if (maxLag >= N) return 0;

    let bestLag = -1;
    let maxAutocorr = -1;

    // Calculate energy for normalization
    let energy0 = 0;
    for (let i = 0; i < N - maxLag; i++) {
      energy0 += buffer[i] * buffer[i];
    }
    if (energy0 < 0.0001) return 0;

    const correlations: number[] = new Array(maxLag + 1).fill(0);

    for (let lag = minLag; lag <= maxLag; lag++) {
      let sum = 0;
      let energyLag = 0;
      for (let i = 0; i < N - lag; i++) {
        sum += buffer[i] * buffer[i + lag];
        energyLag += buffer[i + lag] * buffer[i + lag];
      }
      const norm = Math.sqrt(energy0 * energyLag) || 1;
      const r = sum / norm;
      correlations[lag] = r;

      if (r > maxAutocorr) {
        maxAutocorr = r;
        bestLag = lag;
      }
    }

    // Voicing threshold for autocorrelation peak
    if (maxAutocorr < 0.35 || bestLag <= minLag || bestLag >= maxLag) {
      return 0;
    }

    // Refine peak using 3-point parabolic interpolation
    const alpha = correlations[bestLag - 1] || maxAutocorr;
    const beta = correlations[bestLag];
    const gamma = correlations[bestLag + 1] || maxAutocorr;
    const delta = (alpha - gamma) / (2 * (alpha - 2 * beta + gamma) || 1);
    const refinedLag = bestLag + (isFinite(delta) ? Math.max(-0.5, Math.min(0.5, delta)) : 0);

    const pitchHz = sampleRate / refinedLag;
    return pitchHz >= minPitch && pitchHz <= maxPitch ? Math.round(pitchHz * 10) / 10 : 0;
  }

  /**
   * Compute Spectral Centroid, Rolloff, Flux, and 10 Sub-band Energy Filterbanks
   */
  private computeSpectralMetrics(buffer: Float32Array, sampleRate: number) {
    const fftSize = 512;
    const halfSize = fftSize / 2;
    const spectrum = new Float32Array(halfSize);

    // Apply Hann window and perform discrete spectral analysis
    for (let k = 0; k < halfSize; k++) {
      const freq = (k * sampleRate) / fftSize;
      let real = 0;
      let imag = 0;
      const step = Math.max(1, Math.floor(buffer.length / fftSize));
      
      for (let n = 0; n < Math.min(buffer.length, fftSize); n += step) {
        const window = 0.5 * (1 - Math.cos((2 * Math.PI * n) / fftSize));
        const sample = buffer[n] * window;
        const angle = (2 * Math.PI * k * n) / fftSize;
        real += sample * Math.cos(angle);
        imag -= sample * Math.sin(angle);
      }
      spectrum[k] = Math.sqrt(real * real + imag * imag);
    }

    // Spectral Centroid & Total Energy
    let totalMagnitude = 0;
    let weightedSum = 0;
    for (let k = 0; k < halfSize; k++) {
      const freq = (k * sampleRate) / fftSize;
      const mag = spectrum[k];
      totalMagnitude += mag;
      weightedSum += freq * mag;
    }
    const centroid = totalMagnitude > 0 ? weightedSum / totalMagnitude : 0;

    // Spectral Rolloff (85% energy threshold)
    const rolloffThreshold = totalMagnitude * 0.85;
    let cumulativeEnergy = 0;
    let rolloff = 0;
    for (let k = 0; k < halfSize; k++) {
      cumulativeEnergy += spectrum[k];
      if (cumulativeEnergy >= rolloffThreshold) {
        rolloff = (k * sampleRate) / fftSize;
        break;
      }
    }

    // 10-Band Filterbank for Timbre Resonances (100 Hz to 7500 Hz)
    const bandEdges = [100, 250, 500, 800, 1200, 1700, 2400, 3200, 4500, 6000, 7500];
    const subbands: number[] = new Array(10).fill(0);

    for (let b = 0; b < 10; b++) {
      const lowFreq = bandEdges[b];
      const highFreq = bandEdges[b + 1];
      let bandSum = 0;
      let count = 0;

      for (let k = 0; k < halfSize; k++) {
        const freq = (k * sampleRate) / fftSize;
        if (freq >= lowFreq && freq < highFreq) {
          bandSum += spectrum[k];
          count++;
        }
      }
      subbands[b] = count > 0 ? bandSum / count : 0;
    }

    // Normalize subband energy vector to unit L2 norm
    let subbandNorm = 0;
    for (let b = 0; b < 10; b++) {
      subbandNorm += subbands[b] * subbands[b];
    }
    subbandNorm = Math.sqrt(subbandNorm) || 1;
    for (let b = 0; b < 10; b++) {
      subbands[b] = subbands[b] / subbandNorm;
    }

    // Spectral Flux
    let flux = 0;
    if (this.prevSpectrum && this.prevSpectrum.length === halfSize) {
      for (let k = 0; k < halfSize; k++) {
        const diff = spectrum[k] - this.prevSpectrum[k];
        flux += diff * diff;
      }
      flux = Math.sqrt(flux) / halfSize;
    }
    this.prevSpectrum = new Float32Array(spectrum);

    return {
      spectrum,
      centroid,
      rolloff,
      subbands,
      flux,
    };
  }

  /**
   * Run Voice Biometric Verification against enrolled profile
   * Checks rolling history of recent speech features or provided audio samples
   */
  public verifyOwner(customFeatures?: VoiceFeatures[]): VerificationResult {
    const featuresToEvaluate = customFeatures || this.recentFeatureHistory;
    const voicedFrames = featuresToEvaluate.filter((f) => f.isVoiced && f.f0 > 60);

    // If no recent voice activity or insufficient frames
    if (voicedFrames.length < 1) {
      const hasAnyAudio = featuresToEvaluate.some((f) => f.energyRMS > 0.01);
      return {
        verified: false,
        confidence: 0,
        speaker: "No Clear Voice Detected",
        reason: hasAnyAudio ? "Voice signal too low or unvoiced noise" : "No speech detected",
        status: hasAnyAudio ? "INSUFFICIENT_AUDIO" : "NO_SPEECH",
        metrics: {
          pitchHz: 0,
          targetPitchHz: this.profile.f0Mean,
          centroidHz: 0,
          timbreMatch: 0,
          pitchMatch: 0,
          energyLevel: 0,
        },
      };
    }

    // 1. Calculate Mean Features for current speaker
    let sumPitch = 0;
    let sumCentroid = 0;
    let sumRolloff = 0;
    let sumZcr = 0;
    let sumEnergy = 0;
    const subbandSums = new Array(10).fill(0);

    for (const frame of voicedFrames) {
      sumPitch += frame.f0;
      sumCentroid += frame.spectralCentroid;
      sumRolloff += frame.spectralRolloff;
      sumZcr += frame.zcr;
      sumEnergy += frame.energyRMS;
      for (let b = 0; b < 10; b++) {
        subbandSums[b] += frame.subbandEnergies[b] || 0;
      }
    }

    const count = voicedFrames.length;
    const avgPitch = sumPitch / count;
    const avgCentroid = sumCentroid / count;
    const avgRolloff = sumRolloff / count;
    const avgZcr = sumZcr / count;
    const avgEnergy = sumEnergy / count;

    const avgSubbands = subbandSums.map((s) => s / count);
    let subNorm = 0;
    for (let b = 0; b < 10; b++) subNorm += avgSubbands[b] * avgSubbands[b];
    subNorm = Math.sqrt(subNorm) || 1;
    for (let b = 0; b < 10; b++) avgSubbands[b] /= subNorm;

    // 2. Compute Individual Biometric Match Scores
    // A. Pitch / F0 Distance Score (Gaussian distance)
    const pitchDiff = Math.abs(avgPitch - this.profile.f0Mean);
    const pitchTolerance = Math.max(25, this.profile.f0Std * 2.2);
    const pitchMatch = Math.max(0, 1 - pitchDiff / pitchTolerance);

    // B. Spectral Centroid / Timbre Brightness Score
    const centroidDiff = Math.abs(avgCentroid - this.profile.spectralCentroidMean);
    const centroidTolerance = Math.max(350, this.profile.spectralCentroidStd * 2.2);
    const centroidMatch = Math.max(0, 1 - centroidDiff / centroidTolerance);

    // C. Subband Filterbank Cosine Similarity (Vocal Tract Resonance)
    let dotProduct = 0;
    for (let b = 0; b < 10; b++) {
      dotProduct += avgSubbands[b] * (this.profile.subbandEnergies[b] || 0.1);
    }
    const timbreMatch = Math.max(0, Math.min(1, dotProduct));

    // D. Zero-Crossing Rate Match
    const zcrDiff = Math.abs(avgZcr - this.profile.zcrMean);
    const zcrMatch = Math.max(0, 1 - zcrDiff / 0.12);

    // E. Spectral Rolloff Match
    const rolloffDiff = Math.abs(avgRolloff - this.profile.spectralRolloffMean);
    const rolloffMatch = Math.max(0, 1 - rolloffDiff / 1000);

    // 3. Composite Weighted Confidence Score (0 to 100%)
    const weightedScore =
      pitchMatch * 0.38 +
      timbreMatch * 0.34 +
      centroidMatch * 0.14 +
      rolloffMatch * 0.08 +
      zcrMatch * 0.06;

    const confidence = Math.round(Math.max(0, Math.min(100, weightedScore * 100)));

    // 4. Threshold Evaluation based on Sensitivity Setting
    let threshold = 65; // Balanced
    if (this.profile.sensitivity === "strict") threshold = 78;
    if (this.profile.sensitivity === "relaxed") threshold = 52;

    const isVerified = confidence >= threshold;

    return {
      verified: isVerified,
      confidence,
      speaker: isVerified ? this.profile.name : "Unauthorized Speaker",
      reason: isVerified
        ? `Owner voice match confirmed (${confidence}% confidence, Pitch: ${Math.round(avgPitch)}Hz)`
        : `Voice biometric mismatch (${confidence}% vs required ${threshold}%). Pitch: ${Math.round(avgPitch)}Hz vs target ${Math.round(this.profile.f0Mean)}Hz`,
      status: isVerified ? "VERIFIED" : "REJECTED_UNAUTHORIZED",
      metrics: {
        pitchHz: Math.round(avgPitch * 10) / 10,
        targetPitchHz: Math.round(this.profile.f0Mean * 10) / 10,
        centroidHz: Math.round(avgCentroid),
        timbreMatch: Math.round(timbreMatch * 100),
        pitchMatch: Math.round(pitchMatch * 100),
        energyLevel: Math.round(avgEnergy * 100),
      },
    };
  }

  /**
   * Enroll or Calibrate a new voice profile from captured sample frames
   */
  public calibrateProfileFromSamples(samples: VoiceFeatures[], ownerName: string = "Dhruv (Authorized Owner)"): VoiceProfile {
    const voiced = samples.filter((s) => s.isVoiced && s.f0 > 60);
    if (voiced.length < 5) {
      throw new Error("Insufficient clear voice samples. Please speak clearly into the microphone.");
    }

    const n = voiced.length;
    const f0Values = voiced.map((v) => v.f0);
    const centroidValues = voiced.map((v) => v.spectralCentroid);
    const rolloffValues = voiced.map((v) => v.spectralRolloff);
    const zcrValues = voiced.map((v) => v.zcr);

    const f0Mean = f0Values.reduce((a, b) => a + b, 0) / n;
    const f0Variance = f0Values.reduce((a, b) => a + Math.pow(b - f0Mean, 2), 0) / n;
    const f0Std = Math.max(10, Math.sqrt(f0Variance));

    const centroidMean = centroidValues.reduce((a, b) => a + b, 0) / n;
    const centroidVariance = centroidValues.reduce((a, b) => a + Math.pow(b - centroidMean, 2), 0) / n;
    const centroidStd = Math.max(80, Math.sqrt(centroidVariance));

    const rolloffMean = rolloffValues.reduce((a, b) => a + b, 0) / n;
    const zcrMean = zcrValues.reduce((a, b) => a + b, 0) / n;

    const subbands: number[] = new Array(10).fill(0);
    for (const v of voiced) {
      for (let b = 0; b < 10; b++) {
        subbands[b] += v.subbandEnergies[b] || 0;
      }
    }
    let norm = 0;
    for (let b = 0; b < 10; b++) {
      subbands[b] /= n;
      norm += subbands[b] * subbands[b];
    }
    norm = Math.sqrt(norm) || 1;
    for (let b = 0; b < 10; b++) {
      subbands[b] /= norm;
    }

    const newProfile: VoiceProfile = {
      name: ownerName,
      enrolledAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      sampleCount: n,
      f0Mean: Math.round(f0Mean * 10) / 10,
      f0Std: Math.round(f0Std * 10) / 10,
      spectralCentroidMean: Math.round(centroidMean),
      spectralCentroidStd: Math.round(centroidStd),
      spectralRolloffMean: Math.round(rolloffMean),
      zcrMean: Math.round(zcrMean * 1000) / 1000,
      subbandEnergies: subbands,
      sensitivity: this.profile.sensitivity || "balanced",
      passcodeFallback: this.profile.passcodeFallback || "0934",
    };

    this.saveProfile(newProfile);
    return newProfile;
  }

  /**
   * Log a security verification check
   */
  public logVerification(command: string, result: VerificationResult) {
    const entry: BiometricLogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      command,
      verified: result.verified,
      confidence: result.confidence,
      speaker: result.speaker,
      reason: result.reason,
    };

    try {
      const logs = this.getLogs();
      logs.unshift(entry);
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs.slice(0, 30)));
    } catch (e) {
      console.warn("[VoiceBiometrics] Failed to write log:", e);
    }
  }

  public getLogs(): BiometricLogEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public clearLogs() {
    try {
      localStorage.removeItem(STORAGE_LOGS_KEY);
    } catch {}
  }
}

// Global Singleton Instance
export const voiceBiometrics = new VoiceBiometricsEngine();

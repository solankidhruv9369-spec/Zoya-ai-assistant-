import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Activity,
  Mic,
  Square,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Trash2,
  Lock,
  Unlock,
  Volume2,
  Info,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  voiceBiometrics,
  VoiceProfile,
  VerificationResult,
  BiometricLogEntry,
  VoiceFeatures,
} from "../lib/voiceBiometrics";
import { AudioStreamer } from "../lib/audioStreamer";

interface VoiceBiometricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioStreamer?: AudioStreamer | null;
  lastVerification?: VerificationResult | null;
}

export function VoiceBiometricsModal({
  isOpen,
  onClose,
  audioStreamer,
  lastVerification,
}: VoiceBiometricsModalProps) {
  const [profile, setProfile] = useState<VoiceProfile>(() => voiceBiometrics.getProfile());
  const [activeTab, setActiveTab] = useState<"status" | "calibrate" | "logs">("status");
  const [liveFeatures, setLiveFeatures] = useState<VoiceFeatures | null>(null);
  const [liveResult, setLiveResult] = useState<VerificationResult | null>(lastVerification || null);
  const [logs, setLogs] = useState<BiometricLogEntry[]>(() => voiceBiometrics.getLogs());

  // Calibration state
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(0);
  const [collectedSamples, setCollectedSamples] = useState<VoiceFeatures[]>([]);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrationSuccess, setCalibrationSuccess] = useState(false);
  const [ownerNameInput, setOwnerNameInput] = useState(profile.name || "Dhruv (Authorized Owner)");
  const [passcodeInput, setPasscodeInput] = useState(profile.passcodeFallback || "0934");

  // Live polling for acoustic stream
  useEffect(() => {
    if (!isOpen) return;

    // Refresh logs and profile
    setProfile(voiceBiometrics.getProfile());
    setLogs(voiceBiometrics.getLogs());

    if (audioStreamer) {
      audioStreamer.setRawAudioListener((features) => {
        setLiveFeatures(features);
        if (features.isVoiced || features.energyRMS > 0.02) {
          const result = voiceBiometrics.verifyOwner();
          setLiveResult(result);
        }
      });
    }

    return () => {
      if (audioStreamer) {
        audioStreamer.setRawAudioListener(null);
      }
    };
  }, [isOpen, audioStreamer]);

  // Periodic result check when open
  useEffect(() => {
    if (!isOpen) return;
    const interval = window.setInterval(() => {
      const result = voiceBiometrics.verifyOwner();
      setLiveResult(result);
      setLogs(voiceBiometrics.getLogs());
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSensitivityChange = (sensitivity: "strict" | "balanced" | "relaxed") => {
    const updated = { ...profile, sensitivity };
    voiceBiometrics.saveProfile(updated);
    setProfile(updated);
  };

  const handleSavePasscode = () => {
    const updated = { ...profile, passcodeFallback: passcodeInput.trim(), name: ownerNameInput.trim() };
    voiceBiometrics.saveProfile(updated);
    setProfile(updated);
    alert("Owner profile & security passcode updated!");
  };

  const handleResetToBaseline = () => {
    if (confirm("Reset Voice Biometrics profile back to factory baseline for Dhruv?")) {
      voiceBiometrics.resetToDefault();
      const updated = voiceBiometrics.getProfile();
      setProfile(updated);
      setLogs(voiceBiometrics.getLogs());
      setCalibrationSuccess(false);
      setCalibrationStep(0);
    }
  };

  // Calibration flow
  const startCalibration = () => {
    setIsCalibrating(true);
    setCalibrationStep(1);
    setCollectedSamples([]);
    setCalibrationProgress(0);
    setCalibrationSuccess(false);

    if (audioStreamer) {
      audioStreamer.setRawAudioListener((features) => {
        setLiveFeatures(features);
        if (features.isVoiced && features.f0 > 60) {
          setCollectedSamples((prev) => {
            const next = [...prev, features];
            setCalibrationProgress(Math.min(100, Math.round((next.length / 25) * 100)));
            return next;
          });
        }
      });
    }
  };

  const finishCalibration = () => {
    try {
      if (collectedSamples.length < 5) {
        alert("Please speak clearly into the mic for a few seconds so we can capture your voice.");
        return;
      }
      const newProfile = voiceBiometrics.calibrateProfileFromSamples(collectedSamples, ownerNameInput);
      setProfile(newProfile);
      setIsCalibrating(false);
      setCalibrationSuccess(true);
      setCalibrationStep(0);
      alert(`Voice profile calibrated successfully for ${newProfile.name}!`);
    } catch (e: any) {
      alert(e.message || "Failed to calibrate voice profile.");
    }
  };

  const cancelCalibration = () => {
    setIsCalibrating(false);
    setCalibrationStep(0);
    setCollectedSamples([]);
    setCalibrationProgress(0);
  };

  const handleClearLogs = () => {
    if (confirm("Clear all biometric verification security audit logs?")) {
      voiceBiometrics.clearLogs();
      setLogs([]);
    }
  };

  const currentStatus = liveResult?.status || "NO_SPEECH";
  const confidence = liveResult?.confidence ?? 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 max-h-[92vh] overflow-y-auto z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white bg-neutral-800/70 hover:bg-neutral-700 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white tracking-wide font-display">
                    Voice Biometrics & Security Check
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
                    Active
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  Real-time DSP acoustic feature analyzer & owner voice verification for sensitive commands
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 bg-neutral-950/80 p-1.5 rounded-2xl border border-neutral-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("status")}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "status"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Live Verification</span>
              </button>
              <button
                onClick={() => setActiveTab("calibrate")}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "calibrate"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Voice Profile & Calibration</span>
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === "logs"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Security Audit Log ({logs.length})</span>
              </button>
            </div>

            {/* TAB 1: LIVE STATUS & DSP ANALYZER */}
            {activeTab === "status" && (
              <div className="flex flex-col gap-4">
                {/* Live Biometric Shield Banner */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    currentStatus === "VERIFIED"
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : currentStatus === "REJECTED_UNAUTHORIZED"
                      ? "bg-red-950/40 border-red-500/40 text-red-300"
                      : "bg-neutral-950/60 border-neutral-800 text-neutral-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        currentStatus === "VERIFIED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : currentStatus === "REJECTED_UNAUTHORIZED"
                          ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                          : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {currentStatus === "VERIFIED" ? (
                        <ShieldCheck className="w-5 h-5" />
                      ) : currentStatus === "REJECTED_UNAUTHORIZED" ? (
                        <ShieldAlert className="w-5 h-5" />
                      ) : (
                        <Shield className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <span>Biometric Status:</span>
                        <span
                          className={`font-mono px-2 py-0.5 rounded text-[11px] ${
                            currentStatus === "VERIFIED"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : currentStatus === "REJECTED_UNAUTHORIZED"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-neutral-800 text-neutral-400"
                          }`}
                        >
                          {currentStatus === "VERIFIED"
                            ? "OWNER VERIFIED (DHRUV)"
                            : currentStatus === "REJECTED_UNAUTHORIZED"
                            ? "UNAUTHORIZED SPEAKER"
                            : "LISTENING FOR VOICE..."}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {liveResult?.reason || "Speak to test real-time voice verification."}
                      </p>
                    </div>
                  </div>

                  {/* Confidence Gauge */}
                  <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400">Match Score</span>
                    <span
                      className={`text-2xl font-mono font-bold ${
                        confidence >= 65 ? "text-emerald-400" : confidence > 40 ? "text-amber-400" : "text-red-400"
                      }`}
                    >
                      {confidence}%
                    </span>
                  </div>
                </div>

                {/* Live Acoustic DSP Metrics Card */}
                <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                    <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      Real-Time Acoustic Features (DSP Engine)
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">16kHz Web Audio</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Pitch / F0 */}
                    <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-400 font-semibold">Pitch (F0 Fundamental)</span>
                      <div className="text-base font-mono font-bold text-cyan-300">
                        {liveFeatures?.f0 ? `${Math.round(liveFeatures.f0)} Hz` : "—"}
                      </div>
                      <span className="text-[9px] text-neutral-500 font-mono">
                        Target: ~{Math.round(profile.f0Mean)} Hz (±{Math.round(profile.f0Std * 2)} Hz)
                      </span>
                    </div>

                    {/* Spectral Centroid */}
                    <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-400 font-semibold">Timbre Centroid</span>
                      <div className="text-base font-mono font-bold text-purple-300">
                        {liveFeatures?.spectralCentroid ? `${Math.round(liveFeatures.spectralCentroid)} Hz` : "—"}
                      </div>
                      <span className="text-[9px] text-neutral-500 font-mono">
                        Vocal Tract Brightness
                      </span>
                    </div>

                    {/* Zero Crossing Rate */}
                    <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-400 font-semibold">Zero-Crossing Rate</span>
                      <div className="text-base font-mono font-bold text-amber-300">
                        {liveFeatures?.zcr ? (liveFeatures.zcr * 100).toFixed(1) + "%" : "—"}
                      </div>
                      <span className="text-[9px] text-neutral-500 font-mono">Voiced vs Fricatives</span>
                    </div>

                    {/* Signal RMS Energy */}
                    <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl flex flex-col gap-1">
                      <span className="text-[10px] text-neutral-400 font-semibold">Vocal Energy (RMS)</span>
                      <div className="text-base font-mono font-bold text-pink-300">
                        {liveFeatures?.energyRMS ? Math.min(100, Math.round(liveFeatures.energyRMS * 400)) + "%" : "0%"}
                      </div>
                      <span className="text-[9px] text-neutral-500 font-mono">
                        {liveFeatures?.isVoiced ? "Voiced Speech Active" : "Silence / Noise"}
                      </span>
                    </div>
                  </div>

                  {/* Spectral Subband Resonance Filterbank Bars */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      <span>Vocal Tract Resonance Subband Distribution (Formant Vectors)</span>
                      <span className="font-mono text-cyan-400 text-[9px]">10-Band Filterbank</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-12 bg-neutral-900/90 rounded-xl p-2 border border-neutral-800">
                      {(liveFeatures?.subbandEnergies || profile.subbandEnergies).map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <div
                            className="w-full bg-gradient-to-t from-cyan-600 to-pink-500 rounded-sm transition-all duration-150"
                            style={{ height: `${Math.max(8, Math.min(100, val * 220))}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sensitivity & Security Mode Quick Selector */}
                <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-2.5">
                  <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    Security Sensitivity Threshold
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["strict", "balanced", "relaxed"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSensitivityChange(s)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                          profile.sensitivity === s
                            ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                        }`}
                      >
                        <span>{s}</span>
                        <span className="text-[9px] font-mono text-neutral-500">
                          {s === "strict" ? "≥78% match" : s === "balanced" ? "≥65% match" : "≥52% match"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PROFILE & CALIBRATION WIZARD */}
            {activeTab === "calibrate" && (
              <div className="flex flex-col gap-4">
                {/* Current Enrolled Profile Summary */}
                <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Enrolled Owner Profile
                      </h3>
                      <p className="text-[11px] text-neutral-400">
                        {profile.name} &bull; Calibrated on {profile.enrolledAt}
                      </p>
                    </div>
                    <button
                      onClick={handleResetToBaseline}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors cursor-pointer"
                    >
                      Reset Baseline
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block">Baseline Pitch (F0)</span>
                      <span className="text-sm font-mono font-bold text-cyan-300">{profile.f0Mean} Hz</span>
                    </div>
                    <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block">Timbre Centroid</span>
                      <span className="text-sm font-mono font-bold text-purple-300">
                        {profile.spectralCentroidMean} Hz
                      </span>
                    </div>
                    <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block">Samples Analyzed</span>
                      <span className="text-sm font-mono font-bold text-emerald-300">
                        {profile.sampleCount} frames
                      </span>
                    </div>
                  </div>
                </div>

                {/* Calibration Record Step */}
                <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-5 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Mic className={`w-6 h-6 ${isCalibrating ? "animate-pulse text-red-400" : ""}`} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {isCalibrating ? "Calibrating Your Voice..." : "Train / Recalibrate Owner Voice"}
                    </h3>
                    <p className="text-xs text-neutral-400 max-w-md mt-1">
                      {isCalibrating
                        ? "Please speak naturally for a few seconds (e.g., 'Hello Zoya, I am Dhruv, my voice is my password')."
                        : "Record 3-5 seconds of your speech to fine-tune Zoya's acoustic recognition to your microphone and vocal characteristics."}
                    </p>
                  </div>

                  {isCalibrating && (
                    <div className="w-full max-w-md flex flex-col gap-2">
                      <div className="w-full bg-neutral-900 h-3 rounded-full overflow-hidden border border-neutral-800">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-pink-500 h-full transition-all duration-150"
                          style={{ width: `${calibrationProgress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                        <span>Captured frames: {collectedSamples.length}</span>
                        <span>{calibrationProgress}% Complete</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {!isCalibrating ? (
                      <button
                        onClick={startCalibration}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Start Calibration</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={finishCalibration}
                          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Save Calibration</span>
                        </button>
                        <button
                          onClick={cancelCalibration}
                          className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Profile Name & Passcode Fallback Config */}
                <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-3">
                  <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    Owner Identity & Security Passcode Fallback
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Authorized Owner Name</label>
                      <input
                        type="text"
                        value={ownerNameInput}
                        onChange={(e) => setOwnerNameInput(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Backup Security PIN (Fallback)</label>
                      <input
                        type="text"
                        value={passcodeInput}
                        onChange={(e) => setPasscodeInput(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                        maxLength={8}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSavePasscode}
                    className="self-end px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: AUDIT LOGS */}
            {activeTab === "logs" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-cyan-400" />
                    Biometric Verification Checks Log
                  </span>
                  {logs.length > 0 && (
                    <button
                      onClick={handleClearLogs}
                      className="text-[11px] text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear History</span>
                    </button>
                  )}
                </div>

                {logs.length === 0 ? (
                  <div className="text-center py-8 text-xs text-neutral-600 italic">
                    No sensitive command verifications logged yet. When Zoya receives commands like makePhoneCall, openWhatsApp, or app actions, verification attempts will appear here.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          log.verified
                            ? "bg-emerald-950/20 border-emerald-500/30 text-neutral-200"
                            : "bg-red-950/20 border-red-500/30 text-neutral-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {log.verified ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          )}
                          <div>
                            <div className="text-xs font-bold flex items-center gap-2">
                              <span className="font-mono text-cyan-300">{log.command}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                  log.verified
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {log.verified ? "APPROVED" : "BLOCKED"}
                              </span>
                            </div>
                            <div className="text-[10px] text-neutral-400">{log.reason}</div>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                          <span
                            className={`text-xs font-mono font-bold ${
                              log.confidence >= 65 ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {log.confidence}% match
                          </span>
                          <span className="text-[9px] text-neutral-500 font-mono">{log.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer Notice */}
            <div className="flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-800/80 pt-3">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3 text-cyan-400" />
                DSP Voice Biometric engine executes locally in browser (no biometric data sent to third parties).
              </span>
              <span className="font-mono text-cyan-400/80">Owner: Dhruv</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

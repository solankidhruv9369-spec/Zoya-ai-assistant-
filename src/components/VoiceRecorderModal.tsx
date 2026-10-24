import { useState, useRef, useEffect } from "react";
import { X, Mic, Square, Play, Pause, Download, Trash2, Save, Send, Radio, Volume2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VoiceNote {
  id: string;
  title: string;
  audioUrl: string;
  duration: number;
  timestamp: string;
  transcript?: string;
}

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToZoya?: (transcript: string) => void;
}

export function VoiceRecorderModal({ isOpen, onClose, onSendToZoya }: VoiceRecorderModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [transcript, setTranscript] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Saved recordings list
  const [savedNotes, setSavedNotes] = useState<VoiceNote[]>(() => {
    try {
      const stored = localStorage.getItem("zoya_voice_notes");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const playingAudioRef = useRef<HTMLAudioElement | null>(null);

  // Save to localStorage whenever savedNotes change
  useEffect(() => {
    try {
      localStorage.setItem("zoya_voice_notes", JSON.stringify(savedNotes));
    } catch (e) {
      console.warn("Could not save voice notes to localStorage:", e);
    }
  }, [savedNotes]);

  // Clean up on unmount or close
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
      if (playingAudioRef.current) {
        playingAudioRef.current.pause();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    setAudioUrl(null);
    setRecordedBlob(null);
    setTranscript("");
    setRecordingTime(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecordedBlob(blob);
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Try live SpeechRecognition for auto-transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "hi-IN";

          let fullTranscript = "";
          recognition.onresult = (e: any) => {
            let interim = "";
            for (let i = e.resultIndex; i < e.results.length; i++) {
              if (e.results[i].isFinal) {
                fullTranscript += e.results[i][0].transcript + " ";
              } else {
                interim += e.results[i][0].transcript;
              }
            }
            setTranscript(fullTranscript + interim);
          };

          recognition.start();
        } catch (e) {
          console.warn("Speech recognition error during recording:", e);
        }
      }
    } catch (err) {
      console.error("Failed to access microphone for voice recorder:", err);
      alert("Microphone access is required to record audio. Please check your browser permissions.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        timerRef.current = window.setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }
  };

  const stopRecordingCleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const handleSaveNote = () => {
    if (!audioUrl || !recordedBlob) return;

    const titleToUse = noteTitle.trim() || `Voice Note ${savedNotes.length + 1}`;
    const newNote: VoiceNote = {
      id: Math.random().toString(36).substring(7),
      title: titleToUse,
      audioUrl: audioUrl,
      duration: recordingTime,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }),
      transcript: transcript || undefined,
    };

    setSavedNotes((prev) => [newNote, ...prev]);
    setNoteTitle("");
    alert("Voice recording saved successfully!");
  };

  const handleDeleteNote = (id: string) => {
    setSavedNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handlePlayNote = (note: VoiceNote) => {
    if (playingNoteId === note.id) {
      if (playingAudioRef.current) {
        playingAudioRef.current.pause();
        setPlayingNoteId(null);
      }
      return;
    }

    if (playingAudioRef.current) {
      playingAudioRef.current.pause();
    }

    const audio = new Audio(note.audioUrl);
    playingAudioRef.current = audio;
    setPlayingNoteId(note.id);

    audio.play().catch((e) => console.warn("Playback error:", e));
    audio.onended = () => {
      setPlayingNoteId(null);
    };
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  const handleSendToZoyaClick = () => {
    if (transcript && onSendToZoya) {
      onSendToZoya(transcript);
      onClose();
    } else if (onSendToZoya) {
      onSendToZoya("Hello Zoya, I recorded a voice note for you!");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white bg-neutral-800/60 hover:bg-neutral-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-md">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide font-display">
                  Voice Recording System
                </h2>
                <p className="text-xs text-neutral-400">
                  आवाज़ रिकॉर्ड करें, प्लेबैक करें और ज़ोया के साथ शेयर करें
                </p>
              </div>
            </div>

            {/* Recorder Core Section */}
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-5 relative overflow-hidden">
              {/* Pulsing visual backdrop when recording */}
              {isRecording && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-950/30 via-pink-950/20 to-red-950/30 animate-pulse pointer-events-none" />
              )}

              {/* Timer Display */}
              <div className="text-4xl font-mono font-bold tracking-widest text-neutral-100 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isRecording ? (isPaused ? "bg-amber-400" : "bg-red-500 animate-ping") : "bg-neutral-600"}`} />
                <span>{formatTime(recordingTime)}</span>
              </div>

              {/* Status hint */}
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                {isRecording ? (isPaused ? "Recording Paused" : "Live Recording...") : audioUrl ? "Recording Complete" : "Tap Record to Start"}
              </div>

              {/* Main Control Buttons */}
              <div className="flex items-center gap-4 z-10">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-red-500/25 transition-all transform hover:scale-105 cursor-pointer text-sm"
                  >
                    <Mic className="w-5 h-5" />
                    <span>Record Audio</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={pauseRecording}
                      className="p-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-2xl border border-neutral-700 transition-all cursor-pointer"
                      title={isPaused ? "Resume" : "Pause"}
                    >
                      {isPaused ? <Play className="w-5 h-5 text-green-400" /> : <Pause className="w-5 h-5 text-amber-400" />}
                    </button>
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl shadow-lg transition-all transform hover:scale-105 cursor-pointer text-sm"
                    >
                      <Square className="w-5 h-5 fill-current" />
                      <span>Stop & Save</span>
                    </button>
                  </>
                )}
              </div>

              {/* Live Transcript Preview if captured */}
              {transcript && (
                <div className="w-full bg-neutral-900/80 rounded-xl p-3 border border-neutral-800/80 text-xs text-neutral-300 italic text-center max-h-20 overflow-y-auto mt-2">
                  "{transcript}"
                </div>
              )}
            </div>

            {/* Recorded Audio Preview & Actions */}
            {audioUrl && !isRecording && (
              <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                  <span>Current Recording Preview</span>
                  <span className="text-pink-400 font-mono">{formatTime(recordingTime)}</span>
                </div>

                <audio src={audioUrl} controls className="w-full h-10 accent-pink-500 rounded-lg" />

                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Enter recording title (optional)..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 outline-none focus:border-pink-500"
                  />

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      onClick={handleSaveNote}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save to History</span>
                    </button>

                    <button
                      onClick={() => handleDownload(audioUrl, `zoya_voice_note_${Date.now()}.webm`)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-pink-400 border border-pink-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download File</span>
                    </button>
                  </div>

                  {onSendToZoya && (
                    <button
                      onClick={handleSendToZoyaClick}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer mt-1"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Recording Transcript to Zoya</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Saved Recordings History List */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                  Saved Voice Notes ({savedNotes.length})
                </span>
                {savedNotes.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("Clear all saved voice notes?")) {
                        setSavedNotes([]);
                      }
                    }}
                    className="text-[10px] text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {savedNotes.length === 0 ? (
                <div className="text-center py-6 text-xs text-neutral-600 italic">
                  No saved voice notes yet. Record your voice above!
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {savedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-center justify-between bg-neutral-950/60 border border-neutral-850 rounded-xl p-3 hover:border-neutral-750 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handlePlayNote(note)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            playingNoteId === note.id ? "bg-pink-500 text-neutral-950" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                          }`}
                        >
                          {playingNoteId === note.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>

                        <div>
                          <div className="text-xs font-bold text-neutral-200">{note.title}</div>
                          <div className="text-[10px] text-neutral-500 flex items-center gap-2">
                            <span>{note.timestamp}</span>
                            <span>&bull;</span>
                            <span className="font-mono text-pink-400/80">{formatTime(note.duration)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownload(note.audioUrl, `${note.title.replace(/\s+/g, "_")}.webm`)}
                          className="p-1.5 text-neutral-400 hover:text-pink-400 transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-neutral-500 font-mono pt-1">
              Recorded audio is saved locally on your device.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import React, { useState, useEffect } from "react";
import { 
  Brain, 
  Sparkles, 
  Trash2, 
  Plus, 
  Search, 
  X, 
  Calendar, 
  Tag, 
  Check, 
  Copy, 
  RefreshCw,
  Heart,
  ShieldCheck,
  Zap,
  Database,
  Cloud,
  Code2,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface MemoryItem {
  id: string;
  fact: string;
  category: "personal" | "preference" | "daily" | "secret" | "general";
  created_at: string;
  source?: string;
}

interface MemoryVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemoryAdded?: (fact: string) => void;
}

interface SupabaseStatus {
  configured: boolean;
  connected: boolean;
  url: string | null;
  count: number;
  error: string | null;
  sqlSchema: string;
}

const CATEGORIES: { id: string; label: string; icon: string; color: string }[] = [
  { id: "all", label: "All Memories", icon: "✨", color: "text-purple-400 border-purple-500/30" },
  { id: "personal", label: "Personal & Identity", icon: "👤", color: "text-blue-400 border-blue-500/30" },
  { id: "preference", label: "Likes & Favorites", icon: "💖", color: "text-pink-400 border-pink-500/30" },
  { id: "daily", label: "Daily Life & Plans", icon: "📅", color: "text-emerald-400 border-emerald-500/30" },
  { id: "secret", label: "Notes & Secrets", icon: "🔒", color: "text-amber-400 border-amber-500/30" },
];

export const MemoryVaultModal: React.FC<MemoryVaultModalProps> = ({
  isOpen,
  onClose,
  onMemoryAdded,
}) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newFact, setNewFact] = useState<string>("");
  const [newCategory, setNewCategory] = useState<MemoryItem["category"]>("personal");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Supabase Cloud State
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showSupabaseGuide, setShowSupabaseGuide] = useState<boolean>(false);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/memories");
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
      }
    } catch (e) {
      console.warn("Failed to fetch memories from server:", e);
      // Fallback to local storage if server unreachable
      try {
        const local = localStorage.getItem("zoya_local_memories");
        if (local) setMemories(JSON.parse(local));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const fetchSupabaseStatus = async () => {
    try {
      const res = await fetch("/api/supabase/status");
      if (res.ok) {
        const data = await res.json();
        setSupabaseStatus(data);
      }
    } catch (e) {
      console.warn("Failed to fetch supabase status:", e);
    }
  };

  const handleSyncSupabase = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/supabase/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          text: `Supabase Sync Complete! (Cloud Data: ${data.total} facts) 🚀`,
          type: "success",
        });
        await fetchMemories();
        await fetchSupabaseStatus();
      } else {
        setMessage({
          text: data.error || "Supabase sync failed. Please check credentials or SQL table setup.",
          type: "error",
        });
      }
    } catch {
      setMessage({ text: "Failed to connect to sync endpoint.", type: "error" });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMemories();
      fetchSupabaseStatus();
    }
  }, [isOpen]);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fact: newFact.trim(), category: newCategory }),
      });

      if (res.ok) {
        const data = await res.json();
        const added = data.memory;
        setMemories((prev) => [added, ...prev]);
        setNewFact("");
        setMessage({ text: "बात सफलतापूर्वक याद कर ली गई! 🧠", type: "success" });
        if (onMemoryAdded) onMemoryAdded(added.fact);
        fetchSupabaseStatus();
      } else {
        throw new Error("Failed to save");
      }
    } catch {
      // Local fallback save
      const fallbackItem: MemoryItem = {
        id: "mem_" + Date.now(),
        fact: newFact.trim(),
        category: newCategory,
        created_at: new Date().toISOString(),
        source: "manual",
      };
      const updated = [fallbackItem, ...memories];
      setMemories(updated);
      try {
        localStorage.setItem("zoya_local_memories", JSON.stringify(updated));
      } catch {}
      setNewFact("");
      setMessage({ text: "लोकल मेमोरी में सेव हो गया! 💾", type: "success" });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await fetch(`/api/memories/${id}`, { method: "DELETE" });
      setMemories((prev) => prev.filter((m) => m.id !== id));
      try {
        const local = memories.filter((m) => m.id !== id);
        localStorage.setItem("zoya_local_memories", JSON.stringify(local));
      } catch {}
      setMessage({ text: "मेमोरी डिलीट कर दी गई।", type: "success" });
      setTimeout(() => setMessage(null), 2500);
    } catch {
      setMemories((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleCopy = (fact: string, id: string) => {
    navigator.clipboard.writeText(fact);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopySql = () => {
    if (supabaseStatus?.sqlSchema) {
      navigator.clipboard.writeText(supabaseStatus.sqlSchema);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    }
  };

  const filteredMemories = memories.filter((m) => {
    const matchesCat = selectedCategory === "all" || m.category === selectedCategory;
    const matchesSearch = m.fact.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800/80 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-900 bg-gradient-to-r from-purple-950/40 via-neutral-950 to-pink-950/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Brain className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-neutral-100 tracking-wide font-display">
                    ज़ोया की यादें (Memory Vault)
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {memories.length} Facts Remembered
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  ध्रुव की सभी बातें, पसंद, रूटीन और महत्वपूर्ण विवरण जो ज़ोया कभी नहीं भूलती।
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Supabase Cloud Live Status Bar */}
          <div className="px-6 py-2.5 bg-neutral-900/60 border-b border-neutral-900 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-neutral-300">Supabase Cloud:</span>
              {supabaseStatus?.connected ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Active & Connected ({supabaseStatus.count} facts in cloud)
                </span>
              ) : supabaseStatus?.configured ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full" title={supabaseStatus.error || "Checking"}>
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  Keys present (Table check needed)
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full">
                  <Cloud className="w-3 h-3 text-neutral-500" />
                  Local Disk Active
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {supabaseStatus?.connected && (
                <button
                  onClick={handleSyncSupabase}
                  disabled={isSyncing}
                  className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-medium flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                  title="Force 2-way sync with Supabase database"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin text-emerald-400" : ""}`} />
                  <span>{isSyncing ? "Syncing..." : "Sync Cloud"}</span>
                </button>
              )}
              <button
                onClick={() => setShowSupabaseGuide(!showSupabaseGuide)}
                className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
              >
                <Code2 className="w-3 h-3" />
                <span>{showSupabaseGuide ? "Hide Guide" : "Supabase Setup & SQL"}</span>
              </button>
            </div>
          </div>

          {/* Collapsible Supabase Setup Assistant */}
          <AnimatePresence>
            {showSupabaseGuide && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-neutral-900/90 border-b border-purple-500/30 p-5 text-xs text-neutral-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                      <Database className="w-4 h-4 text-purple-400" />
                      Supabase Cloud Database Injection Guide
                    </h4>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Follow these 3 easy steps to connect your own Supabase project:
                    </p>
                  </div>
                  <button
                    onClick={handleCopySql}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium text-[11px] flex items-center gap-1.5 transition cursor-pointer shadow"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? "Copied SQL!" : "Copy SQL Script"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="bg-black/50 p-3 rounded-xl border border-neutral-800">
                    <span className="font-bold text-purple-300 block mb-1">Step 1: Get Keys</span>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Go to your Supabase Dashboard &rarr; <b>Project Settings</b> &rarr; <b>API</b>.
                      Copy your <b>Project URL</b> and <b>service_role</b> (or anon) API key.
                    </p>
                  </div>
                  <div className="bg-black/50 p-3 rounded-xl border border-neutral-800">
                    <span className="font-bold text-pink-300 block mb-1">Step 2: Set Secrets</span>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      In AI Studio Settings &rarr; Secrets, declare:
                      <br />
                      <code className="text-purple-300 font-mono">SUPABASE_URL=https://xyz.supabase.co</code>
                      <br />
                      <code className="text-pink-300 font-mono">SUPABASE_KEY=your_key_here</code>
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <span className="font-bold text-emerald-400 block mb-1">Step 3: Create SQL Table (Run in Supabase SQL Editor)</span>
                  <pre className="font-mono text-[11px] text-emerald-300/90 overflow-x-auto whitespace-pre p-2 bg-black/60 rounded-lg">
                    {supabaseStatus?.sqlSchema || `-- Run in Supabase SQL Editor:\nCREATE TABLE IF NOT EXISTS memories (\n  id TEXT PRIMARY KEY,\n  fact TEXT NOT NULL,\n  category TEXT DEFAULT 'general',\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  source TEXT DEFAULT 'voice'\n);\nALTER TABLE memories ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "Allow all" ON memories FOR ALL USING (true) WITH CHECK (true);`}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add New Memory Form */}
          <div className="p-5 border-b border-neutral-900 bg-neutral-900/30">
            <form onSubmit={handleAddMemory} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  नई बात याद कराएं (Teach Zoya New Fact):
                </span>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 rounded-lg px-2.5 py-1 outline-none cursor-pointer"
                >
                  <option value="personal">👤 Personal (पर्सनल)</option>
                  <option value="preference">💖 Likes & Favorites (पसंद)</option>
                  <option value="daily">📅 Daily Routine / Plans (रूटीन)</option>
                  <option value="secret">🔒 Notes & Secrets (खास नोट)</option>
                  <option value="general">✨ General (सामान्य)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFact}
                  onChange={(e) => setNewFact(e.target.value)}
                  placeholder="उदा. मुझे कोल्ड कॉफी बहुत पसंद है, मेरा जन्मदिन 15 अगस्त को है..."
                  className="flex-1 bg-neutral-900/90 border border-neutral-800 focus:border-purple-500/50 rounded-xl px-4 py-2.5 text-xs text-neutral-200 outline-none transition placeholder-neutral-500"
                />
                <button
                  type="submit"
                  disabled={!newFact.trim() || isSubmitting}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-purple-900/20 flex-shrink-0"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>याद रखो</span>
                </button>
              </div>
            </form>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-2 text-xs font-medium px-3 py-1.5 rounded-lg ${
                  message.type === "success"
                    ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
                    : "bg-red-950/60 border border-red-500/40 text-red-300"
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </div>

          {/* Search & Category Filter Bar */}
          <div className="px-5 py-3 border-b border-neutral-900 bg-neutral-950 flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 outline-none placeholder-neutral-500"
              />
            </div>

            {/* Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition cursor-pointer border ${
                    selectedCategory === cat.id
                      ? "bg-purple-950/70 border-purple-500/50 text-purple-200"
                      : "bg-neutral-900/50 border-neutral-800/80 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Memory List */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 min-h-[260px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-neutral-500 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                <span>यादों की तिजोरी लोड हो रही है...</span>
              </div>
            ) : filteredMemories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2 text-center text-neutral-500 text-xs">
                <Brain className="w-8 h-8 text-neutral-700 mb-1" />
                <span className="text-neutral-400 font-medium">कोई मेमोरी नहीं मिली</span>
                <span className="text-[11px] text-neutral-600 max-w-sm">
                  {searchQuery 
                    ? "खोज के अनुसार कोई तथ्य नहीं मिला।" 
                    : "ज़ोया से बातचीत करें या ऊपर फ़ॉर्म भरकर ध्रुव की बातें सेव करें।"}
                </span>
              </div>
            ) : (
              filteredMemories.map((mem) => {
                const isCopied = copiedId === mem.id;
                const formattedDate = new Date(mem.created_at || Date.now()).toLocaleDateString("hi-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <motion.div
                    key={mem.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-neutral-900/40 hover:bg-neutral-900/70 border border-neutral-800/80 hover:border-purple-500/40 rounded-2xl p-4 transition-all duration-200 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400 mt-0.5">
                        {mem.category === "preference" ? (
                          <Heart className="w-4 h-4 text-pink-400" />
                        ) : mem.category === "secret" ? (
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                        ) : mem.category === "daily" ? (
                          <Calendar className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Zap className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-neutral-200 font-medium leading-relaxed">
                          {mem.fact}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-neutral-500 font-mono">
                          <span className="flex items-center gap-1 capitalize px-2 py-0.5 rounded-full bg-neutral-800/80 border border-neutral-700/50 text-neutral-400">
                            <Tag className="w-2.5 h-2.5" />
                            {mem.category}
                          </span>
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(mem.fact, mem.id)}
                        className="p-1.5 text-neutral-400 hover:text-cyan-400 hover:bg-neutral-800 rounded-lg transition"
                        title="Copy fact"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteMemory(mem.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition"
                        title="Delete memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-neutral-900 bg-neutral-950/80 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              क्लाउड व लोकल डिस्क पर हमेशा सुरक्षित
            </span>
            <button
              onClick={() => {
                fetchMemories();
                fetchSupabaseStatus();
              }}
              className="hover:text-purple-300 transition flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>रिफ्रेश करें</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

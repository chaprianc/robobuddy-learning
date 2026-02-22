import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Plus, Clock, BookOpen, Trophy, Settings, Users, ArrowRight, Star, TrendingUp, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import RoboAvatar from "@/components/RoboAvatar";
import { supabase } from "@/integrations/supabase/client";
import { getLevelFromXp, getXpProgress, LEVEL_TITLES, BADGE_DEFINITIONS } from "@/lib/xp-system";

interface Child {
  id: string;
  name: string;
  age_group: string;
  screen_time_limit_minutes: number;
  xp: number;
  level: number;
}

interface Session {
  module: string;
  duration_minutes: number | null;
  started_at: string;
  messages_count: number | null;
  child_id: string;
}

interface QuizScore {
  topic: string;
  score: number;
  total: number;
  created_at: string;
  child_id: string;
}

interface Badge {
  badge_key: string;
  badge_name: string;
  badge_icon: string;
  earned_at: string;
  child_id: string;
}

interface Memory {
  module: string;
  strengths: string[] | null;
  weaknesses: string[] | null;
  total_correct: number | null;
  total_wrong: number | null;
  highest_streak: number | null;
  child_id: string;
}

const MODULE_LABELS: Record<string, string> = {
  math: "חשבון 🔢",
  reading: "קריאה 📖",
  english: "אנגלית 🇬🇧",
  quiz: "חידון 🎮",
  free: "שיחה חופשית 💬",
};

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const STORAGE_KEY = "robo_parent_data";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState("7-9");
  const [tab, setTab] = useState<"overview" | "progress" | "strengths" | "settings">("overview");
  const [screenTimeLimit, setScreenTimeLimit] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("parent_auth") !== "true") {
      navigate("/parent/auth");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Try DB first, fall back to localStorage
      const { data: dbChildren } = await supabase.from("children").select("*");
      
      if (dbChildren && dbChildren.length > 0) {
        setChildren(dbChildren);
        setSelectedChild(dbChildren[0]);
        setScreenTimeLimit(dbChildren[0].screen_time_limit_minutes);

        const childIds = dbChildren.map(c => c.id);
        
        const [sessRes, scoreRes, badgeRes, memRes] = await Promise.all([
          supabase.from("learning_sessions").select("*").in("child_id", childIds).order("started_at", { ascending: false }),
          supabase.from("quiz_scores").select("*").in("child_id", childIds).order("created_at", { ascending: false }),
          supabase.from("badges").select("*").in("child_id", childIds),
          supabase.from("learning_memory").select("*").in("child_id", childIds),
        ]);
        
        setSessions((sessRes.data || []) as Session[]);
        setQuizScores((scoreRes.data || []) as QuizScore[]);
        setBadges((badgeRes.data || []) as Badge[]);
        setMemories((memRes.data || []) as Memory[]);
      } else {
        // Fall back to localStorage
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const stored = JSON.parse(raw);
            setChildren(stored.children || []);
            if (stored.children?.length > 0) {
              setSelectedChild(stored.children[0]);
              setScreenTimeLimit(stored.children[0].screen_time_limit_minutes);
            }
          }
        } catch {}
      }
    } catch {
      // localStorage fallback
    }
    setLoading(false);
  };

  const addChild = async () => {
    if (!newChildName.trim()) return;
    const newChild: Child = {
      id: crypto.randomUUID(),
      name: newChildName.trim(),
      age_group: newChildAge,
      screen_time_limit_minutes: 30,
      xp: 0,
      level: 1,
    };
    
    // Save to DB
    await supabase.from("children").insert({
      id: newChild.id,
      name: newChild.name,
      age_group: newChild.age_group,
      screen_time_limit_minutes: 30,
      parent_id: newChild.id, // placeholder since no real auth
    });

    const updated = [...children, newChild];
    setChildren(updated);
    setSelectedChild(newChild);
    setNewChildName("");
    setShowAddChild(false);
    setScreenTimeLimit(30);
    
    // Also save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ children: updated }));
  };

  const updateScreenTime = async () => {
    if (!selectedChild) return;
    await supabase.from("children").update({ screen_time_limit_minutes: screenTimeLimit }).eq("id", selectedChild.id);
    const updated = children.map(c =>
      c.id === selectedChild.id ? { ...c, screen_time_limit_minutes: screenTimeLimit } : c
    );
    setChildren(updated);
  };

  const logout = () => {
    sessionStorage.removeItem("parent_auth");
    navigate("/parent/auth");
  };

  // Filtered data for selected child
  const childSessions = selectedChild ? sessions.filter(s => s.child_id === selectedChild.id) : [];
  const childScores = selectedChild ? quizScores.filter(q => q.child_id === selectedChild.id) : [];
  const childBadges = selectedChild ? badges.filter(b => b.child_id === selectedChild.id) : [];
  const childMemories = selectedChild ? memories.filter(m => m.child_id === selectedChild.id) : [];

  // Computed stats
  const totalMinutes = childSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const totalMessages = childSessions.reduce((sum, s) => sum + (s.messages_count || 0), 0);
  const avgScore = childScores.length > 0
    ? Math.round(childScores.reduce((sum, q) => sum + (q.score / q.total) * 100, 0) / childScores.length)
    : 0;

  // Daily learning time chart data (last 7 days)
  const dailyData = (() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("he-IL", { weekday: "short" });
      days[key] = 0;
    }
    childSessions.forEach(s => {
      const d = new Date(s.started_at);
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff < 7) {
        const key = d.toLocaleDateString("he-IL", { weekday: "short" });
        if (key in days) days[key] += (s.duration_minutes || 0);
      }
    });
    return Object.entries(days).map(([name, minutes]) => ({ name, minutes }));
  })();

  // Module distribution pie data
  const moduleDistribution = (() => {
    const counts: Record<string, number> = {};
    childSessions.forEach(s => {
      counts[s.module] = (counts[s.module] || 0) + 1;
    });
    return Object.entries(counts).map(([module, value]) => ({
      name: MODULE_LABELS[module] || module,
      value,
    }));
  })();

  // XP progress over quiz scores (timeline)
  const xpTimeline = childScores.slice().reverse().slice(-10).map((q, i) => ({
    name: new Date(q.created_at).toLocaleDateString("he-IL", { day: "numeric", month: "numeric" }),
    score: Math.round((q.score / q.total) * 100),
  }));

  // Strengths & weaknesses
  const allStrengths = childMemories.flatMap(m => m.strengths || []);
  const allWeaknesses = childMemories.flatMap(m => m.weaknesses || []);
  const totalCorrect = childMemories.reduce((s, m) => s + (m.total_correct || 0), 0);
  const totalWrong = childMemories.reduce((s, m) => s + (m.total_wrong || 0), 0);
  const highestStreak = Math.max(0, ...childMemories.map(m => m.highest_streak || 0));

  const xpProgress = selectedChild ? getXpProgress(selectedChild.xp, selectedChild.level) : 0;
  const levelTitle = selectedChild ? LEVEL_TITLES[selectedChild.level] || "" : "";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
          <RoboAvatar size="md" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted pb-8" dir="rtl">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowRight className="w-5 h-5" />
          </button>
          <RoboAvatar size="sm" animate={false} />
          <div>
            <p className="font-bold text-foreground text-sm">דשבורד הורים 👋</p>
            <p className="text-xs text-muted-foreground">מעקב התקדמות</p>
          </div>
        </div>
        <button onClick={logout} className="text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6">
        {/* Children selector */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => { setSelectedChild(child); setScreenTimeLimit(child.screen_time_limit_minutes); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedChild?.id === child.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {child.name}
            </button>
          ))}
          <button onClick={() => setShowAddChild(true)} className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Add child modal */}
        <AnimatePresence>
          {showAddChild && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="bg-card rounded-2xl p-5 border border-border shadow-lg mb-6 space-y-3">
              <h3 className="font-bold text-foreground">הוספת ילד/ה</h3>
              <input value={newChildName} onChange={e => setNewChildName(e.target.value)} placeholder="שם הילד/ה" maxLength={50} className="w-full bg-muted rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <select value={newChildAge} onChange={e => setNewChildAge(e.target.value)} className="w-full bg-muted rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="5-6">גיל 5-6</option>
                <option value="7-9">גיל 7-9</option>
                <option value="10-12">גיל 10-12</option>
                <option value="13-14">גיל 13-14</option>
              </select>
              <div className="flex gap-2">
                <button onClick={addChild} className="flex-1 bg-primary text-primary-foreground rounded-xl py-2 font-medium">הוספה</button>
                <button onClick={() => setShowAddChild(false)} className="flex-1 bg-muted text-foreground rounded-xl py-2">ביטול</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {children.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground font-medium">אין ילדים עדיין</p>
            <p className="text-muted-foreground text-sm mt-1">לחץ + כדי להוסיף ילד/ה</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
              {([
                { key: "overview", label: "📊 סקירה" },
                { key: "progress", label: "📈 התקדמות" },
                { key: "strengths", label: "💪 חוזקות" },
                { key: "settings", label: "⚙️ הגדרות" },
              ] as const).map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    tab === t.key ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* XP & Level Card */}
                {selectedChild && (
                  <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">רמה {selectedChild.level}</p>
                        <p className="text-lg font-bold text-foreground">{levelTitle}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-bold text-primary">{selectedChild.xp}</p>
                        <p className="text-xs text-muted-foreground">XP</p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-left">{Math.round(xpProgress)}% לרמה הבאה</p>
                  </div>
                )}

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard icon={<Clock className="w-5 h-5 text-primary" />} value={`${totalMinutes}`} label="דקות למידה" />
                  <StatCard icon={<BookOpen className="w-5 h-5 text-chart-2" />} value={`${childSessions.length}`} label="שיעורים" />
                  <StatCard icon={<Trophy className="w-5 h-5 text-chart-3" />} value={`${avgScore}%`} label="ממוצע חידון" />
                  <StatCard icon={<Award className="w-5 h-5 text-chart-4" />} value={`${childBadges.length}`} label="תגים נצברו" />
                  <StatCard icon={<Star className="w-5 h-5 text-chart-5" />} value={`${totalCorrect}`} label="תשובות נכונות" />
                  <StatCard icon={<TrendingUp className="w-5 h-5 text-primary" />} value={`${highestStreak}`} label="רצף שיא" />
                </div>

                {/* Badges earned */}
                {childBadges.length > 0 && (
                  <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                    <h3 className="font-bold text-foreground mb-3">🏆 תגים שנצברו</h3>
                    <div className="flex flex-wrap gap-2">
                      {childBadges.map((b, i) => (
                        <motion.span
                          key={b.badge_key}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium"
                        >
                          {b.badge_icon} {b.badge_name}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent activity */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                  <h3 className="font-bold text-foreground mb-3">📝 פעילות אחרונה</h3>
                  {childSessions.length === 0 ? (
                    <p className="text-muted-foreground text-sm">אין פעילות עדיין.</p>
                  ) : (
                    <div className="space-y-2">
                      {childSessions.slice(0, 5).map((s, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div>
                            <p className="text-sm font-medium text-foreground">{MODULE_LABELS[s.module] || s.module}</p>
                            <p className="text-xs text-muted-foreground">{new Date(s.started_at).toLocaleDateString("he-IL")}</p>
                          </div>
                          <span className="text-sm text-muted-foreground">{s.duration_minutes || 0} דק׳</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {tab === "progress" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Daily learning time */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                  <h3 className="font-bold text-foreground mb-4">⏱ זמן למידה יומי (7 ימים אחרונים)</h3>
                  {dailyData.some(d => d.minutes > 0) ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={dailyData}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: number) => [`${v} דקות`, "זמן למידה"]} />
                        <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">אין נתונים עדיין</p>
                  )}
                </div>

                {/* Module distribution */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                  <h3 className="font-bold text-foreground mb-4">📚 חלוקה לפי מודולים</h3>
                  {moduleDistribution.length > 0 ? (
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width="50%" height={180}>
                        <PieChart>
                          <Pie data={moduleDistribution} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                            {moduleDistribution.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2">
                        {moduleDistribution.map((m, i) => (
                          <div key={m.name} className="flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span className="text-foreground">{m.name}</span>
                            <span className="text-muted-foreground">({m.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">אין נתונים עדיין</p>
                  )}
                </div>

                {/* Quiz score trend */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                  <h3 className="font-bold text-foreground mb-4">📈 מגמת ציוני חידונים</h3>
                  {xpTimeline.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={xpTimeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: number) => [`${v}%`, "ציון"]} />
                        <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-8">אין נתונים עדיין</p>
                  )}
                </div>
              </motion.div>
            )}

            {tab === "strengths" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Accuracy */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                  <h3 className="font-bold text-foreground mb-3">🎯 דיוק כללי</h3>
                  {(totalCorrect + totalWrong) > 0 ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                          <motion.circle
                            cx="18" cy="18" r="15.5" fill="none"
                            stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round"
                            strokeDasharray={`${(totalCorrect / (totalCorrect + totalWrong)) * 97.5} 97.5`}
                            initial={{ strokeDasharray: "0 97.5" }}
                            animate={{ strokeDasharray: `${(totalCorrect / (totalCorrect + totalWrong)) * 97.5} 97.5` }}
                            transition={{ duration: 1.2 }}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
                          {Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100)}%
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-foreground">✅ {totalCorrect} נכונות</p>
                        <p className="text-sm text-foreground">❌ {totalWrong} שגויות</p>
                        <p className="text-sm text-foreground">🔥 רצף שיא: {highestStreak}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">אין נתונים עדיין</p>
                  )}
                </div>

                {/* Per-module breakdown */}
                {childMemories.length > 0 && (
                  <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                    <h3 className="font-bold text-foreground mb-3">📊 ביצועים לפי מודול</h3>
                    <div className="space-y-3">
                      {childMemories.map(m => {
                        const total = (m.total_correct || 0) + (m.total_wrong || 0);
                        const pct = total > 0 ? Math.round(((m.total_correct || 0) / total) * 100) : 0;
                        return (
                          <div key={m.module}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-foreground">{MODULE_LABELS[m.module] || m.module}</span>
                              <span className="text-muted-foreground">{pct}% ({m.total_correct || 0}/{total})</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8 }}
                                className="h-full bg-primary rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {allStrengths.length > 0 && (
                  <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                    <h3 className="font-bold text-foreground mb-3">💪 נושאים חזקים</h3>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(allStrengths)].map(s => (
                        <span key={s} className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm">✅ {s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weaknesses */}
                {allWeaknesses.length > 0 && (
                  <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                    <h3 className="font-bold text-foreground mb-3">📌 נושאים לשיפור</h3>
                    <div className="flex flex-wrap gap-2">
                      {[...new Set(allWeaknesses)].map(w => (
                        <span key={w} className="bg-destructive/10 text-destructive rounded-full px-3 py-1 text-sm">📍 {w}</span>
                      ))}
                    </div>
                  </div>
                )}

                {childMemories.length === 0 && allStrengths.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">אין נתוני חוזקות וחולשות עדיין. הנתונים יתמלאו ככל שהילד/ה ישתמש/ו יותר.</p>
                  </div>
                )}
              </motion.div>
            )}

            {tab === "settings" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" /> הגדרות עבור {selectedChild?.name}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">⏱ מגבלת זמן מסך (דקות ליום)</label>
                      <div className="flex items-center gap-3">
                        <input type="range" min={10} max={120} step={5} value={screenTimeLimit} onChange={e => setScreenTimeLimit(Number(e.target.value))} className="flex-1" />
                        <span className="text-lg font-bold text-primary w-12 text-center">{screenTimeLimit}</span>
                      </div>
                    </div>
                    <button onClick={updateScreenTime} className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-medium hover:opacity-90 transition-opacity">
                      שמור הגדרות
                    </button>
                  </div>
                </div>
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                  <h3 className="font-bold text-foreground mb-2">👤 פרטי הילד/ה</h3>
                  <p className="text-sm text-muted-foreground">שם: {selectedChild?.name}</p>
                  <p className="text-sm text-muted-foreground">קבוצת גיל: {selectedChild?.age_group}</p>
                  <p className="text-sm text-muted-foreground">רמה: {selectedChild?.level} ({levelTitle})</p>
                  <p className="text-sm text-muted-foreground">XP: {selectedChild?.xp}</p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card rounded-2xl p-4 border border-border text-center shadow-sm"
  >
    <div className="flex justify-center mb-1">{icon}</div>
    <p className="text-xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </motion.div>
);

export default ParentDashboard;

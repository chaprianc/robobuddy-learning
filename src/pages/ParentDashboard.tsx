import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Plus, Clock, BookOpen, Trophy, Settings, Users, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import RoboAvatar from "@/components/RoboAvatar";

interface Child {
  id: string;
  name: string;
  age_group: string;
  screen_time_limit_minutes: number;
}

interface Session {
  module: string;
  duration_minutes: number | null;
  started_at: string;
  messages_count: number | null;
}

interface QuizScore {
  topic: string;
  score: number;
  total: number;
  created_at: string;
}

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState("7-9");
  const [tab, setTab] = useState<"overview" | "settings">("overview");
  const [parentName, setParentName] = useState("");
  const [screenTimeLimit, setScreenTimeLimit] = useState(30);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/parent/auth");
        return;
      }
      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      if (profile) setParentName(profile.name || session.user.email || "");
      loadChildren();
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/parent/auth");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadChildren = async () => {
    setLoading(true);
    const { data } = await supabase.from("children").select("*").order("created_at");
    if (data && data.length > 0) {
      setChildren(data);
      setSelectedChild(data[0]);
      loadChildData(data[0].id);
      setScreenTimeLimit(data[0].screen_time_limit_minutes);
    }
    setLoading(false);
  };

  const loadChildData = async (childId: string) => {
    const [sessionsRes, scoresRes] = await Promise.all([
      supabase.from("learning_sessions").select("*").eq("child_id", childId).order("started_at", { ascending: false }).limit(20),
      supabase.from("quiz_scores").select("*").eq("child_id", childId).order("created_at", { ascending: false }).limit(20),
    ]);
    setSessions(sessionsRes.data || []);
    setQuizScores(scoresRes.data || []);
  };

  const addChild = async () => {
    if (!newChildName.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", session.user.id).single();
    if (!profile) return;

    const { data } = await supabase.from("children").insert({
      parent_id: profile.id,
      name: newChildName.trim(),
      age_group: newChildAge,
    }).select().single();

    if (data) {
      setChildren((prev) => [...prev, data]);
      setSelectedChild(data);
      setNewChildName("");
      setShowAddChild(false);
      loadChildData(data.id);
    }
  };

  const updateScreenTime = async () => {
    if (!selectedChild) return;
    await supabase.from("children").update({ screen_time_limit_minutes: screenTimeLimit }).eq("id", selectedChild.id);
    setChildren((prev) => prev.map((c) => c.id === selectedChild.id ? { ...c, screen_time_limit_minutes: screenTimeLimit } : c));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/parent/auth");
  };

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const avgScore = quizScores.length > 0
    ? Math.round(quizScores.reduce((sum, q) => sum + (q.score / q.total) * 100, 0) / quizScores.length)
    : 0;
  const moduleMap: Record<string, string> = { homework: "שיעורי בית", english: "אנגלית", quiz: "חידון" };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <RoboAvatar size="md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted pb-8">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground"><ArrowRight className="w-5 h-5" /></button>
          <RoboAvatar size="sm" animate={false} />
          <div>
            <p className="font-bold text-foreground text-sm">שלום {parentName} 👋</p>
            <p className="text-xs text-muted-foreground">דשבורד הורים</p>
          </div>
        </div>
        <button onClick={logout} className="text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6">
        {/* Children selector */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => { setSelectedChild(child); loadChildData(child.id); setScreenTimeLimit(child.screen_time_limit_minutes); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedChild?.id === child.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {child.name}
            </button>
          ))}
          <button
            onClick={() => setShowAddChild(true)}
            className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Add child modal */}
        {showAddChild && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl p-5 border border-border shadow-lg mb-6 space-y-3">
            <h3 className="font-bold text-foreground">הוספת ילד/ה</h3>
            <input
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              placeholder="שם הילד/ה"
              className="w-full bg-muted rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={newChildAge}
              onChange={(e) => setNewChildAge(e.target.value)}
              className="w-full bg-muted rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
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

        {children.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-foreground font-medium">אין ילדים עדיין</p>
            <p className="text-muted-foreground text-sm mt-1">לחץ + כדי להוסיף ילד/ה</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setTab("overview")}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === "overview" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}
              >
                📊 סקירה
              </button>
              <button
                onClick={() => setTab("settings")}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === "settings" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}
              >
                ⚙️ הגדרות
              </button>
            </div>

            {tab === "overview" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-sm">
                    <Clock className="w-6 h-6 mx-auto text-primary mb-1" />
                    <p className="text-xl font-bold text-foreground">{totalMinutes}</p>
                    <p className="text-xs text-muted-foreground">דקות למידה</p>
                  </div>
                  <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-sm">
                    <BookOpen className="w-6 h-6 mx-auto text-secondary mb-1" />
                    <p className="text-xl font-bold text-foreground">{sessions.length}</p>
                    <p className="text-xs text-muted-foreground">שיעורים</p>
                  </div>
                  <div className="bg-card rounded-2xl p-4 border border-border text-center shadow-sm">
                    <Trophy className="w-6 h-6 mx-auto text-warning mb-1" />
                    <p className="text-xl font-bold text-foreground">{avgScore}%</p>
                    <p className="text-xs text-muted-foreground">ממוצע חידון</p>
                  </div>
                </div>

                {/* Recent sessions */}
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                  <h3 className="font-bold text-foreground mb-3">📝 פעילות אחרונה</h3>
                  {sessions.length === 0 ? (
                    <p className="text-muted-foreground text-sm">אין פעילות עדיין</p>
                  ) : (
                    <div className="space-y-2">
                      {sessions.slice(0, 5).map((s, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div>
                            <p className="text-sm font-medium text-foreground">{moduleMap[s.module] || s.module}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(s.started_at).toLocaleDateString("he-IL")}
                            </p>
                          </div>
                          <span className="text-sm text-muted-foreground">{s.duration_minutes || 0} דק׳</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quiz scores */}
                {quizScores.length > 0 && (
                  <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                    <h3 className="font-bold text-foreground mb-3">🏆 ציוני חידונים</h3>
                    <div className="space-y-2">
                      {quizScores.slice(0, 5).map((q, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div>
                            <p className="text-sm font-medium text-foreground">{q.topic}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(q.created_at).toLocaleDateString("he-IL")}
                            </p>
                          </div>
                          <span className={`text-sm font-bold ${(q.score / q.total) >= 0.8 ? "text-success" : (q.score / q.total) >= 0.5 ? "text-warning" : "text-destructive"}`}>
                            {q.score}/{q.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" /> הגדרות עבור {selectedChild?.name}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        ⏱ מגבלת זמן מסך (דקות ליום)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={10}
                          max={120}
                          step={5}
                          value={screenTimeLimit}
                          onChange={(e) => setScreenTimeLimit(Number(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-lg font-bold text-primary w-12 text-center">{screenTimeLimit}</span>
                      </div>
                    </div>

                    <button
                      onClick={updateScreenTime}
                      className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-medium hover:opacity-90 transition-opacity"
                    >
                      שמור הגדרות
                    </button>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                  <h3 className="font-bold text-foreground mb-2">👤 פרטי הילד/ה</h3>
                  <p className="text-sm text-muted-foreground">שם: {selectedChild?.name}</p>
                  <p className="text-sm text-muted-foreground">קבוצת גיל: {selectedChild?.age_group}</p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;

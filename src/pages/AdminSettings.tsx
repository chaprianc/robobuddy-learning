import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Volume2, VolumeX, Palette, RotateCcw, Shield, Users,
  Clock, Gauge, Trash2, Download, Baby, GraduationCap, Zap
} from "lucide-react";
import RoboAvatar from "@/components/RoboAvatar";
import { supabase } from "@/integrations/supabase/client";

// --- Storage keys ---
const SETTINGS_KEY = "robo_app_settings";
const PIN_KEY = "robo_parent_pin";

interface AppSettings {
  ttsEnabled: boolean;
  ttsSpeed: number;       // 0.5 - 1.5
  ttsPitch: number;       // 0.5 - 2
  autoSpeak: boolean;     // auto-read bot messages
  defaultDifficulty: "easy" | "medium" | "hard";
  defaultAgeGroup: "5-6" | "7-9" | "10-12" | "13-14";
  soundEffects: boolean;
  animationsEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  ttsEnabled: true,
  ttsSpeed: 0.75,
  ttsPitch: 1.5,
  autoSpeak: true,
  defaultDifficulty: "medium",
  defaultAgeGroup: "7-9",
  soundEffects: true,
  animationsEnabled: true,
};

const loadSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const saveSettings = (s: AppSettings) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));

interface Child {
  id: string;
  name: string;
  age_group: string;
  screen_time_limit_minutes: number;
  xp: number;
  level: number;
}

const AdminSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [children, setChildren] = useState<Child[]>([]);
  const [pin, setPin] = useState(localStorage.getItem(PIN_KEY) || "1234");
  const [newPin, setNewPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [deleteChildId, setDeleteChildId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("parent_auth") !== "true") {
      navigate("/parent/auth");
      return;
    }
    loadChildren();
  }, [navigate]);

  const loadChildren = async () => {
    const { data } = await supabase.from("children").select("*");
    if (data) setChildren(data as Child[]);
  };

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
    flashSaved();
  };

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const changePin = () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinMsg("הפין חייב להיות 4 ספרות");
      return;
    }
    localStorage.setItem(PIN_KEY, newPin);
    setPin(newPin);
    setNewPin("");
    setPinMsg("הפין שונה בהצלחה ✅");
    setTimeout(() => setPinMsg(""), 2000);
  };

  const updateChildScreenTime = async (childId: string, minutes: number) => {
    await supabase.from("children").update({ screen_time_limit_minutes: minutes }).eq("id", childId);
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, screen_time_limit_minutes: minutes } : c));
  };

  const deleteChild = async (childId: string) => {
    await Promise.all([
      supabase.from("badges").delete().eq("child_id", childId),
      supabase.from("quiz_scores").delete().eq("child_id", childId),
      supabase.from("learning_memory").delete().eq("child_id", childId),
      supabase.from("learning_sessions").delete().eq("child_id", childId),
    ]);
    await supabase.from("children").delete().eq("id", childId);
    setChildren(prev => prev.filter(c => c.id !== childId));
    setDeleteChildId(null);
  };

  const resetAllData = async () => {
    for (const child of children) {
      await deleteChild(child.id);
    }
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(PIN_KEY);
    localStorage.removeItem("robo_parent_data");
    setSettings(DEFAULT_SETTINGS);
    setPin("1234");
    setConfirmReset(false);
    setChildren([]);
    flashSaved();
  };

  const exportData = () => {
    const data = {
      settings,
      children,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `robo-settings-${new Date().toLocaleDateString("he-IL")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted pb-10" dir="rtl">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/parent/auth")} className="text-muted-foreground hover:text-foreground">
            <ArrowRight className="w-5 h-5" />
          </button>
          <RoboAvatar size="sm" animate={false} />
          <div>
            <p className="font-bold text-foreground text-sm">⚙️ הגדרות מנהל</p>
            <p className="text-xs text-muted-foreground">ניהול כל הגדרות האפליקציה</p>
          </div>
        </div>
        {saved && (
          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
            נשמר ✓
          </motion.span>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-5">

        {/* ── TTS & Sound ── */}
        <SettingsSection icon={<Volume2 className="w-5 h-5" />} title="קול והקראה">
          <ToggleRow label="הפעלת הקראה (TTS)" checked={settings.ttsEnabled} onChange={v => update("ttsEnabled", v)} />
          <ToggleRow label="הקראה אוטומטית" desc="רובו מקריא הודעות אוטומטית" checked={settings.autoSpeak} onChange={v => update("autoSpeak", v)} />
          <SliderRow label="מהירות דיבור" value={settings.ttsSpeed} min={0.5} max={1.5} step={0.05} display={`${Math.round(settings.ttsSpeed * 100)}%`} onChange={v => update("ttsSpeed", v)} />
          <SliderRow label="גובה קול" value={settings.ttsPitch} min={0.5} max={2} step={0.1} display={`${settings.ttsPitch.toFixed(1)}`} onChange={v => update("ttsPitch", v)} />
          <ToggleRow label="אפקטים קוליים" desc="צלילי אנימציה ואפקטים" checked={settings.soundEffects} onChange={v => update("soundEffects", v)} />
        </SettingsSection>

        {/* ── Display ── */}
        <SettingsSection icon={<Palette className="w-5 h-5" />} title="תצוגה">
          <ToggleRow label="אנימציות" desc="הפעל/כבה אנימציות ממשק" checked={settings.animationsEnabled} onChange={v => update("animationsEnabled", v)} />
        </SettingsSection>

        {/* ── Learning Defaults ── */}
        <SettingsSection icon={<GraduationCap className="w-5 h-5" />} title="ברירות מחדל ללמידה">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">רמת קושי ברירת מחדל</label>
              <div className="flex gap-2 mt-2">
                {([
                  { v: "easy" as const, l: "🌱 קל" },
                  { v: "medium" as const, l: "⭐ בינוני" },
                  { v: "hard" as const, l: "🔥 קשה" },
                ]).map(opt => (
                  <button
                    key={opt.v}
                    onClick={() => update("defaultDifficulty", opt.v)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      settings.defaultDifficulty === opt.v
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-foreground hover:bg-accent"
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">קבוצת גיל ברירת מחדל</label>
              <div className="flex gap-2 mt-2">
                {([
                  { v: "5-6" as const, l: "5-6", icon: <Baby className="w-3.5 h-3.5" /> },
                  { v: "7-9" as const, l: "7-9", icon: <Zap className="w-3.5 h-3.5" /> },
                  { v: "10-12" as const, l: "10-12", icon: <GraduationCap className="w-3.5 h-3.5" /> },
                  { v: "13-14" as const, l: "13-14", icon: <Gauge className="w-3.5 h-3.5" /> },
                ]).map(opt => (
                  <button
                    key={opt.v}
                    onClick={() => update("defaultAgeGroup", opt.v)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                      settings.defaultAgeGroup === opt.v
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-foreground hover:bg-accent"
                    }`}
                  >
                    {opt.icon} {opt.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* ── Children Management ── */}
        <SettingsSection icon={<Users className="w-5 h-5" />} title="ניהול ילדים">
          {children.length === 0 ? (
            <p className="text-sm text-muted-foreground">אין ילדים רשומים עדיין</p>
          ) : (
            <div className="space-y-3">
              {children.map(child => (
                <div key={child.id} className="bg-muted rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{child.name}</p>
                      <p className="text-xs text-muted-foreground">גיל {child.age_group} · רמה {child.level} · {child.xp} XP</p>
                    </div>
                    {deleteChildId === child.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => deleteChild(child.id)} className="text-xs bg-destructive text-destructive-foreground px-3 py-1 rounded-lg font-medium">מחק</button>
                        <button onClick={() => setDeleteChildId(null)} className="text-xs bg-muted-foreground/20 text-foreground px-3 py-1 rounded-lg">ביטול</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteChildId(child.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> מגבלת זמן מסך</label>
                      <span className="text-xs font-bold text-primary">{child.screen_time_limit_minutes} דק׳</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={120}
                      step={5}
                      value={child.screen_time_limit_minutes}
                      onChange={e => updateChildScreenTime(child.id, Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SettingsSection>

        {/* ── PIN ── */}
        <SettingsSection icon={<Shield className="w-5 h-5" />} title="אבטחה">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">קוד PIN נוכחי: <span className="font-mono font-bold text-foreground">{pin}</span></p>
            <div className="flex gap-2">
              <input
                type="tel"
                inputMode="numeric"
                maxLength={4}
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="PIN חדש (4 ספרות)"
                className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
              />
              <button
                onClick={changePin}
                disabled={newPin.length !== 4}
                className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 font-medium text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
              >
                שנה
              </button>
            </div>
            {pinMsg && <p className={`text-sm text-center ${pinMsg.includes("✅") ? "text-primary" : "text-destructive"}`}>{pinMsg}</p>}
          </div>
        </SettingsSection>

        {/* ── Data ── */}
        <SettingsSection icon={<RotateCcw className="w-5 h-5" />} title="נתונים">
          <div className="space-y-3">
            <button onClick={exportData} className="w-full flex items-center justify-center gap-2 bg-muted hover:bg-accent text-foreground rounded-xl py-3 font-medium text-sm transition-colors">
              <Download className="w-4 h-4" /> ייצוא הגדרות
            </button>
            {!confirmReset ? (
              <button onClick={() => setConfirmReset(true)} className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl py-3 font-medium text-sm transition-colors">
                <Trash2 className="w-4 h-4" /> איפוס כל הנתונים
              </button>
            ) : (
              <div className="bg-destructive/10 rounded-xl p-4 space-y-2">
                <p className="text-sm text-destructive font-medium text-center">האם אתה בטוח? כל הנתונים יימחקו!</p>
                <div className="flex gap-2">
                  <button onClick={resetAllData} className="flex-1 bg-destructive text-destructive-foreground rounded-xl py-2 font-medium text-sm">כן, מחק הכל</button>
                  <button onClick={() => setConfirmReset(false)} className="flex-1 bg-muted text-foreground rounded-xl py-2 text-sm">ביטול</button>
                </div>
              </div>
            )}
          </div>
        </SettingsSection>

        {/* Navigate to dashboard */}
        <button
          onClick={() => navigate("/parent")}
          className="w-full bg-card border border-border rounded-2xl py-4 text-center font-medium text-foreground hover:bg-muted transition-colors shadow-sm"
        >
          📊 מעבר לדשבורד הורים
        </button>
      </div>
    </div>
  );
};

/* ── Reusable sub-components ── */

const SettingsSection = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/30">
      <span className="text-primary">{icon}</span>
      <h2 className="font-bold text-foreground text-sm">{title}</h2>
    </div>
    <div className="px-5 py-4">{children}</div>
  </motion.div>
);

const ToggleRow = ({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}
    >
      <motion.span
        layout
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
        style={{ left: checked ? "calc(100% - 1.375rem)" : "0.125rem" }}
      />
    </button>
  </div>
);

const SliderRow = ({ label, value, min, max, step, display, onChange }: {
  label: string; value: number; min: number; max: number; step: number; display: string; onChange: (v: number) => void;
}) => (
  <div className="py-2">
    <div className="flex items-center justify-between mb-1">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <span className="text-xs font-bold text-primary">{display}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full" />
  </div>
);

export default AdminSettings;

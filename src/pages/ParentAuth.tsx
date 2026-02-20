import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import RoboAvatar from "@/components/RoboAvatar";

const ParentAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
      }
      navigate("/parent");
    } catch (err: any) {
      setError(err.message || "שגיאה בהתחברות");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-background to-muted">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center"
      >
        <RoboAvatar size="md" />
        <h1 className="mt-4 text-2xl font-bold text-foreground">כניסת הורים 👨‍👩‍👧</h1>
        <p className="text-muted-foreground mt-1">עקוב אחרי ההתקדמות של ילדך</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="mt-8 w-full max-w-sm bg-card rounded-2xl p-6 shadow-lg border border-border space-y-4"
      >
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">שם</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-muted rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="השם שלך"
              required
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">אימייל</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-muted rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="email@example.com"
            dir="ltr"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">סיסמה</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-muted rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••••••"
            dir="ltr"
            minLength={6}
            required
          />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground font-bold rounded-xl py-3 hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {loading ? "..." : isLogin ? "כניסה" : "הרשמה"}
        </button>

        <button
          type="button"
          onClick={() => { setIsLogin(!isLogin); setError(""); }}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isLogin ? "אין לך חשבון? הירשם" : "יש לך חשבון? התחבר"}
        </button>
      </motion.form>

      <button
        onClick={() => navigate("/")}
        className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← חזרה לרובו
      </button>
    </div>
  );
};

export default ParentAuth;

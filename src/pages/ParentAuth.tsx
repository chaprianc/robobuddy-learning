import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import RoboAvatar from "@/components/RoboAvatar";

const getPin = () => localStorage.getItem("robo_parent_pin") || "1234";

const ParentAuth = () => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pin === getPin()) {
      sessionStorage.setItem("parent_auth", "true");
      navigate("/admin/settings");
    } else {
      setError("הפין שגוי, נסה שוב");
      setPin("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-background to-muted">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
        <RoboAvatar size="md" />
        <h1 className="mt-4 text-2xl font-bold text-foreground">כניסת הורים 🔒</h1>
        <p className="text-muted-foreground mt-1">הזן את קוד הגישה</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="mt-8 w-full max-w-xs bg-card rounded-2xl p-6 shadow-lg border border-border space-y-4"
      >
        <div className="flex justify-center gap-3" dir="ltr">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                pin.length > i
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              {pin[i] ? "●" : ""}
            </div>
          ))}
        </div>

        <input
          type="tel"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
            setPin(v);
          }}
          className="sr-only"
          autoFocus
        />

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-2" dir="ltr">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫"].map((num, i) => (
            <button
              key={i}
              type={num === "⌫" ? "button" : "button"}
              onClick={() => {
                if (num === null) return;
                if (num === "⌫") {
                  setPin((p) => p.slice(0, -1));
                  setError("");
                } else if (pin.length < 4) {
                  setPin((p) => p + num);
                  setError("");
                }
              }}
              className={`h-12 rounded-xl font-bold text-lg transition-all ${
                num === null
                  ? "invisible"
                  : "bg-muted text-foreground hover:bg-primary/10 active:scale-95"
              }`}
            >
              {num}
            </button>
          ))}
        </div>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm text-center">
            {error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={pin.length !== 4}
          className="w-full bg-primary text-primary-foreground font-bold rounded-xl py-3 hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          כניסה
        </button>
      </motion.form>

      <button onClick={() => navigate("/")} className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← חזרה לרובו
      </button>
    </div>
  );
};

export default ParentAuth;

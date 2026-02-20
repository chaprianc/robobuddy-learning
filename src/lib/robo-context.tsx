import React, { createContext, useContext, useState, ReactNode } from "react";

type AgeGroup = "5-6" | "7-9" | "10-12" | "13-14" | null;
type Module = "math" | "reading" | "english" | "quiz" | null;

interface RoboContextType {
  age: AgeGroup;
  setAge: (age: AgeGroup) => void;
  module: Module;
  setModule: (module: Module) => void;
  score: number;
  addScore: (points: number) => void;
  childId: string | null;
  setChildId: (id: string | null) => void;
}

const RoboContext = createContext<RoboContextType | undefined>(undefined);

export const RoboProvider = ({ children }: { children: ReactNode }) => {
  const [age, setAge] = useState<AgeGroup>(null);
  const [module, setModule] = useState<Module>(null);
  const [score, setScore] = useState(0);
  const [childId, setChildId] = useState<string | null>(null);

  return (
    <RoboContext.Provider value={{ age, setAge, module, setModule, score, addScore: (p) => setScore((s) => s + p), childId, setChildId }}>
      {children}
    </RoboContext.Provider>
  );
};

export const useRobo = () => {
  const ctx = useContext(RoboContext);
  if (!ctx) throw new Error("useRobo must be inside RoboProvider");
  return ctx;
};

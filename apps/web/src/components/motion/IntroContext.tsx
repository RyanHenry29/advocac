"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

interface IntroState {
  introDone: boolean;
  finishIntro: () => void;
}

const SEEN_KEY = "advocac_intro_seen";

const IntroContext = createContext<IntroState>({
  introDone: true,
  finishIntro: () => {}
});

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SEEN_KEY) === "1") setIntroDone(true);
    } catch {}
  }, []);

  const finishIntro = useCallback(() => {
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {}
    setIntroDone(true);
  }, []);

  return (
    <IntroContext.Provider value={{ introDone, finishIntro }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro() {
  return useContext(IntroContext);
}

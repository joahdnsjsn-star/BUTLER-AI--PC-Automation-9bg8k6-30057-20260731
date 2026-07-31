/**
 * Butler AI — Cosmetic Context
 * Provides current theme colours and cosmetic settings to all tabs.
 */
import React, { createContext, useContext, useState } from 'react';
import { COLOR } from '@/constants/tokens';

interface CosmeticTheme {
  primary:  string;
  bg:       string;
  surface:  string;
  border:   string;
  text:     string;
  textMid:  string;
  cyan:     string;
  green:    string;
  amber:    string;
  purple:   string;
}

const DEFAULT_THEME: CosmeticTheme = {
  primary:  COLOR.cyan,
  bg:       COLOR.bg,
  surface:  COLOR.surf,
  border:   COLOR.border,
  text:     COLOR.text,
  textMid:  COLOR.textMid,
  cyan:     COLOR.cyan,
  green:    COLOR.green,
  amber:    COLOR.amber,
  purple:   COLOR.purple,
};

const CosmeticContext = createContext<{
  theme: CosmeticTheme;
  setTheme: (t: Partial<CosmeticTheme>) => void;
}>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function CosmeticProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<CosmeticTheme>(DEFAULT_THEME);
  const setTheme = (partial: Partial<CosmeticTheme>) =>
    setThemeState(prev => ({ ...prev, ...partial }));
  return (
    <CosmeticContext.Provider value={{ theme, setTheme }}>
      {children}
    </CosmeticContext.Provider>
  );
}

export function useCosmetic() {
  return useContext(CosmeticContext);
}

import React, { createContext, useContext, useEffect, useState } from "react";

export type ColorTheme = "blue" | "purple" | "green" | "orange" | "rose" | "slate";

interface ThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ColorThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem("color-theme");
    return (saved as ColorTheme) || "blue";
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove("theme-blue", "theme-purple", "theme-green", "theme-orange", "theme-rose", "theme-slate");
    
    // Add current theme class
    root.classList.add(`theme-${colorTheme}`);
    
    // Save to localStorage
    localStorage.setItem("color-theme", colorTheme);
  }, [colorTheme]);

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
  };

  return (
    <ThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useColorTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
};

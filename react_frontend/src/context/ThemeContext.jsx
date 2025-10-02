import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * ThemeContext provides global theme state and helpers.
 * It applies data-theme onto the <body> to enable CSS variables switching
 * and prepares for future dark mode/theming enhancements.
 */
const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

/**
 * PUBLIC_INTERFACE
 * ThemeProvider component to wrap the app and control theme state.
 */
export function ThemeProvider({ initial = "light", children }) {
  const [theme, setTheme] = useState(initial);

  useEffect(() => {
    // Keep body data-theme in sync for global CSS variables
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * PUBLIC_INTERFACE
 * Hook to access theme context in components.
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

export default ThemeContext;

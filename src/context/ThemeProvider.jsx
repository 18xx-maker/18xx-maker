import { createContext, useContext, useEffect, useState } from "react";

const ThemeProviderContext = createContext({ theme: "light" });

export const ThemeProvider = ({ children, ...props }) => {
  const [theme, setTheme] = useState("light");

  const updateTheme = () => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const style = media.matches ? "dark" : "light";
    root.classList.add(style);
    root.style.setProperty("color-scheme", style);
    setTheme(style);

    return media;
  };

  useEffect(() => {
    const media = updateTheme();

    media.addEventListener("change", updateTheme);

    return () => {
      media.removeEventListener("change", updateTheme);
    };
  }, []);

  return (
    <ThemeProviderContext.Provider {...props} value={theme}>
      {children}
    </ThemeProviderContext.Provider>
  );
};
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

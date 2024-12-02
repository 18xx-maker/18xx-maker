import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSelector } from "react-redux";

const ThemeProviderContext = createContext({ theme: "light" });

export const ThemeProvider = ({ children, ...props }) => {
  const settings = useSelector((state) => state.settings);
  const [theme, setTheme] = useState("light");

  const updateTheme = useCallback(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    let style = settings.theme;

    // If there is no setting, that means use the system one
    if (!style) {
      style = media.matches ? "dark" : "light";
    }

    root.classList.add(style);
    root.style.setProperty("color-scheme", style);
    setTheme(style);

    return media;
  }, [settings.theme]);

  useEffect(() => {
    const media = updateTheme();

    media.addEventListener("change", updateTheme);

    return () => {
      media.removeEventListener("change", updateTheme);
    };
  }, [updateTheme]);

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

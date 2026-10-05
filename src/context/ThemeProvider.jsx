import { createContext, useContext, useEffect } from "react";
import { useSelector } from "react-redux";

import { usePrefersDark } from "@/hooks/usePrefersDark";
import { selectTheme } from "@/state/selectors";
import { getRenderInput } from "@/util/renderInput";

const ThemeProviderContext = createContext("light");

export const ThemeProvider = ({ children, ...props }) => {
  const setting = useSelector(selectTheme);
  const prefersDark = usePrefersDark();

  // An export is never themed: the system theme of the machine must not
  // paint the images dark. With no setting, use the system theme.
  const theme = getRenderInput()
    ? "light"
    : (setting ?? (prefersDark ? "dark" : "light"));

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.setProperty("color-scheme", theme);
  }, [theme]);

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

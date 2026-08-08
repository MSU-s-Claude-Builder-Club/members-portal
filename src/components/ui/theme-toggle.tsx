import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  // The glyph shows the mode you would switch TO.
  const Glyph = theme === "light" ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-none border border-border bg-transparent transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground motion-reduce:transition-none"
    >
      <Glyph
        aria-hidden="true"
        className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-[35deg] motion-reduce:transform-none motion-reduce:transition-none"
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

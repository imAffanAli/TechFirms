"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {mounted && isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ORDER = ["light", "dark", "system"] as const;
type ThemeKey = (typeof ORDER)[number];

const LABEL: Record<ThemeKey, string> = {
  light: "亮",
  dark: "暗",
  system: "跟随",
};

const ICON: Record<ThemeKey, string> = {
  light: "☀",
  dark: "☾",
  system: "⌂",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        aria-hidden
        className="fixed top-4 right-4 z-40 w-10 h-10 rounded-full bg-white/0 border border-transparent"
      />
    );
  }

  const current = (
    ORDER.includes((theme ?? "system") as ThemeKey)
      ? theme ?? "system"
      : "system"
  ) as ThemeKey;

  function cycle() {
    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`切换主题（当前：${LABEL[current]}）`}
      title={`主题：${LABEL[current]}（点击切换）`}
      className="fixed top-4 right-4 z-40 inline-flex items-center gap-1.5 px-3 h-10 rounded-full border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur text-sm text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md hover:border-rose-300 dark:hover:border-rose-700 transition"
    >
      <span className="text-base leading-none" aria-hidden>
        {ICON[current]}
      </span>
      <span className="hidden sm:inline text-xs">{LABEL[current]}</span>
    </button>
  );
}

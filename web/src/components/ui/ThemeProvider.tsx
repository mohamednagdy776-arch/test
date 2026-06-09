'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 
  // Base themes
  | 'light' 
  | 'dark'
  // Color variants (light)
  | 'light-green'
  | 'light-blue'
  | 'light-purple'
  | 'light-pink'
  | 'light-orange'
  // Color variants (dark)
  | 'dark-green'
  | 'dark-blue'
  | 'dark-purple'
  | 'dark-pink'
  | 'dark-orange'
  // Special occasion themes
  | 'world-cup'
  | 'winter'
  | 'ramadan'
  | 'summer'
  | 'eid'
  | 'national-day';

interface ThemeContextType {
  theme: Theme;
  themeFamily: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  availableThemes: { value: Theme; label: string; icon: string; category: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// All available themes list
const allThemes: Theme[] = [
  'light', 'dark',
  'light-green', 'light-blue', 'light-purple', 'light-pink', 'light-orange',
  'dark-green', 'dark-blue', 'dark-purple', 'dark-pink', 'dark-orange',
  'world-cup', 'winter', 'ramadan', 'summer', 'eid', 'national-day'
];

export const availableThemes: { value: Theme; label: string; icon: string; category: string }[] = [
  // Base
  { value: 'light', label: 'فاتح', icon: '☀️', category: 'base' },
  { value: 'dark', label: 'داكن', icon: '🌙', category: 'base' },
  // Light variants
  { value: 'light-green', label: 'أخضر فاتح', icon: '🌿', category: 'light' },
  { value: 'light-blue', label: 'أزرق فاتح', icon: '🌊', category: 'light' },
  { value: 'light-purple', label: 'بنفسجي فاتح', icon: '🟣', category: 'light' },
  { value: 'light-pink', label: 'وردي فاتح', icon: '🌸', category: 'light' },
  { value: 'light-orange', label: 'برتقالي فاتح', icon: '🍊', category: 'light' },
  // Dark variants
  { value: 'dark-green', label: 'أخضر داكن', icon: '🌲', category: 'dark' },
  { value: 'dark-blue', label: 'أزرق داكن', icon: '🌌', category: 'dark' },
  { value: 'dark-purple', label: 'بنفسجي داكن', icon: '🦋', category: 'dark' },
  { value: 'dark-pink', label: 'وردي داكن', icon: '🌺', category: 'dark' },
  { value: 'dark-orange', label: 'برتقالي داكن', icon: '🎃', category: 'dark' },
  // Special occasions
  { value: 'world-cup', label: 'كأس العالم', icon: '🏆', category: 'special' },
  { value: 'winter', label: 'شتاء', icon: '❄️', category: 'special' },
  { value: 'ramadan', label: 'رمضان', icon: '🌙', category: 'special' },
  { value: 'summer', label: 'صيف', icon: '☀️', category: 'special' },
  { value: 'eid', label: 'عيد', icon: '🎉', category: 'special' },
  { value: 'national-day', label: 'اليوم الوطني', icon: '🇸🇦', category: 'special' },
];

// Get the theme family (light or dark) based on theme name
function getThemeFamily(theme: Theme): 'light' | 'dark' {
  // Light family themes
  if (theme === 'light' || theme.startsWith('light-')) return 'light';
  // Dark family themes
  if (theme === 'dark' || theme.startsWith('dark-')) return 'dark';
  // Special themes default to dark in dark mode context
  const isDarkSystem = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDarkSystem ? 'dark' : 'light';
}

// Apply theme classes synchronously to prevent flash
function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  
  // Remove all theme classes
  allThemes.forEach(t => document.documentElement.classList.remove(t));
  
  // Add current theme class
  document.documentElement.classList.add(theme);
  
  // Set data attribute for CSS variable overrides
  document.documentElement.setAttribute('data-theme', theme);
}

// Get initial theme - runs before React hydrates
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored && allThemes.includes(stored)) {
    return stored;
  }
  // Check system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

// Initialize theme before hydration to prevent flash
function initTheme() {
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);
  return initialTheme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  const themeFamily = getThemeFamily(theme);

  // Initialize theme on first render
  useEffect(() => {
    const initialTheme = initTheme();
    setThemeState(initialTheme);
    setMounted(true);
  }, []);

  // Persist theme changes to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', theme);
      applyTheme(theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const newTheme = themeFamily === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Provide theme context immediately after mount to prevent content flash
  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : 'light', themeFamily, toggleTheme, setTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
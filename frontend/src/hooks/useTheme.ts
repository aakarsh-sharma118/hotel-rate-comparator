/**
 * Theme hook.
 */

import { useHotelStore } from '../store/useHotelStore';

export type ThemeMode = 'light' | 'dark';

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useHotelStore();

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    setTheme,
  };
}

export default useTheme;

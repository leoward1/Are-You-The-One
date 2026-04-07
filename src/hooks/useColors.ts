import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS, type AppColors } from '../utils/theme';

export const useColors = (): AppColors => {
  const { mode } = useThemeStore();
  const systemScheme = useColorScheme();
  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  return isDark ? DARK_COLORS : LIGHT_COLORS;
};

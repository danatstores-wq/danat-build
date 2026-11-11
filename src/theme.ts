import { StyleSheet } from 'react-native';

export type AppTheme = 'dark' | 'light';

// Warm Ivory & Gold: softer contrast than pure white, with warm stone surfaces.
const LIGHT_COLORS: Record<string, string> = {
  '#030406': '#E8E1D5',
  '#080B0E': '#F1ECE2',
  '#080b0e': '#F1ECE2',
  '#101419': '#EAE3D7',
  '#11161c': '#FBF8F1',
  '#17110a': '#3B3327',
  '#171b20': '#EDE6DA',
  '#171c22': '#FBF8F1',
  '#191e24': '#FBF8F1',
  '#1c1a15': '#E8DFD0',
  '#202019': '#E8DFD0',
  '#20262d': '#F0E9DE',
  '#20272b': '#F0E9DE',
  '#242019': '#E9E0D1',
  '#292319': '#E9E0D1',
  '#2a2117': '#F0E6D6',
  '#2a2216': '#E9E0D1',
  '#292f36': '#E5DCCF',
  '#343a40': '#DED5C8',
  '#333': '#D8CDBD',
  '#363a3d': '#DED5C8',
  '#39352d': '#D8CDBD',
  '#3b4145': '#D8CDBD',
  '#45484d': '#CFC3B1',
  '#51432f': '#D8C8AE',
  '#514b40': '#D8C8AE',
  '#57472d': '#D8C8AE',
  '#5b5142': '#D8C8AE',
  '#625239': '#D8C8AE',
  '#66553a': '#D8C8AE',
  '#6b5736': '#CDBB9D',
  '#6c5938': '#CDBB9D',
  '#80623b': '#C4AE88',
  '#92979d': '#777064',
  '#aeb2b8': '#71695D',
  '#aeb4bb': '#71695D',
  '#aaa': '#71695D',
  '#b7bbc0': '#71695D',
  '#b8b8b8': '#71695D',
  '#c4c4c4': '#71695D',
  '#c5c9ce': '#71695D',
  '#c7c9cb': '#62594D',
  '#ddd': '#51483D',
  '#ddd0b5': '#6D5B40',
  '#e2d7c5': '#71624E',
  '#eee': '#3B3327',
  '#f1f1f1': '#3B3327',
  '#f5f3ef': '#71695D',
  '#fff': '#302C26',
  '#ffffff': '#302C26',
  '#E9B85D': '#B98A3E',
  '#e9b85d': '#B98A3E',
  '#b7a27f': '#806D4C',
};

export function getThemedStyles<T extends Record<string, any>>(styles: T, theme: AppTheme): T {
  if (theme === 'dark') return styles;
  const result: Record<string, any> = {};
  for (const [key, source] of Object.entries(styles)) {
    const flat = StyleSheet.flatten(source) || {};
    const next: Record<string, any> = { ...flat };
    for (const property of ['backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor', 'color', 'shadowColor']) {
      const value = next[property];
      if (typeof value === 'string' && LIGHT_COLORS[value]) {
        next[property] = LIGHT_COLORS[value];
      }
    }
    result[key] = next;
  }
  return StyleSheet.create(result) as T;
}

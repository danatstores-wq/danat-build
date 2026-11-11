import { StyleSheet } from 'react-native';

export type AppTheme = 'dark' | 'light';

const LIGHT_COLORS: Record<string, string> = {
  '#030406': '#f3f5f8',
  '#080B0E': '#f5f7fa',
  '#080b0e': '#f5f7fa',
  '#101419': '#ffffff',
  '#11161c': '#ffffff',
  '#17110a': '#332715',
  '#171b20': '#ffffff',
  '#171c22': '#ffffff',
  '#191e24': '#ffffff',
  '#1c1a15': '#fffaf0',
  '#202019': '#fffaf0',
  '#20262d': '#f1f4f7',
  '#20272b': '#f1f4f7',
  '#242019': '#fff4dc',
  '#292319': '#fff4dc',
  '#292f36': '#ffffff',
  '#2a2117': '#fff7e8',
  '#2a2216': '#e4e8ee',
  '#343a40': '#e5e9ef',
  '#333': '#e5e9ef',
  '#363a3d': '#e5e9ef',
  '#39352d': '#e5e9ef',
  '#3b4145': '#e5e9ef',
  '#45484d': '#d7dde5',
  '#51432f': '#e7dcc8',
  '#514b40': '#e0d8ca',
  '#57472d': '#e7dcc8',
  '#5b5142': '#e7dcc8',
  '#625239': '#e7dcc8',
  '#66553a': '#e7dcc8',
  '#6b5736': '#e7dcc8',
  '#6c5938': '#e7dcc8',
  '#80623b': '#e7dcc8',
  '#92979d': '#77808d',
  '#aeb2b8': '#657184',
  '#aeb4bb': '#657184',
  '#aaa': '#657184',
  '#b7bbc0': '#657184',
  '#b8b8b8': '#657184',
  '#c4c4c4': '#657184',
  '#c5c9ce': '#657184',
  '#c7c9cb': '#526071',
  '#ddd': '#263244',
  '#ddd0b5': '#526071',
  '#e2d7c5': '#526071',
  '#eee': '#263244',
  '#f1f1f1': '#263244',
  '#f5f3ef': '#526071',
  '#fff': '#202b3b',
  '#ffffff': '#202b3b',
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

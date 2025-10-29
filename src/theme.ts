// src/theme.ts
export const Theme = {
  colors: {
    primary: '#28A745',     
    primaryLight: '#4CAF50',
    accent: '#FF9800',      
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    error: '#D32F2F',
    border: '#E0E0E0',
  },
  spacing: (factor: number = 1) => 8 * factor,
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  shadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  typography: {
    h1: { fontSize: 28, fontWeight: '700' } as const,
    h2: { fontSize: 22, fontWeight: '600' } as const,
    body: { fontSize: 16 } as const,
    caption: { fontSize: 13, color: '#757575' } as const,
  },
};
export const Theme = {
  colors: {
    primary: '#FF6B35',
    primaryDark: '#E55A2B',
    background: '#0D0D0D',
    surface: '#1A1A1A',
    surfaceLight: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#333333',
    success: '#4CAF50',
    error: '#F44336',
  },
  spacing: (n = 1) => 8 * n,
  radius: { sm: 12, md: 16, lg: 24 },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  typography: {
    h1: { fontFamily: 'Inter_700Bold', fontSize: 32 },
    h2: { fontFamily: 'Inter_600SemiBold', fontSize: 24 },
    body: { fontFamily: 'Inter_400Regular', fontSize: 16 },
    caption: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#B0B0B0' },
  },
} as const;
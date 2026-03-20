import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import App from './App.tsx'

const theme = createTheme({
  palette: {
    primary: { main: '#1a73e8', light: '#4285f4', dark: '#1557b0' },
    secondary: { main: '#34a853', light: '#43c764', dark: '#2d8f45' },
    background: { default: '#f8f9fa', paper: '#ffffff' },
    text: { primary: '#1f1f1f', secondary: '#6b7280' },
    error: { main: '#dc2626', light: '#ef4444', dark: '#b91c1c' },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    success: { main: '#15803d', light: '#22c55e', dark: '#166534' },
  },
  typography: {
    fontFamily: '"Google Sans", "Roboto", system-ui, -apple-system, sans-serif',
    htmlFontSize: 14,
    h1: { fontFamily: '"Google Sans", "Roboto", sans-serif', fontWeight: 500 },
    h2: { fontFamily: '"Google Sans", "Roboto", sans-serif', fontWeight: 500 },
    h3: { fontFamily: '"Google Sans", "Roboto", sans-serif', fontWeight: 500 },
    h4: { fontFamily: '"Google Sans", "Roboto", sans-serif', fontWeight: 500 },
    h5: { fontFamily: '"Google Sans", "Roboto", sans-serif', fontWeight: 500 },
    h6: { fontFamily: '"Google Sans", "Roboto", sans-serif', fontWeight: 500 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 },
    button: { fontWeight: 500, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.04)',
    '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    '0 2px 4px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    '0 2px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
    '0 3px 8px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
    '0 4px 10px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
    '0 4px 12px rgba(0,0,0,0.1), 0 3px 6px rgba(0,0,0,0.08)',
    '0 6px 14px rgba(0,0,0,0.12), 0 3px 6px rgba(0,0,0,0.08)',
    '0 8px 18px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.08)',
    '0 10px 20px rgba(0,0,0,0.14), 0 4px 8px rgba(0,0,0,0.08)',
    '0 12px 24px rgba(0,0,0,0.14), 0 6px 12px rgba(0,0,0,0.1)',
    '0 14px 28px rgba(0,0,0,0.16), 0 6px 12px rgba(0,0,0,0.1)',
    '0 16px 32px rgba(0,0,0,0.16), 0 8px 16px rgba(0,0,0,0.12)',
    '0 18px 36px rgba(0,0,0,0.18), 0 8px 16px rgba(0,0,0,0.12)',
    '0 20px 40px rgba(0,0,0,0.18), 0 10px 20px rgba(0,0,0,0.14)',
    '0 22px 44px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.14)',
    '0 24px 48px rgba(0,0,0,0.2), 0 12px 24px rgba(0,0,0,0.16)',
    '0 26px 52px rgba(0,0,0,0.22), 0 12px 24px rgba(0,0,0,0.16)',
    '0 28px 56px rgba(0,0,0,0.22), 0 14px 28px rgba(0,0,0,0.18)',
    '0 30px 60px rgba(0,0,0,0.24), 0 14px 28px rgba(0,0,0,0.18)',
    '0 32px 64px rgba(0,0,0,0.24), 0 16px 32px rgba(0,0,0,0.2)',
    '0 34px 68px rgba(0,0,0,0.26), 0 16px 32px rgba(0,0,0,0.2)',
    '0 36px 72px rgba(0,0,0,0.26), 0 18px 36px rgba(0,0,0,0.22)',
    '0 38px 76px rgba(0,0,0,0.28), 0 18px 36px rgba(0,0,0,0.22)',
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: 14,
          letterSpacing: '0.02em',
          borderRadius: 8,
          padding: '10px 20px',
        },
        contained: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          },
        },
        outlined: {
          borderWidth: 1,
          '&:hover': {
            borderWidth: 1,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.05)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: 14,
          letterSpacing: '0.01em',
          minHeight: 40,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: 12,
          letterSpacing: '0.01em',
        },
        label: {
          paddingLeft: 12,
          paddingRight: 12,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: 14,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: 14,
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          '&:before': {
            display: 'none',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        },
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)

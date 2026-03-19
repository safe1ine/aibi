import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import App from './App.tsx'

const theme = createTheme({
  palette: {
    primary: { main: '#1E40AF', light: '#3B82F6', dark: '#1e3a8a' },
    secondary: { main: '#F59E0B' },
    background: { default: '#F8FAFC', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#475569' },
  },
  typography: {
    fontFamily: '"Fira Sans", system-ui, sans-serif',
    h1: { fontFamily: '"Fira Code", monospace' },
    h2: { fontFamily: '"Fira Code", monospace' },
    h3: { fontFamily: '"Fira Code", monospace' },
    h4: { fontFamily: '"Fira Code", monospace' },
    h5: { fontFamily: '"Fira Code", monospace' },
    h6: { fontFamily: '"Fira Code", monospace' },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, borderRadius: 8 },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(30,64,175,0.25)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
          transition: 'box-shadow 0.2s ease',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, fontSize: 14 },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500 } },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
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

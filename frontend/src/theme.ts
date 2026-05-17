import { createTheme } from '@mui/material/styles';

export const buildTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#1E6FD9',
      },
      background: {
        default: mode === 'light' ? '#F7FBFC' : '#0C1421',
        paper: mode === 'light' ? '#FFFFFF' : '#101B2D',
      },
      text: {
        primary: mode === 'light' ? '#132238' : '#EAF2FF',
        secondary: mode === 'light' ? '#5B6B7A' : '#A8B6CC',
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 750 },
      h4: { fontWeight: 750 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            border: '1px solid rgba(30, 111, 217, 0.08)',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
      },
    },
  });

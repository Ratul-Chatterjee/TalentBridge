import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './auth';
import { buildTheme } from './theme';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
const Root = () => {
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider theme={buildTheme(mode)}>
          <CssBaseline />
          <App mode={mode} onToggleMode={() => setMode(current => (current === 'light' ? 'dark' : 'light'))} />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { HelmetProvider } from 'react-helmet-async';
import { theme } from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;

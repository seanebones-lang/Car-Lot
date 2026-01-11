import React, { useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import i18n from './i18n';
import Layout from './components/Layout';
import Login from './components/Login';
import { useAppStore } from './stores/useAppStore';

const App: React.FC = () => {
  const { user } = useAppStore();
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);

  // For development, skip login - remove this in production
  React.useEffect(() => {
    if (!user) {
      setIsAuthenticated(true); // Skip auth for now
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <I18nextProvider i18n={i18n}>
        <Login onLogin={() => setIsAuthenticated(true)} />
        <Toaster position="top-right" />
      </I18nextProvider>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <Layout />
        <Toaster position="top-right" />
      </BrowserRouter>
    </I18nextProvider>
  );
};

export default App;

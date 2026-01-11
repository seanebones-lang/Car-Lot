import { create } from 'zustand';
import i18n from '../i18n';

interface AppState {
  language: string;
  theme: 'light' | 'dark';
  user: any | null;
  setLanguage: (lang: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setUser: (user: any | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  theme: 'light',
  user: null,
  setLanguage: (lang: string) => {
    i18n.changeLanguage(lang);
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lang;
    }
    set({ language: lang });
  },
  setTheme: (theme: 'light' | 'dark') => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    set({ theme });
  },
  setUser: (user: any | null) => set({ user }),
}));

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';
import { toast } from 'react-hot-toast';
import { Save, Key, Globe, Moon, Sun } from 'lucide-react';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { language, theme, setLanguage, setTheme } = useAppStore();
  const [apiKey, setApiKey] = useState('');
  const [enableTranslation, setEnableTranslation] = useState(false);
  const [autoLock, setAutoLock] = useState(false);
  const [lockAfter, setLockAfter] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load settings from database
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // This would load from database via IPC
      // For now, using local state
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await window.electronAPI.users.updateSettings({
        language,
        theme,
        translationApiKey: apiKey,
        enableTranslation,
        autoLock,
        lockAfter,
      });
      toast.success(t('common.success'));
    } catch (error) {
      toast.error(t('common.error'));
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('settings.title')}</h1>

      <div className="space-y-6">
        {/* Language Settings */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold">{t('settings.language')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.language')}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>
        </section>

        {/* Theme Settings */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-gray-600" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600" />
            )}
            <h2 className="text-xl font-semibold">{t('settings.theme')}</h2>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === 'light'}
                  onChange={() => setTheme('light')}
                  className="w-4 h-4 text-blue-600"
                />
                <span>{t('settings.light')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={theme === 'dark'}
                  onChange={() => setTheme('dark')}
                  className="w-4 h-4 text-blue-600"
                />
                <span>{t('settings.dark')}</span>
              </label>
            </div>
          </div>
        </section>

        {/* Translation API Settings */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold">{t('settings.translationApi')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.apiKey')}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter Google Cloud Translation API key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter the path to your Google Cloud credentials JSON file or API key
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enableTranslation"
                checked={enableTranslation}
                onChange={(e) => setEnableTranslation(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableTranslation" className="text-sm font-medium text-gray-700">
                {t('settings.enableTranslation')}
              </label>
            </div>
          </div>
        </section>

        {/* Security Settings */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{t('settings.autoLock')}</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoLock"
                checked={autoLock}
                onChange={(e) => setAutoLock(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="autoLock" className="text-sm font-medium text-gray-700">
                {t('settings.autoLock')}
              </label>
            </div>
            {autoLock && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('settings.lockAfter')}
                </label>
                <input
                  type="number"
                  value={lockAfter}
                  onChange={(e) => setLockAfter(parseInt(e.target.value) || 30)}
                  min="1"
                  max="120"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../stores/useAppStore';
import { 
  Car, 
  Users, 
  ShoppingCart, 
  Calendar, 
  BarChart3, 
  Settings,
  Globe
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { language, setLanguage } = useAppStore();

  const menuItems = [
    { path: '/inventory', icon: Car, label: t('navigation.inventory') },
    { path: '/crm', icon: Users, label: t('navigation.crm') },
    { path: '/sales', icon: ShoppingCart, label: t('navigation.sales') },
    { path: '/scheduling', icon: Calendar, label: t('navigation.scheduling') },
    { path: '/reports', icon: BarChart3, label: t('navigation.reports') },
    { path: '/settings', icon: Settings, label: t('navigation.settings') },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">{t('common.appName')}</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4" />
          <span className="text-sm text-gray-400">{t('settings.language')}</span>
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
          <option value="es">Español</option>
        </select>
      </div>
    </aside>
  );
};

export default Sidebar;

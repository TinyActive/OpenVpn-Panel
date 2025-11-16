import { NavLink } from 'react-router-dom';
import { FiGrid, FiUsers, FiServer, FiSettings, FiLayers } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import logoSrc from '../assets/Logo-Landscape-Dark.webp';
import LanguageSwitcher from './LanguageSwitcher';
import { settingsAPI } from '../services/api';

const Sidebar = () => {
  const { t } = useTranslation();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // Check if this is super admin panel
    const checkPanelType = async () => {
      try {
        const response = await settingsAPI.getPanelInfo();
        if (response.data.success) {
          setIsSuperAdmin(response.data.data.is_super_admin);
        }
      } catch (error) {
        console.error('Error checking panel type:', error);
      }
    };
    checkPanelType();
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        {/* اصلاح: تگ img مستقیماً با کلاس جدید استایل‌دهی می‌شود */}
        <img
          src={logoSrc}
          alt="Panel Logo"
          className="sidebar-logo" // کلاس جدید برای استایل‌دهی
        />
      </div>
      <nav>
        <ul>
          <li>
            <NavLink to="/" end className="nav-link">
              <div className="icon-wrapper">
                <FiGrid size={22} />
              </div>
              <span>{t('dashboard')}</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/users" className="nav-link">
              <div className="icon-wrapper">
                <FiUsers size={22} />
              </div>
              <span>{t('userManagement')}</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/nodes" className="nav-link">
              <div className="icon-wrapper">
                <FiServer size={22} />
              </div>
              <span>{t('nodeManagement')}</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className="nav-link">
              <div className="icon-wrapper">
                <FiSettings size={22} />
              </div>
              <span>{t('settings', 'Settings')}</span>
            </NavLink>
          </li>
          {isSuperAdmin && (
            <li>
              <NavLink to="/whitelabel" className="nav-link">
                <div className="icon-wrapper">
                  <FiLayers size={22} />
                </div>
                <span>White-Label</span>
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <LanguageSwitcher />
      </div>
    </aside>
  );
};

export default Sidebar;
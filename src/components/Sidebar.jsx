import React from 'react';
import { 
  BarChart2, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings as SettingsIcon, 
  LogOut,
  Home,
  Ticket,
  Tag,
  Clock
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMediaUrl, getUserAvatar } from '../utils';
import './Sidebar.css';

export default function Sidebar({ user, onLogout }) {
  const { t } = useTranslation();
  
  const menuItems = [
    { path: '/', name: t('menu.dashboard'), icon: <Home size={20} />, roles: ['Administrator', 'Supervisor', 'Cashier'] },
    { path: '/sales', name: t('menu.sales'), icon: <ShoppingCart size={20} />, roles: ['Administrator', 'Supervisor', 'Cashier'] },
    { path: '/sales-history', name: 'Historial', icon: <Clock size={20} />, roles: ['Administrator', 'Supervisor'] },
    { path: '/products', name: t('menu.products'), icon: <Package size={20} />, roles: ['Administrator', 'Supervisor'] },
    { path: '/categories', name: t('menu.categories') || 'Categorías', icon: <Tag size={20} />, roles: ['Administrator', 'Supervisor'] },
    { path: '/clients', name: t('menu.clients'), icon: <Users size={20} />, roles: ['Administrator', 'Supervisor', 'Cashier'] },
    { path: '/coupons', name: t('menu.coupons') || 'Cupones', icon: <Ticket size={20} />, roles: ['Administrator', 'Supervisor'] },
    { path: '/reports', name: t('menu.reports'), icon: <BarChart2 size={20} />, roles: ['Administrator', 'Supervisor'] },
    { path: '/settings', name: t('menu.settings'), icon: <SettingsIcon size={20} />, roles: ['Administrator'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sidebar-logo-svg">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <span className="sidebar-brand">{t('common.menu')}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {filteredMenu.map(item => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/profile" className="sidebar-user">
          <div className="sidebar-avatar-wrap">
            <img src={getUserAvatar(user)} alt={user.role} className="sidebar-avatar" />
            <span className="sidebar-status" />
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-username">{user.username}</p>
            <p className="sidebar-role">{user.role}</p>
          </div>
        </Link>
        <button className="sidebar-logout" onClick={onLogout} title="Cerrar sesión">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}

import React from 'react';
import { 
  BarChart2, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings as SettingsIcon, 
  LogOut,
  ChevronRight,
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
  const isAdmin = user.role === 'Administrator';
  const isSupervisor = user.role === 'Supervisor';
  
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
        <h3>{t('common.menu') || 'Menu'}</h3>
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
            <ChevronRight size={16} className="chevron" />
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <Link to="/profile" className="user-info-link">
          <div className="user-info">
            <div className="user-avatar-img">
              <img src={getUserAvatar(user)} alt={user.role} />
            </div>
            <div className="user-details">
              <p className="username">{user.username}</p>
              <p className="role">{user.role}</p>
            </div>
          </div>
        </Link>
        <button className="logout-button" onClick={onLogout}>
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}

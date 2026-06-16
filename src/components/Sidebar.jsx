import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, ShoppingCart, History, Package, Tags, Users, TicketPercent,
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, User
} from 'lucide-react';
import { getMediaUrl, getUserAvatar } from '../utils';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'menu.dashboard', roles: ['Administrator', 'Supervisor', 'Cashier'] },
  { to: '/sales', icon: ShoppingCart, label: 'menu.sales', roles: ['Administrator', 'Supervisor', 'Cashier'] },
  { to: '/sales-history', icon: History, label: 'menu.sales_history', roles: ['Administrator', 'Supervisor'] },
  { to: '/products', icon: Package, label: 'menu.products', roles: ['Administrator', 'Supervisor'] },
  { to: '/categories', icon: Tags, label: 'menu.categories', roles: ['Administrator', 'Supervisor'] },
  { to: '/clients', icon: Users, label: 'menu.clients', roles: ['Administrator', 'Supervisor', 'Cashier'] },
  { to: '/coupons', icon: TicketPercent, label: 'menu.coupons', roles: ['Administrator', 'Supervisor'] },
  { to: '/reports', icon: BarChart3, label: 'menu.reports', roles: ['Administrator', 'Supervisor'] },
  { to: '/settings', icon: Settings, label: 'menu.settings', roles: ['Administrator'] },
];

export default function Sidebar({ user, onLogout }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);

  const userRole = user?.role || 'Cashier';
  const visibleItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-sm font-bold shadow-lg shrink-0">
            TN
          </div>
          {!collapsed && <span className="text-sm font-bold text-on-surface tracking-tight">Tu Negocio</span>}
        </div>
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? t('common.show') : t('common.hide')}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              {!collapsed && <span>{t(item.label)}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            <img src={getUserAvatar(user)} alt="avatar" />
            <span className="online-dot" />
          </div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <NavLink to="/profile" className="sidebar-username">{user?.username}</NavLink>
              <span className="sidebar-role">{user?.role}</span>
            </div>
          )}
        </div>

        <button className="logout-btn" onClick={onLogout} title={t('menu.logout')}>
          <LogOut size={18} />
          {!collapsed && <span>{t('menu.logout')}</span>}
        </button>
      </div>
    </aside>
  );
}

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../ToastContext';
import { Eye, EyeOff, Shield } from 'lucide-react';
import './Permissions.css';

export default function Permissions() {
  const { t } = useTranslation();
  const showToast = useToast();
  const [permissions, setPermissions] = useState({
    Administrator: ['Dashboard', 'Ventas', 'Productos', 'Clientes', 'Reportes', 'Configuración'],
    Supervisor: ['Dashboard', 'Ventas', 'Productos', 'Clientes', 'Reportes'],
    Cashier: ['Dashboard', 'Ventas', 'Clientes']
  });

  const sections = ['Dashboard', 'Ventas', 'Productos', 'Clientes', 'Reportes', 'Configuración'];
  const roles = ['Administrator', 'Supervisor', 'Cashier'];

  const sectionLabels = {
    'Dashboard': t('menu.dashboard'),
    'Ventas': t('menu.sales'),
    'Productos': t('menu.products'),
    'Clientes': t('menu.clients'),
    'Reportes': t('menu.reports'),
    'Configuración': t('menu.settings'),
  };

  const togglePermission = (role, section) => {
    setPermissions(prev => {
      const rolePerms = prev[role];
      const newPerms = rolePerms.includes(section)
        ? rolePerms.filter(s => s !== section)
        : [...rolePerms, section];
      return { ...prev, [role]: newPerms };
    });
  };

  const savePermissions = () => {
    localStorage.setItem('section_permissions', JSON.stringify(permissions));
    showToast(t('permissions.save_success') || 'Permisos actualizados', 'success');
  };

  return (
    <div className="permissions-page">
      <div className="page-header">
        <div className="header-info">
          <Shield size={28} className="header-icon" />
          <div>
            <h2>{t('permissions.title')}</h2>
            <p>{t('permissions.subtitle')}</p>
          </div>
        </div>
        <button className="btn-primary" onClick={savePermissions}>{t('permissions.save_changes') || 'Guardar Cambios'}</button>
      </div>

      <div className="permissions-table-wrapper">
        <table className="permissions-table">
          <thead>
            <tr>
              <th>{t('permissions.section_header')}</th>
              {roles.map(role => <th key={role}>{role}</th>)}
            </tr>
          </thead>
          <tbody>
            {sections.map(section => (
              <tr key={section}>
                <td className="section-name">{sectionLabels[section] || section}</td>
                {roles.map(role => (
                   <td key={role} className="toggle-cell">
                    <button 
                      className={`toggle-btn ${permissions[role].includes(section) ? 'visible' : 'hidden'}`}
                      onClick={() => togglePermission(role, section)}
                      title={permissions[role].includes(section) ? t('common.hide') : t('common.show')}
                    >
                      {permissions[role].includes(section) ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

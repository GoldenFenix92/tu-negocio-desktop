import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Save, Camera, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../ToastContext';
import { getMediaUrl } from '../utils';
import './UserProfile.css';

export default function UserProfile({ user, onUpdateUser }) {
  const { t } = useTranslation();
  const showToast = useToast();
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    image_path: user.image_path || ''
  });
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const getAvatarImage = (path) => getMediaUrl(path, `assets/${user.role === 'Administrator' ? 'administrador.webp' : user.role === 'Supervisor' ? 'supervisor.webp' : 'empleado.webp'}`);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.path) {
      const savedPath = await window.api.saveImage(file.path, 'users');
      if (savedPath) {
        setFormData(prev => ({ ...prev, image_path: savedPath }));
      }
    }
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    try {
      const sql = 'UPDATE users SET username = ?, image_path = ? WHERE id = ?';
      await window.api.dbQuery(sql, [formData.username, formData.image_path || null, user.id]);
      
      const updatedUser = { ...user, username: formData.username, image_path: formData.image_path };
      onUpdateUser(updatedUser);
      showToast(t('common.save_success'), 'success');
    } catch (err) {
      console.error('Error updating profile', err);
      showToast(t('common.save_error'), 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast(t('users.password_mismatch'), 'warning');
      return;
    }

    try {
      const userRes = await window.api.dbQuery('SELECT password FROM users WHERE id = ?', [user.id]);
      const isMatch = await window.api.comparePassword(passwords.oldPassword, userRes[0].password);
      
      if (!isMatch) {
        showToast(t('users.password_error'), 'error');
        return;
      }

      const newHash = await window.api.hashPassword(passwords.newPassword);
      await window.api.dbQuery('UPDATE users SET password = ? WHERE id = ?', [newHash, user.id]);
      
      showToast(t('users.password_updated'), 'success');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (err) {
      console.error('Error changing password', err);
      showToast(t('common.save_error'), 'error');
    }
  };

  return (
    <div className="user-profile">
      <div className="page-header">
        <div className="header-info">
          <User size={28} className="header-icon" />
          <div>
            <h2>{t('users.edit_profile')}</h2>
            <p>{user.role}</p>
          </div>
        </div>
      </div>

      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar-card">
            <div className="avatar-wrapper">
              <img src={getAvatarImage(formData.image_path)} alt="Profile" />
              <label className="avatar-edit-overlay">
                <Camera size={24} />
                <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
              </label>
            </div>
            <h3>{formData.username}</h3>
            <span className="role-badge">{user.role}</span>
          </div>

          <button 
            className={`btn-link ${isChangingPassword ? 'active' : ''}`}
            onClick={() => setIsChangingPassword(!isChangingPassword)}
          >
            <Lock size={18} /> {isChangingPassword ? 'Volver a Información' : t('users.password')}
          </button>
        </div>

        <div className="profile-main">
          {!isChangingPassword ? (
            <form onSubmit={handleSaveInfo} className="profile-form">
              <h3>{t('common.info')}</h3>
              <div className="form-group">
                <label>{t('users.username')}</label>
                <div className="input-with-icon">
                  <User size={18} />
                  <input 
                    type="text" 
                    value={formData.username} 
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary">
                <Save size={18} /> {t('common.save')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="profile-form">
              <h3>{t('users.edit_password') || 'Modificar Contraseña'}</h3>
              <div className="form-group">
                <label>{t('users.current_password')}</label>
                <input 
                  type="password" 
                  value={passwords.oldPassword} 
                  onChange={e => setPasswords({...passwords, oldPassword: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>{t('users.new_password')}</label>
                <input 
                  type="password" 
                  value={passwords.newPassword} 
                  onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>{t('users.confirm_password')}</label>
                <input 
                  type="password" 
                  value={passwords.confirmPassword} 
                  onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                  required 
                />
              </div>
              <button type="submit" className="btn-primary">
                <Save size={18} /> {t('users.update_password') || 'Actualizar Contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

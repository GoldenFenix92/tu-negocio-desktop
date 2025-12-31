import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './Clients.css';

export default function Clients() {
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', image_path: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const results = await window.api.dbQuery('SELECT * FROM clients ORDER BY id DESC');
      setClients(results);
    } catch (err) {
      console.error('Error loading clients', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        image_path: client.image_path || ''
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', email: '', phone: '', address: '', image_path: '' });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.path) {
      const savedPath = await window.api.saveImage(file.path, 'clients');
      if (savedPath) {
        setFormData(prev => ({ ...prev, image_path: savedPath }));
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        const sql = 'UPDATE clients SET name=?, email=?, phone=?, address=?, image_path=? WHERE id=?';
        await window.api.dbQuery(sql, [formData.name, formData.email, formData.phone, formData.address, formData.image_path || null, editingClient.id]);
      } else {
        const sql = 'INSERT INTO clients (name, email, phone, address, image_path) VALUES (?, ?, ?, ?, ?)';
        await window.api.dbQuery(sql, [formData.name, formData.email, formData.phone, formData.address, formData.image_path || null]);
      }
      setIsModalOpen(false);
      loadClients();
      alert(t('common.save_success'));
    } catch (err) {
      console.error('Error saving client', err);
      alert(t('common.save_error'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('common.confirm_delete'))) return;
    try {
      await window.api.dbQuery('DELETE FROM clients WHERE id = ?', [id]);
      loadClients();
    } catch (err) {
      console.error('Error deleting client', err);
    }
  };

  const getClientImage = (path) => {
    if (path) return `media://${path}`;
    return 'media://assets/cliente_comodin.webp';
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="clients-page">
      <div className="page-header">
        <div className="header-info">
          <Users size={28} className="header-icon" />
          <div>
            <h2>{t('menu.clients')}</h2>
            <p>{t('clients.subtitle') || 'Gestiona tu base de datos de clientes'}</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          {t('clients.new') || 'Nuevo Cliente'}
        </button>
      </div>

      <div className="search-bar">
        <div className="search-input">
          <Search size={18} />
          <input 
            type="text" 
            placeholder={t('common.search')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingClient ? t('common.edit') : t('clients.new') || 'Nuevo Cliente'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>{t('clients.name')}</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => ({...prev, name: val}));
                  }} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>{t('clients.photo') || 'Foto'}</label>
                <div className="image-upload-wrapper">
                  <div className="image-preview">
                    <img src={getClientImage(formData.image_path)} alt="Preview" />
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>{t('clients.email')}</label>
                   <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({...prev, email: val}));
                    }} 
                    required 
                  />
                </div>
                <div className="form-group flex-1">
                  <label>{t('clients.phone')}</label>
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({...prev, phone: val}));
                    }} 
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>{t('clients.address')}</label>
                 <input 
                  type="text" 
                  value={formData.address} 
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => ({...prev, address: val}));
                  }} 
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn-primary">
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="clients-table-wrapper">
        <table className="clients-table">
          <thead>
            <tr>
              <th>{t('clients.name')}</th>
              <th>{t('clients.email')}</th>
              <th>{t('clients.phone')}</th>
              <th>{t('clients.address')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{textAlign: 'center'}}>{t('common.loading')}</td></tr>
            ) : filteredClients.length > 0 ? (
              filteredClients.map(client => (
                <tr key={client.id}>
                  <td className="name-cell">
                    <div className="client-info-cell">
                      <img src={getClientImage(client.image_path)} alt={client.name} className="client-thumb" />
                      <span>{client.name}</span>
                    </div>
                  </td>
                  <td>{client.email || '-'}</td>
                  <td>{client.phone || '-'}</td>
                  <td>{client.address || '-'}</td>
                  <td className="actions-cell">
                    <button className="btn-icon edit" title={t('common.edit')} onClick={() => handleOpenModal(client)}><Edit size={16} /></button>
                    <button className="btn-icon delete" title={t('common.delete')} onClick={() => handleDelete(client.id)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" style={{textAlign: 'center'}}>{t('common.no_results')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

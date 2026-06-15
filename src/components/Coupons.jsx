import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Ticket, Save, X, Globe, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../ToastContext';
import './Coupons.css';

const emptyForm = {
  code: '',
  discount: '',
  type: 'percentage',
  is_global: true,
  client_id: '',
  valid_from: '',
  valid_until: '',
};

export default function Coupons() {
  const { t } = useTranslation();
  const showToast = useToast();
  const [coupons, setCoupons] = useState([]);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  useEffect(() => {
    loadCoupons();
    loadClients();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const sql = `SELECT c.*, cl.name as client_name FROM coupons c
        LEFT JOIN clients cl ON c.client_id = cl.id ORDER BY c.id DESC`;
      const results = await window.api.dbQuery(sql);
      setCoupons(results);
    } catch (err) {
      console.error('Failed to load coupons', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const results = await window.api.dbQuery('SELECT id, name FROM clients ORDER BY name ASC');
      setClients(results);
    } catch (err) {
      console.error('Failed to load clients', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const discountVal = parseFloat(formData.discount);
      if (isNaN(discountVal)) throw new Error('Invalid discount');

      const params = [
        formData.code.toUpperCase(),
        discountVal,
        formData.type,
        formData.is_global ? 1 : 0,
        formData.is_global ? null : (formData.client_id ? parseInt(formData.client_id) : null),
        formData.valid_from || null,
        formData.valid_until || null,
      ];

      if (editingCoupon) {
        const sql = `UPDATE coupons SET code=?, discount=?, type=?, is_global=?, client_id=?, valid_from=?, valid_until=? WHERE id=?`;
        await window.api.dbQuery(sql, [...params, editingCoupon.id]);
      } else {
        const sql = `INSERT INTO coupons (code, discount, type, is_global, client_id, valid_from, valid_until) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await window.api.dbQuery(sql, params);
      }
      loadCoupons();
      closeModal();
      showToast(t('common.save_success'), 'success');
    } catch (err) {
      showToast(t('common.save_error') + ': ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('common.confirm_delete'))) return;
    try {
      await window.api.dbQuery('DELETE FROM coupons WHERE id = ?', [id]);
      loadCoupons();
      showToast(t('common.save_success'), 'success');
    } catch (err) {
      showToast(t('common.save_error'), 'error');
    }
  };

  const openModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discount: coupon.discount.toString(),
        type: coupon.type,
        is_global: !!coupon.is_global,
        client_id: coupon.client_id ? coupon.client_id.toString() : '',
        valid_from: coupon.valid_from ? coupon.valid_from.split('T')[0] : '',
        valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
      });
    } else {
      setEditingCoupon(null);
      setFormData({ ...emptyForm });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const today = new Date().setHours(0, 0, 0, 0);
  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="coupon-mgmt">
      <div className="page-header">
        <div className="header-info">
          <Ticket size={28} className="header-icon" />
          <div>
            <h2>{t('coupons.title')}</h2>
            <p>{t('coupons.subtitle')}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => openModal()}>
            <Plus size={18} /> {t('coupons.new')}
          </button>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input">
          <Search size={18} />
          <input type="text" placeholder={t('common.search')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="coupon-table-wrapper">
        <table className="coupon-table">
          <thead>
            <tr>
              <th>{t('coupons.code')}</th>
              <th>{t('coupons.discount')}</th>
              <th>{t('coupons.type')}</th>
              <th>Alcance</th>
              <th>Válido desde</th>
              <th>Válido hasta</th>
              <th>{t('coupons.status')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center' }}>{t('common.loading')}</td></tr>
            ) : filteredCoupons.length > 0 ? (
              filteredCoupons.map(coupon => {
                const expired = coupon.valid_until && new Date(coupon.valid_until) < today;
                const notStarted = coupon.valid_from && new Date(coupon.valid_from) > today;
                const status = expired ? 'expired' : notStarted ? 'pending' : 'active';
                return (
                  <tr key={coupon.id} className={status === 'expired' ? 'expired-row' : status === 'pending' ? 'pending-row' : ''}>
                    <td className="code-cell">{coupon.code}</td>
                    <td>{coupon.discount}{coupon.type === 'percentage' ? '%' : '$'}</td>
                    <td>{coupon.type === 'percentage' ? t('coupons.percentage') : t('coupons.fixed')}</td>
                    <td>
                      {coupon.is_global ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Globe size={14} /> Global</span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={14} /> {coupon.client_name || `#${coupon.client_id}`}</span>
                      )}
                    </td>
                    <td>{coupon.valid_from ? new Date(coupon.valid_from).toLocaleDateString() : '-'}</td>
                    <td>{coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : '-'}</td>
                    <td>
                      <span className={`status-badge ${status}`}>
                        {status === 'expired' ? t('coupons.expired') : status === 'pending' ? 'Próximo' : t('coupons.active')}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="btn-icon edit" title={t('common.edit')} onClick={() => openModal(coupon)}><Edit size={16} /></button>
                      <button className="btn-icon delete" title={t('common.delete')} onClick={() => handleDelete(coupon.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="8" style={{ textAlign: 'center' }}>{t('common.no_results')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingCoupon ? t('coupons.edit_title') : t('coupons.new_title')}</h3>
              <button className="close-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t('coupons.code')}:</label>
                <input type="text" required placeholder="EJ: VERANO20" value={formData.code}
                  onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>{t('coupons.discount')}:</label>
                  <input type="number" step="0.01" required value={formData.discount}
                    onChange={e => setFormData(prev => ({ ...prev, discount: e.target.value }))} />
                </div>
                <div className="form-group flex-1">
                  <label>{t('coupons.type')}:</label>
                  <select value={formData.type} onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}>
                    <option value="percentage">{t('coupons.percentage')}</option>
                    <option value="fixed">{t('coupons.fixed')}</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="checkbox" id="is_global" checked={formData.is_global}
                  onChange={e => setFormData(prev => ({ ...prev, is_global: e.target.checked, client_id: '' }))} />
                <label htmlFor="is_global" style={{ margin: 0, cursor: 'pointer' }}>Disponible para todos los clientes</label>
              </div>

              {!formData.is_global && (
                <div className="form-group">
                  <label>Cliente:</label>
                  <select value={formData.client_id} onChange={e => setFormData(prev => ({ ...prev, client_id: e.target.value }))} required>
                    <option value="">Seleccionar cliente</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Válido desde:</label>
                  <input type="date" value={formData.valid_from}
                    onChange={e => setFormData(prev => ({ ...prev, valid_from: e.target.value }))} />
                </div>
                <div className="form-group flex-1">
                  <label>Válido hasta:</label>
                  <input type="date" value={formData.valid_until}
                    onChange={e => setFormData(prev => ({ ...prev, valid_until: e.target.value }))} />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>{t('common.cancel')}</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  <Save size={18} /> {saving ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

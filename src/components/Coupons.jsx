import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Ticket, Save, X, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../ToastContext';
import './Coupons.css';

export default function Coupons() {
  const { t } = useTranslation();
  const showToast = useToast();
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    type: 'percentage',
    expiry_date: ''
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const sql = 'SELECT * FROM coupons ORDER BY id DESC';
      const results = await window.api.dbQuery(sql);
      setCoupons(results);
    } catch (err) {
      console.error('Failed to load coupons', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const discountVal = parseFloat(formData.discount);
      if (isNaN(discountVal)) throw new Error('Descuento inválido');

      if (editingCoupon) {
        const sql = 'UPDATE coupons SET code=?, discount=?, type=?, expiry_date=? WHERE id=?';
        await window.api.dbQuery(sql, [formData.code.toUpperCase(), discountVal, formData.type, formData.expiry_date || null, editingCoupon.id]);
      } else {
        const sql = 'INSERT INTO coupons (code, discount, type, expiry_date) VALUES (?, ?, ?, ?)';
        await window.api.dbQuery(sql, [formData.code.toUpperCase(), discountVal, formData.type, formData.expiry_date || null]);
      }
      loadCoupons();
      closeModal();
      showToast(t('common.save_success'), 'success');
    } catch (err) {
      console.error('Error saving coupon', err);
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
      console.error('Error deleting coupon', err);
      showToast(t('common.save_error'), 'error');
    }
  };

  const openModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      // Format date for input type="date"
      let dateStr = '';
      if (coupon.expiry_date) {
        const d = new Date(coupon.expiry_date);
        dateStr = d.toISOString().split('T')[0];
      }
      setFormData({ 
        code: coupon.code, 
        discount: coupon.discount.toString(), 
        type: coupon.type, 
        expiry_date: dateStr 
      });
    } else {
      setEditingCoupon(null);
      setFormData({ code: '', discount: '', type: 'percentage', expiry_date: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

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
            <Plus size={18} />
            {t('coupons.new')}
          </button>
        </div>
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

      <div className="coupon-table-wrapper">
        <table className="coupon-table">
          <thead>
            <tr>
              <th>{t('coupons.code')}</th>
              <th>{t('coupons.discount')}</th>
              <th>{t('coupons.type')}</th>
              <th>{t('coupons.expiry')}</th>
              <th>{t('coupons.status')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>{t('common.loading')}</td></tr>
            ) : filteredCoupons.length > 0 ? (
              filteredCoupons.map(coupon => {
                const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < new Date().setHours(0,0,0,0);
                return (
                  <tr key={coupon.id} className={isExpired ? 'expired-row' : ''}>
                    <td className="code-cell">{coupon.code}</td>
                    <td>{coupon.discount}{coupon.type === 'percentage' ? '%' : '$'}</td>
                    <td>{coupon.type === 'percentage' ? t('coupons.percentage') : t('coupons.fixed')}</td>
                    <td>{coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : t('coupons.never')}</td>
                    <td>
                      <span className={`status-badge ${isExpired ? 'expired' : 'active'}`}>
                        {isExpired ? t('coupons.expired') : t('coupons.active')}
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
              <tr><td colSpan="6" style={{textAlign: 'center'}}>{t('common.no_results')}</td></tr>
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
                <input 
                  type="text" 
                  required 
                  placeholder="EJ: VERANO20"
                  value={formData.code} 
                  onChange={e => setFormData(prev => ({...prev, code: e.target.value}))}
                  style={{textTransform: 'uppercase'}}
                />
              </div>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>{t('coupons.discount')}:</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required 
                    value={formData.discount} 
                    onChange={e => setFormData(prev => ({...prev, discount: e.target.value}))}
                  />
                </div>
                <div className="form-group flex-1">
                  <label>{t('coupons.type')}:</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData(prev => ({...prev, type: e.target.value}))}
                  >
                    <option value="percentage">{t('coupons.percentage')}</option>
                    <option value="fixed">{t('coupons.fixed')}</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>{t('coupons.expiry')}:</label>
                <div className="input-with-icon">
                  <Calendar size={18} className="input-icon" />
                   <input 
                    type="date" 
                    value={formData.expiry_date} 
                    onChange={e => setFormData(prev => ({...prev, expiry_date: e.target.value}))}
                    required 
                  />
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

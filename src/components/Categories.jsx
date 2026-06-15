import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Tag, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../ToastContext';
import { getMediaUrl } from '../utils';
import './Categories.css';

export default function Categories() {
  const { t } = useTranslation();
  const showToast = useToast();
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', image_path: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const results = await window.api.dbQuery('SELECT * FROM categories ORDER BY name ASC');
      setCategories(results);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryImage = (path) => getMediaUrl(path, 'assets/categoria_comodin.webp');

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, image_path: category.image_path || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', image_path: '' });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.path) {
      const savedPath = await window.api.saveImage(file.path, 'categories');
      if (savedPath) {
        setFormData(prev => ({ ...prev, image_path: savedPath }));
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await window.api.dbQuery('UPDATE categories SET name = ?, image_path = ? WHERE id = ?', 
          [formData.name, formData.image_path || null, editingCategory.id]);
      } else {
        await window.api.dbQuery('INSERT INTO categories (name, image_path) VALUES (?, ?)', 
          [formData.name, formData.image_path || null]);
      }
      setIsModalOpen(false);
      loadCategories();
      showToast(t('common.save_success'), 'success');
    } catch (err) {
      console.error('Error saving category', err);
      showToast(t('common.save_error'), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('common.confirm_delete'))) return;
    try {
      await window.api.dbQuery('DELETE FROM categories WHERE id = ?', [id]);
      loadCategories();
      showToast(t('common.save_success'), 'success');
    } catch (err) {
      console.error('Error deleting category', err);
      showToast(t('common.save_error'), 'error');
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="category-mgmt">
      <div className="page-header">
        <div className="header-info">
          <Tag size={28} className="header-icon" />
          <div>
            <h2>{t('categories.title')}</h2>
            <p>{t('categories.subtitle')}</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} /> {t('categories.new')}
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

      <div className="categories-grid">
        {loading ? (
          <p className="loading-text">{t('common.loading')}</p>
        ) : filteredCategories.length > 0 ? (
          filteredCategories.map(cat => (
            <div key={cat.id} className="category-card">
              <div className="category-image">
                <img src={getCategoryImage(cat.image_path)} alt={cat.name} />
              </div>
              <div className="category-info">
                <h3>{cat.name}</h3>
                <div className="category-actions">
                  <button className="btn-icon edit" onClick={() => handleOpenModal(cat)}><Edit size={16} /></button>
                  <button className="btn-icon delete" onClick={() => handleDelete(cat.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">{t('common.no_results')}</p>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingCategory ? t('common.edit') : t('categories.new')}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>{t('categories.name')}</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>{t('categories.image')}</label>
                <div className="image-upload-wrapper">
                  <div className="image-preview">
                    <img src={getCategoryImage(formData.image_path)} alt="Preview" />
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>
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
    </div>
  );
}

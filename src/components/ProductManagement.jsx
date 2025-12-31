import React, { useState, useEffect } from 'react';
import { Plus, Search, Upload, Edit, Trash2, Package, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ImportModal from './ImportModal';
import './ProductManagement.css';

export default function ProductManagement() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    code: '', name: '', price: '', cost: '', stock: '', category_id: ''
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const results = await window.api.dbQuery('SELECT * FROM categories ORDER BY name ASC');
      setCategories(results);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const sql = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id';
      const results = await window.api.dbQuery(sql);
      setProducts(results);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        code: product.code,
        name: product.name,
        price: product.price,
        cost: product.cost || '',
        stock: product.stock,
        category_id: product.category_id || '',
        image_path: product.image_path || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ code: '', name: '', price: '', cost: '', stock: '', category_id: '', image_path: '' });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.path) {
      const savedPath = await window.api.saveImage(file.path, 'products');
      if (savedPath) {
        setFormData(prev => ({ ...prev, image_path: savedPath }));
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const sql = 'UPDATE products SET code=?, name=?, price=?, cost=?, stock=?, category_id=?, image_path=? WHERE id=?';
        await window.api.dbQuery(sql, [formData.code, formData.name, formData.price, formData.cost, formData.stock, formData.category_id || null, formData.image_path || null, editingProduct.id]);
      } else {
        const sql = 'INSERT INTO products (code, name, price, cost, stock, category_id, image_path) VALUES (?, ?, ?, ?, ?, ?, ?)';
        await window.api.dbQuery(sql, [formData.code, formData.name, formData.price, formData.cost, formData.stock, formData.category_id || null, formData.image_path || null]);
      }
      closeModal();
      loadProducts();
      alert(t('common.save_success'));
    } catch (err) {
      console.error('Error saving product', err);
      if (err.code === 'ER_DUP_ENTRY' || (err.message && err.message.includes('Duplicate entry'))) {
        alert(t('products.duplicate_code_error') || 'Error: El código de producto ya existe.');
      } else {
        alert(t('common.save_error'));
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('common.confirm_delete'))) return;
    try {
      await window.api.dbQuery('DELETE FROM products WHERE id = ?', [id]);
      loadProducts();
    } catch (err) {
      console.error('Error deleting product', err);
    }
  };

  const handleImport = async (data) => {
    try {
      for (const item of data) {
        if (!item.code || !item.name) continue;
        const sql = 'INSERT INTO products (code, name, price, cost, stock, category_id, image_path) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), cost=VALUES(cost), stock=VALUES(stock), category_id=VALUES(category_id), image_path=VALUES(image_path)';
        await window.api.dbQuery(sql, [item.code, item.name, item.price, item.cost, item.stock, item.category_id || null, item.image_path || null]);
      }
      alert(t('common.save_success'));
      loadProducts();
    } catch (err) {
      console.error('Error importing products', err);
      alert(t('common.save_error'));
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductImage = (path) => {
    if (path) return `media://${path}`;
    return 'media://assets/producto_comodin.webp';
  };

  return (
    <div className="product-mgmt">
      <div className="page-header">
        <div className="header-info">
          <Package size={28} className="header-icon" />
          <div>
            <h2>{t('products.title')}</h2>
            <p>{t('products.subtitle')}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setIsImportModalOpen(true)}>
            <Upload size={18} />
            {t('products.import')}
          </button>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            {t('products.new')}
          </button>
        </div>
      </div>

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImport={handleImport} 
      />

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingProduct ? t('common.edit') : t('products.new')}</h3>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>{t('products.code')}</label>
                  <input 
                    type="text" 
                    value={formData.code} 
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({...prev, code: val}));
                    }} 
                    required 
                  />
                </div>
                <div className="form-group flex-1">
                  <label>{t('products.name')}</label>
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
              </div>

              <div className="form-group">
                <label>{t('products.image') || 'Imagen'}</label>
                <div className="image-upload-wrapper">
                  <div className="image-preview">
                    <img src={getProductImage(formData.image_path)} alt="Preview" />
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>{t('products.price')}</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={formData.price} 
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({...prev, price: val}));
                    }} 
                    required 
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Cost</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={formData.cost} 
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({...prev, cost: val}));
                    }} 
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>{t('products.stock')}</label>
                <input 
                  type="number" 
                  value={formData.stock} 
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => ({...prev, stock: val}));
                  }} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>{t('products.category')}</label>
                <select 
                  value={formData.category_id} 
                  onChange={e => setFormData(prev => ({...prev, category_id: e.target.value}))}
                  required
                >
                  <option value="">{t('products.select_category') || 'Seleccionar categoría'}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
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

      <div className="search-bar">
        <div className="search-input">
          <Search size={18} />
          <input 
            type="text" 
            placeholder={t('sales.search_placeholder')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="product-table-wrapper">
        <table className="product-table">
          <thead>
            <tr>
              <th>{t('products.code')}</th>
              <th>{t('products.name')}</th>
              <th>{t('products.category')}</th>
              <th>{t('products.price')}</th>
              <th>{t('products.stock')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>{t('common.loading')}</td></tr>
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <tr key={product.id}>
                  <td className="code-cell">{product.code}</td>
                  <td className="name-cell">
                    <div className="product-info-cell">
                      <img src={getProductImage(product.image_path)} alt={product.name} className="product-thumb" />
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td>{product.category_name || t('products.no_category')}</td>
                  <td className="price-cell">${Number(product.price).toFixed(2)}</td>
                  <td>
                    <span className={`stock-badge ${product.stock < 10 ? 'low' : ''}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-icon edit" title={t('common.edit')} onClick={() => handleOpenModal(product)}><Edit size={16} /></button>
                    <button className="btn-icon delete" title={t('common.delete')} onClick={() => handleDelete(product.id)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>{t('common.no_results')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

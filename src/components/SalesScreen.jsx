import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, Trash2, Plus, Minus, CreditCard, User, Tag, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../ToastContext';
import { getMediaUrl } from '../utils';
import './SalesScreen.css';

export default function SalesScreen() {
  const { t } = useTranslation();
  const showToast = useToast();
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [client, setClient] = useState({ id: null, name: t('sales.final_consumer') });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [allClients, setAllClients] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const searchInputRef = useRef(null);
  const barcodeBuffer = useRef('');
  const barcodeTimer = useRef(null);

  useEffect(() => {
    loadAllProducts();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') { e.preventDefault(); searchInputRef.current?.focus(); }
      if (e.key === 'F4') { e.preventDefault(); handleFinishSale(); }
      if (e.key === 'Escape') {
        if (isClientModalOpen) setIsClientModalOpen(false);
      }
      if (e.key.length === 1 && e.key !== 'Escape') {
        barcodeBuffer.current += e.key;
        clearTimeout(barcodeTimer.current);
        barcodeTimer.current = setTimeout(() => { barcodeBuffer.current = ''; }, 50);
      }
      if (e.key === 'Enter' && barcodeBuffer.current.length > 3) {
        const code = barcodeBuffer.current;
        barcodeBuffer.current = '';
        const product = allProducts.find(p => p.code === code);
        if (product) addToCart(product);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allProducts, isClientModalOpen]);

  const loadAllProducts = async () => {
    try {
      const sql = 'SELECT * FROM products WHERE stock > 0 ORDER BY name ASC';
      const results = await window.api.dbQuery(sql);
      setAllProducts(results);
    } catch (err) {
      console.error('Error loading products', err);
    }
  };

  // Update client name when language changes if it's the default one
  useEffect(() => {
    if (client.id === null) {
      setClient(prev => ({ ...prev, name: t('sales.final_consumer') }));
    }
  }, [t]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const sql = 'SELECT * FROM coupons WHERE code = ?';
      const results = await window.api.dbQuery(sql, [couponCode.toUpperCase()]);
      
      if (results.length === 0) {
        showToast(t('coupons.not_found') || 'Cupón no encontrado', 'warning');
        return;
      }

      const coupon = results[0];
      const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < new Date().setHours(0,0,0,0);
      
      if (isExpired) {
        showToast(t('coupons.expired_alert') || 'Este cupón ha expirado', 'warning');
        return;
      }

      setAppliedCoupon(coupon);
      setCouponCode('');
      showToast(`${t('coupons.apply_success') || 'Cupón aplicado'}: ${coupon.code}`, 'success');
    } catch (err) {
      console.error('Error applying coupon', err);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const openClientModal = async () => {
    try {
      const results = await window.api.dbQuery('SELECT * FROM clients LIMIT 50');
      setAllClients(results);
      setIsClientModalOpen(true);
    } catch (err) {
      console.error('Error loading clients', err);
    }
  };

  const selectClient = (c) => {
    setClient({ id: c.id, name: c.name });
    setIsClientModalOpen(false);
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    // No longer clearing search to keep the catalog view
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = subtotal * (appliedCoupon.discount / 100);
    } else {
      discount = Math.min(subtotal, appliedCoupon.discount);
    }
  }

  const total = subtotal - discount;

  const handleFinishSale = async () => {
    if (cart.length === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const saleResult = await window.api.dbQuery(
        'INSERT INTO sales (user_id, client_id, total) VALUES (?, ?, ?)',
        [user.id || null, client.id, total]
      );
      const saleId = saleResult.insertId;

      const queries = cart.map(item => ({
        sql: 'INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        params: [saleId, item.id, item.quantity, item.price]
      }));
      for (const item of cart) {
        queries.push({
          sql: 'UPDATE products SET stock = stock - ? WHERE id = ?',
          params: [item.quantity, item.id]
        });
      }

      const result = await window.api.dbTransaction(queries);
      if (!result.success) throw new Error(result.error);

      showToast(t('sales.success_alert') || 'Venta realizada con éxito', 'success');
      setCart([]);
      setAppliedCoupon(null);
      setClient({ id: null, name: t('sales.final_consumer') });
      loadAllProducts();
    } catch (err) {
      console.error('Sale failed', err);
      showToast(t('sales.error_alert') || 'Error al procesar la venta', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getProductImage = (path) => getMediaUrl(path, 'assets/producto_comodin.webp');
  const getClientImage = (path) => getMediaUrl(path, 'assets/cliente_comodin.webp');

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sales-container">
      <div className="sales-left">
        <div className="pos-search-bar">
          <Search size={20} />
          <input 
            type="text" 
            placeholder={t('sales.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="product-catalog">
          <div className="product-grid">
            {filteredProducts.map(p => (
              <div 
                key={p.id} 
                className={`product-card ${p.stock < 10 ? 'low-stock' : ''}`}
                onClick={() => addToCart(p)}
              >
                <div className="product-card-image">
                  <img src={getProductImage(p.image_path)} alt={p.name} />
                  {p.stock < 10 && <div className="stock-warning">{p.stock}</div>}
                </div>
                <div className="product-card-info">
                  <span className="product-name">{p.name}</span>
                  <span className="product-price">${Number(p.price).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sales-right">
        <div className="checkout-card">
          <div className="card-section client-section">
            <div className="section-title">
              <User size={18} />
              <span>{t('sales.client')}</span>
            </div>
            <div className="client-display">
              <div className="client-avatar-mini">
                <img src={getClientImage(client.image_path)} alt={client.name} />
              </div>
              <span className="client-name">{client.name}</span>
              <button className="btn-small" onClick={openClientModal}>{t('sales.change_client')}</button>
            </div>
          </div>
          
          <div className="card-section">
            <div className="section-title">
              <CreditCard size={18} />
              <span>Método de pago</span>
            </div>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
            >
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>

          <div className="card-section coupon-section">
            <div className="section-title">
              <Tag size={18} />
              <span>{t('coupons.title')}</span>
            </div>
            {!appliedCoupon ? (
              <div className="coupon-input-group">
                <input 
                  type="text" 
                  placeholder={t('sales.coupon_placeholder')} 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                />
                <button className="btn-apply" onClick={handleApplyCoupon}>{t('sales.apply')}</button>
              </div>
            ) : (
              <div className="applied-coupon">
                <div className="coupon-info">
                  <span className="coupon-code">{appliedCoupon.code}</span>
                  <span className="coupon-discount">
                    -{appliedCoupon.discount}{appliedCoupon.type === 'percentage' ? '%' : '$'}
                  </span>
                </div>
                <button className="btn-remove-coupon" onClick={removeCoupon}><X size={16} /></button>
              </div>
            )}
          </div>

          <div className="cart-list-section">
            <div className="section-title">
              <ShoppingCart size={18} />
              <span>{t('menu.sales')}</span>
            </div>
            <div className="cart-items-mini">
              {cart.map(item => (
                <div key={item.id} className="cart-item-mini">
                  <div className="item-info">
                    <span className="item-qty">{item.quantity}x</span>
                    <span className="item-name">{item.name}</span>
                  </div>
                  <div className="item-price-actions">
                    <span className="item-total">${(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(item.id)} className="btn-remove"><X size={14} /></button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && <p className="empty-msg">{t('sales.cart_empty')}</p>}
            </div>
          </div>

          <div className="summary">
            <div className="summary-row">
              <span>{t('sales.subtotal')}</span>
              <span>${Number(subtotal).toFixed(2)}</span>
            </div>
            <div className="summary-row discount">
              <span>{t('sales.discount')}</span>
              <span>-${Number(discount).toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>{t('sales.total')}</span>
              <span>${Number(total).toFixed(2)}</span>
            </div>
          </div>
          
          <button className="finish-btn" onClick={handleFinishSale} disabled={cart.length === 0 || isProcessing}>
            <CreditCard size={20} />
            {t('sales.finish')}
          </button>
        </div>
      </div>

      {isClientModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{t('sales.select_client')}</h3>
              <button className="close-btn" onClick={() => setIsClientModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="search-bar">
              <div className="search-input">
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder={t('sales.search_client')} 
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="client-list">
              <div 
                className="client-item" 
                onClick={() => selectClient({ id: null, name: t('sales.final_consumer') })}
              >
                <div className="client-item-info">
                  <img src={getClientImage(null)} alt="Final Consumer" className="client-item-thumb" />
                  <span className="client-item-name">{t('sales.final_consumer')}</span>
                </div>
              </div>
              {allClients
                .filter(c => c.name.toLowerCase().includes(clientSearchTerm.toLowerCase()))
                .map(c => (
                  <div key={c.id} className="client-item" onClick={() => selectClient(c)}>
                    <div className="client-item-info">
                      <img src={getClientImage(c.image_path)} alt={c.name} className="client-item-thumb" />
                      <div className="client-details">
                        <span className="client-item-name">{c.name}</span>
                        <span className="client-item-sub">{c.email || c.phone || t('common.no_results')}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



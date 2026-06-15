import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Search, X, DollarSign, User, Package } from 'lucide-react';
import { getMediaUrl } from '../utils';

export default function SalesHistory() {
  const { t } = useTranslation();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleItems, setSaleItems] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { loadSales(); }, []);

  const loadSales = async () => {
    setLoading(true);
    try {
      let sql = `SELECT s.id, s.total, s.created_at, u.username, c.name as client_name
        FROM sales s LEFT JOIN users u ON s.user_id = u.id
        LEFT JOIN clients c ON s.client_id = c.id`;
      const params = [];
      const conditions = [];
      if (dateFrom) { conditions.push("date(s.created_at) >= ?"); params.push(dateFrom); }
      if (dateTo) { conditions.push("date(s.created_at) <= ?"); params.push(dateTo); }
      if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
      sql += ' ORDER BY s.id DESC LIMIT 100';

      const results = await window.api.dbQuery(sql, params);
      setSales(results);
    } catch (err) {
      console.error('Error loading sales', err);
    } finally {
      setLoading(false);
    }
  };

  const viewSale = async (sale) => {
    setSelectedSale(sale);
    try {
      const items = await window.api.dbQuery(
        `SELECT si.*, p.name, p.image_path FROM sale_items si
         LEFT JOIN products p ON si.product_id = p.id WHERE si.sale_id = ?`,
        [sale.id]
      );
      setSaleItems(items);
    } catch (err) {
      console.error('Error loading sale items', err);
    }
  };

  return (
    <div className="sales-history">
      <div className="page-header">
        <div className="header-info">
          <Calendar size={28} className="header-icon" />
          <div>
            <h2>Historial de Ventas</h2>
            <p>Consulta de ventas realizadas</p>
          </div>
        </div>
      </div>

      <div className="search-bar" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          Desde: <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          Hasta: <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </label>
        <button className="btn-primary" onClick={loadSales} style={{ padding: '0.5rem 1rem' }}>
          <Search size={16} /> Filtrar
        </button>
        {(dateFrom || dateTo) && (
          <button className="btn-secondary" onClick={() => { setDateFrom(''); setDateTo(''); loadSales(); }} style={{ padding: '0.5rem 1rem' }}>
            Limpiar
          </button>
        )}
      </div>

      <div className="sales-split">
        <div className="sales-list-panel">
          <table className="product-table">
            <thead>
              <tr>
                <th>#</th><th>Fecha</th><th>Usuario</th><th>Cliente</th><th>Total</th><th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>{t('common.loading')}</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>{t('common.no_results')}</td></tr>
              ) : sales.map(s => (
                <tr key={s.id} className={selectedSale?.id === s.id ? 'selected-row' : ''}>
                  <td>{s.id}</td>
                  <td>{s.created_at}</td>
                  <td>{s.username || '-'}</td>
                  <td>{s.client_name || 'Consumidor Final'}</td>
                  <td>${Number(s.total).toFixed(2)}</td>
                  <td><button className="btn-icon" onClick={() => viewSale(s)} title="Ver detalle"><Package size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedSale && (
          <div className="sale-detail-panel">
            <div className="detail-header">
              <h3>Venta #{selectedSale.id}</h3>
              <button className="close-btn" onClick={() => setSelectedSale(null)}><X size={20} /></button>
            </div>
            <p><strong>Fecha:</strong> {selectedSale.created_at}</p>
            <p><strong>Usuario:</strong> {selectedSale.username || '-'}</p>
            <p><strong>Cliente:</strong> {selectedSale.client_name || 'Consumidor Final'}</p>
            <p><strong>Total:</strong> ${Number(selectedSale.total).toFixed(2)}</p>
            <h4 style={{ marginTop: '1rem' }}>Productos</h4>
            <table className="product-table">
              <thead>
                <tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                {saleItems.map(item => (
                  <tr key={item.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={getMediaUrl(item.image_path, 'assets/producto_comodin.webp')} alt="" style={{ width: 30, height: 30, borderRadius: 4, objectFit: 'cover' }} />
                      {item.name}
                    </td>
                    <td>{item.quantity}</td>
                    <td>${Number(item.price).toFixed(2)}</td>
                    <td>${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

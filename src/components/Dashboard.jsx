import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart2, DollarSign, ShoppingBag, Package, AlertTriangle, Users } from 'lucide-react';

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [salesToday, totals, productCount, lowStock, clientCount] = await Promise.all([
        window.api.dbQuery("SELECT COUNT(*) as count, COALESCE(SUM(total),0) as total FROM sales WHERE date(created_at) = date('now')"),
        window.api.dbQuery("SELECT COUNT(*) as count, COALESCE(SUM(total),0) as total FROM sales"),
        window.api.dbQuery("SELECT COUNT(*) as count FROM products"),
        window.api.dbQuery("SELECT COUNT(*) as count FROM products WHERE stock < 10"),
        window.api.dbQuery("SELECT COUNT(*) as count FROM clients"),
      ]);
      setStats({
        salesToday: salesToday[0],
        totals: totals[0],
        productCount: productCount[0].count,
        lowStock: lowStock[0].count,
        clientCount: clientCount[0].count,
      });
    } catch (err) {
      console.error('Error loading dashboard stats', err);
    }
  };

  if (!stats) return <div className="dashboard-view"><p>{t('common.loading')}</p></div>;

  return (
    <div className="dashboard-view">
      <h2>{t('menu.dashboard')}</h2>
      <div className="kpi-grid">
        <div className="kpi-card">
          <DollarSign size={28} className="kpi-icon" style={{ color: '#27ae60' }} />
          <div>
            <span className="kpi-value">${Number(stats.salesToday.total).toFixed(2)}</span>
            <span className="kpi-label">{t('reports.total_sales')} (hoy)</span>
          </div>
        </div>
        <div className="kpi-card">
          <ShoppingBag size={28} className="kpi-icon" style={{ color: '#3498db' }} />
          <div>
            <span className="kpi-value">{stats.salesToday.count}</span>
            <span className="kpi-label">{t('reports.sales_count')} (hoy)</span>
          </div>
        </div>
        <div className="kpi-card">
          <BarChart2 size={28} className="kpi-icon" style={{ color: '#9b59b6' }} />
          <div>
            <span className="kpi-value">${Number(stats.totals.total).toFixed(2)}</span>
            <span className="kpi-label">{t('reports.total_sales')}</span>
          </div>
        </div>
        <div className="kpi-card">
          <Package size={28} className="kpi-icon" style={{ color: '#f39c12' }} />
          <div>
            <span className="kpi-value">{stats.productCount}</span>
            <span className="kpi-label">{t('reports.product_count')}</span>
          </div>
        </div>
        <div className="kpi-card">
          <AlertTriangle size={28} className="kpi-icon" style={{ color: '#e74c3c' }} />
          <div>
            <span className="kpi-value">{stats.lowStock}</span>
            <span className="kpi-label">{t('reports.low_stock')}</span>
          </div>
        </div>
        <div className="kpi-card">
          <Users size={28} className="kpi-icon" style={{ color: '#1abc9c' }} />
          <div>
            <span className="kpi-value">{stats.clientCount}</span>
            <span className="kpi-label">{t('clients.title')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

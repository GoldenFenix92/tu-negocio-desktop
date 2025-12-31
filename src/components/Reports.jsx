import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart2, TrendingUp, DollarSign, Package, Calendar } from 'lucide-react';
import './Reports.css';

export default function Reports() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalSales: 0,
    salesCount: 0,
    productCount: 0,
    lowStockCount: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const salesRes = await window.api.dbQuery('SELECT SUM(total) as total, COUNT(*) as count FROM sales');
      const productRes = await window.api.dbQuery('SELECT COUNT(*) as count FROM products');
      const lowStockRes = await window.api.dbQuery('SELECT COUNT(*) as count FROM products WHERE stock < 10');

      setStats({
        totalSales: salesRes[0].total || 0,
        salesCount: salesRes[0].count || 0,
        productCount: productRes[0].count || 0,
        lowStockCount: lowStockRes[0].count || 0
      });
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  return (
    <div className="reports-container">
      <div className="page-header">
        <div className="header-info">
          <BarChart2 size={28} className="header-icon" />
          <div>
            <h2>{t('reports.title')}</h2>
            <p>{t('reports.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon"><DollarSign size={24} /></div>
          <div className="stat-data">
            <span className="stat-label">{t('reports.total_sales')}</span>
            <span className="stat-value">${Number(stats.totalSales).toFixed(2)}</span>
          </div>
        </div>
        
        <div className="stat-card green">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-data">
            <span className="stat-label">{t('reports.sales_count')}</span>
            <span className="stat-value">{stats.salesCount}</span>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon"><Package size={24} /></div>
          <div className="stat-data">
            <span className="stat-label">{t('reports.product_count')}</span>
            <span className="stat-value">{stats.productCount}</span>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon"><Calendar size={24} /></div>
          <div className="stat-data">
            <span className="stat-label">{t('reports.low_stock')}</span>
            <span className="stat-value">{stats.lowStockCount}</span>
          </div>
        </div>
      </div>

      <div className="reports-content">
        <div className="chart-placeholder">
          <p>{t('reports.chart_placeholder')}</p>
          <div className="mock-chart">
            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
              <div key={i} className="bar" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

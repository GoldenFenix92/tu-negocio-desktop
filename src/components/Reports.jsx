import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart2, TrendingUp, DollarSign, Package, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Reports.css';

export default function Reports() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalSales: 0,
    salesCount: 0,
    productCount: 0,
    lowStockCount: 0
  });
  const [dailySales, setDailySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    loadStats();
    loadDailySales();
    loadTopProducts();
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

  const loadDailySales = async () => {
    try {
      const rows = await window.api.dbQuery(`
        SELECT date(created_at) as day, SUM(total) as total, COUNT(*) as count
        FROM sales
        WHERE created_at >= date('now', '-6 days')
        GROUP BY date(created_at)
        ORDER BY day
      `);
      const dayNames = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      });
      const data = dayNames.map((label, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const found = rows.find(r => r.day === dateStr);
        return {
          day: label,
          total: found ? Number(found.total) : 0,
          count: found ? found.count : 0
        };
      });
      setDailySales(data);
    } catch (err) {
      console.error('Failed to load daily sales', err);
    }
  };

  const loadTopProducts = async () => {
    try {
      const rows = await window.api.dbQuery(`
        SELECT p.name, SUM(si.quantity) as qty
        FROM sale_items si
        JOIN products p ON p.id = si.product_id
        GROUP BY si.product_id
        ORDER BY qty DESC
        LIMIT 5
      `);
      setTopProducts(rows.map(r => ({ name: r.name, qty: r.qty })));
    } catch (err) {
      console.error('Failed to load top products', err);
    }
  };

  const chartTheme = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
      grid: isDark ? '#333' : '#e0e0e0',
      text: isDark ? '#ccc' : '#666',
      bar: isDark ? '#5b9bd5' : '#3498db',
      bar2: isDark ? '#82ca9d' : '#2ecc71',
      tooltipBg: isDark ? '#2d2d2d' : '#fff',
      tooltipBorder: isDark ? '#555' : '#e0e0e0'
    };
  };

  const theme = chartTheme();

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

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">{t('reports.daily_sales')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: theme.text }} />
              <YAxis tick={{ fontSize: 12, fill: theme.text }} />
              <Tooltip
                contentStyle={{
                  background: theme.tooltipBg,
                  border: `1px solid ${theme.tooltipBorder}`,
                  borderRadius: 8,
                  fontSize: 13
                }}
              />
              <Bar dataKey="total" fill={theme.bar} radius={[6, 6, 0, 0]} name={t('reports.total_sales')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3 className="chart-title">{t('reports.top_products')}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
              <XAxis type="number" tick={{ fontSize: 12, fill: theme.text }} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12, fill: theme.text }} />
              <Tooltip
                contentStyle={{
                  background: theme.tooltipBg,
                  border: `1px solid ${theme.tooltipBorder}`,
                  borderRadius: 8,
                  fontSize: 13
                }}
              />
              <Bar dataKey="qty" fill={theme.bar2} radius={[0, 6, 6, 0]} name={t('reports.units_sold')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

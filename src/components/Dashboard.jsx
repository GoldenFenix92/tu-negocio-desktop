import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, TrendingUp, Calendar, Package, AlertTriangle, Users } from 'lucide-react';

const kpiConfig = [
  {
    key: 'salesToday',
    icon: DollarSign,
    gradient: 'from-emerald-500 to-emerald-600',
    shadow: 'shadow-emerald-500/20',
    labelKey: 'dashboard.today',
    prefix: '$',
  },
  {
    key: 'salesWeek',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/20',
    labelKey: 'dashboard.week',
    prefix: '$',
  },
  {
    key: 'salesMonth',
    icon: Calendar,
    gradient: 'from-violet-500 to-violet-600',
    shadow: 'shadow-violet-500/20',
    labelKey: 'dashboard.month',
    prefix: '$',
  },
  {
    key: 'productCount',
    icon: Package,
    gradient: 'from-amber-500 to-amber-600',
    shadow: 'shadow-amber-500/20',
    labelKey: 'reports.product_count',
  },
  {
    key: 'lowStock',
    icon: AlertTriangle,
    gradient: 'from-rose-500 to-rose-600',
    shadow: 'shadow-rose-500/20',
    labelKey: 'reports.low_stock',
  },
  {
    key: 'clientCount',
    icon: Users,
    gradient: 'from-teal-500 to-teal-600',
    shadow: 'shadow-teal-500/20',
    labelKey: 'clients.title',
  },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [salesToday, salesWeek, salesMonth, productCount, lowStock, clientCount] = await Promise.all([
        window.api.dbQuery("SELECT COALESCE(SUM(total),0) as total FROM sales WHERE date(created_at) = date('now')"),
        window.api.dbQuery("SELECT COALESCE(SUM(total),0) as total FROM sales WHERE created_at >= datetime('now', '-7 days')"),
        window.api.dbQuery("SELECT COALESCE(SUM(total),0) as total FROM sales WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')"),
        window.api.dbQuery("SELECT COUNT(*) as count FROM products"),
        window.api.dbQuery("SELECT COUNT(*) as count FROM products WHERE stock < 10"),
        window.api.dbQuery("SELECT COUNT(*) as count FROM clients"),
      ]);
      setStats({
        salesToday: salesToday[0].total,
        salesWeek: salesWeek[0].total,
        salesMonth: salesMonth[0].total,
        productCount: productCount[0].count,
        lowStock: lowStock[0].count,
        clientCount: clientCount[0].count,
      });
    } catch (err) {
      console.error('Error loading dashboard stats', err);
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
          <span className="text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('menu.dashboard')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('reports.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {kpiConfig.map((kpi) => {
          const Icon = kpi.icon;
          const value = stats[kpi.key];
          const displayValue = kpi.prefix
            ? `${kpi.prefix}${Number(value).toFixed(2)}`
            : value;
          return (
            <div
              key={kpi.key}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 dark:hover:bg-slate-700/80"
            >
              <div className={`absolute -top-6 -right-6 w-28 h-28 rounded-full bg-gradient-to-br ${kpi.gradient} opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity blur-xl`} />
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${kpi.gradient} shadow-lg ${kpi.shadow}`}>
                  <Icon size={22} className="text-white" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                  {displayValue}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {t(kpi.labelKey)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

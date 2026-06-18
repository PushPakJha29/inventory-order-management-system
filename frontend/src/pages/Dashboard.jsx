import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatCard from '../components/StatCard';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_products: 0,
    total_customers: 0,
    total_orders: 0,
    low_stock_products: 0
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, productsData] = await Promise.all([
          api.getDashboardStats(),
          api.getProducts()
        ]);
        
        setStats(statsData);
        // Filter low stock products locally to show in dashboard list
        const filteredLowStock = productsData.filter(p => p.quantity_in_stock <= 5);
        setLowStockItems(filteredLowStock);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse">Loading dashboard telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight md:text-4xl">
            Overview
          </h1>
          <p className="mt-1 text-slate-400 text-sm md:text-base">
            Real-time diagnostics of your stock levels and order activity.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-400 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>SYSTEM ONLINE</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/45 border border-red-800/60 text-red-200 px-5 py-4 rounded-2xl flex items-center space-x-3 text-sm">
          <AlertTriangle className="text-red-400 shrink-0" size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics KPI Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.total_products}
          icon={Package}
          gradient="from-brand-500 to-blue-600"
          description="Catalogued SKU inventory items"
        />
        <StatCard
          title="Total Customers"
          value={stats.total_customers}
          icon={Users}
          gradient="from-purple-500 to-indigo-600"
          description="Registered profiles"
        />
        <StatCard
          title="Orders Fulfilled"
          value={stats.total_orders}
          icon={ShoppingCart}
          gradient="from-emerald-500 to-teal-600"
          description="Total operations"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.low_stock_products}
          icon={AlertTriangle}
          gradient={stats.low_stock_products > 0 ? "from-amber-500 to-orange-600" : "from-slate-600 to-slate-700"}
          description="Stock quantity ≤ 5 units"
        />
      </div>

      {/* Grid: Low Stock Alert & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Low Stock Warning Panel */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 md:p-8 flex flex-col h-full shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="text-amber-400" size={22} />
              <h2 className="text-xl font-bold font-outfit text-white">Critical Stock Alert</h2>
            </div>
            <span className="bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full text-xs font-semibold">
              {lowStockItems.length} Warnings
            </span>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 bg-slate-900/35 border border-dashed border-slate-800 rounded-xl">
              <span className="text-4xl mb-3">✅</span>
              <h3 className="font-semibold text-slate-300">Inventory Levels Stable</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-xs">
                All catalogued products have stock quantities above the critical threshold.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium">SKU</th>
                    <th className="pb-3 font-medium text-right">Stock</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {lowStockItems.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-800/10 transition-colors">
                      <td className="py-3.5 font-medium text-slate-200 text-sm max-w-[200px] truncate">
                        {item.product_name}
                      </td>
                      <td className="py-3.5 text-slate-400 font-mono text-xs">
                        {item.sku}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className={`inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-full text-xs ${
                          item.quantity_in_stock === 0 
                            ? 'bg-red-500/10 text-red-400' 
                            : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {item.quantity_in_stock} left
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link 
                          to={`/products?edit=${item.id}`} 
                          className="text-xs text-brand-400 hover:text-brand-300 font-semibold inline-flex items-center hover:underline"
                        >
                          Restock <ArrowRight size={12} className="ml-1" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Operations panel */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-lg">
          <div>
            <h2 className="text-xl font-bold font-outfit text-white mb-2 flex items-center space-x-2">
              <TrendingUp size={20} className="text-brand-400" />
              <span>Quick Actions</span>
            </h2>
            <p className="text-slate-400 text-xs mb-6">
              Accelerate your workflow with these routine business operations:
            </p>
            
            <div className="space-y-3.5">
              <Link 
                to="/orders" 
                className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/60 hover:bg-brand-500/5 transition-all group"
              >
                <div className="text-left">
                  <h4 className="font-semibold text-slate-200 text-sm group-hover:text-brand-400 transition-colors">Place New Order</h4>
                  <p className="text-slate-500 text-xxs mt-0.5">Deduct inventory and verify client</p>
                </div>
                <ShoppingCart size={18} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
              </Link>
              
              <Link 
                to="/products" 
                className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/60 hover:bg-brand-500/5 transition-all group"
              >
                <div className="text-left">
                  <h4 className="font-semibold text-slate-200 text-sm group-hover:text-brand-400 transition-colors">Add New Product</h4>
                  <p className="text-slate-500 text-xxs mt-0.5">Register new items and SKUs</p>
                </div>
                <Package size={18} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
              </Link>
              
              <Link 
                to="/customers" 
                className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/60 hover:bg-brand-500/5 transition-all group"
              >
                <div className="text-left">
                  <h4 className="font-semibold text-slate-200 text-sm group-hover:text-brand-400 transition-colors">Register Customer</h4>
                  <p className="text-slate-500 text-xxs mt-0.5">Add unique user profiles</p>
                </div>
                <Users size={18} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
              </Link>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <span className="text-slate-500 text-xxs block font-medium">V1.0.0 POSTGRES DATABASE ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

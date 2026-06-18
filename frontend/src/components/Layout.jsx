import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Menu, 
  X 
} from 'lucide-react';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0b0f19]">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📦</span>
          <span className="font-outfit text-xl font-bold bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
            StockFlow
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-400 hover:text-slate-200 focus:outline-none"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          
          {/* Menu Drawer */}
          <div className="relative flex flex-col w-64 max-w-xs bg-slate-900 border-r border-slate-800 h-full p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📦</span>
                <span className="font-outfit text-xl font-bold bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
                  StockFlow
                </span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <nav className="space-y-2">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      active 
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/60 backdrop-blur-xl border-r border-slate-800/80 p-6 sticky top-0 h-screen">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <span className="text-3xl">📦</span>
          <span className="font-outfit text-2xl font-black bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
            StockFlow
          </span>
        </div>

        <nav className="flex-1 space-y-1.5">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  active 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 font-semibold translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-800/35 hover:text-slate-200 hover:translate-x-0.5'
                }`}
              >
                <item.icon 
                  size={20} 
                  className={`transition-colors ${
                    active ? 'text-white' : 'text-slate-400 group-hover:text-brand-400'
                  }`} 
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-slate-800/80 text-xs text-slate-500 px-2">
          <p>© 2026 StockFlow Inc.</p>
          <p className="mt-1">Production Ready v1.0</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

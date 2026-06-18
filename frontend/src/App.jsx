import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProductManagement from './pages/ProductManagement';
import CustomerManagement from './pages/CustomerManagement';
import OrderManagement from './pages/OrderManagement';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/orders" element={<OrderManagement />} />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-6xl mb-4">🔍</span>
              <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
              <p className="text-slate-400 text-sm max-w-sm mb-6">
                The address you navigated to does not map to any active telemetry route.
              </p>
              <a href="/" className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold transition-all">
                Return to Dashboard
              </a>
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

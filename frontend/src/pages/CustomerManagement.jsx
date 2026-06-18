import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Plus, 
  Trash2, 
  AlertTriangle, 
  X, 
  Check, 
  Search,
  Mail,
  Phone
} from 'lucide-react';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: ''
  });

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomers();
      setCustomers(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to retrieve customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const openAddModal = () => {
    setFormData({
      full_name: '',
      email: '',
      phone_number: ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
  };

  const showToast = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Pre-validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await api.createCustomer(formData);
      showToast(`Customer "${formData.full_name}" registered successfully!`);
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      setError(err.message || 'Failed to create customer');
    }
  };

  const handleDeleteCustomer = async (customer) => {
    if (window.confirm(`Are you sure you want to delete customer "${customer.full_name}"?`)) {
      try {
        await api.deleteCustomer(customer.id);
        showToast(`Customer "${customer.full_name}" removed successfully.`);
        fetchCustomers();
      } catch (err) {
        showToast(err.message || 'Failed to delete customer', 'error');
      }
    }
  };

  // Filter list
  const filteredCustomers = customers.filter(customer =>
    customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone_number && customer.phone_number.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight">Customers</h1>
          <p className="mt-1 text-slate-400 text-sm">Register new client accounts and view ordering profiles.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={20} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Dynamic messages */}
      {success && (
        <div className="bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 px-5 py-4 rounded-xl flex items-center space-x-3 text-sm animate-fade-in">
          <div className="bg-emerald-500 text-slate-950 rounded-full p-0.5">
            <Check size={16} className="stroke-[3]" />
          </div>
          <span>{success}</span>
        </div>
      )}

      {error && !isModalOpen && (
        <div className="bg-red-950/45 border border-red-800/60 text-red-200 px-5 py-4 rounded-xl flex items-center space-x-3 text-sm animate-fade-in">
          <AlertTriangle className="text-red-400 shrink-0" size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Search Filter Card */}
      <div className="glass-panel rounded-2xl p-5 shadow-md">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
          />
        </div>
      </div>

      {/* Customers table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-xs font-medium">Fetching client profiles...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="glass-panel rounded-2xl text-center py-20 shadow-md">
          <span className="text-5xl block mb-4">👥</span>
          <h3 className="text-lg font-bold text-slate-300">No Customers Found</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            {searchTerm 
              ? "No client records matched your keyword search. Try resetting filters."
              : "Your client roster is empty. Register a customer to start placing orders."}
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-800/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800/80 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4.5 px-6 font-medium">Full Name</th>
                  <th className="py-4.5 px-6 font-medium">Email</th>
                  <th className="py-4.5 px-6 font-medium">Phone Number</th>
                  <th className="py-4.5 px-6 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    className="hover:bg-slate-800/15 transition-colors"
                  >
                    <td className="py-4.5 px-6 font-semibold text-slate-200 text-sm">
                      {customer.full_name}
                    </td>
                    <td className="py-4.5 px-6 text-slate-300 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail size={14} className="text-slate-500" />
                        <span>{customer.email}</span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6 text-slate-400 text-xs font-mono">
                      {customer.phone_number ? (
                        <div className="flex items-center space-x-2">
                          <Phone size={14} className="text-slate-500" />
                          <span>{customer.phone_number}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">None</span>
                      )}
                    </td>
                    <td className="py-4.5 px-6">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleDeleteCustomer(customer)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                          title="Delete Customer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Customer Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          ></div>
          
          {/* Form container */}
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 animate-fade-in z-10">
            <button 
              onClick={closeModal}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
            >
              <X size={18} />
            </button>
            
            <h2 className="text-2xl font-bold font-outfit text-white mb-1">
              Add New Customer
            </h2>
            <p className="text-slate-400 text-xs mb-6">
              Create a unique client record. The email address must be unique and valid.
            </p>

            {error && (
              <div className="mb-5 bg-red-950/40 border border-red-800/50 text-red-200 px-4 py-3 rounded-xl flex items-center space-x-2 text-xs">
                <AlertTriangle className="text-red-400 shrink-0" size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4.5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
                  placeholder="e.g. Alice Johnson"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
                  placeholder="e.g. alice.johnson@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number (Optional)</label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
                  placeholder="e.g. +1 (555) 019-2834"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-3 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-lg shadow-brand-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Register Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  X, 
  Check, 
  Search,
  SlidersHorizontal
} from 'lucide-react';

const ProductManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    price: '',
    quantity_in_stock: ''
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
      
      // Check query params for deep-linked edits (e.g. from Dashboard click)
      const queryParams = new URLSearchParams(location.search);
      const editId = queryParams.get('edit');
      if (editId) {
        const productToEdit = data.find(p => p.id === editId);
        if (productToEdit) {
          openEditModal(productToEdit);
        }
        // Clear query param
        navigate('/products', { replace: true });
      }
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to retrieve products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [location.search]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      product_name: '',
      sku: '',
      price: '',
      quantity_in_stock: '0'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      sku: product.sku,
      price: product.price.toString(),
      quantity_in_stock: product.quantity_in_stock.toString()
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
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
    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.quantity_in_stock, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be a positive number greater than 0');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      setError('Stock cannot be negative');
      return;
    }

    try {
      const payload = {
        product_name: formData.product_name,
        sku: formData.sku,
        price: priceNum,
        quantity_in_stock: stockNum
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showToast(`Product "${formData.product_name}" updated successfully!`);
      } else {
        await api.createProduct(payload);
        showToast(`Product "${formData.product_name}" registered successfully!`);
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to delete the product "${product.product_name}"?`)) {
      try {
        await api.deleteProduct(product.id);
        showToast(`Product "${product.product_name}" deleted.`);
        fetchProducts();
      } catch (err) {
        showToast(err.message || 'Failed to delete product', 'error');
      }
    }
  };

  // Filter list
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterLowStock) {
      return matchesSearch && product.quantity_in_stock <= 5;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight">Products</h1>
          <p className="mt-1 text-slate-400 text-sm">Manage inventory stock, descriptions, and SKUs.</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={20} />
          <span>Add Product</span>
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

      {/* Filters card */}
      <div className="glass-panel rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              filterLowStock 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Show Low Stock (≤ 5)</span>
          </button>
        </div>
      </div>

      {/* Products table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-xs font-medium">Fetching catalog details...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-panel rounded-2xl text-center py-20 shadow-md">
          <span className="text-5xl block mb-4">📦</span>
          <h3 className="text-lg font-bold text-slate-300">No Products Found</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            {searchTerm || filterLowStock 
              ? "No catalog items matched your filter keywords. Try resetting query parameters."
              : "Your inventory list is empty. Click 'Add Product' to get started."}
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-800/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800/80 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4.5 px-6 font-medium">Product Name</th>
                  <th className="py-4.5 px-6 font-medium">SKU</th>
                  <th className="py-4.5 px-6 font-medium text-right">Price</th>
                  <th className="py-4.5 px-6 font-medium text-right">Stock</th>
                  <th className="py-4.5 px-6 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredProducts.map((product) => {
                  const isLow = product.quantity_in_stock <= 5;
                  const isOut = product.quantity_in_stock === 0;
                  
                  return (
                    <tr 
                      key={product.id} 
                      className="hover:bg-slate-800/15 transition-colors group"
                    >
                      <td className="py-4 px-6 font-semibold text-slate-200 text-sm">
                        {product.product_name}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-400">
                        {product.sku}
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-slate-200 text-sm">
                        ${parseFloat(product.price).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isOut 
                            ? 'bg-red-500/10 text-red-400' 
                            : isLow 
                            ? 'bg-amber-500/10 text-amber-400' 
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isOut ? 'bg-red-400' : isLow ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}></span>
                          <span>{product.quantity_in_stock} units</span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-slate-400 hover:text-brand-400 hover:bg-brand-500/5 rounded-lg transition-all"
                            title="Edit Product"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit/Create Product Modal Overlay */}
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
              {editingProduct ? 'Edit Product Catalog' : 'Add New Product'}
            </h2>
            <p className="text-slate-400 text-xs mb-6">
              {editingProduct ? 'Update product pricing and inventory tracking levels.' : 'Create a new catalog item with unique identifier SKU.'}
            </p>

            {error && (
              <div className="mb-5 bg-red-950/40 border border-red-800/50 text-red-200 px-4 py-3 rounded-xl flex items-center space-x-2 text-xs">
                <AlertTriangle className="text-red-400 shrink-0" size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4.5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  required
                  value={formData.product_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
                  placeholder="e.g. Mechanical Keyboard"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">SKU (Stock Keeping Unit)</label>
                <input
                  type="text"
                  name="sku"
                  required
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm font-mono transition-all"
                  placeholder="e.g. PROD-KYB-05"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
                    placeholder="89.99"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Initial Stock</label>
                  <input
                    type="number"
                    step="1"
                    name="quantity_in_stock"
                    required
                    value={formData.quantity_in_stock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm transition-all"
                    placeholder="40"
                  />
                </div>
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
                  {editingProduct ? 'Save Changes' : 'Register Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;

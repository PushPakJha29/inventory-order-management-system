import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Plus, 
  Trash2, 
  AlertTriangle, 
  X, 
  Check, 
  ShoppingCart,
  Eye,
  Calendar,
  DollarSign,
  User,
  ShoppingBag
} from 'lucide-react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Create Order states
  const [orderCustomer, setOrderCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([]); // Array of { product_id, quantity, product_name, price, sku }
  
  // Current Item builder states
  const [currentProduct, setCurrentProduct] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [availableStock, setAvailableStock] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, productsData, customersData] = await Promise.all([
        api.getOrders(),
        api.getProducts(),
        api.getCustomers()
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setCustomers(customersData);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to retrieve order logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Handle Product select during order creation
  const handleProductChange = (productId) => {
    setCurrentProduct(productId);
    const prod = products.find(p => p.id === productId);
    if (prod) {
      setAvailableStock(prod.quantity_in_stock);
      setCurrentQuantity(1);
    } else {
      setAvailableStock(0);
    }
  };

  // Add item to temporary cart
  const addItemToCart = () => {
    if (!currentProduct) {
      showToast('Please select a product', 'error');
      return;
    }

    const prod = products.find(p => p.id === currentProduct);
    if (!prod) return;

    // Check if item already exists in cart
    const existingIndex = orderItems.findIndex(item => item.product_id === currentProduct);
    const proposedQuantity = existingIndex > -1 
      ? orderItems[existingIndex].quantity + currentQuantity 
      : currentQuantity;

    // Validate stock locally first
    if (proposedQuantity > prod.quantity_in_stock) {
      showToast(
        `Insufficient stock for ${prod.product_name}. Available: ${prod.quantity_in_stock}, Cart total: ${proposedQuantity}`, 
        'error'
      );
      return;
    }

    if (existingIndex > -1) {
      const updated = [...orderItems];
      updated[existingIndex].quantity = proposedQuantity;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          product_id: prod.id,
          product_name: prod.product_name,
          sku: prod.sku,
          price: parseFloat(prod.price),
          quantity: currentQuantity
        }
      ]);
    }

    // Reset picker
    setCurrentProduct('');
    setCurrentQuantity(1);
    setAvailableStock(0);
  };

  const removeItemFromCart = (index) => {
    const updated = [...orderItems];
    updated.splice(index, 1);
    setOrderItems(updated);
  };

  // Compute live preview cart subtotal
  const cartTotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCreateOrderSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!orderCustomer) {
      setError('Please select a customer');
      return;
    }

    if (orderItems.length === 0) {
      setError('Please add at least one product to the order');
      return;
    }

    try {
      const payload = {
        customer_id: orderCustomer,
        items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };

      await api.createOrder(payload);
      showToast('Order placed successfully! Inventory stock levels updated.');
      setIsCreateOpen(false);
      
      // Reset forms
      setOrderCustomer('');
      setOrderItems([]);
      
      // Refresh list
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to place order');
    }
  };

  const handleOpenDetails = async (orderId) => {
    try {
      setLoading(true);
      const detail = await api.getOrderById(orderId);
      setSelectedOrder(detail);
      setIsDetailsOpen(true);
    } catch (err) {
      showToast(err.message || 'Failed to fetch order details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (order) => {
    if (window.confirm(`Are you sure you want to cancel Order #${order.id.substring(0, 8)}? This will automatically restore the stock to products.`)) {
      try {
        await api.deleteOrder(order.id);
        showToast(`Order cancelled. Stock restocked to products.`);
        fetchData();
      } catch (err) {
        showToast(err.message || 'Failed to cancel order', 'error');
      }
    }
  };

  const openCreateModal = () => {
    setOrderCustomer('');
    setOrderItems([]);
    setCurrentProduct('');
    setCurrentQuantity(1);
    setAvailableStock(0);
    setError('');
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-white tracking-tight">Orders</h1>
          <p className="mt-1 text-slate-400 text-sm">Review transactions, build cart purchases, and manage cancellations.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={20} />
          <span>Create Order</span>
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 px-5 py-4 rounded-xl flex items-center space-x-3 text-sm animate-fade-in">
          <div className="bg-emerald-500 text-slate-950 rounded-full p-0.5">
            <Check size={16} className="stroke-[3]" />
          </div>
          <span>{success}</span>
        </div>
      )}

      {error && !isCreateOpen && (
        <div className="bg-red-950/45 border border-red-800/60 text-red-200 px-5 py-4 rounded-xl flex items-center space-x-3 text-sm animate-fade-in">
          <AlertTriangle className="text-red-400 shrink-0" size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Orders log table */}
      {loading && orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-xs font-medium">Loading ledger activity...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-panel rounded-2xl text-center py-20 shadow-md">
          <span className="text-5xl block mb-4">🛒</span>
          <h3 className="text-lg font-bold text-slate-300">No Orders Registered</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            Your transaction history log is empty. Place an order to execute stock reductions and client purchases.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-slate-800/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800/80 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4.5 px-6 font-medium">Order ID</th>
                  <th className="py-4.5 px-6 font-medium">Customer</th>
                  <th className="py-4.5 px-6 font-medium">Date</th>
                  <th className="py-4.5 px-6 font-medium text-right">Total Amount</th>
                  <th className="py-4.5 px-6 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {orders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-slate-800/15 transition-colors"
                  >
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-400">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-200 font-semibold">
                      {order.customer_name}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <Calendar size={13} className="text-slate-500" />
                        <span>{new Date(order.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-brand-400 text-sm">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleOpenDetails(order.id)}
                          className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-brand-500/5 rounded-lg transition-all inline-flex items-center space-x-1"
                          title="View Details"
                        >
                          <Eye size={15} />
                          <span className="text-xxs font-semibold uppercase tracking-wider">Details</span>
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all inline-flex items-center space-x-1"
                          title="Cancel Order"
                        >
                          <Trash2 size={15} />
                          <span className="text-xxs font-semibold uppercase tracking-wider">Cancel</span>
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

      {/* Modal: Create Order */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)}></div>
          
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 animate-fade-in z-10 max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
            >
              <X size={18} />
            </button>
            
            <h2 className="text-2xl font-bold font-outfit text-white mb-1">Create Purchase Order</h2>
            <p className="text-slate-400 text-xs mb-5">Draft a new order, calculate totals, and update stock counts.</p>

            {error && (
              <div className="mb-4 bg-red-950/40 border border-red-800/50 text-red-200 px-4 py-3 rounded-xl flex items-center space-x-2 text-xs">
                <AlertTriangle className="text-red-400 shrink-0" size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateOrderSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Select Customer */}
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <User size={13} className="text-slate-500" />
                  <span>Select Customer</span>
                </label>
                <select
                  required
                  value={orderCustomer}
                  onChange={(e) => setOrderCustomer(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-500 text-sm transition-all"
                >
                  <option value="">-- Choose registered customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                  ))}
                </select>
              </div>

              {/* Add Cart items section */}
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShoppingBag size={13} className="text-slate-500" />
                  <span>Build Cart Line Items</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Select Product</label>
                    <select
                      value={currentProduct}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-500 text-xs transition-all"
                    >
                      <option value="">-- Select items (shows SKU & Stock) --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.quantity_in_stock === 0}>
                          {p.product_name} - ${parseFloat(p.price).toFixed(2)} ({p.quantity_in_stock} left) {p.quantity_in_stock === 0 ? '[OUT OF STOCK]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-2">
                    <div className="w-24">
                      <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        max={availableStock || 9999}
                        value={currentQuantity}
                        onChange={(e) => setCurrentQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-brand-500 text-xs transition-all"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={addItemToCart}
                      className="flex-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all"
                    >
                      Add Item
                    </button>
                  </div>
                </div>

                {availableStock > 0 && (
                  <p className="text-[11px] text-brand-400">
                    * In Stock: <span className="font-bold">{availableStock}</span> units. Max quantity allowed.
                  </p>
                )}
              </div>

              {/* Cart Preview Table */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cart Preview</h4>
                {orderItems.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                    Cart is empty. Select products and quantity to compile order.
                  </div>
                ) : (
                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse bg-slate-950">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider font-semibold bg-slate-900/40">
                          <th className="py-2.5 px-4">Product</th>
                          <th className="py-2.5 px-4 text-right">Price</th>
                          <th className="py-2.5 px-4 text-center">Qty</th>
                          <th className="py-2.5 px-4 text-right">Total</th>
                          <th className="py-2.5 px-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs">
                        {orderItems.map((item, index) => (
                          <tr key={item.product_id} className="hover:bg-slate-900/20">
                            <td className="py-2.5 px-4 text-slate-300 font-semibold">{item.product_name}</td>
                            <td className="py-2.5 px-4 text-right text-slate-400">${item.price.toFixed(2)}</td>
                            <td className="py-2.5 px-4 text-center text-slate-300 font-bold">{item.quantity}</td>
                            <td className="py-2.5 px-4 text-right text-slate-200 font-semibold">${(item.price * item.quantity).toFixed(2)}</td>
                            <td className="py-2.5 px-4 text-center">
                              <button 
                                type="button" 
                                onClick={() => removeItemFromCart(index)}
                                className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-900/60 font-semibold text-slate-200">
                          <td colSpan="3" className="py-3 px-4 text-right uppercase text-[10px] tracking-wider text-slate-400">Grand Total:</td>
                          <td className="py-3 px-4 text-right text-sm font-bold text-brand-400">${cartTotal.toFixed(2)}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-3 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderItems.length === 0}
                  className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-brand-500 text-white text-sm font-semibold shadow-lg shadow-brand-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Order Details */}
      {isDetailsOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsDetailsOpen(false)}></div>
          
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 animate-fade-in z-10">
            <button 
              onClick={() => setIsDetailsOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
            >
              <X size={18} />
            </button>
            
            <h2 className="text-2xl font-bold font-outfit text-white mb-1">Order Details</h2>
            <p className="text-slate-400 text-xs mb-6 font-mono uppercase">ID: #{selectedOrder.id}</p>

            <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800/60">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Customer Name</span>
                <span className="text-sm font-bold text-slate-200">{selectedOrder.customer_name}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-semibold">Date Placed</span>
                <span className="text-sm text-slate-300">{new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
            </div>

            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Purchased items</h4>
            <div className="border border-slate-800 rounded-xl overflow-hidden mb-6">
              <table className="w-full text-left border-collapse bg-slate-950">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider font-semibold bg-slate-900/40">
                    <th className="py-2.5 px-4">Product</th>
                    <th className="py-2.5 px-4">SKU</th>
                    <th className="py-2.5 px-4 text-right">Price</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/10">
                      <td className="py-2.5 px-4 text-slate-300 font-semibold">{item.product_name}</td>
                      <td className="py-2.5 px-4 text-slate-400 font-mono text-xxs uppercase">{item.sku}</td>
                      <td className="py-2.5 px-4 text-right text-slate-400">${parseFloat(item.unit_price).toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-center text-slate-300 font-bold">{item.quantity}</td>
                      <td className="py-2.5 px-4 text-right text-slate-200 font-semibold">
                        ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-900/60 font-semibold text-slate-200">
                    <td colSpan="4" className="py-3 px-4 text-right uppercase text-[10px] tracking-wider text-slate-400">Total Charged:</td>
                    <td className="py-3 px-4 text-right text-sm font-extrabold text-brand-400">${parseFloat(selectedOrder.total_amount).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

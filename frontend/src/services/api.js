import axios from 'axios';

// Resolve the backend API base url from environment variables
const API_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to format error responses consistently for pages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract error message formatted by FastAPI exception handler
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export const api = {
  // Dashboard
  getDashboardStats: async () => {
    const res = await apiClient.get('/dashboard');
    return res.data;
  },

  // Products CRUD
  getProducts: async () => {
    const res = await apiClient.get('/products');
    return res.data;
  },
  getProductById: async (id) => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
  },
  createProduct: async (productData) => {
    const res = await apiClient.post('/products', productData);
    return res.data;
  },
  updateProduct: async (id, productData) => {
    const res = await apiClient.put(`/products/${id}`, productData);
    return res.data;
  },
  deleteProduct: async (id) => {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  },

  // Customers CRUD
  getCustomers: async () => {
    const res = await apiClient.get('/customers');
    return res.data;
  },
  getCustomerById: async (id) => {
    const res = await apiClient.get(`/customers/${id}`);
    return res.data;
  },
  createCustomer: async (customerData) => {
    const res = await apiClient.post('/customers', customerData);
    return res.data;
  },
  deleteCustomer: async (id) => {
    const res = await apiClient.delete(`/customers/${id}`);
    return res.data;
  },

  // Orders CRUD
  getOrders: async () => {
    const res = await apiClient.get('/orders');
    return res.data;
  },
  getOrderById: async (id) => {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data;
  },
  createOrder: async (orderData) => {
    const res = await apiClient.post('/orders', orderData);
    return res.data;
  },
  deleteOrder: async (id) => {
    const res = await apiClient.delete(`/orders/${id}`);
    return res.data;
  },
};

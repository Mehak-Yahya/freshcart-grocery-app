import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("freshcartToken");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Products API
export const productAPI = {
  getAll: async () => {
    const response = await apiClient.get("/products");
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  create: async (productData) => {
    const response = await apiClient.post("/products", productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};

// Orders API
export const orderAPI = {
  create: async (orderData) => {
    const response = await apiClient.post("/orders", orderData);
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get("/orders");
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await apiClient.put(`/orders/${id}`, { status });
    return response.data;
  },
};

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getStats: async () => {
    const response = await apiClient.get("/admin/stats");
    return response.data;
  },

  getOrders: async () => {
    const response = await apiClient.get("/admin/orders");
    return response.data;
  },

  getRiders: async () => {
    const response = await apiClient.get("/admin/riders");
    return response.data;
  },

  assignOrderToRider: async (orderId, riderId) => {
    const response = await apiClient.put(`/admin/riders/orders/${orderId}/assign`, {
      assignedRider: riderId,
    });
    return response.data;
  },
};

// Rider API
export const riderAPI = {
  getDeliveries: async () => {
    const response = await apiClient.get("/rider/deliveries");
    return response.data;
  },

  updateDeliveryStatus: async (orderId, status) => {
    const response = await apiClient.put(`/rider/deliveries/${orderId}`, {
      status,
    });
    return response.data;
  },

  getEarnings: async () => {
    const response = await apiClient.get("/rider/earnings");
    return response.data;
  },

  toggleAvailability: async (isAvailable) => {
    const response = await apiClient.put("/rider/availability", {
      isAvailable,
    });
    return response.data;
  },

  getHistory: async (startDate, endDate, status) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (status) params.status = status;

    const response = await apiClient.get("/rider/history", { params });
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get("/rider/profile");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put("/rider/profile", profileData);
    return response.data;
  },

  updateLocation: async (latitude, longitude) => {
    const response = await apiClient.put("/rider/location", {
      latitude,
      longitude,
    });
    return response.data;
  },

  submitSupport: async (type, subject, message, orderId) => {
    const response = await apiClient.post("/rider/support", {
      type,
      subject,
      message,
      orderId: orderId || null,
    });
    return response.data;
  },
};
// Customer API
export const customerAPI = {
  getProfile: async () => {
    const response = await apiClient.get("/customer/profile");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put("/customer/profile", profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await apiClient.put("/customer/change-password", passwordData);
    return response.data;
  },

  getOrders: async () => {
    const response = await apiClient.get("/customer/orders");
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await apiClient.get(`/customer/orders/${id}`);
    return response.data;
  },
};
export default apiClient;

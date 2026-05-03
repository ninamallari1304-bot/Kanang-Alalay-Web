import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

const normalizedApiUrl = String(API_URL || "").replace(/\/$/, "");
if (!normalizedApiUrl || normalizedApiUrl === "undefined") {
  console.error("Invalid API_URL in mobile/services/api.js:", API_URL);
}

const api = axios.create({
  baseURL: `${normalizedApiUrl}/api`,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

console.log("Axios baseURL:", api.defaults.baseURL);

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem("token");
      AsyncStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

const loginUrl = `${normalizedApiUrl}/api/auth/login`;

export const login = async (username, password) => {
  try {
    return await api.post("/auth/login", { username, password });
  } catch (error) {
    console.warn('Login request failed with Axios:', error?.message || error);
    if (error?.message === 'Network Error') {
      console.warn('Falling back to fetch for login request.');
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        const fetchError = new Error(data.message || 'Login failed');
        fetchError.response = { status: response.status, data };
        throw fetchError;
      }

      return { data };
    }
    throw error;
  }
};

export const register = (userData) => api.post("/auth/register", userData);

export const getResidents = () => api.get("/residents");
export const getMyAssignedResidents = () => api.get("/residents/assigned");
export const getResidentsByWard = (ward) => api.get(`/residents/ward/${ward}`);
export const getResidentById = (id) => api.get(`/residents/${id}`);
export const createResident = (data) => api.post("/residents", data);
export const updateResident = (id, data) => api.put(`/residents/${id}`, data);
export const deleteResident = (id) => api.delete(`/residents/${id}`);

export const getResidentMedications = (residentId) =>
  api.get(`/medications/resident/${residentId}`);
export const getMedicationById = (id) => api.get(`/medications/${id}`);
export const getMedications = () => api.get('/medications');
export const scanMedication = (code) => api.post('/medications/scan', { code });
export const updateMedicationStock = (id, data) => api.post(`/medications/${id}/stock`, data);
export const createMedication = (data) => api.post("/medications", data);
export const administerMedication = (data) =>
  api.post("/medications/administer", data);
export const getMedicationHistory = (residentId) =>
  api.get(`/medications/history/${residentId}`);
export const updateMedication = (id, data) =>
  api.put(`/medications/${id}`, data);
export const getTodaySchedule = () => api.get('/head-caregiver/schedule');

export const getInventory = () => api.get("/inventory");
export const getLowStock = async () => {
  try {
    return await api.get("/inventory/low-stock");
  } catch (error) {
    if (error.response?.status === 404) {
      const inventoryRes = await getInventory();
      const inventoryItems = inventoryRes.data?.data || [];
      const lowStockItems = inventoryItems.filter(item => item.quantity <= (item.minThreshold ?? 10));
      return { data: { success: true, data: lowStockItems } };
    }
    throw error;
  }
};
export const getInventoryItem = (id) => api.get(`/inventory/${id}`);
export const createInventoryItem = (data) => api.post("/inventory", data);
export const scanInventory = (code) => api.post('/inventory/scan', { code });
export const updateInventory = (id, data) => api.put(`/inventory/${id}`, data);
export const deleteInventoryItem = (id) => api.delete(`/inventory/${id}`);
export const decrementInventoryByName = async (name) => {
  const inventory = await getInventory();
  const item = inventory.data.find(item => item.name === name);
  if (item && item.quantity > 0) {
    return updateInventory(item._id, { quantity: item.quantity - 1 });
  } else {
    throw new Error('Item not found or out of stock');
  }
};

export const getAlerts = () => api.get("/alerts");
export const getUnreadAlerts = () => api.get("/alerts/unread");
export const markAlertRead = (id) => api.put(`/alerts/${id}/read`);
export const markAllAlertsRead = () => api.put("/alerts/mark-all-read");
export const createAlert = (data) => api.post("/alerts", data);

export default api;

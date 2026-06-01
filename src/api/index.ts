import axios from 'axios';
import { useAuthStore } from '../store';
import { ApiResponse, PaginatedResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username: string, password: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getCurrentUser: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  changePassword: async (data: { oldPassword: string; newPassword: string }): Promise<ApiResponse> => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },
};

export const orderApi = {
  getOrders: async (params?: {
    status?: string;
    playerId?: string;
    customerId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  getOrder: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  createOrder: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/orders', data);
    return response.data;
  },
  updateOrder: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },
  updateOrderStatus: async (id: string, data: {
    status: string;
    progress?: number;
    note?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/orders/${id}/status`, data);
    return response.data;
  },
  publishOrder: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/orders/${id}/publish`);
    return response.data;
  },
  assignOrder: async (id: string, playerId: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/orders/${id}/assign`, { playerId });
    return response.data;
  },
  deleteOrder: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};

export const playerApi = {
  getPlayers: async (params?: {
    status?: string;
    minCredit?: number;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> => {
    const response = await api.get('/players', { params });
    return response.data;
  },
  getPlayer: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/players/${id}`);
    return response.data;
  },
  getPlayerPerformance: async (id: string, params: {
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.get(`/players/${id}/performance`, { params });
    return response.data;
  },
  updatePlayer: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/players/${id}`, data);
    return response.data;
  },
  createPlayer: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/players', data);
    return response.data;
  },
};

export const customerApi = {
  getCustomers: async (params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> => {
    const response = await api.get('/customers', { params });
    return response.data;
  },
  getCustomer: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  createCustomer: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/customers', data);
    return response.data;
  },
  updateCustomer: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },
};

export const financeApi = {
  getBalance: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/finance/balance');
    return response.data;
  },
  getWithdrawals: async (params?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> => {
    const response = await api.get('/finance/withdrawals', { params });
    return response.data;
  },
  createWithdrawal: async (data: {
    amount: number;
    bankName: string;
    bankAccount: string;
    bankBranch?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/finance/withdraw', data);
    return response.data;
  },
  reviewWithdrawal: async (id: string, data: {
    status: 'approved' | 'rejected';
    rejectionReason?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/finance/withdraw/${id}/review`, data);
    return response.data;
  },
  executeWithdrawal: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/finance/withdraw/${id}/execute`);
    return response.data;
  },
  getReport: async (params: {
    type: 'daily' | 'weekly' | 'monthly';
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.get('/finance/report', { params });
    return response.data;
  },
  getPayments: async (params?: {
    type?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> => {
    const response = await api.get('/finance/payments', { params });
    return response.data;
  },
};

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export const wecomApi = {
  getConfig: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/wecom/config');
    return response.data;
  },
  updateConfig: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.put('/wecom/config', data);
    return response.data;
  },
  sendTestMessage: async (): Promise<ApiResponse<any>> => {
    const response = await api.post('/wecom/test-message');
    return response.data;
  },
  sendMessage: async (data: {
    msgType: 'text' | 'markdown' | 'image';
    content: string;
    mentionedList?: string[];
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/wecom/send', data);
    return response.data;
  },
};

export const memberApi = {
  getMembers: async (params?: {
    level?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> => {
    const response = await api.get('/members', { params });
    return response.data;
  },
  getMember: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/members/${id}`);
    return response.data;
  },
  getMemberByPhone: async (phone: string): Promise<ApiResponse<any>> => {
    const response = await api.get('/members/search/phone', { params: { phone } });
    return response.data;
  },
  createMember: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/members', data);
    return response.data;
  },
  updateMember: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/members/${id}`, data);
    return response.data;
  },
  rechargeMember: async (id: string, data: {
    amount: number;
    paymentMethod: string;
    operatorId: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post(`/members/${id}/recharge`, data);
    return response.data;
  },
  getMemberRecharges: async (memberId: string, params?: {
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> => {
    const response = await api.get(`/members/${memberId}/recharges`, { params });
    return response.data;
  },
  consumeMember: async (id: string, data: {
    amount: number;
    orderId?: string;
    description?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post(`/members/${id}/consume`, data);
    return response.data;
  },
};

export const employeeApi = {
  getDepartments: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/employees/departments');
    return response.data;
  },
  createDepartment: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/employees/departments', data);
    return response.data;
  },
  updateDepartment: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/employees/departments/${id}`, data);
    return response.data;
  },
  getPositions: async (params?: { departmentId?: string }): Promise<ApiResponse<any>> => {
    const response = await api.get('/employees/positions', { params });
    return response.data;
  },
  createPosition: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/employees/positions', data);
    return response.data;
  },
  updatePosition: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/employees/positions/${id}`, data);
    return response.data;
  },
  getEmployees: async (params?: {
    departmentId?: string;
    positionId?: string;
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> => {
    const response = await api.get('/employees', { params });
    return response.data;
  },
  getEmployee: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
  createEmployee: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/employees', data);
    return response.data;
  },
  updateEmployee: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },
  getPermissions: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/employees/permissions');
    return response.data;
  },
  getPositionPermissions: async (positionId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/employees/positions/${positionId}/permissions`);
    return response.data;
  },
  updatePositionPermissions: async (positionId: string, data: {
    permissionIds: string[];
  }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/employees/positions/${positionId}/permissions`, data);
    return response.data;
  },
};

export const serviceApi = {
  getServices: async (params?: {
    gameType?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> => {
    const response = await api.get('/services', { params });
    return response.data;
  },
  getService: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
  createService: async (data: {
    name: string;
    gameType: string;
    basePrice: number;
    baseHafCoins: number;
    description?: string;
    status?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/services', data);
    return response.data;
  },
  updateService: async (id: string, data: {
    name?: string;
    gameType?: string;
    basePrice?: number;
    baseHafCoins?: number;
    description?: string;
    status?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },
  deleteService: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};

export const handoffApi = {
  getHandoffs: async (params?: {
    status?: string;
    shiftType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> => {
    const response = await api.get('/handoffs', { params });
    return response.data;
  },
  getHandoff: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/handoffs/${id}`);
    return response.data;
  },
  createHandoff: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/handoffs', data);
    return response.data;
  },
  confirmHandoff: async (id: string, data?: { notes?: string }): Promise<ApiResponse<any>> => {
    const response = await api.post(`/handoffs/${id}/confirm`, data);
    return response.data;
  },
  cancelHandoff: async (id: string, data: { reason: string }): Promise<ApiResponse<any>> => {
    const response = await api.post(`/handoffs/${id}/cancel`, data);
    return response.data;
  },
  addHandoffMessage: async (id: string, data: {
    content: string;
    type: 'text' | 'image' | 'file';
  }): Promise<ApiResponse<any>> => {
    const response = await api.post(`/handoffs/${id}/messages`, data);
    return response.data;
  },
};

export default api;

import { create } from 'zustand';
import { User, Order, Player, Customer, Withdrawal } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  refreshUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  login: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  refreshUser: (user) => {
    set({ user });
  },
}));

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  setOrders: (orders: Order[]) => void;
  setCurrentOrder: (order: Order | null) => void;
  setLoading: (loading: boolean) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  addOrder: (order: Order) => void;
  removeOrder: (id: string) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  setOrders: (orders) => set({ orders }),
  setCurrentOrder: (order) => set({ currentOrder: order }),
  setLoading: (loading) => set({ loading }),
  updateOrder: (id, updates) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    })),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  removeOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    })),
}));

interface PlayerState {
  players: Player[];
  currentPlayer: Player | null;
  loading: boolean;
  setPlayers: (players: Player[]) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setLoading: (loading: boolean) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  players: [],
  currentPlayer: null,
  loading: false,
  setPlayers: (players) => set({ players }),
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  setLoading: (loading) => set({ loading }),
  updatePlayer: (id, updates) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
}));

interface WithdrawalState {
  withdrawals: Withdrawal[];
  loading: boolean;
  setWithdrawals: (withdrawals: Withdrawal[]) => void;
  setLoading: (loading: boolean) => void;
  updateWithdrawal: (id: string, updates: Partial<Withdrawal>) => void;
}

export const useWithdrawalStore = create<WithdrawalState>((set) => ({
  withdrawals: [],
  loading: false,
  setWithdrawals: (withdrawals) => set({ withdrawals }),
  setLoading: (loading) => set({ loading }),
  updateWithdrawal: (id, updates) =>
    set((state) => ({
      withdrawals: state.withdrawals.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    })),
}));

interface NotificationState {
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  addNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (type, message) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: Date.now().toString(), type, message, timestamp: Date.now() },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));

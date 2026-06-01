import type { User, Player, Customer, Order, Withdrawal, Payment } from '../types';

interface SupabaseConfig {
  url: string;
  key: string;
}

class SupabaseService {
  private config: SupabaseConfig = {
    url: '',
    key: '',
  };

  private get isPublishableKey(): boolean {
    return this.config.key.startsWith('sb_publishable_');
  }

  private get isSecretKey(): boolean {
    return this.config.key.startsWith('sb_secret_');
  }

  private get isNewKeyFormat(): boolean {
    return this.isPublishableKey || this.isSecretKey;
  }

  setConfig(config: SupabaseConfig) {
    this.config = config;
  }

  getConfig() {
    return {
      url: this.config.url ? '******' : '',
      key: this.config.key ? '******' : '',
      keyType: this.isNewKeyFormat
        ? (this.isSecretKey ? 'secret' : 'publishable')
        : 'legacy',
      configured: !!(this.config.url && this.config.key),
    };
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    headers['apikey'] = this.config.key;
    headers['Authorization'] = `Bearer ${this.config.key}`;

    return headers;
  }

  private async request(
    path: string,
    options: RequestInit = {}
  ): Promise<{ ok: boolean; status: number; data: any; error?: string }> {
    const url = `${this.config.url}/rest/v1${path}`;
    const headers = this.getHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {}),
        },
      });

      const text = await response.text();
      let data: any = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!response.ok) {
        return {
          ok: false,
          status: response.status,
          data,
          error: data?.message || data?.error || `HTTP ${response.status}`,
        };
      }

      return { ok: true, status: response.status, data };
    } catch (e: any) {
      return {
        ok: false,
        status: 0,
        data: null,
        error: e?.message || 'Network error',
      };
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string; info?: string }> {
    if (!this.config.url || !this.config.key) {
      return { success: false, error: '未配置 Supabase' };
    }

    try {
      const result = await this.request('/users?select=id&limit=1');

      if (result.ok) {
        return {
          success: true,
          info: `连接成功 (${this.getConfig().keyType} key)`,
        };
      }

      if (result.status === 404) {
        const tableCheck = await this.request('/orders?select=id&limit=1');
        if (tableCheck.ok || tableCheck.status === 404) {
          return {
            success: true,
            info: '连接成功，但需要先创建表',
          };
        }
      }

      return {
        success: false,
        error: result.error || `HTTP ${result.status}`,
      };
    } catch (e: any) {
      return { success: false, error: e?.message || '未知错误' };
    }
  }

  async getAllUsers(): Promise<User[]> {
    const result = await this.request('/users?select=*');
    if (!result.ok) {
      console.error('获取用户失败:', result.error);
      return [];
    }
    return (result.data || []).map(this.mapUser);
  }

  async getAllOrders(): Promise<Order[]> {
    const result = await this.request('/orders?select=*');
    if (!result.ok) {
      console.error('获取订单失败:', result.error);
      return [];
    }
    return (result.data || []).map(this.mapOrder);
  }

  async getAllPlayers(): Promise<Player[]> {
    const result = await this.request('/players?select=*');
    if (!result.ok) {
      console.error('获取打手失败:', result.error);
      return [];
    }
    return (result.data || []).map(this.mapPlayer);
  }

  async getAllCustomers(): Promise<Customer[]> {
    const result = await this.request('/customers?select=*');
    if (!result.ok) {
      console.error('获取客户失败:', result.error);
      return [];
    }
    return (result.data || []).map(this.mapCustomer);
  }

  async saveUser(user: User): Promise<{ success: boolean; error?: string }> {
    const data = this.mapUserToDb(user);
    const result = await this.request('/users', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(data),
    });
    return { success: result.ok, error: result.error };
  }

  async saveOrder(order: Order): Promise<{ success: boolean; error?: string }> {
    const data = this.mapOrderToDb(order);
    const result = await this.request('/orders', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(data),
    });
    return { success: result.ok, error: result.error };
  }

  async savePlayer(player: Player): Promise<{ success: boolean; error?: string }> {
    const data = this.mapPlayerToDb(player);
    const result = await this.request('/players', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(data),
    });
    return { success: result.ok, error: result.error };
  }

  async saveCustomer(customer: Customer): Promise<{ success: boolean; error?: string }> {
    const data = this.mapCustomerToDb(customer);
    const result = await this.request('/customers', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(data),
    });
    return { success: result.ok, error: result.error };
  }

  async saveWithdrawal(withdrawal: Withdrawal): Promise<{ success: boolean; error?: string }> {
    const data = {
      id: withdrawal.id,
      player_id: withdrawal.playerId,
      amount: withdrawal.amount,
      status: withdrawal.status,
      bank_account: withdrawal.bankAccount,
      bank_name: withdrawal.bankName,
      created_at: withdrawal.createdAt,
      updated_at: withdrawal.updatedAt,
    };
    const result = await this.request('/withdrawals', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(data),
    });
    return { success: result.ok, error: result.error };
  }

  async savePayment(payment: Payment): Promise<{ success: boolean; error?: string }> {
    const data = {
      id: payment.id,
      order_id: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      transaction_id: payment.transactionId,
      created_at: payment.createdAt,
      updated_at: payment.updatedAt,
    };
    const result = await this.request('/payments', {
      method: 'POST',
      headers: { 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(data),
    });
    return { success: result.ok, error: result.error };
  }

  async syncAllData(
    users: User[],
    orders: Order[],
    players: Player[],
    customers: Customer[],
    withdrawals: Withdrawal[],
    payments: Payment[]
  ): Promise<{ success: boolean; count: number; errors: string[] }> {
    let count = 0;
    const errors: string[] = [];

    for (const user of users) {
      const r = await this.saveUser(user);
      if (r.success) count++;
      else if (r.error) errors.push(`User ${user.username}: ${r.error}`);
    }
    for (const order of orders) {
      const r = await this.saveOrder(order);
      if (r.success) count++;
      else if (r.error) errors.push(`Order ${order.orderNo}: ${r.error}`);
    }
    for (const player of players) {
      const r = await this.savePlayer(player);
      if (r.success) count++;
      else if (r.error) errors.push(`Player ${player.playerName}: ${r.error}`);
    }
    for (const customer of customers) {
      const r = await this.saveCustomer(customer);
      if (r.success) count++;
      else if (r.error) errors.push(`Customer ${customer.customerName}: ${r.error}`);
    }
    for (const withdrawal of withdrawals) {
      const r = await this.saveWithdrawal(withdrawal);
      if (r.success) count++;
      else if (r.error) errors.push(`Withdrawal: ${r.error}`);
    }
    for (const payment of payments) {
      const r = await this.savePayment(payment);
      if (r.success) count++;
      else if (r.error) errors.push(`Payment: ${r.error}`);
    }

    return { success: errors.length === 0, count, errors };
  }

  private mapUser(item: any): User {
    return {
      id: item.id,
      username: item.username,
      name: item.name,
      password: item.password,
      role: item.role,
      permissions: item.permissions || [],
      email: item.email,
      phone: item.phone,
      status: item.status,
      positionId: item.position_id,
      positionName: item.position_name,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  private mapOrder(item: any): Order {
    return {
      id: item.id,
      orderNo: item.order_no,
      customerId: item.customer_id,
      game: item.game,
      content: item.content,
      price: item.price,
      status: item.status,
      requiredPlayersCount: item.required_players_count,
      playerIds: item.player_ids || [],
      progress: item.progress,
      completionTime: item.completion_time,
      requirements: item.requirements,
      notes: item.notes,
      createdBy: item.created_by,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  private mapPlayer(item: any): Player {
    return {
      id: item.id,
      playerName: item.player_name,
      playerId: item.player_id,
      type: item.type,
      creditScore: item.credit_score,
      balance: item.balance,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  private mapCustomer(item: any): Customer {
    return {
      id: item.id,
      customerName: item.customer_name,
      phone: item.phone,
      email: item.email,
      totalOrders: item.total_orders,
      totalSpent: item.total_spent,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
  }

  private mapUserToDb(user: User): any {
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      password: user.password,
      role: user.role,
      permissions: user.permissions,
      email: user.email,
      phone: user.phone,
      status: user.status,
      position_id: user.positionId,
      position_name: user.positionName,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  private mapOrderToDb(order: Order): any {
    return {
      id: order.id,
      order_no: order.orderNo,
      customer_id: order.customerId,
      game: order.game,
      content: order.content,
      price: order.price,
      status: order.status,
      required_players_count: order.requiredPlayersCount,
      player_ids: order.playerIds,
      progress: order.progress,
      completion_time: order.completionTime,
      requirements: order.requirements,
      notes: order.notes,
      created_by: order.createdBy,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    };
  }

  private mapPlayerToDb(player: Player): any {
    return {
      id: player.id,
      player_name: player.playerName,
      player_id: player.playerId,
      type: player.type,
      credit_score: player.creditScore,
      balance: player.balance,
      status: player.status,
      created_at: player.createdAt,
      updated_at: player.updatedAt,
    };
  }

  private mapCustomerToDb(customer: Customer): any {
    return {
      id: customer.id,
      customer_name: customer.customerName,
      phone: customer.phone,
      email: customer.email,
      total_orders: customer.totalOrders,
      total_spent: customer.totalSpent,
      created_at: customer.createdAt,
      updated_at: customer.updatedAt,
    };
  }
}

export default new SupabaseService();

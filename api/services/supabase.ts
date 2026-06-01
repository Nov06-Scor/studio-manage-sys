import { createClient, SupabaseClient, type SupabaseOptions } from '@supabase/supabase-js';
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
  
  private client: SupabaseClient | null = null;

  setConfig(config: SupabaseConfig) {
    this.config = config;
    this.client = createClient(config.url, config.key, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    });
  }

  getConfig() {
    return {
      url: this.config.url ? '******' : '',
      key: this.config.key ? '******' : '',
      configured: !!(this.config.url && this.config.key),
    };
  }

  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase 未配置');
    }
    return this.client;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.client) return { success: false, error: '客户端未初始化' };
    
    try {
      console.log('🔍 尝试连接 Supabase...');
      const { data, error } = await this.client.from('users').select('id').limit(1);
      
      if (error) {
        console.error('❌ Supabase 错误:', error);
        return { success: false, error: JSON.stringify(error) };
      }
      
      console.log('✅ Supabase 连接成功');
      return { success: true };
    } catch (e: any) {
      console.error('❌ 连接异常:', e);
      return { success: false, error: e?.message || '未知错误' };
    }
  }

  async initializeTables(): Promise<void> {
    if (!this.client) throw new Error('Supabase 未配置');

    await this.createUsersTable();
    await this.createOrdersTable();
    await this.createPlayersTable();
    await this.createCustomersTable();
    await this.createWithdrawalsTable();
    await this.createPaymentsTable();
  }

  private async createUsersTable(): Promise<void> {
    try {
      await this.client!.rpc('create_users_table');
    } catch {
      const { error } = await this.client!.from('users').select('id').limit(1);
      if (error?.code === '42P01') {
        await this.client!.query(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'customer_service',
            permissions TEXT[],
            email TEXT,
            phone TEXT,
            status TEXT DEFAULT 'active',
            position_id TEXT,
            position_name TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `);
      }
    }
  }

  private async createOrdersTable(): Promise<void> {
    try {
      await this.client!.rpc('create_orders_table');
    } catch {
      const { error } = await this.client!.from('orders').select('id').limit(1);
      if (error?.code === '42P01') {
        await this.client!.query(`
          CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            order_no TEXT UNIQUE NOT NULL,
            customer_id TEXT,
            game TEXT NOT NULL,
            content TEXT NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            status TEXT DEFAULT 'pending',
            required_players_count INTEGER DEFAULT 1,
            player_ids TEXT[],
            progress INTEGER DEFAULT 0,
            completion_time TIMESTAMP,
            requirements TEXT,
            notes TEXT,
            created_by TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `);
      }
    }
  }

  private async createPlayersTable(): Promise<void> {
    try {
      await this.client!.rpc('create_players_table');
    } catch {
      const { error } = await this.client!.from('players').select('id').limit(1);
      if (error?.code === '42P01') {
        await this.client!.query(`
          CREATE TABLE IF NOT EXISTS players (
            id TEXT PRIMARY KEY,
            player_name TEXT NOT NULL,
            player_id TEXT UNIQUE NOT NULL,
            type TEXT DEFAULT 'tech',
            credit_score INTEGER DEFAULT 100,
            balance DECIMAL(10, 2) DEFAULT 0,
            status TEXT DEFAULT 'online',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `);
      }
    }
  }

  private async createCustomersTable(): Promise<void> {
    try {
      await this.client!.rpc('create_customers_table');
    } catch {
      const { error } = await this.client!.from('customers').select('id').limit(1);
      if (error?.code === '42P01') {
        await this.client!.query(`
          CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            email TEXT,
            total_orders INTEGER DEFAULT 0,
            total_spent DECIMAL(10, 2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `);
      }
    }
  }

  private async createWithdrawalsTable(): Promise<void> {
    try {
      await this.client!.rpc('create_withdrawals_table');
    } catch {
      const { error } = await this.client!.from('withdrawals').select('id').limit(1);
      if (error?.code === '42P01') {
        await this.client!.query(`
          CREATE TABLE IF NOT EXISTS withdrawals (
            id TEXT PRIMARY KEY,
            player_id TEXT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            status TEXT DEFAULT 'pending',
            bank_account TEXT,
            bank_name TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `);
      }
    }
  }

  private async createPaymentsTable(): Promise<void> {
    try {
      await this.client!.rpc('create_payments_table');
    } catch {
      const { error } = await this.client!.from('payments').select('id').limit(1);
      if (error?.code === '42P01') {
        await this.client!.query(`
          CREATE TABLE IF NOT EXISTS payments (
            id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            method TEXT DEFAULT 'wechat',
            status TEXT DEFAULT 'pending',
            transaction_id TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `);
      }
    }
  }

  async saveUser(user: User): Promise<void> {
    if (!this.client) throw new Error('Supabase 未配置');
    
    const { error } = await this.client.from('users').upsert({
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
    });

    if (error) throw new Error(error.message);
  }

  async saveOrder(order: Order): Promise<void> {
    if (!this.client) throw new Error('Supabase 未配置');
    
    const { error } = await this.client.from('orders').upsert({
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
    });

    if (error) throw new Error(error.message);
  }

  async savePlayer(player: Player): Promise<void> {
    if (!this.client) throw new Error('Supabase 未配置');
    
    const { error } = await this.client.from('players').upsert({
      id: player.id,
      player_name: player.playerName,
      player_id: player.playerId,
      type: player.type,
      credit_score: player.creditScore,
      balance: player.balance,
      status: player.status,
      created_at: player.createdAt,
      updated_at: player.updatedAt,
    });

    if (error) throw new Error(error.message);
  }

  async saveCustomer(customer: Customer): Promise<void> {
    if (!this.client) throw new Error('Supabase 未配置');
    
    const { error } = await this.client.from('customers').upsert({
      id: customer.id,
      customer_name: customer.customerName,
      phone: customer.phone,
      email: customer.email,
      total_orders: customer.totalOrders,
      total_spent: customer.totalSpent,
      created_at: customer.createdAt,
      updated_at: customer.updatedAt,
    });

    if (error) throw new Error(error.message);
  }

  async saveWithdrawal(withdrawal: Withdrawal): Promise<void> {
    if (!this.client) throw new Error('Supabase 未配置');
    
    const { error } = await this.client.from('withdrawals').upsert({
      id: withdrawal.id,
      player_id: withdrawal.playerId,
      amount: withdrawal.amount,
      status: withdrawal.status,
      bank_account: withdrawal.bankAccount,
      bank_name: withdrawal.bankName,
      created_at: withdrawal.createdAt,
      updated_at: withdrawal.updatedAt,
    });

    if (error) throw new Error(error.message);
  }

  async savePayment(payment: Payment): Promise<void> {
    if (!this.client) throw new Error('Supabase 未配置');
    
    const { error } = await this.client.from('payments').upsert({
      id: payment.id,
      order_id: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      transaction_id: payment.transactionId,
      created_at: payment.createdAt,
      updated_at: payment.updatedAt,
    });

    if (error) throw new Error(error.message);
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.client) throw new Error('Supabase 未配置');
    
    const { data, error } = await this.client.from('users').select('*');
    
    if (error) throw new Error(error.message);
    
    return data.map(item => ({
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
    }));
  }

  async getAllOrders(): Promise<Order[]> {
    if (!this.client) throw new Error('Supabase 未配置');
    
    const { data, error } = await this.client.from('orders').select('*');
    
    if (error) throw new Error(error.message);
    
    return data.map(item => ({
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
    }));
  }

  async getAllPlayers(): Promise<Player[]> {
    if (!this.client) throw new Error('Supabase 未配置');
    
    const { data, error } = await this.client.from('players').select('*');
    
    if (error) throw new Error(error.message);
    
    return data.map(item => ({
      id: item.id,
      playerName: item.player_name,
      playerId: item.player_id,
      type: item.type,
      creditScore: item.credit_score,
      balance: item.balance,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async getAllCustomers(): Promise<Customer[]> {
    if (!this.client) throw new Error('Supabase 未配置');
    
    const { data, error } = await this.client.from('customers').select('*');
    
    if (error) throw new Error(error.message);
    
    return data.map(item => ({
      id: item.id,
      customerName: item.customer_name,
      phone: item.phone,
      email: item.email,
      totalOrders: item.total_orders,
      totalSpent: item.total_spent,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async syncAllData(
    users: User[],
    orders: Order[],
    players: Player[],
    customers: Customer[],
    withdrawals: Withdrawal[],
    payments: Payment[]
  ): Promise<void> {
    for (const user of users) {
      await this.saveUser(user);
    }
    for (const order of orders) {
      await this.saveOrder(order);
    }
    for (const player of players) {
      await this.savePlayer(player);
    }
    for (const customer of customers) {
      await this.saveCustomer(customer);
    }
    for (const withdrawal of withdrawals) {
      await this.saveWithdrawal(withdrawal);
    }
    for (const payment of payments) {
      await this.savePayment(payment);
    }
  }
}

export default new SupabaseService();

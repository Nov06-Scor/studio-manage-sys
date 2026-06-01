import express from 'express';
import supabaseService from '../services/supabase';
import { mockUsers, mockOrders, mockPlayers, mockCustomers, mockWithdrawals, mockPayments } from '../data/mockData';

const router = express.Router();

router.get('/config', (req, res) => {
  const config = supabaseService.getConfig();
  res.json({ success: true, data: config });
});

router.post('/config', (req, res) => {
  try {
    const { url, key } = req.body;
    supabaseService.setConfig({ url, key });
    res.json({ success: true, message: 'Supabase配置已更新' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: '配置更新失败' });
  }
});

router.post('/test', async (req, res) => {
  try {
    const result = await supabaseService.testConnection();
    if (result.success) {
      res.json({
        success: true,
        message: result.info || 'Supabase连接测试成功',
      });
    } else {
      res.json({
        success: false,
        message: 'Supabase连接测试失败',
        error: result.error,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sync/all', async (req, res) => {
  try {
    const result = await supabaseService.syncAllData(
      mockUsers,
      mockOrders,
      mockPlayers,
      mockCustomers,
      mockWithdrawals,
      mockPayments
    );
    res.json({
      success: result.success,
      message: result.success
        ? `成功同步 ${result.count} 条数据`
        : `同步完成，成功 ${result.count} 条，失败 ${result.errors.length} 条`,
      data: {
        count: result.count,
        errors: result.errors,
        users: mockUsers.length,
        orders: mockOrders.length,
        players: mockPlayers.length,
        customers: mockCustomers.length,
        withdrawals: mockWithdrawals.length,
        payments: mockPayments.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sync/users', async (req, res) => {
  try {
    let count = 0;
    const errors: string[] = [];
    for (const user of mockUsers) {
      const r = await supabaseService.saveUser(user);
      if (r.success) count++;
      else if (r.error) errors.push(`${user.username}: ${r.error}`);
    }
    res.json({
      success: errors.length === 0,
      message: `已同步 ${count} 个用户`,
      data: { count, errors },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sync/orders', async (req, res) => {
  try {
    let count = 0;
    const errors: string[] = [];
    for (const order of mockOrders) {
      const r = await supabaseService.saveOrder(order);
      if (r.success) count++;
      else if (r.error) errors.push(`${order.orderNo}: ${r.error}`);
    }
    res.json({
      success: errors.length === 0,
      message: `已同步 ${count} 个订单`,
      data: { count, errors },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sync/players', async (req, res) => {
  try {
    let count = 0;
    const errors: string[] = [];
    for (const player of mockPlayers) {
      const r = await supabaseService.savePlayer(player);
      if (r.success) count++;
      else if (r.error) errors.push(`${player.playerName}: ${r.error}`);
    }
    res.json({
      success: errors.length === 0,
      message: `已同步 ${count} 个打手`,
      data: { count, errors },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sync/customers', async (req, res) => {
  try {
    let count = 0;
    const errors: string[] = [];
    for (const customer of mockCustomers) {
      const r = await supabaseService.saveCustomer(customer);
      if (r.success) count++;
      else if (r.error) errors.push(`${customer.customerName}: ${r.error}`);
    }
    res.json({
      success: errors.length === 0,
      message: `已同步 ${count} 个客户`,
      data: { count, errors },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await supabaseService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await supabaseService.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/players', async (req, res) => {
  try {
    const players = await supabaseService.getAllPlayers();
    res.json({ success: true, data: players });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/customers', async (req, res) => {
  try {
    const customers = await supabaseService.getAllCustomers();
    res.json({ success: true, data: customers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

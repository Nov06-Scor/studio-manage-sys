import { Router, Request, Response } from 'express';
import { mockOrders, mockPlayers, mockWithdrawals } from '../data/mockData';
import { ApiResponse, DashboardStats } from '../types';

const router = Router();

router.get('/stats', (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const todayOrders = mockOrders.filter((o) =>
      o.createdAt.startsWith(today)
    ).length;

    const todayRevenue = mockOrders
      .filter(
        (o) =>
          o.status === 'completed' &&
          o.completedAt?.startsWith(today)
      )
      .reduce((sum, o) => sum + (o.actualPrice || o.price), 0);

    const pendingOrders = mockOrders.filter(
      (o) =>
        o.status === 'pending' ||
        o.status === 'verified' ||
        o.status === 'published' ||
        o.status === 'assigned'
    ).length;

    const activePlayers = mockPlayers.filter(
      (p) => p.status === 'online' || p.status === 'busy'
    ).length;

    const pendingWithdrawals = mockWithdrawals.filter(
      (w) => w.status === 'pending'
    ).length;

    const recentOrders = mockOrders
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);

    const stats: DashboardStats = {
      todayOrders,
      todayRevenue,
      pendingOrders,
      activePlayers,
      pendingWithdrawals,
      recentOrders,
    };

    const response: ApiResponse<DashboardStats> = {
      success: true,
      data: stats,
    };

    res.json(response);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取仪表盘数据失败',
    };
    res.status(500).json(response);
  }
});

export default router;

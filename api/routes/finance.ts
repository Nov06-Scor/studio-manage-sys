import { Router, Request, Response } from 'express';
import { mockWithdrawals, mockPayments, mockPlayers, mockOrders } from '../data/mockData';
import { Withdrawal, Payment, ApiResponse, PaginatedResponse } from '../types';

const router = Router();

router.get('/balance', (req: Request, res: Response) => {
  try {
    const totalIncome = mockOrders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + (o.actualPrice || o.price), 0);

    const totalExpense = mockWithdrawals
      .filter((w) => w.status === 'completed')
      .reduce((sum, w) => sum + w.actualAmount, 0);

    const netProfit = totalIncome - totalExpense;

    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = mockOrders.filter(
      (o) => o.status === 'completed' && o.completedAt?.startsWith(today)
    );
    const todayIncome = todayOrders.reduce(
      (sum, o) => sum + (o.actualPrice || o.price),
      0
    );
    const todayExpense = mockWithdrawals
      .filter(
        (w) =>
          w.status === 'completed' &&
          w.processedAt?.startsWith(today)
      )
      .reduce((sum, w) => sum + w.actualAmount, 0);

    const balanceData = {
      totalIncome,
      totalExpense,
      netProfit,
      todayIncome,
      todayExpense,
      pendingWithdrawals: mockWithdrawals.filter((w) => w.status === 'pending').length,
    };

    const response: ApiResponse = {
      success: true,
      data: balanceData,
    };

    res.json(response);
  } catch (error) {
    console.error('Get balance error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取账户余额失败',
    };
    res.status(500).json(response);
  }
});

router.get('/withdrawals', (req: Request, res: Response) => {
  try {
    const { status, page = 1, pageSize = 10 } = req.query;

    let filteredWithdrawals = [...mockWithdrawals];

    if (status) {
      filteredWithdrawals = filteredWithdrawals.filter((w) => w.status === status);
    }

    const total = filteredWithdrawals.length;
    const totalPages = Math.ceil(total / Number(pageSize));
    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const items = filteredWithdrawals
      .slice(start, end)
      .map((w) => ({
        ...w,
        player: mockPlayers.find((p) => p.id === w.playerId),
      }));

    const response: ApiResponse<PaginatedResponse<Withdrawal>> = {
      success: true,
      data: {
        items,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get withdrawals error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取提现列表失败',
    };
    res.status(500).json(response);
  }
});

router.post('/withdraw', (req: Request, res: Response) => {
  try {
    const { playerId, amount, bankName, bankAccount, bankBranch } = req.body;

    const player = mockPlayers.find((p) => p.id === playerId);

    if (!player) {
      const response: ApiResponse = {
        success: false,
        message: '打手不存在',
      };
      return res.status(404).json(response);
    }

    if (player.balance < amount) {
      const response: ApiResponse = {
        success: false,
        message: '余额不足',
      };
      return res.status(400).json(response);
    }

    const fee = Math.max(1, amount * 0.005);

    const newWithdrawal: Withdrawal = {
      id: String(mockWithdrawals.length + 1),
      playerId,
      amount,
      fee,
      actualAmount: amount - fee,
      status: 'pending',
      bankName,
      bankAccount,
      bankBranch,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockWithdrawals.push(newWithdrawal);

    const playerIndex = mockPlayers.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1) {
      mockPlayers[playerIndex].balance -= amount;
    }

    const response: ApiResponse<Withdrawal> = {
      success: true,
      data: newWithdrawal,
      message: '提现申请已提交',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create withdrawal error:', error);
    const response: ApiResponse = {
      success: false,
      message: '提交提现申请失败',
    };
    res.status(500).json(response);
  }
});

router.put('/withdraw/:id/review', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const withdrawalIndex = mockWithdrawals.findIndex((w) => w.id === id);

    if (withdrawalIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '提现记录不存在',
      };
      return res.status(404).json(response);
    }

    if (mockWithdrawals[withdrawalIndex].status !== 'pending') {
      const response: ApiResponse = {
        success: false,
        message: '该提现申请已审核',
      };
      return res.status(400).json(response);
    }

    mockWithdrawals[withdrawalIndex].status = status;

    if (status === 'rejected') {
      const playerIndex = mockPlayers.findIndex(
        (p) => p.id === mockWithdrawals[withdrawalIndex].playerId
      );
      if (playerIndex !== -1) {
        mockPlayers[playerIndex].balance += mockWithdrawals[withdrawalIndex].amount;
      }
      mockWithdrawals[withdrawalIndex].rejectionReason = rejectionReason;
    }

    mockWithdrawals[withdrawalIndex].updatedAt = new Date().toISOString();

    const response: ApiResponse<Withdrawal> = {
      success: true,
      data: mockWithdrawals[withdrawalIndex],
      message: status === 'approved' ? '审核通过' : '已拒绝',
    };

    res.json(response);
  } catch (error) {
    console.error('Review withdrawal error:', error);
    const response: ApiResponse = {
      success: false,
      message: '审核提现失败',
    };
    res.status(500).json(response);
  }
});

router.post('/withdraw/:id/execute', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const withdrawalIndex = mockWithdrawals.findIndex((w) => w.id === id);

    if (withdrawalIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '提现记录不存在',
      };
      return res.status(404).json(response);
    }

    if (mockWithdrawals[withdrawalIndex].status !== 'approved') {
      const response: ApiResponse = {
        success: false,
        message: '该提现申请尚未通过审核',
      };
      return res.status(400).json(response);
    }

    mockWithdrawals[withdrawalIndex].status = 'completed';
    mockWithdrawals[withdrawalIndex].processedAt = new Date().toISOString();
    mockWithdrawals[withdrawalIndex].updatedAt = new Date().toISOString();

    const response: ApiResponse<Withdrawal> = {
      success: true,
      data: mockWithdrawals[withdrawalIndex],
      message: '打款成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Execute withdrawal error:', error);
    const response: ApiResponse = {
      success: false,
      message: '执行打款失败',
    };
    res.status(500).json(response);
  }
});

router.get('/report', (req: Request, res: Response) => {
  try {
    const { type, startDate, endDate } = req.query;

    const reportData = {
      type,
      period: {
        start: startDate,
        end: endDate,
      },
      summary: {
        totalOrders: mockOrders.filter((o) => o.status === 'completed').length,
        totalIncome: mockOrders
          .filter((o) => o.status === 'completed')
          .reduce((sum, o) => sum + (o.actualPrice || o.price), 0),
        totalExpense: mockWithdrawals
          .filter((w) => w.status === 'completed')
          .reduce((sum, w) => sum + w.actualAmount, 0),
        netProfit: 0,
      },
      dailyData: [
        {
          date: '2024-01-15',
          orders: 12,
          income: 5600,
          expense: 4200,
          profit: 1400,
        },
        {
          date: '2024-01-14',
          orders: 15,
          income: 6800,
          expense: 5100,
          profit: 1700,
        },
      ],
      topPlayers: mockPlayers
        .sort((a, b) => b.totalEarnings - a.totalEarnings)
        .slice(0, 5)
        .map((p) => ({
          playerName: p.playerName,
          totalEarnings: p.totalEarnings,
          orderCount: p.orderCount,
        })),
    };

    reportData.summary.netProfit =
      reportData.summary.totalIncome - reportData.summary.totalExpense;

    const response: ApiResponse = {
      success: true,
      data: reportData,
    };

    res.json(response);
  } catch (error) {
    console.error('Get report error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取财务报表失败',
    };
    res.status(500).json(response);
  }
});

router.get('/payments', (req: Request, res: Response) => {
  try {
    const { type, page = 1, pageSize = 10 } = req.query;

    let filteredPayments = [...mockPayments];

    if (type) {
      filteredPayments = filteredPayments.filter((p) => p.type === type);
    }

    const total = filteredPayments.length;
    const totalPages = Math.ceil(total / Number(pageSize));
    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const items = filteredPayments.slice(start, end);

    const response: ApiResponse<PaginatedResponse<Payment>> = {
      success: true,
      data: {
        items,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get payments error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取支付记录失败',
    };
    res.status(500).json(response);
  }
});

export default router;

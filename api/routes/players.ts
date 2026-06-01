import { Router, Request, Response } from 'express';
import { mockPlayers } from '../data/mockData';
import { Player, ApiResponse, PaginatedResponse } from '../types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const { status, minCredit, page = 1, pageSize = 10 } = req.query;

    let filteredPlayers = [...mockPlayers];

    if (status) {
      filteredPlayers = filteredPlayers.filter((p) => p.status === status);
    }

    if (minCredit) {
      filteredPlayers = filteredPlayers.filter(
        (p) => p.creditScore >= Number(minCredit)
      );
    }

    const total = filteredPlayers.length;
    const totalPages = Math.ceil(total / Number(pageSize));
    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const items = filteredPlayers.slice(start, end);

    const response: ApiResponse<PaginatedResponse<Player>> = {
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
    console.error('Get players error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取打手列表失败',
    };
    res.status(500).json(response);
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const player = mockPlayers.find((p) => p.id === id);

    if (!player) {
      const response: ApiResponse = {
        success: false,
        message: '打手不存在',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Player> = {
      success: true,
      data: player,
    };

    res.json(response);
  } catch (error) {
    console.error('Get player error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取打手详情失败',
    };
    res.status(500).json(response);
  }
});

router.get('/:id/performance', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const player = mockPlayers.find((p) => p.id === id);

    if (!player) {
      const response: ApiResponse = {
        success: false,
        message: '打手不存在',
      };
      return res.status(404).json(response);
    }

    const performanceData = {
      playerId: id,
      playerName: player.playerName,
      period: {
        start: startDate || '2024-01-01',
        end: endDate || new Date().toISOString(),
      },
      summary: {
        totalOrders: player.orderCount,
        completedOrders: player.completedCount,
        failedOrders: player.failedCount,
        completionRate: player.completionRate,
        averageRating: player.rating,
        totalEarnings: player.totalEarnings,
      },
      dailyStats: [
        {
          date: '2024-01-15',
          ordersCompleted: 3,
          ordersFailed: 0,
          earnings: 450,
          rating: 4.8,
        },
        {
          date: '2024-01-14',
          ordersCompleted: 2,
          ordersFailed: 0,
          earnings: 300,
          rating: 4.7,
        },
      ],
    };

    const response: ApiResponse = {
      success: true,
      data: performanceData,
    };

    res.json(response);
  } catch (error) {
    console.error('Get player performance error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取打手绩效失败',
    };
    res.status(500).json(response);
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const {
      userId,
      playerName,
      playerId,
      type = 'tech',
      wecomUserId,
      shareRatio = 80,
    } = req.body;

    const newPlayer: Player = {
      id: String(mockPlayers.length + 1),
      userId,
      playerName,
      playerId,
      type,
      creditScore: 100,
      balance: 0,
      totalEarnings: 0,
      orderCount: 0,
      completedCount: 0,
      failedCount: 0,
      completionRate: 0,
      rating: 5.0,
      status: 'offline',
      shareRatio: Number(shareRatio),
      wecomUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPlayers.push(newPlayer);

    const response: ApiResponse<Player> = {
      success: true,
      data: newPlayer,
      message: '打手创建成功',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create player error:', error);
    const response: ApiResponse = {
      success: false,
      message: '创建打手失败',
    };
    res.status(500).json(response);
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const playerIndex = mockPlayers.findIndex((p) => p.id === id);

    if (playerIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '打手不存在',
      };
      return res.status(404).json(response);
    }

    mockPlayers[playerIndex] = {
      ...mockPlayers[playerIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<Player> = {
      success: true,
      data: mockPlayers[playerIndex],
      message: '打手信息更新成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Update player error:', error);
    const response: ApiResponse = {
      success: false,
      message: '更新打手信息失败',
    };
    res.status(500).json(response);
  }
});

export default router;

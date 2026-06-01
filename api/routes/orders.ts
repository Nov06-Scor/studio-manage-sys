import { Router, Request, Response } from 'express';
import { mockOrders, mockPlayers, mockCustomers } from '../data/mockData';
import wecomService from '../services/wecom';
import { Order, ApiResponse, PaginatedResponse } from '../types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const {
      status,
      playerId,
      customerId,
      startDate,
      endDate,
      page = 1,
      pageSize = 10,
    } = req.query;

    let filteredOrders = [...mockOrders];

    if (status) {
      filteredOrders = filteredOrders.filter((o) => o.status === status);
    }

    if (playerId) {
      filteredOrders = filteredOrders.filter((o) => o.playerId === playerId);
    }

    if (customerId) {
      filteredOrders = filteredOrders.filter((o) => o.customerId === customerId);
    }

    if (startDate) {
      filteredOrders = filteredOrders.filter(
        (o) => new Date(o.createdAt) >= new Date(startDate as string)
      );
    }

    if (endDate) {
      filteredOrders = filteredOrders.filter(
        (o) => new Date(o.createdAt) <= new Date(endDate as string)
      );
    }

    const total = filteredOrders.length;
    const totalPages = Math.ceil(total / Number(pageSize));
    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const items = filteredOrders.slice(start, end).map((order) => ({
      ...order,
      customer: mockCustomers.find((c) => c.id === order.customerId),
      player: order.playerId ? mockPlayers.find((p) => p.id === order.playerId) : undefined,
    }));

    const response: ApiResponse<PaginatedResponse<Order>> = {
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
    console.error('Get orders error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取订单列表失败',
    };
    res.status(500).json(response);
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = mockOrders.find((o) => o.id === id);

    if (!order) {
      const response: ApiResponse = {
        success: false,
        message: '订单不存在',
      };
      return res.status(404).json(response);
    }

    const orderWithRelations = {
      ...order,
      customer: mockCustomers.find((c) => c.id === order.customerId),
      player: order.playerId
        ? mockPlayers.find((p) => p.id === order.playerId)
        : undefined,
    };

    const response: ApiResponse<Order> = {
      success: true,
      data: orderWithRelations,
    };

    res.json(response);
  } catch (error) {
    console.error('Get order error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取订单详情失败',
    };
    res.status(500).json(response);
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const {
      customerId,
      game,
      content,
      requirements,
      price,
      completionTime,
      requiredPlayersCount = 1,
      playerIds = [],
      playerId,
      playerShareRatio = 80,
    } = req.body;

    const orderNo = `ORD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(
      mockOrders.length + 1
    ).padStart(3, '0')}`;

    const newOrder: Order = {
      id: String(mockOrders.length + 1),
      orderNo,
      customerId,
      game,
      content,
      requirements,
      price,
      status: 'pending',
      playerShareRatio,
      completionTime,
      progress: 0,
      requiredPlayersCount,
      playerIds,
      playerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockOrders.push(newOrder);

    const response: ApiResponse<Order> = {
      success: true,
      data: newOrder,
      message: '订单创建成功',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create order error:', error);
    const response: ApiResponse = {
      success: false,
      message: '创建订单失败',
    };
    res.status(500).json(response);
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orderIndex = mockOrders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '订单不存在',
      };
      return res.status(404).json(response);
    }

    mockOrders[orderIndex] = {
      ...mockOrders[orderIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<Order> = {
      success: true,
      data: mockOrders[orderIndex],
      message: '订单更新成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Update order error:', error);
    const response: ApiResponse = {
      success: false,
      message: '更新订单失败',
    };
    res.status(500).json(response);
  }
});

router.put('/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, progress, note } = req.body;
    const orderIndex = mockOrders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '订单不存在',
      };
      return res.status(404).json(response);
    }

    mockOrders[orderIndex].status = status;

    if (progress !== undefined) {
      mockOrders[orderIndex].progress = progress;
    }

    if (status === 'in_progress' && !mockOrders[orderIndex].startedAt) {
      mockOrders[orderIndex].startedAt = new Date().toISOString();
    }

    if (status === 'completed') {
      mockOrders[orderIndex].completedAt = new Date().toISOString();
      mockOrders[orderIndex].completionTime = new Date().toISOString();
      mockOrders[orderIndex].progress = 100;
    }

    mockOrders[orderIndex].updatedAt = new Date().toISOString();

    const response: ApiResponse<Order> = {
      success: true,
      data: mockOrders[orderIndex],
      message: '订单状态更新成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Update order status error:', error);
    const response: ApiResponse = {
      success: false,
      message: '更新订单状态失败',
    };
    res.status(500).json(response);
  }
});

router.post('/:id/publish', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orderIndex = mockOrders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '订单不存在',
      };
      return res.status(404).json(response);
    }

    const order = mockOrders[orderIndex];

    if (order.status !== 'pending' && order.status !== 'verified') {
      const response: ApiResponse = {
        success: false,
        message: '订单状态不允许发布',
      };
      return res.status(400).json(response);
    }

    try {
      await wecomService.sendOrderToGroup({
        orderNo: order.orderNo,
        game: order.game,
        content: order.content,
        price: order.price,
        completionTime: order.completionTime,
        requirements: order.requirements,
      });

      mockOrders[orderIndex].status = 'published';
      mockOrders[orderIndex].updatedAt = new Date().toISOString();

      const response: ApiResponse = {
        success: true,
        data: {
          wecom_message_id: `msg_${Date.now()}`,
          published_at: new Date().toISOString(),
        },
        message: '订单已发布到派单群',
      };

      res.json(response);
    } catch (wecomError: any) {
      mockOrders[orderIndex].status = 'published';
      mockOrders[orderIndex].updatedAt = new Date().toISOString();

      const response: ApiResponse = {
        success: true,
        data: {
          wecom_message_id: null,
          published_at: new Date().toISOString(),
          warning: '企业微信未配置或发送失败，请手动发送',
        },
        message: '订单已发布（企业微信发送失败，请手动发送）',
      };

      res.json(response);
    }
  } catch (error) {
    console.error('Publish order error:', error);
    const response: ApiResponse = {
      success: false,
      message: '发布订单失败',
    };
    res.status(500).json(response);
  }
});

router.post('/:id/assign', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { playerId } = req.body;
    const orderIndex = mockOrders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '订单不存在',
      };
      return res.status(404).json(response);
    }

    const player = mockPlayers.find((p) => p.id === playerId);

    if (!player) {
      const response: ApiResponse = {
        success: false,
        message: '打手不存在',
      };
      return res.status(404).json(response);
    }

    if (player.creditScore < 60) {
      const response: ApiResponse = {
        success: false,
        message: '打手信誉分不足，无法接单',
      };
      return res.status(400).json(response);
    }

    mockOrders[orderIndex].playerId = playerId;
    mockOrders[orderIndex].status = 'assigned';
    mockOrders[orderIndex].updatedAt = new Date().toISOString();

    try {
      await wecomService.sendOrderAssignmentNotification(
        {
          orderNo: mockOrders[orderIndex].orderNo,
          game: mockOrders[orderIndex].game,
          content: mockOrders[orderIndex].content,
        },
        {
          playerName: player.playerName,
          playerId: player.playerId,
        }
      );
    } catch (wecomError) {
      console.warn('Failed to send WeChat notification:', wecomError);
    }

    const response: ApiResponse<Order> = {
      success: true,
      data: mockOrders[orderIndex],
      message: '订单已分配给打手',
    };

    res.json(response);
  } catch (error) {
    console.error('Assign order error:', error);
    const response: ApiResponse = {
      success: false,
      message: '分配订单失败',
    };
    res.status(500).json(response);
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orderIndex = mockOrders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '订单不存在',
      };
      return res.status(404).json(response);
    }

    mockOrders.splice(orderIndex, 1);

    const response: ApiResponse = {
      success: true,
      message: '订单删除成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Delete order error:', error);
    const response: ApiResponse = {
      success: false,
      message: '删除订单失败',
    };
    res.status(500).json(response);
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { mockHandoffs, mockEmployees } from '../data/advancedMockData';
import { Handover, HandoverRecord } from '../types/advanced';
import { ApiResponse, PaginatedResponse } from '../types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const { status, handoverUserId, receiverUserId, shiftType, page = 1, pageSize = 10 } = req.query;

    let filteredHandoffs = [...mockHandoffs];

    if (status) {
      filteredHandoffs = filteredHandoffs.filter((h) => h.status === status);
    }

    if (handoverUserId) {
      filteredHandoffs = filteredHandoffs.filter((h) => h.handoverUserId === handoverUserId);
    }

    if (receiverUserId) {
      filteredHandoffs = filteredHandoffs.filter((h) => h.receiverUserId === receiverUserId);
    }

    if (shiftType) {
      filteredHandoffs = filteredHandoffs.filter((h) => h.shiftType === shiftType);
    }

    filteredHandoffs.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = filteredHandoffs.length;
    const totalPages = Math.ceil(total / Number(pageSize));
    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const items = filteredHandoffs.slice(start, end).map((handoff) => ({
      ...handoff,
      handoverUser: mockEmployees.find((e) => e.id === handoff.handoverUserId),
      receiverUser: mockEmployees.find((e) => e.id === handoff.receiverUserId),
    }));

    const response: ApiResponse<PaginatedResponse<any>> = {
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
    console.error('Get handoffs error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取交接班列表失败',
    };
    res.status(500).json(response);
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const handoff = mockHandoffs.find((h) => h.id === id);

    if (!handoff) {
      const response: ApiResponse = {
        success: false,
        message: '交接记录不存在',
      };
      return res.status(404).json(response);
    }

    const handoffWithDetails = {
      ...handoff,
      handoverUser: mockEmployees.find((e) => e.id === handoff.handoverUserId),
      receiverUser: mockEmployees.find((e) => e.id === handoff.receiverUserId),
    };

    const response: ApiResponse = {
      success: true,
      data: handoffWithDetails,
    };

    res.json(response);
  } catch (error) {
    console.error('Get handoff error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取交接详情失败',
    };
    res.status(500).json(response);
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const {
      shiftType,
      handoverUserId,
      receiverUserId,
      orders,
      messages,
      notes,
    } = req.body;

    const handoverNo = `HB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(
      mockHandoffs.length + 1
    ).padStart(3, '0')}`;

    const newHandoff: Handover = {
      id: String(mockHandoffs.length + 1),
      handoverNo,
      shiftType,
      handoverUserId,
      receiverUserId,
      status: 'pending',
      orders: orders || [],
      messages: messages || [],
      notes,
      createdAt: new Date().toISOString(),
    };

    mockHandoffs.push(newHandoff);

    const response: ApiResponse<Handover> = {
      success: true,
      data: newHandoff,
      message: '交接单创建成功',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create handoff error:', error);
    const response: ApiResponse = {
      success: false,
      message: '创建交接单失败',
    };
    res.status(500).json(response);
  }
});

router.put('/:id/confirm', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const handoffIndex = mockHandoffs.findIndex((h) => h.id === id);

    if (handoffIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '交接记录不存在',
      };
      return res.status(404).json(response);
    }

    if (mockHandoffs[handoffIndex].status !== 'pending') {
      const response: ApiResponse = {
        success: false,
        message: '该交接已确认或取消',
      };
      return res.status(400).json(response);
    }

    mockHandoffs[handoffIndex].status = 'confirmed';
    mockHandoffs[handoffIndex].confirmedAt = new Date().toISOString();

    const response: ApiResponse<Handover> = {
      success: true,
      data: mockHandoffs[handoffIndex],
      message: '交接确认成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Confirm handoff error:', error);
    const response: ApiResponse = {
      success: false,
      message: '确认交接失败',
    };
    res.status(500).json(response);
  }
});

router.put('/:id/cancel', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const handoffIndex = mockHandoffs.findIndex((h) => h.id === id);

    if (handoffIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '交接记录不存在',
      };
      return res.status(404).json(response);
    }

    if (mockHandoffs[handoffIndex].status !== 'pending') {
      const response: ApiResponse = {
        success: false,
        message: '该交接已确认或取消',
      };
      return res.status(400).json(response);
    }

    mockHandoffs[handoffIndex].status = 'cancelled';

    const response: ApiResponse<Handover> = {
      success: true,
      data: mockHandoffs[handoffIndex],
      message: '交接取消成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Cancel handoff error:', error);
    const response: ApiResponse = {
      success: false,
      message: '取消交接失败',
    };
    res.status(500).json(response);
  }
});

router.get('/pending/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const pendingHandoffs = mockHandoffs.filter(
      (h) =>
        h.receiverUserId === userId &&
        h.status === 'pending'
    );

    const response: ApiResponse<Handover[]> = {
      success: true,
      data: pendingHandoffs,
    };

    res.json(response);
  } catch (error) {
    console.error('Get pending handoffs error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取待接收交接失败',
    };
    res.status(500).json(response);
  }
});

router.get('/stats/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const givenHandoffs = mockHandoffs.filter(
      (h) => h.handoverUserId === userId
    );
    const receivedHandoffs = mockHandoffs.filter(
      (h) => h.receiverUserId === userId
    );

    const stats = {
      totalGiven: givenHandoffs.length,
      totalReceived: receivedHandoffs.length,
      confirmedGiven: givenHandoffs.filter((h) => h.status === 'confirmed').length,
      confirmedReceived: receivedHandoffs.filter((h) => h.status === 'confirmed').length,
      pendingReceived: receivedHandoffs.filter((h) => h.status === 'pending').length,
    };

    const response: ApiResponse = {
      success: true,
      data: stats,
    };

    res.json(response);
  } catch (error) {
    console.error('Get handoff stats error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取交接统计失败',
    };
    res.status(500).json(response);
  }
});

export default router;

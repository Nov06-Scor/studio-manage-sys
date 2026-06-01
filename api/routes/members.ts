import { Router, Request, Response } from 'express';
import {
  mockMembers,
  mockRecharges,
  mockConsumptions,
} from '../data/advancedMockData';
import {
  Member,
  MemberLevel,
  Recharge,
  Consumption,
  MEMBER_LEVEL_CONFIG,
} from '../types/advanced';
import { ApiResponse, PaginatedResponse } from '../types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const { level, status, search, page = 1, pageSize = 10 } = req.query;

    let filteredMembers = [...mockMembers];

    if (level) {
      filteredMembers = filteredMembers.filter((m) => m.level === level);
    }

    if (status) {
      filteredMembers = filteredMembers.filter((m) => m.status === status);
    }

    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredMembers = filteredMembers.filter(
        (m) =>
          m.memberName.toLowerCase().includes(searchLower) ||
          m.phone.includes(search as string) ||
          m.memberNo.toLowerCase().includes(searchLower)
      );
    }

    const total = filteredMembers.length;
    const totalPages = Math.ceil(total / Number(pageSize));
    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const items = filteredMembers.slice(start, end);

    const response: ApiResponse<PaginatedResponse<Member>> = {
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
    console.error('Get members error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取会员列表失败',
    };
    res.status(500).json(response);
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const member = mockMembers.find((m) => m.id === id);

    if (!member) {
      const response: ApiResponse = {
        success: false,
        message: '会员不存在',
      };
      return res.status(404).json(response);
    }

    const memberRecharges = mockRecharges.filter((r) => r.memberId === id);
    const memberConsumptions = mockConsumptions.filter((c) => c.memberId === id);

    const response: ApiResponse = {
      success: true,
      data: {
        ...member,
        recharges: memberRecharges,
        consumptions: memberConsumptions,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Get member error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取会员详情失败',
    };
    res.status(500).json(response);
  }
});

router.get('/search/phone', (req: Request, res: Response) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      const response: ApiResponse = {
        success: false,
        message: '请提供手机号',
      };
      return res.status(400).json(response);
    }

    const member = mockMembers.find((m) => m.phone === phone);

    if (!member) {
      const response: ApiResponse = {
        success: false,
        message: '会员不存在',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: member,
    };

    res.json(response);
  } catch (error) {
    console.error('Search member by phone error:', error);
    const response: ApiResponse = {
      success: false,
      message: '查询会员失败',
    };
    res.status(500).json(response);
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const {
      memberName,
      phone,
      email,
      level = 'normal',
      birthday,
    } = req.body;

    const memberNo = `MB${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(
      mockMembers.length + 1
    ).padStart(3, '0')}`;

    const newMember: Member = {
      id: String(mockMembers.length + 1),
      memberNo,
      memberName,
      phone,
      email,
      level,
      balance: 0,
      totalConsumed: 0,
      totalRecharged: 0,
      totalOrders: 0,
      status: 'active',
      birthday,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockMembers.push(newMember);

    const response: ApiResponse<Member> = {
      success: true,
      data: newMember,
      message: '会员创建成功',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create member error:', error);
    const response: ApiResponse = {
      success: false,
      message: '创建会员失败',
    };
    res.status(500).json(response);
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const memberIndex = mockMembers.findIndex((m) => m.id === id);

    if (memberIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '会员不存在',
      };
      return res.status(404).json(response);
    }

    mockMembers[memberIndex] = {
      ...mockMembers[memberIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<Member> = {
      success: true,
      data: mockMembers[memberIndex],
      message: '会员信息更新成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Update member error:', error);
    const response: ApiResponse = {
      success: false,
      message: '更新会员信息失败',
    };
    res.status(500).json(response);
  }
});

router.post('/:id/recharge', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, operatorId } = req.body;

    const memberIndex = mockMembers.findIndex((m) => m.id === id);

    if (memberIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '会员不存在',
      };
      return res.status(404).json(response);
    }

    const member = mockMembers[memberIndex];
    const levelConfig = MEMBER_LEVEL_CONFIG.find((c) => c.level === member.level);
    const bonus = amount * (levelConfig?.rechargeBonus || 0);

    const newRecharge: Recharge = {
      id: String(mockRecharges.length + 1),
      memberId: id,
      amount,
      bonus,
      actualAmount: amount,
      paymentMethod,
      status: 'completed',
      operatorId,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    mockRecharges.push(newRecharge);

    mockMembers[memberIndex].balance += amount + bonus;
    mockMembers[memberIndex].totalRecharged += amount + bonus;
    mockMembers[memberIndex].updatedAt = new Date().toISOString();

    const newConsumption: Consumption = {
      id: String(mockConsumptions.length + 1),
      memberId: id,
      orderId: '',
      amount: amount + bonus,
      balanceBefore: member.balance,
      balanceAfter: member.balance + amount + bonus,
      type: 'recharge',
      description: `储值：¥${amount} + 赠送：¥${bonus}`,
      createdAt: new Date().toISOString(),
    };

    mockConsumptions.push(newConsumption);

    const response: ApiResponse = {
      success: true,
      data: {
        recharge: newRecharge,
        newBalance: mockMembers[memberIndex].balance,
      },
      message: '储值成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Recharge error:', error);
    const response: ApiResponse = {
      success: false,
      message: '储值失败',
    };
    res.status(500).json(response);
  }
});

router.get('/:id/recharges', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 10, startDate, endDate } = req.query;

    let recharges = mockRecharges.filter((r) => r.memberId === id);

    if (startDate) {
      recharges = recharges.filter(
        (r) => new Date(r.createdAt) >= new Date(startDate as string)
      );
    }

    if (endDate) {
      recharges = recharges.filter(
        (r) => new Date(r.createdAt) <= new Date(endDate as string)
      );
    }

    recharges.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = recharges.length;
    const totalPages = Math.ceil(total / Number(pageSize));
    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const items = recharges.slice(start, end);

    const response: ApiResponse<PaginatedResponse<Recharge>> = {
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
    console.error('Get recharges error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取储值记录失败',
    };
    res.status(500).json(response);
  }
});

router.get('/:id/consumptions', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 10, type } = req.query;

    let consumptions = mockConsumptions.filter((c) => c.memberId === id);

    if (type) {
      consumptions = consumptions.filter((c) => c.type === type);
    }

    consumptions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = consumptions.length;
    const totalPages = Math.ceil(total / Number(pageSize));
    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const items = consumptions.slice(start, end);

    const response: ApiResponse<PaginatedResponse<Consumption>> = {
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
    console.error('Get consumptions error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取消费记录失败',
    };
    res.status(500).json(response);
  }
});

router.get('/levels/config', (req: Request, res: Response) => {
  try {
    const response: ApiResponse = {
      success: true,
      data: MEMBER_LEVEL_CONFIG,
    };

    res.json(response);
  } catch (error) {
    console.error('Get level config error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取会员等级配置失败',
    };
    res.status(500).json(response);
  }
});

export default router;

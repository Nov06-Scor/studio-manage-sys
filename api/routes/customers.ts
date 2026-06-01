import { Router, Request, Response } from 'express';
import { mockCustomers } from '../data/mockData';
import { Customer, ApiResponse, PaginatedResponse } from '../types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const total = mockCustomers.length;
    const totalPages = Math.ceil(total / Number(pageSize));
    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const items = mockCustomers.slice(start, end);

    const response: ApiResponse<PaginatedResponse<Customer>> = {
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
    console.error('Get customers error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取客户列表失败',
    };
    res.status(500).json(response);
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = mockCustomers.find((c) => c.id === id);

    if (!customer) {
      const response: ApiResponse = {
        success: false,
        message: '客户不存在',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Customer> = {
      success: true,
      data: customer,
    };

    res.json(response);
  } catch (error) {
    console.error('Get customer error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取客户详情失败',
    };
    res.status(500).json(response);
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { userId, customerName, phone, email } = req.body;

    const newCustomer: Customer = {
      id: String(mockCustomers.length + 1),
      userId,
      customerName,
      phone,
      email,
      totalOrders: 0,
      totalSpent: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCustomers.push(newCustomer);

    const response: ApiResponse<Customer> = {
      success: true,
      data: newCustomer,
      message: '客户创建成功',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create customer error:', error);
    const response: ApiResponse = {
      success: false,
      message: '创建客户失败',
    };
    res.status(500).json(response);
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customerIndex = mockCustomers.findIndex((c) => c.id === id);

    if (customerIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '客户不存在',
      };
      return res.status(404).json(response);
    }

    mockCustomers[customerIndex] = {
      ...mockCustomers[customerIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<Customer> = {
      success: true,
      data: mockCustomers[customerIndex],
      message: '客户信息更新成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Update customer error:', error);
    const response: ApiResponse = {
      success: false,
      message: '更新客户信息失败',
    };
    res.status(500).json(response);
  }
});

export default router;

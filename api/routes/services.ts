import { Router, Request, Response } from 'express';
import { mockServices } from '../data/mockData';
import { ServiceContent, ApiResponse, PaginatedResponse } from '../types';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const { gameType, status, page = 1, pageSize = 10 } = req.query;

    let filteredServices = [...mockServices];

    if (gameType) {
      filteredServices = filteredServices.filter((s) => s.gameType === gameType);
    }

    if (status) {
      filteredServices = filteredServices.filter((s) => s.status === status);
    }

    const total = filteredServices.length;
    const totalPages = Math.ceil(total / Number(pageSize));
    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const items = filteredServices.slice(start, end);

    const response: ApiResponse<PaginatedResponse<ServiceContent>> = {
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
    console.error('Get services error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取服务内容失败',
    };
    res.status(500).json(response);
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = mockServices.find((s) => s.id === id);

    if (!service) {
      const response: ApiResponse = {
        success: false,
        message: '服务内容不存在',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<ServiceContent> = {
      success: true,
      data: service,
    };

    res.json(response);
  } catch (error) {
    console.error('Get service error:', error);
    const response: ApiResponse = {
      success: false,
      message: '获取服务内容失败',
    };
    res.status(500).json(response);
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { name, gameType, basePrice, baseHafCoins, description, imageUrl, status = 'active' } = req.body;

    const newService: ServiceContent = {
      id: String(mockServices.length + 1),
      name,
      gameType,
      basePrice,
      baseHafCoins,
      description,
      imageUrl,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockServices.push(newService);

    const response: ApiResponse<ServiceContent> = {
      success: true,
      data: newService,
      message: '服务内容创建成功',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create service error:', error);
    const response: ApiResponse = {
      success: false,
      message: '创建服务内容失败',
    };
    res.status(500).json(response);
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const serviceIndex = mockServices.findIndex((s) => s.id === id);

    if (serviceIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '服务内容不存在',
      };
      return res.status(404).json(response);
    }

    mockServices[serviceIndex] = {
      ...mockServices[serviceIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<ServiceContent> = {
      success: true,
      data: mockServices[serviceIndex],
      message: '服务内容更新成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Update service error:', error);
    const response: ApiResponse = {
      success: false,
      message: '更新服务内容失败',
    };
    res.status(500).json(response);
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const serviceIndex = mockServices.findIndex((s) => s.id === id);

    if (serviceIndex === -1) {
      const response: ApiResponse = {
        success: false,
        message: '服务内容不存在',
      };
      return res.status(404).json(response);
    }

    mockServices.splice(serviceIndex, 1);

    const response: ApiResponse = {
      success: true,
      message: '服务内容删除成功',
    };

    res.json(response);
  } catch (error) {
    console.error('Delete service error:', error);
    const response: ApiResponse = {
      success: false,
      message: '删除服务内容失败',
    };
    res.status(500).json(response);
  }
});

export default router;

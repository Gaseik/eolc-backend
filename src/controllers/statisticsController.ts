import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// 獲取訂單統計數據（包括與上個月的比較）
// GET /statistics/orders:
export const getOrderStatistics = async (req: RequestWithUser, res: Response) => {
  try {
    console.log('Debug: getOrderStatistics called');

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    console.log('Debug: User ID:', userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    console.log('Debug: User found:', user.email, user.role);

    // 構建基本查詢條件
    const baseQuery: any = {};
    if (user.role === 'endUser') {
      baseQuery.endUserCompanyId = user.organizationId;
    } else {
      baseQuery.createdBy = userId;
    }

    console.log('Debug: Base query:', baseQuery);

    // 計算當前月份和上個月的時間範圍
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    console.log('Debug: Current month start:', currentMonthStart.toISOString());
    console.log('Debug: Current month end:', currentMonthEnd.toISOString());
    console.log('Debug: Last month start:', lastMonthStart.toISOString());
    console.log('Debug: Last month end:', lastMonthEnd.toISOString());

    console.log('Debug: Current month range:', currentMonthStart.toISOString(), 'to', currentMonthEnd.toISOString());
    console.log('Debug: Last month range:', lastMonthStart.toISOString(), 'to', lastMonthEnd.toISOString());

    // 獲取當前月份的訂單
    const currentMonthQuery = {
      ...baseQuery,
      createdAt: {
        $gte: currentMonthStart,
        $lte: currentMonthEnd
      }
    };

    // 獲取上個月的訂單
    const lastMonthQuery = {
      ...baseQuery,
      createdAt: {
        $gte: lastMonthStart,
        $lte: lastMonthEnd
      }
    };

    console.log('Debug: Current month query:', currentMonthQuery);
    console.log('Debug: Last month query:', lastMonthQuery);

    const [currentMonthOrders, lastMonthOrders] = await Promise.all([
      Order.find(currentMonthQuery),
      Order.find(lastMonthQuery)
    ]);

    console.log('Debug: Current month orders:', currentMonthOrders.length);
    console.log('Debug: Last month orders:', lastMonthOrders.length);

    // 計算當前月份統計數據
    let currentUnusedQuantity = 0;
    let currentInUseQuantity = 0;
    let currentDisposedQuantity = 0;
    let currentTotalQuantity = 0;

    for (const order of currentMonthOrders) {
      currentUnusedQuantity += order.unusedQuantity || 0;
      currentInUseQuantity += order.inUseQuantity || 0;
      currentDisposedQuantity += order.disposedQuantity || 0;
      currentTotalQuantity += order.producedQuantity || 0;
    }

    // 計算上個月統計數據
    let lastUnusedQuantity = 0;
    let lastInUseQuantity = 0;
    let lastDisposedQuantity = 0;
    let lastTotalQuantity = 0;

    for (const order of lastMonthOrders) {
      lastUnusedQuantity += order.unusedQuantity || 0;
      lastInUseQuantity += order.inUseQuantity || 0;
      lastDisposedQuantity += order.disposedQuantity || 0;
      lastTotalQuantity += order.producedQuantity || 0;
    }

    const currentStats = {
      unusedQuantity: currentUnusedQuantity,
      inUseQuantity: currentInUseQuantity,
      disposedQuantity: currentDisposedQuantity,
      totalQuantity: currentTotalQuantity
    };

    const lastStats = {
      unusedQuantity: lastUnusedQuantity,
      inUseQuantity: lastInUseQuantity,
      disposedQuantity: lastDisposedQuantity,
      totalQuantity: lastTotalQuantity
    };

    console.log('Debug: Current month stats:', currentStats);
    console.log('Debug: Last month stats:', lastStats);

    // 計算變化量和百分比
    const calculateChange = (current: number, last: number) => {
      const change = current - last;
      const percentageChange = last === 0 ? (current > 0 ? 100 : 0) : (change / last) * 100;
      return { change, percentageChange: Math.round(percentageChange * 100) / 100 };
    };

    const result = {
      currentMonth: {
        period: {
          start: currentMonthStart.toISOString(),
          end: currentMonthEnd.toISOString()
        },
        statistics: currentStats
      },
      lastMonth: {
        period: {
          start: lastMonthStart.toISOString(),
          end: lastMonthEnd.toISOString()
        },
        statistics: lastStats
      },
      comparison: {
        unusedQuantity: calculateChange(currentStats.unusedQuantity, lastStats.unusedQuantity),
        inUseQuantity: calculateChange(currentStats.inUseQuantity, lastStats.inUseQuantity),
        disposedQuantity: calculateChange(currentStats.disposedQuantity, lastStats.disposedQuantity),
        totalQuantity: calculateChange(currentStats.totalQuantity, lastStats.totalQuantity)
      }
    };

    console.log('Debug: Returning result');
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get order statistics error:', error);
    res.status(500).json({ success: false, error: 'Server error: ' + (error as Error).message });
  }
}; 
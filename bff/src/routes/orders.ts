import express, { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';

const router = express.Router();
const orderService = new OrderService();

// GET /api/orders
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await orderService.getOrders(req.query);
        res.json(data);
    } catch (error) {
        next(error);
    }
});

// GET /api/orders/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await orderService.getOrderById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (error) {
        next(error);
    }
});

export { router as orderRoutes };

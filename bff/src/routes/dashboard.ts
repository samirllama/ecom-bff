// bff/src/routes/dashboard.ts
import express, { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService';

const router = express.Router();
const dashboardService = new DashboardService();

// GET /api/dashboard/summary
// BFF Pattern: Aggregates data from multiple microservices
router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // The BFF layer aggregates data from multiple services
        // and transforms it into a format optimized for the frontend
        const summary = await dashboardService.getDashboardSummary();

        // Add cache headers for performance
        res.set('Cache-Control', 'public, max-age=30'); // 30 seconds cache
        res.json(summary);
    } catch (error) {
        next(error);
    }
});

export { router as dashboardRoutes };

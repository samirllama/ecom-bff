import express, { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';

const router = express.Router();
const productService = new ProductService();

// GET /api/products
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await productService.getProducts(req.query);
        res.json(data);
    } catch (error) {
        next(error);
    }
});

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        next(error);
    }
});

export { router as productRoutes };

import { Router } from 'express';
import { getAllCars, getCarById, createCar, updateCar, deleteCar } from '../controllers/carController'; // ใช้ relative path
import { adminMiddleware } from '../middleware/auth'; // ใช้ relative path

const router = Router();

// เส้นทางสำหรับจัดการรถ
router.get('/', getAllCars);
router.get('/:id', getCarById);
router.post('/', adminMiddleware, createCar);
router.put('/:id', adminMiddleware, updateCar);
router.delete('/:id', adminMiddleware, deleteCar);

export default router;
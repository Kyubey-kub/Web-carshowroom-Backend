import { Router, Response, NextFunction, RequestHandler, Request } from 'express';
import db from '../config/db';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';
import { format, isValid, parseISO } from 'date-fns';
import { register, login, getDashboardData, getRecentActivity } from '../controllers/authController';
import { getCarById } from '../controllers/carController';
import { sendContact, getContacts, replyContact, deleteContact } from '../controllers/contactController';
import { getUserActivity, getRegistrationTrends } from '../controllers/reportController';
import { AuthenticatedRequest } from '../types';

const router = Router();

// เส้นทางที่ไม่ต้องใช้ authMiddleware
router.get('/cars', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [cars] = await db.query<RowDataPacket[]>(
      `SELECT cars.*, models.name AS model_name, brands.name AS brand_name 
       FROM cars 
       LEFT JOIN models ON cars.model_id = models.id 
       LEFT JOIN brands ON models.brand_id = brands.id`
    );
    res.status(200).json(cars);
  } catch (error: any) {
    console.error('[GET /cars] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch cars', details: error.message });
    next(error);
  }
});

router.get('/brands', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [brands] = await db.query<RowDataPacket[]>('SELECT name FROM brands');
    res.status(200).json(brands.map((brand: any) => brand.name));
  } catch (error: any) {
    console.error('[GET /brands] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch brands', details: error.message });
    next(error);
  }
});

router.get('/years', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [years] = await db.query<RowDataPacket[]>('SELECT DISTINCT year FROM cars');
    res.status(200).json(years.map((year: any) => year.year.toString()));
  } catch (error: any) {
    console.error('[GET /years] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch years', details: error.message });
    next(error);
  }
});

router.get('/cars/:id', getCarById);

router.get('/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [reviews] = await db.query<RowDataPacket[]>(
      `SELECT reviews.*, users.email AS user_email, 
              cars.year, models.name AS model_name, brands.name AS brand_name 
       FROM reviews 
       JOIN users ON reviews.user_id = users.id 
       JOIN cars ON reviews.car_id = cars.id 
       JOIN models ON cars.model_id = models.id 
       JOIN brands ON models.brand_id = brands.id`
    );
    res.status(200).json(reviews);
  } catch (error: any) {
    console.error('[GET /reviews] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch reviews', details: error.message });
    next(error);
  }
});

router.post('/reviews', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const { car_id, rating, comment } = req.body;
  const user_id = req.user.id;

  if (!car_id || !rating || !comment) {
    res.status(400).json({ error: 'Car ID, rating, and comment are required' });
    return;
  }

  if (rating < 1 || rating > 5) {
    res.status(400).json({ error: 'Rating must be between 1 and 5' });
    return;
  }

  const [cars] = await db.query<RowDataPacket[]>('SELECT * FROM cars WHERE id = ?', [car_id]);
  if (cars.length === 0) {
    res.status(404).json({ error: 'Car not found' });
    return;
  }

  try {
    const [result] = await db.query(
      'INSERT INTO reviews (user_id, car_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())',
      [user_id, car_id, rating, comment]
    );
    res.status(201).json({ id: (result as any).insertId, user_id, car_id, rating, comment, created_at: new Date().toISOString() });
  } catch (error: any) {
    console.error('[POST /reviews] Error:', error.message);
    res.status(500).json({ error: 'Failed to create review', details: error.message });
    next(error);
  }
});

router.put('/reviews/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const reviewId = parseInt(req.params.id);
  const { rating, comment } = req.body;
  const user_id = req.user.id;
  const user_role = req.user.role;

  if (!rating || !comment) {
    res.status(400).json({ error: 'Rating and comment are required' });
    return;
  }

  if (rating < 1 || rating > 5) {
    res.status(400).json({ error: 'Rating must be between 1 and 5' });
    return;
  }

  try {
    const [reviews] = await db.query<RowDataPacket[]>('SELECT * FROM reviews WHERE id = ?', [reviewId]);
    if (reviews.length === 0) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    const review = reviews[0];
    if (review.user_id !== user_id && user_role !== 'admin') {
      res.status(403).json({ error: 'You can only edit your own reviews' });
      return;
    }

    await db.query(
      'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
      [rating, comment, reviewId]
    );
    res.status(200).json({ id: reviewId, rating, comment });
  } catch (error: any) {
    console.error('[PUT /reviews/:id] Error:', error.message);
    res.status(500).json({ error: 'Failed to update review', details: error.message });
    next(error);
  }
});

router.delete('/reviews/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const reviewId = parseInt(req.params.id);
  const user_id = req.user.id;
  const user_role = req.user.role;

  try {
    const [reviews] = await db.query<RowDataPacket[]>('SELECT * FROM reviews WHERE id = ?', [reviewId]);
    if (reviews.length === 0) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    const review = reviews[0];
    if (review.user_id !== user_id && user_role !== 'admin') {
      res.status(403).json({ error: 'You can only delete your own reviews' });
      return;
    }

    await db.query('DELETE FROM reviews WHERE id = ?', [reviewId]);
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    console.error('[DELETE /reviews/:id] Error:', error.message);
    res.status(500).json({ error: 'Failed to delete review', details: error.message });
    next(error);
  }
});

router.get('/bookings/my-bookings', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const user_id = req.user.id;

  try {
    const [bookings] = await db.query<RowDataPacket[]>(
      `SELECT bookings.*, 
              cars.year, 
              models.name AS model_name, 
              brands.name AS brand_name 
       FROM bookings 
       JOIN cars ON bookings.car_id = cars.id 
       JOIN models ON cars.model_id = models.id 
       JOIN brands ON models.brand_id = brands.id 
       WHERE bookings.user_id = ?`,
      [user_id]
    );

    console.log(`[GET /bookings/my-bookings] userId: ${user_id}, bookings:`, bookings);
    res.status(200).json(bookings);
  } catch (error: any) {
    console.error('[GET /bookings/my-bookings] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
    next(error);
  }
});

router.delete('/bookings/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    console.log('[DELETE /bookings/:id] No user_id found');
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const bookingId = parseInt(req.params.id);
  const user_id = req.user.id;

  try {
    console.log(`[DELETE /bookings/:id] Deleting booking ID: ${bookingId} for user ID: ${user_id}`);

    const [bookings] = await db.query<RowDataPacket[]>(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [bookingId, user_id]
    );

    console.log(`[DELETE /bookings/:id] Booking found:`, bookings);

    if (bookings.length === 0) {
      console.log(`[DELETE /bookings/:id] Booking ID ${bookingId} not found or not authorized for user ID ${user_id}`);
      res.status(404).json({ error: 'Booking not found or not authorized' });
      return;
    }

    const booking = bookings[0];
    if (booking.status !== 'pending') {
      console.log(`[DELETE /bookings/:id] Booking ID ${bookingId} is not in pending status: ${booking.status}`);
      res.status(400).json({ error: 'Only pending bookings can be deleted' });
      return;
    }

    const [deleteResult] = await db.query(
      'DELETE FROM bookings WHERE id = ?',
      [bookingId]
    );

    console.log(`[DELETE /bookings/:id] Delete result:`, deleteResult);

    if ((deleteResult as any).affectedRows === 0) {
      console.log(`[DELETE /bookings/:id] Failed to delete booking ID ${bookingId}`);
      res.status(500).json({ error: 'Failed to delete booking: Delete failed' });
      return;
    }

    await db.query(
      'UPDATE cars SET status = ? WHERE id = ?',
      ['available', booking.car_id]
    );

    console.log(`[DELETE /bookings/:id] Updated car status to "available" for car ID: ${booking.car_id}`);

    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error: any) {
    console.error('[DELETE /bookings/:id] Error:', error.message);
    res.status(500).json({ error: 'Failed to delete booking', details: error.message });
    next(error);
  }
});

router.post('/auth/register', register);

router.post('/auth/login', login);

router.get('/auth/dashboard', authMiddleware, adminMiddleware, getDashboardData);

router.get('/auth/recent-activity', authMiddleware, adminMiddleware, getRecentActivity);

router.post('/bookings', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  const { carId, bookingDate, type, message } = req.body;
  const userId = req.user.id;

  if (!carId || !bookingDate || !type) {
    res.status(400).json({ error: 'Car ID, booking date, and type are required' });
    return;
  }

  if (!['test_drive', 'inquiry'].includes(type)) {
    res.status(400).json({ error: 'Type must be either "test_drive" or "inquiry"' });
    return;
  }

  const [cars] = await db.query<RowDataPacket[]>('SELECT * FROM cars WHERE id = ?', [carId]);
  if (cars.length === 0) {
    res.status(404).json({ error: 'Car not found' });
    return;
  }

  const parsedDate = parseISO(bookingDate);
  if (!isValid(parsedDate)) {
    res.status(400).json({ error: 'Invalid booking date format. Use ISO 8601 format (e.g., 2025-03-27T19:09:00.900Z)' });
    return;
  }

  const formattedBookingDate = format(parsedDate, 'yyyy-MM-dd HH:mm:ss');

  try {
    const [result] = await db.query(
      'INSERT INTO bookings (user_id, car_id, booking_date, type, message, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, carId, formattedBookingDate, type, message, 'pending']
    );
    res.status(201).json({ id: (result as any).insertId, carId, bookingDate, type, message, userId, status: 'pending' });
  } catch (error: any) {
    console.error('[POST /bookings] Error:', error.message);
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
    next(error);
  }
});

router.post('/contacts', authMiddleware, sendContact);

router.get('/contacts', authMiddleware, adminMiddleware, getContacts);

router.post('/contacts/:id/reply', authMiddleware, adminMiddleware, replyContact);

router.delete('/contacts/:id', authMiddleware, adminMiddleware, deleteContact);

router.get('/reports/user-activity', authMiddleware, adminMiddleware, getUserActivity);

router.get('/reports/registration-trends', authMiddleware, adminMiddleware, getRegistrationTrends);

export default router;
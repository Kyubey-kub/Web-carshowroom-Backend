import { Router, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { getUsers, deleteUser, getAdminEmail, updateUser, addUser } from '../controllers/userController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>, getUsers as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>);
router.delete('/:id', authMiddleware as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>, deleteUser as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>);
router.put('/:id', authMiddleware as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>, updateUser as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>);
router.post('/', authMiddleware as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>, addUser as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>);
router.get('/admin-email', authMiddleware as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>, getAdminEmail as RequestHandler<ParamsDictionary, any, any, any, Record<string, any>>);

export default router;
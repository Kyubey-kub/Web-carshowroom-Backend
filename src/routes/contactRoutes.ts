import { Router } from 'express';
import { getContacts, sendContact } from '../controllers/contactController'; // ใช้ relative path

const router = Router();

router.get('/', getContacts);
router.post('/', sendContact);

export default router;
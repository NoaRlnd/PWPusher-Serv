import { Router } from 'express';
import { createPush } from '../controllers/push.controller.js';
const router = Router();

router.route('/create').post(createPush);

export default router;
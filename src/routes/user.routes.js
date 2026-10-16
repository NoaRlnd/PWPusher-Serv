import { Router } from 'express';
import { authStatus, checkApiInfo, deleteApiKey, deleteUser, generateApiKey, loginUser, logoutUser, registerUser } from '../controllers/user.controller.js';

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(logoutUser);
router.route('/status').get(authStatus);
router.route('/delUser').delete(deleteUser);
router.route('/genApiKey').post(generateApiKey);
router.route('/getApiKey').get(checkApiInfo);
router.route('/delApiKey').delete(deleteApiKey);

export default router;
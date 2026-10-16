import { Router } from "express";
import { deleteMFA, resetMFA, setupMFA, verifyMFA } from "../controllers/mfa.controller.js";

const router = Router();

router.route('/setup').get(setupMFA);
router.route('/verify').get(verifyMFA); // OTP ?
router.route('/reset').patch(resetMFA);
router.route('/delete').delete(deleteMFA);

export default router;
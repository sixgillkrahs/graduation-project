import { Router } from "express";
import { PaymentController } from "@/controllers/payment.controller";
import { requireAuth } from "@/middleware/authMiddleware";

const router = Router();
const paymentController = new PaymentController();

// We can define this behind auth if we want, currently keeping it open or with auth
router.use(requireAuth);

router.post("/create_payment_url", paymentController.createPaymentUrl);

router.get("/vnpay_return", paymentController.vnpayReturn);

export default router;

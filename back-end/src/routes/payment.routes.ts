import { Router } from "express";
import { PaymentController } from "@/controllers/payment.controller";
import { requireAuth } from "@/middleware/authMiddleware";

const router = Router();
const paymentController = new PaymentController();

// We can define this behind auth if we want, currently keeping it open or with auth
router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment integration with VNPay
 */

/**
 * @swagger
 * /payment/create_payment_url:
 *   post:
 *     summary: Create a VNPay payment URL for agent plan upgrade
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount (defaults to 500000)
 *               bankCode:
 *                 type: string
 *                 description: Optional bank code
 *               language:
 *                 type: string
 *                 description: Language for VNPay (e.g., 'vn' or 'en')
 *     responses:
 *       200:
 *         description: Successfully generated VNPay URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: string
 *                   description: The VNPay URL to redirect to
 */
router.post("/create_payment_url", paymentController.createPaymentUrl);

/**
 * @swagger
 * /payment/downgrade:
 *   post:
 *     summary: Downgrade from PRO plan to Basic plan
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully downgraded plan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Successfully downgraded to Basic plan.
 */
router.post("/downgrade", paymentController.downgradePlan);

/**
 * @swagger
 * /payment/create_momo_payment_url:
 *   post:
 *     summary: Create a MoMo payment URL for agent plan upgrade
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount (defaults to 500000)
 *     responses:
 *       200:
 *         description: Successfully generated MoMo URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: string
 *                   description: The MoMo URL to redirect to
 */
router.post("/create_momo_payment_url", paymentController.createMomoPaymentUrl);

/**
 * @swagger
 * /payment/momo_return:
 *   get:
 *     summary: Handle MoMo return webhook
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: partnerCode
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: requestId
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: amount
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: orderInfo
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: orderType
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: transId
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: resultCode
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: message
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: payType
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: responseTime
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: extraData
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: signature
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *       200:
 *         description: Transaction result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     code:
 *                       type: string
 */
router.get("/momo_return", paymentController.momoReturn);

/**
 * @swagger
 * /payment/vnpay_return:
 *   get:
 *     summary: Handle VNPay return webhook
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: vnp_SecureHash
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *         required: true
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Transaction result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     code:
 *                       type: string
 */
router.get("/vnpay_return", paymentController.vnpayReturn);

export default router;

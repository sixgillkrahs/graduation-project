import { Router } from "express";
import { PaymentController } from "@/controllers/payment.controller";
import { authorize, requireAuth } from "@/middleware/authMiddleware";

const router = Router();
const paymentController = new PaymentController();

// We can define this behind auth if we want, currently keeping it open or with auth
router.use(requireAuth);

/**
 * @swagger
 * /payment/admin/transactions:
 *   get:
 *     summary: Get PRO package purchase transactions for admin
 *     description: Returns a paginated admin list of agent PRO-package purchase transactions. Supports filtering by status, duration, free-text search, and server-side sorting.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page.
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field used for sorting.
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, SUCCESS, FAILED, CANCELLED]
 *           default: SUCCESS
 *         description: Filter by payment status.
 *       - in: query
 *         name: planDurationMonths
 *         schema:
 *           type: integer
 *           enum: [1, 12]
 *         description: Filter by purchased PRO package duration in months.
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search by transaction reference, order info, buyer full name, email, or phone number.
 *     responses:
 *       200:
 *         description: Paginated transaction list returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           transactionRef:
 *                             type: string
 *                           amount:
 *                             type: number
 *                           status:
 *                             type: string
 *                           planDurationMonths:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 nullable: true
 *                               fullName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               phone:
 *                                 type: string
 *                           agent:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 nullable: true
 *                               status:
 *                                 type: string
 *                               currentPlan:
 *                                 type: string
 *                               currentPlanEndDate:
 *                                 type: string
 *                                 format: date-time
 *                                 nullable: true
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalResults:
 *                       type: integer
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden. The current admin account does not have permission to read payments.
 */
router.get("/admin/transactions", authorize(), paymentController.getUpgradeTransactions);

/**
 * @swagger
 * /payment/admin/summary:
 *   get:
 *     summary: Get PRO package payment summary for admin dashboard
 *     description: Returns aggregated payment metrics for PRO package purchases, including total revenue, total successful purchases, unique buyers, current-month revenue, and active PRO agents.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment summary returned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                       example: 12500000
 *                     totalPurchases:
 *                       type: integer
 *                       example: 14
 *                     totalBuyers:
 *                       type: integer
 *                       example: 11
 *                     monthlyRevenue:
 *                       type: number
 *                       example: 4800000
 *                     monthlyPurchases:
 *                       type: integer
 *                       example: 4
 *                     activeProAgents:
 *                       type: integer
 *                       example: 9
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden. The current admin account does not have permission to read payments.
 */
router.get("/admin/summary", authorize(), paymentController.getUpgradeTransactionSummary);

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment integration and plan-upgrade transaction management for VNPay, MoMo, and admin reporting.
 */

/**
 * @swagger
 * /payment/create_payment_url:
 *   post:
 *     summary: Create a VNPay payment URL for agent plan upgrade
 *     description: Creates a VNPay redirect URL for upgrading an agent account to the PRO plan. A pending transaction record is stored before redirecting the user to VNPay.
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
 *       401:
 *         description: Unauthorized.
 */
router.post("/create_payment_url", paymentController.createPaymentUrl);

/**
 * @swagger
 * /payment/downgrade:
 *   post:
 *     summary: Downgrade from PRO plan to Basic plan
 *     description: Downgrades the currently authenticated agent account from PRO back to BASIC by clearing the stored plan information.
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
 *       401:
 *         description: Unauthorized.
 *       400:
 *         description: The plan could not be downgraded.
 */
router.post("/downgrade", paymentController.downgradePlan);

/**
 * @swagger
 * /payment/create_momo_payment_url:
 *   post:
 *     summary: Create a MoMo payment URL for agent plan upgrade
 *     description: Creates a MoMo redirect URL for upgrading an agent account to the PRO plan. A pending transaction record is stored before redirecting the user to MoMo.
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
 *       401:
 *         description: Unauthorized.
 */
router.post("/create_momo_payment_url", paymentController.createMomoPaymentUrl);

/**
 * @swagger
 * /payment/momo_return:
 *   get:
 *     summary: Handle MoMo return webhook
 *     description: Handles the return callback from MoMo after payment completion, updates the stored transaction status, and activates the PRO plan when the payment succeeds.
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
 *                       example: Payment Success
 *                     code:
 *                       type: string
 *                       example: "00"
 */
router.get("/momo_return", paymentController.momoReturn);

/**
 * @swagger
 * /payment/vnpay_return:
 *   get:
 *     summary: Handle VNPay return webhook
 *     description: Handles the return callback from VNPay after payment completion, validates the VNPay signature, updates the stored transaction status, and activates the PRO plan when the payment succeeds.
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
 *                       example: Payment Success
 *                     code:
 *                       type: string
 *                       example: "00"
 *       400:
 *         description: Invalid callback payload or payment validation failed.
 */
router.get("/vnpay_return", paymentController.vnpayReturn);

export default router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = require("../services/order.service");
class OrderController {
    /**
     * Checks out the shopping cart to place a new order.
     */
    static async checkout(req, res, next) {
        try {
            const patientId = req.user.id;
            const { address_id, prescription_id } = req.body;
            const result = await order_service_1.OrderService.checkout(patientId, address_id, prescription_id);
            return res.status(201).json({
                message: 'Order placed successfully',
                ...result,
            });
        }
        catch (err) {
            return res.status(400).json({ error: err.message || 'Checkout failed' });
        }
    }
    /**
     * Retrieves orders list (patient lists their orders, retailer lists orders with their products).
     */
    static async list(req, res, next) {
        try {
            const userId = req.user.id;
            const role = req.user.role;
            const orders = await order_service_1.OrderService.getOrders(userId, role);
            return res.status(200).json(orders);
        }
        catch (err) {
            return next(err);
        }
    }
    /**
     * Retrieves details of a single order.
     */
    static async getById(req, res, next) {
        try {
            const orderId = req.params.id;
            const userId = req.user.id;
            const role = req.user.role;
            const order = await order_service_1.OrderService.getOrderById(orderId, userId, role);
            return res.status(200).json(order);
        }
        catch (err) {
            return res.status(403).json({ error: err.message || 'Access denied' });
        }
    }
}
exports.OrderController = OrderController;

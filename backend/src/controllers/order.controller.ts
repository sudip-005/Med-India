import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';

export class OrderController {
  /**
   * Checks out the shopping cart to place a new order.
   */
  static async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.user!.id;
      const { address_id, prescription_id } = req.body;
      const result = await OrderService.checkout(patientId, address_id, prescription_id);
      return res.status(201).json({
        message: 'Order placed successfully',
        ...result,
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Checkout failed' });
    }
  }

  /**
   * Retrieves orders list (patient lists their orders, retailer lists orders with their products).
   */
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const orders = await OrderService.getOrders(userId, role);
      return res.status(200).json(orders);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Retrieves details of a single order.
   */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.id;
      const userId = req.user!.id;
      const role = req.user!.role;
      const order = await OrderService.getOrderById(orderId, userId, role);
      return res.status(200).json(order);
    } catch (err: any) {
      return res.status(403).json({ error: err.message || 'Access denied' });
    }
  }
}

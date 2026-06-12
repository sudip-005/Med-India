import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';

export class CartController {
  /**
   * Retrieves the shopping cart and its items.
   */
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.user!.id;
      const cart = await CartService.getCartItems(patientId);
      return res.status(200).json(cart);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Adds an item to the shopping cart.
   */
  static async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.user!.id;
      const item = await CartService.addItemToCart(patientId, req.body);
      return res.status(201).json({
        message: 'Item added to cart successfully',
        item,
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Removes an item from the cart.
   */
  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const patientId = req.user!.id;
      const cartItemId = req.params.id;
      await CartService.removeCartItem(patientId, cartItemId);
      return res.status(200).json({
        message: 'Item removed from cart successfully',
      });
    } catch (err) {
      return next(err);
    }
  }
}

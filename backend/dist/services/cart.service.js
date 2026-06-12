"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const supabase_1 = require("../config/supabase");
/**
 * Service to manage shopping carts and items.
 */
class CartService {
    /**
     * Retrieves or creates a shopping cart for a Patient.
     */
    static async getOrCreateCart(patientId) {
        let { data: cart, error: fetchError } = await supabase_1.supabaseAdmin
            .from('carts')
            .select('*')
            .eq('patient_id', patientId)
            .maybeSingle();
        if (fetchError) {
            throw new Error(`Failed to query cart: ${fetchError.message}`);
        }
        if (!cart) {
            const { data: newCart, error: createError } = await supabase_1.supabaseAdmin
                .from('carts')
                .insert({ patient_id: patientId })
                .select()
                .single();
            if (createError) {
                throw new Error(`Failed to initialize cart: ${createError.message}`);
            }
            cart = newCart;
        }
        return cart;
    }
    /**
     * Lists all items currently in the patient's cart.
     */
    static async getCartItems(patientId) {
        const cart = await this.getOrCreateCart(patientId);
        const { data: items, error } = await supabase_1.supabaseAdmin
            .from('cart_items')
            .select('*')
            .eq('cart_id', cart.cart_id);
        if (error) {
            throw new Error(`Failed to load cart items: ${error.message}`);
        }
        return {
            cart_id: cart.cart_id,
            items: items || [],
        };
    }
    /**
     * Adds an item to the shopping cart.
     * If the item already exists in the cart (same name and retailer), it updates the quantity.
     */
    static async addItemToCart(patientId, itemData) {
        const cart = await this.getOrCreateCart(patientId);
        // Check for existing duplicate item in cart
        const { data: existingItem, error: checkError } = await supabase_1.supabaseAdmin
            .from('cart_items')
            .select('*')
            .eq('cart_id', cart.cart_id)
            .eq('product_name', itemData.product_name)
            .eq('retailer_id', itemData.retailer_id || null)
            .maybeSingle();
        if (checkError) {
            throw new Error(`Failed to check existing cart items: ${checkError.message}`);
        }
        if (existingItem) {
            // Add up quantities
            const newQuantity = existingItem.quantity + itemData.quantity;
            const { data, error } = await supabase_1.supabaseAdmin
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('cart_item_id', existingItem.cart_item_id)
                .select()
                .single();
            if (error) {
                throw new Error(`Failed to update item quantity: ${error.message}`);
            }
            return data;
        }
        else {
            // Insert new item
            const { data, error } = await supabase_1.supabaseAdmin
                .from('cart_items')
                .insert({
                cart_id: cart.cart_id,
                product_name: itemData.product_name,
                quantity: itemData.quantity,
                price: itemData.price,
                retailer_id: itemData.retailer_id || null,
            })
                .select()
                .single();
            if (error) {
                throw new Error(`Failed to add item to cart: ${error.message}`);
            }
            return data;
        }
    }
    /**
     * Deletes a cart item.
     */
    static async removeCartItem(patientId, cartItemId) {
        const cart = await this.getOrCreateCart(patientId);
        const { error } = await supabase_1.supabaseAdmin
            .from('cart_items')
            .delete()
            .eq('cart_item_id', cartItemId)
            .eq('cart_id', cart.cart_id);
        if (error) {
            throw new Error(`Failed to delete cart item: ${error.message}`);
        }
    }
    /**
     * Clears all items from a cart.
     */
    static async clearCart(cartId) {
        const { error } = await supabase_1.supabaseAdmin
            .from('cart_items')
            .delete()
            .eq('cart_id', cartId);
        if (error) {
            throw new Error(`Failed to clear cart items: ${error.message}`);
        }
    }
}
exports.CartService = CartService;

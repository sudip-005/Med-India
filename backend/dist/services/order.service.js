"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const supabase_1 = require("../config/supabase");
const cart_service_1 = require("./cart.service");
/**
 * Service to manage orders and checkout.
 */
class OrderService {
    /**
     * Checks out the patient's cart, creates the order, logs items, and clears the cart.
     */
    static async checkout(patientId, addressId, prescriptionId) {
        // 1. Get cart items
        const { cart_id, items } = await cart_service_1.CartService.getCartItems(patientId);
        if (!items || items.length === 0) {
            throw new Error('Cannot checkout: your cart is empty');
        }
        // Compute total sum
        const totalAmount = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
        // 2. Create the Order record
        const { data: order, error: orderError } = await supabase_1.supabaseAdmin
            .from('orders')
            .insert({
            patient_id: patientId,
            address_id: addressId,
            total_amount: totalAmount,
            prescription_id: prescriptionId || null,
            status: 'pending',
        })
            .select()
            .single();
        if (orderError) {
            throw new Error(`Failed to place order: ${orderError.message}`);
        }
        // 3. Create the Order Items records
        const orderItemsToInsert = items.map((item) => ({
            order_id: order.order_id,
            product_name: item.product_name,
            quantity: item.quantity,
            price: item.price,
            retailer_id: item.retailer_id,
        }));
        const { error: itemsError } = await supabase_1.supabaseAdmin
            .from('order_items')
            .insert(orderItemsToInsert);
        if (itemsError) {
            // Rollback/delete the order record if items fail to insert
            await supabase_1.supabaseAdmin.from('orders').delete().eq('order_id', order.order_id);
            throw new Error(`Failed to store order items: ${itemsError.message}`);
        }
        // 4. Update the retailers' total_orders count
        const uniqueRetailerIds = Array.from(new Set(items.map((i) => i.retailer_id).filter(Boolean)));
        for (const retailerId of uniqueRetailerIds) {
            try {
                const { data: retailer } = await supabase_1.supabaseAdmin
                    .from('retailers')
                    .select('total_orders')
                    .eq('retailer_id', retailerId)
                    .maybeSingle();
                if (retailer) {
                    const currentCount = retailer.total_orders || 0;
                    await supabase_1.supabaseAdmin
                        .from('retailers')
                        .update({ total_orders: currentCount + 1 })
                        .eq('retailer_id', retailerId);
                }
            }
            catch (err) {
                console.error(`Error updating total_orders for retailer "${retailerId}":`, err);
            }
        }
        // 5. Clear the shopping cart
        await cart_service_1.CartService.clearCart(cart_id);
        return {
            order,
            items: orderItemsToInsert,
        };
    }
    /**
     * Retrieves orders based on role.
     * Patients see their own orders. Retailers see orders containing their products.
     */
    static async getOrders(userId, role) {
        if (role === 'PATIENT') {
            const { data, error } = await supabase_1.supabaseAdmin
                .from('orders')
                .select(`
          *,
          address:addresses(*),
          items:order_items(*)
        `)
                .eq('patient_id', userId)
                .order('created_at', { ascending: false });
            if (error) {
                throw new Error(`Failed to fetch orders: ${error.message}`);
            }
            return data;
        }
        else if (role === 'RETAILER') {
            // Find orders that contain this retailer's items
            const { data: retailerItems, error: itemsError } = await supabase_1.supabaseAdmin
                .from('order_items')
                .select('order_id')
                .eq('retailer_id', userId);
            if (itemsError) {
                throw new Error(`Failed to query order items: ${itemsError.message}`);
            }
            const orderIds = Array.from(new Set(retailerItems?.map((x) => x.order_id) || []));
            if (orderIds.length === 0)
                return [];
            const { data, error } = await supabase_1.supabaseAdmin
                .from('orders')
                .select(`
          *,
          address:addresses(*),
          items:order_items(*)
        `)
                .in('order_id', orderIds)
                .order('created_at', { ascending: false });
            if (error) {
                throw new Error(`Failed to fetch retailer orders: ${error.message}`);
            }
            // Filter each order's items array to only show products matching this retailer
            return data.map((order) => ({
                ...order,
                items: order.items.filter((item) => item.retailer_id === userId),
            }));
        }
        else {
            // Doctors do not have orders
            return [];
        }
    }
    /**
     * Retrieves a single order by ID, validating ownership/access based on user role.
     */
    static async getOrderById(orderId, userId, role) {
        const { data: order, error } = await supabase_1.supabaseAdmin
            .from('orders')
            .select(`
        *,
        address:addresses(*),
        items:order_items(*)
      `)
            .eq('order_id', orderId)
            .maybeSingle();
        if (error || !order) {
            throw new Error('Order not found');
        }
        if (role === 'PATIENT' && order.patient_id !== userId) {
            throw new Error('Access denied: You do not own this order');
        }
        if (role === 'RETAILER') {
            const hasSellerItem = order.items.some((item) => item.retailer_id === userId);
            if (!hasSellerItem) {
                throw new Error('Access denied: You are not a retailer on this order');
            }
            // Filter items to show only this retailer's products
            return {
                ...order,
                items: order.items.filter((item) => item.retailer_id === userId),
            };
        }
        return order;
    }
}
exports.OrderService = OrderService;

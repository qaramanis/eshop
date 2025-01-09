import { supabase } from '../SupabaseClient';

/**
 * MarketplaceService provides a simplified interface for marketplace integration
 * using the existing database structure. This approach treats your shop's inventory
 * as directly available to the marketplace without additional complexity.
 */
class MarketplaceService {
    /**
     * Fetches all available products and formats them for marketplace consumption.
     * This method combines both smartphones and accessories into a single product list.
     */
    async getAllProducts() {
        try {
            // Fetch products from both tables simultaneously
            const [smartphonesResult, accessoriesResult] = await Promise.all([
                supabase
                    .from('smartphones')
                    .select('*'),
                supabase
                    .from('accessories')
                    .select('*')
            ]);

            // Handle any database errors
            if (smartphonesResult.error) throw smartphonesResult.error;
            if (accessoriesResult.error) throw accessoriesResult.error;

            // Format all products for marketplace consistency
            const smartphones = smartphonesResult.data.map(product => ({
                ...this._formatProductForMarketplace(product, 'smartphone')
            }));

            const accessories = accessoriesResult.data.map(product => ({
                ...this._formatProductForMarketplace(product, 'accessory')
            }));

            return [...smartphones, ...accessories];
        } catch (error) {
            console.error('Error fetching products for marketplace:', error);
            throw new Error('Failed to fetch products');
        }
    }

    /**
     * Processes an order from the marketplace by updating inventory
     * and creating order records in your existing tables.
     */
    async processOrder(orderData) {
        try {
            // Start a Supabase transaction
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    total_amount: orderData.totalAmount,
                    order_status: 'pending',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Insert customer contact information
            await supabase
                .from('order_contact_info')
                .insert({
                    order_id: order.id,
                    first_name: orderData.customer.firstName,
                    last_name: orderData.customer.lastName,
                    email: orderData.customer.email,
                    phone: orderData.customer.phone
                });

            // Insert shipping information
            await supabase
                .from('order_shipping_info')
                .insert({
                    order_id: order.id,
                    address: orderData.shipping.address,
                    city: orderData.shipping.city,
                    state: orderData.shipping.state,
                    zipcode: orderData.shipping.zipcode
                });

            // Update inventory for each ordered item
            for (const item of orderData.items) {
                const table = this._getTableName(item.type);
                const { data: product } = await supabase
                    .from(table)
                    .select('quantity')
                    .eq('id', item.id)
                    .single();

                if (product.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for product ${item.id}`);
                }

                await supabase
                    .from(table)
                    .update({ quantity: product.quantity - item.quantity })
                    .eq('id', item.id);
            }

            // Update order status to confirmed
            await supabase
                .from('orders')
                .update({ order_status: 'confirmed' })
                .eq('id', order.id);

            return {
                success: true,
                orderId: order.id,
                status: 'confirmed'
            };
        } catch (error) {
            console.error('Error processing marketplace order:', error);
            throw new Error('Failed to process order');
        }
    }

    /**
     * Checks if products are available in requested quantities
     */
    async checkAvailability(items) {
        try {
            const availability = {};
            
            for (const item of items) {
                const table = this._getTableName(item.type);
                const { data: product } = await supabase
                    .from(table)
                    .select('quantity')
                    .eq('id', item.id)
                    .single();

                availability[item.id] = {
                    available: product.quantity >= item.quantity,
                    currentStock: product.quantity
                };
            }

            return availability;
        } catch (error) {
            console.error('Error checking product availability:', error);
            throw new Error('Failed to check availability');
        }
    }

    // Private helper methods
    _getTableName(type) {
        return type === 'smartphone' ? 'smartphones' : 'accessories';
    }

    _formatProductForMarketplace(product, type) {
        return {
            id: product.id,
            type: type,
            name: product.name,
            description: product.description,
            price: product.price,
            quantity: product.quantity,
            manufacturer: product.manufacturer,
            image_url: product.image_url,
            // Include color options only for smartphones
            variants: type === 'smartphone' ? {
                colors: product.colors || []
            } : null
        };
    }
}

export const marketplaceService = new MarketplaceService();
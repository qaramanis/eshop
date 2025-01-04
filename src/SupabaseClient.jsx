import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
)

export async function fetchProducts(types = [], filters = {}) {
    if (!types.length) {
        const [smartphonesResult, accessoriesResult] = await Promise.all([
            supabase.from('smartphones')
                    .select('*, colors') // Add colors to the selection
                    .then(result => {
                        if (result.data) {
                            return {
                                ...result,
                                data: result.data.map(item => ({...item, type: 'smartphones'}))
                            };
                        }
                        return result;
                    }),
            supabase.from('accessories')
                    .select('*')
                    .then(result => {
                        if (result.data) {
                            return {
                                ...result,
                                data: result.data.map(item => ({...item, type: 'accessories'}))
                            };
                        }
                        return result;
                    })
        ]);

        if (smartphonesResult.error) throw smartphonesResult.error;
        if (accessoriesResult.error) throw accessoriesResult.error;

        let combinedData = [...smartphonesResult.data, ...accessoriesResult.data];

        if (filters.priceRange) {
            combinedData = combinedData.filter(item => 
                item.price >= filters.priceRange[0] && 
                item.price <= filters.priceRange[1]
            );
        }

        if (filters.manufacturer) {
            combinedData = combinedData.filter(item => 
                filters.manufacturer.includes(item.manufacturer)
            );
        }

        if (filters.availability !== undefined) {
            combinedData = combinedData.filter(item => 
                filters.availability ? item.quantity > 0 : true
            );
        }

        return combinedData;
    }

    const queries = types.map(type => {
        if (type === 'smartphones') {
            return supabase.from('smartphones')
                          .select('*, colors')
                          .then(result => {
                              if (result.data) {
                                  return {
                                      ...result,
                                      data: result.data.map(item => ({...item, type: 'smartphones'}))
                                  };
                              }
                              return result;
                          });
        } else {
            return supabase.from('accessories')
                          .select('*')
                          .then(result => {
                              if (result.data) {
                                  return {
                                      ...result,
                                      data: result.data.map(item => ({...item, type: 'accessories'}))
                                  };
                              }
                              return result;
                          });
        }
    });

    const results = await Promise.all(queries);
    
    results.forEach(result => {
        if (result.error) throw result.error;
    });

    return results.flatMap(result => result.data);
}

export async function fetchProductById(type, id) {
    const table = type === 'smartphones' ? 'smartphones' : 'accessories';
    const { data, error } = await supabase
        .from(table)
        .select(type === 'smartphones' ? '*, colors' : '*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return { ...data, type };
}

// Rest of the code remains unchanged
export async function updateProductQuantity(type, id, newHoard) {
    const table = type === 'smartphones' ? 'smartphones' : 'accessories';
    const { data, error } = await supabase
        .from(table)
        .update({ hoard: newHoard })
        .eq('id', id);

    if (error) throw error;
    return data;
}

export async function fetchManufacturers(type) {
    const table = type === 'smartphones' ? 'smartphones' : 'accessories';
    const { data, error } = await supabase
        .from(table)
        .select('manufacturer');

    if (error) throw error;
    const uniqueManufacturers = [...new Set(data.map(item => item.manufacturer))];
    return uniqueManufacturers;
}

export async function fetchPriceRange(types = []) {
    if (!types.length) {
        const [smartphonesResult, accessoriesResult] = await Promise.all([
            supabase
                .from('smartphones')
                .select('price')
                .order('price', { ascending: true }),
            supabase
                .from('accessories')
                .select('price')
                .order('price', { ascending: true })
        ]);

        if (smartphonesResult.error) throw smartphonesResult.error;
        if (accessoriesResult.error) throw accessoriesResult.error;

        const allPrices = [...smartphonesResult.data, ...accessoriesResult.data]
            .map(item => item.price);

        return {
            min: Math.min(...allPrices),
            max: Math.max(...allPrices)
        };
    }
    
    const queries = types.map(type => {
        const table = type === 'smartphones' ? 'smartphones' : 'accessories';
        return supabase
            .from(table)
            .select('price')
            .order('price', { ascending: true });
    });

    const results = await Promise.all(queries);
    results.forEach(result => {
        if (result.error) throw result.error;
    });

    const allPrices = results
        .flatMap(result => result.data)
        .map(item => item.price);

    return {
        min: Math.min(...allPrices),
        max: Math.max(...allPrices)
    };
}

export async function submitOrder(formData, cartItems, totalAmount) {
   
    try {
      // 1. Create the main order record
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          total_amount: totalAmount,
          order_status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
  
      if (orderError) throw orderError;
  
      // 2. Save contact information
      const { error: contactError } = await supabase
        .from('order_contact_info')
        .insert({
          order_id: orderData.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone
        });
  
      if (contactError) throw contactError;
  
      // 3. Save shipping information
      const { error: shippingError } = await supabase
        .from('order_shipping_info')
        .insert({
          order_id: orderData.id,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipcode: formData.zipCode
        });
  
      if (shippingError) throw shippingError;
  
      // 4. Save payment information
      const { error: paymentError } = await supabase
        .from('order_payment_info')
        .insert({
          order_id: orderData.id,
          payment_method: formData.paymentMethod,
          card_last_four: formData.cardNumber ? formData.cardNumber.slice(-4) : null,
          card_expiry: formData.cardExpiry || null
        });
  
      if (paymentError) throw paymentError;
  
      // 5. Update product quantities
      for (const item of cartItems) {
        const table = item.type === 'smartphones' ? 'smartphones' : 'accessories';
        
        // Get current quantity
        const { data: productData, error: fetchError } = await supabase
          .from(table)
          .select('quantity')
          .eq('id', item.id)
          .single();
  
        if (fetchError) throw fetchError;
  
        // Update quantity
        const { error: updateError } = await supabase
          .from(table)
          .update({ quantity: productData.quantity - 1 })
          .eq('id', item.id);
  
        if (updateError) throw updateError;
      }
  
      return { success: true, orderId: orderData.id };
  
    } catch (error) {
      console.error('Error submitting order:', error);
      throw new Error('Failed to process order. Please try again.');
    }
  }
/**
 * Razorpay Payment API Utility
 */

export const initiatePayment = async (options) => {
    return new Promise(async (resolve, reject) => {
        const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

        if (!keyId || keyId === 'YOUR_RAZORPAY_KEY_ID_HERE') {
            reject(new Error('Razorpay Key ID is not configured. Please add it to your .env file.'));
            return;
        }

        if (typeof window.Razorpay === 'undefined') {
            reject(new Error('Razorpay SDK failed to load. Please check your internet connection.'));
            return;
        }

        try {
            // STEP 1: Securely fetch a Razorpay Order ID from the backend
            // Note: In production, this should hit your hosted Supabase Edge Function
            // const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
            // const { data, error } = await supabase.functions.invoke('create-razorpay-order', { body: { ... }})
            
            // Simulation for local development (as we might not have Supabase CLI running)
            console.log('paymentApi: Requesting order creation for society:', options.societyId);
            
            // Simulating API call latency
            await new Promise(res => setTimeout(res, 800));
            
            // Mocking a successful order response for development
            const mockOrderId = `order_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            console.log('paymentApi: Order generated successfully:', mockOrderId);

            // STEP 2: Configure Razorpay Options using the Order ID
            const rzpOptions = {
                key: keyId,
                amount: options.amount * 100, // paise
                currency: 'INR',
                name: options.societyName || 'Smart Gate Entry',
                description: `Maintenance for ${options.month} ${options.year}`,
                image: '/logo.png', // Replace with society logo
                order_id: mockOrderId, // Must pass the newly created Order ID
                handler: function (response) {
                    // This callback runs on successful payment
                    resolve({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id || mockOrderId,
                        razorpay_signature: response.razorpay_signature || 'mock_signature'
                    });
                },
                prefill: {
                    name: options.userName,
                    email: options.userEmail,
                    contact: options.userMobile
                },
                notes: {
                    payment_id: options.paymentId,
                    resident_id: options.residentId,
                    society_id: options.societyId
                },
                theme: {
                    color: '#2563eb' // Matches primary-600
                },
                modal: {
                    ondismiss: function () {
                        reject(new Error('Payment cancelled by user.'));
                    }
                }
            };

            const rzp = new window.Razorpay(rzpOptions);
            rzp.on('payment.failed', function (response) {
                console.error('Razorpay payment failed:', response.error);
                reject(new Error(response.error.description || 'Payment Failed'));
            });
            rzp.open();
            
        } catch (error) {
            console.error('paymentApi Error:', error);
            reject(new Error(error.message || 'Failed to initialize payment process.'));
        }
    });
};

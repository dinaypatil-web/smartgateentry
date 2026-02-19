/**
 * Razorpay Payment API Utility
 */

export const initiatePayment = (options) => {
    return new Promise((resolve, reject) => {
        const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

        if (!keyId || keyId === 'YOUR_RAZORPAY_KEY_ID_HERE') {
            reject(new Error('Razorpay Key ID is not configured. Please add it to your .env file.'));
            return;
        }

        if (typeof window.Razorpay === 'undefined') {
            reject(new Error('Razorpay SDK failed to load. Please check your internet connection.'));
            return;
        }

        const rzpOptions = {
            key: keyId,
            amount: options.amount * 100, // Razorpay expects amount in paise (e.g., 2000 INR = 200000 paise)
            currency: 'INR',
            name: options.societyName || 'Smart Gate Entry',
            description: `Maintenance for ${options.month} ${options.year}`,
            image: '/logo.png', // Replace with your society logo
            handler: function (response) {
                // This callback runs on successful payment
                resolve({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature
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
                color: '#6366f1' // Matches primary-500
            },
            modal: {
                ondismiss: function () {
                    reject(new Error('Payment cancelled by user.'));
                }
            }
        };

        const rzp = new window.Razorpay(rzpOptions);
        rzp.open();
    });
};

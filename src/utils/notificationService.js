// WhatsApp Notification Service
// This service handles sending WhatsApp notifications to users

/**
 * Send WhatsApp notification using Twilio API or similar service
 * In production, this would integrate with Twilio WhatsApp Business API
 * For now, we'll simulate the notification and log it
 */

const WHATSAPP_API_ENDPOINT = import.meta.env.VITE_WHATSAPP_API_ENDPOINT || '';
const WHATSAPP_API_KEY = import.meta.env.VITE_WHATSAPP_API_KEY || '';

// Notification templates
const NOTIFICATION_TEMPLATES = {
    VISITOR_ENTRY: (visitorName, residentName, purpose) => ({
        title: '🔔 Visitor Entry Alert',
        message: `Hello ${residentName},\n\n${visitorName} has arrived at the gate.\n\nPurpose: ${purpose}\n\nPlease approve or reject the entry request from your SmartGate app.`,
        type: 'visitor_entry'
    }),
    
    VISITOR_APPROVED: (visitorName, residentName) => ({
        title: '✅ Visitor Approved',
        message: `Hello ${visitorName},\n\nYour entry request has been approved by ${residentName}. You may proceed to enter the premises.`,
        type: 'visitor_approved'
    }),
    
    VISITOR_REJECTED: (visitorName, residentName) => ({
        title: '❌ Entry Denied',
        message: `Hello ${visitorName},\n\nYour entry request has been declined by ${residentName}. Please contact the resident for more information.`,
        type: 'visitor_rejected'
    }),
    
    NEW_NOTICE: (title, message, societyName) => ({
        title: '📢 New Notice from Society',
        message: `*${title}*\n\n${message}\n\n- ${societyName} Management`,
        type: 'new_notice'
    }),
    
    COMPLAINT_CREATED: (ticketId, category, residentName) => ({
        title: '🎫 New Support Ticket',
        message: `Hello Admin,\n\nA new support ticket has been raised by ${residentName}.\n\nTicket ID: #${ticketId}\nCategory: ${category}\n\nPlease check the admin dashboard for details.`,
        type: 'complaint_created'
    }),
    
    COMPLAINT_RESOLVED: (ticketId, category, residentName) => ({
        title: '✅ Ticket Resolved',
        message: `Hello ${residentName},\n\nYour support ticket #${ticketId} (${category}) has been resolved.\n\nThank you for your patience!`,
        type: 'complaint_resolved'
    }),
    
    SOS_ALERT: (residentName, flatNumber, societyName) => ({
        title: '🚨 EMERGENCY SOS ALERT',
        message: `*URGENT: SOS Alert Triggered*\n\nResident: ${residentName}\nFlat: ${flatNumber}\nSociety: ${societyName}\n\nImmediate attention required!`,
        type: 'sos_alert'
    }),
    
    PRE_APPROVAL_CREATED: (visitorName, expectedDate, passCode, residentName) => ({
        title: '🎟️ Pre-Approval Pass Created',
        message: `Hello ${residentName},\n\nYou have created a pre-approval pass for ${visitorName}.\n\nPass Code: ${passCode}\nExpected Date: ${expectedDate}\n\nShare this code with your visitor.`,
        type: 'pre_approval_created'
    }),
    
    PAYMENT_REMINDER: (amount, month, residentName) => ({
        title: '💰 Payment Reminder',
        message: `Hello ${residentName},\n\nThis is a reminder for your society maintenance payment.\n\nAmount: ₹${amount}\nMonth: ${month}\n\nPlease make the payment at your earliest convenience.`,
        type: 'payment_reminder'
    }),
    
    AMENITY_BOOKING: (amenityName, date, slot, residentName) => ({
        title: '🏢 Amenity Booking Confirmed',
        message: `Hello ${residentName},\n\nYour booking has been confirmed!\n\nAmenity: ${amenityName}\nDate: ${date}\nSlot: ${slot}\n\nEnjoy your booking!`,
        type: 'amenity_booking'
    })
};

/**
 * Send WhatsApp notification
 * @param {string} phoneNumber - Recipient's phone number (with country code)
 * @param {object} template - Notification template
 * @param {object} additionalData - Any additional data to include
 */
export const sendWhatsAppNotification = async (phoneNumber, template, additionalData = {}) => {
    try {
        // Validate phone number
        if (!phoneNumber || phoneNumber.length < 10) {
            console.error('Invalid phone number:', phoneNumber);
            return { success: false, error: 'Invalid phone number' };
        }

        // Format phone number (ensure it has country code)
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

        // Log the notification (for development/testing)
        console.log('📱 WhatsApp Notification:', {
            to: formattedPhone,
            title: template.title,
            message: template.message,
            type: template.type,
            timestamp: new Date().toISOString(),
            ...additionalData
        });

        // In production, this would make an actual API call to WhatsApp service
        if (WHATSAPP_API_ENDPOINT && WHATSAPP_API_KEY) {
            const response = await fetch(WHATSAPP_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${WHATSAPP_API_KEY}`
                },
                body: JSON.stringify({
                    to: formattedPhone,
                    message: template.message,
                    type: template.type,
                    ...additionalData
                })
            });

            if (!response.ok) {
                throw new Error(`WhatsApp API error: ${response.statusText}`);
            }

            const result = await response.json();
            return { success: true, data: result };
        }

        // Simulate successful notification for development
        return {
            success: true,
            simulated: true,
            message: 'Notification logged (WhatsApp API not configured)'
        };

    } catch (error) {
        console.error('Error sending WhatsApp notification:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send visitor entry notification to resident
 */
export const notifyVisitorEntry = async (visitor, resident) => {
    const template = NOTIFICATION_TEMPLATES.VISITOR_ENTRY(
        visitor.name,
        resident.name,
        visitor.purpose || 'Not specified'
    );
    
    return await sendWhatsAppNotification(resident.mobile, template, {
        visitorId: visitor.id,
        residentId: resident.id
    });
};

/**
 * Send visitor approval notification
 */
export const notifyVisitorApproved = async (visitor, resident) => {
    if (!visitor.contactNumber) return { success: false, error: 'No contact number' };
    
    const template = NOTIFICATION_TEMPLATES.VISITOR_APPROVED(
        visitor.name,
        resident.name
    );
    
    return await sendWhatsAppNotification(visitor.contactNumber, template, {
        visitorId: visitor.id
    });
};

/**
 * Send visitor rejection notification
 */
export const notifyVisitorRejected = async (visitor, resident) => {
    if (!visitor.contactNumber) return { success: false, error: 'No contact number' };
    
    const template = NOTIFICATION_TEMPLATES.VISITOR_REJECTED(
        visitor.name,
        resident.name
    );
    
    return await sendWhatsAppNotification(visitor.contactNumber, template, {
        visitorId: visitor.id
    });
};

/**
 * Send new notice notification to all society members
 */
export const notifyNewNotice = async (notice, society, residents) => {
    const template = NOTIFICATION_TEMPLATES.NEW_NOTICE(
        notice.title,
        notice.message,
        society.name
    );
    
    const results = [];
    for (const resident of residents) {
        if (resident.mobile) {
            const result = await sendWhatsAppNotification(resident.mobile, template, {
                noticeId: notice.id,
                societyId: society.id
            });
            results.push({ residentId: resident.id, ...result });
        }
    }
    
    return results;
};

/**
 * Send complaint created notification to admin
 */
export const notifyComplaintCreated = async (complaint, resident, admins) => {
    const template = NOTIFICATION_TEMPLATES.COMPLAINT_CREATED(
        complaint.id.slice(0, 8),
        complaint.category,
        resident.name
    );
    
    const results = [];
    for (const admin of admins) {
        if (admin.mobile) {
            const result = await sendWhatsAppNotification(admin.mobile, template, {
                complaintId: complaint.id,
                residentId: resident.id
            });
            results.push({ adminId: admin.id, ...result });
        }
    }
    
    return results;
};

/**
 * Send complaint resolved notification to resident
 */
export const notifyComplaintResolved = async (complaint, resident) => {
    const template = NOTIFICATION_TEMPLATES.COMPLAINT_RESOLVED(
        complaint.id.slice(0, 8),
        complaint.category,
        resident.name
    );
    
    return await sendWhatsAppNotification(resident.mobile, template, {
        complaintId: complaint.id
    });
};

/**
 * Send SOS alert to security and admins
 */
export const notifySOS = async (resident, society, securityAndAdmins) => {
    const residentRole = resident.roles.find(r => r.role === 'resident' && r.societyId === society.id);
    const flatNumber = residentRole ? `${residentRole.block}-${residentRole.flatNumber}` : 'Unknown';
    
    const template = NOTIFICATION_TEMPLATES.SOS_ALERT(
        resident.name,
        flatNumber,
        society.name
    );
    
    const results = [];
    for (const user of securityAndAdmins) {
        if (user.mobile) {
            const result = await sendWhatsAppNotification(user.mobile, template, {
                residentId: resident.id,
                societyId: society.id,
                priority: 'urgent'
            });
            results.push({ userId: user.id, ...result });
        }
    }
    
    return results;
};

/**
 * Send pre-approval pass notification
 */
export const notifyPreApprovalCreated = async (preApproval, resident) => {
    const template = NOTIFICATION_TEMPLATES.PRE_APPROVAL_CREATED(
        preApproval.visitorName,
        preApproval.expectedDate,
        preApproval.passCode,
        resident.name
    );
    
    return await sendWhatsAppNotification(resident.mobile, template, {
        preApprovalId: preApproval.id
    });
};

/**
 * Send payment reminder
 */
export const notifyPaymentReminder = async (payment, resident) => {
    const template = NOTIFICATION_TEMPLATES.PAYMENT_REMINDER(
        payment.amount,
        payment.month,
        resident.name
    );
    
    return await sendWhatsAppNotification(resident.mobile, template, {
        paymentId: payment.id
    });
};

/**
 * Send amenity booking confirmation
 */
export const notifyAmenityBooking = async (booking, amenity, resident) => {
    const template = NOTIFICATION_TEMPLATES.AMENITY_BOOKING(
        amenity.name,
        booking.date,
        booking.slot,
        resident.name
    );
    
    return await sendWhatsAppNotification(resident.mobile, template, {
        bookingId: booking.id,
        amenityId: amenity.id
    });
};

export default {
    sendWhatsAppNotification,
    notifyVisitorEntry,
    notifyVisitorApproved,
    notifyVisitorRejected,
    notifyNewNotice,
    notifyComplaintCreated,
    notifyComplaintResolved,
    notifySOS,
    notifyPreApprovalCreated,
    notifyPaymentReminder,
    notifyAmenityBooking,
    NOTIFICATION_TEMPLATES
};

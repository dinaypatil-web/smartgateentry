# WhatsApp Notification Setup Guide

This document explains how to set up WhatsApp notifications for the SmartGate Entry application.

## Overview

The application sends WhatsApp notifications to users for various events:
- 🔔 Visitor entry requests
- ✅ Visitor approval/rejection
- 📢 New notices from society
- 🎫 Helpdesk ticket updates
- 🚨 SOS alerts
- 🎟️ Pre-approval pass creation
- 💰 Payment reminders
- 🏢 Amenity bookings

## Notification Service

The notification service is implemented in `src/utils/notificationService.js` and provides:
- Template-based notifications
- Automatic formatting
- Error handling
- Development logging

## Integration Options

### Option 1: Twilio WhatsApp Business API (Recommended)

1. **Create Twilio Account**
   - Sign up at https://www.twilio.com
   - Verify your account

2. **Set up WhatsApp Business**
   - Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message
   - Follow the setup wizard
   - Get your WhatsApp-enabled phone number

3. **Get API Credentials**
   - Account SID
   - Auth Token
   - WhatsApp phone number

4. **Configure Environment Variables**
   ```env
   VITE_WHATSAPP_API_ENDPOINT=https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json
   VITE_WHATSAPP_API_KEY=YOUR_AUTH_TOKEN
   ```

5. **Update notificationService.js**
   ```javascript
   const response = await fetch(WHATSAPP_API_ENDPOINT, {
       method: 'POST',
       headers: {
           'Content-Type': 'application/x-www-form-urlencoded',
           'Authorization': `Basic ${btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`)}`
       },
       body: new URLSearchParams({
           From: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
           To: `whatsapp:${formattedPhone}`,
           Body: template.message
       })
   });
   ```

### Option 2: WhatsApp Business API (Direct)

1. **Apply for WhatsApp Business API**
   - Visit https://business.whatsapp.com
   - Apply for API access
   - Complete verification process

2. **Set up Webhook**
   - Configure webhook URL for receiving messages
   - Set up message templates

3. **Get API Credentials**
   - Phone Number ID
   - WhatsApp Business Account ID
   - Access Token

4. **Configure Environment Variables**
   ```env
   VITE_WHATSAPP_API_ENDPOINT=https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages
   VITE_WHATSAPP_API_KEY=YOUR_ACCESS_TOKEN
   ```

### Option 3: Third-Party Services

#### MSG91
1. Sign up at https://msg91.com
2. Get API key
3. Configure:
   ```env
   VITE_WHATSAPP_API_ENDPOINT=https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/
   VITE_WHATSAPP_API_KEY=YOUR_MSG91_API_KEY
   ```

#### Gupshup
1. Sign up at https://www.gupshup.io
2. Get API key
3. Configure:
   ```env
   VITE_WHATSAPP_API_ENDPOINT=https://api.gupshup.io/sm/api/v1/msg
   VITE_WHATSAPP_API_KEY=YOUR_GUPSHUP_API_KEY
   ```

## Environment Variables

Add these to your `.env` file:

```env
# WhatsApp Notification Configuration
VITE_WHATSAPP_API_ENDPOINT=your_api_endpoint_here
VITE_WHATSAPP_API_KEY=your_api_key_here
```

## Notification Templates

The service includes pre-defined templates for:

### 1. Visitor Entry
```
Hello [Resident Name],

[Visitor Name] has arrived at the gate.

Purpose: [Purpose]

Please approve or reject the entry request from your SmartGate app.
```

### 2. New Notice
```
📢 New Notice from Society

*[Notice Title]*

[Notice Message]

- [Society Name] Management
```

### 3. Helpdesk Ticket
```
Hello Admin,

A new support ticket has been raised by [Resident Name].

Ticket ID: #[Ticket ID]
Category: [Category]

Please check the admin dashboard for details.
```

### 4. SOS Alert
```
🚨 EMERGENCY SOS ALERT

*URGENT: SOS Alert Triggered*

Resident: [Name]
Flat: [Flat Number]
Society: [Society Name]

Immediate attention required!
```

## Testing

### Development Mode
When WhatsApp API is not configured, notifications are logged to console:

```javascript
console.log('📱 WhatsApp Notification:', {
    to: '+919876543210',
    title: 'Visitor Entry Alert',
    message: 'Hello John, Jane Doe has arrived...',
    type: 'visitor_entry',
    timestamp: '2024-01-15T10:30:00Z'
});
```

### Test Notification
```javascript
import { sendWhatsAppNotification, NOTIFICATION_TEMPLATES } from './utils/notificationService';

// Test visitor entry notification
const template = NOTIFICATION_TEMPLATES.VISITOR_ENTRY('John Doe', 'Jane Smith', 'Personal Visit');
await sendWhatsAppNotification('+919876543210', template);
```

## Usage in Application

### Automatic Notifications
Notifications are automatically sent when:

1. **Visitor Entry** - When security creates a visitor entry
   ```javascript
   // In DataContext.addVisitor()
   await notificationService.notifyVisitorEntry(visitor, resident);
   ```

2. **Visitor Status Update** - When resident approves/rejects
   ```javascript
   // In DataContext.updateVisitor()
   if (updates.status === 'approved') {
       await notificationService.notifyVisitorApproved(visitor, resident);
   }
   ```

3. **New Notice** - When admin posts a notice
   ```javascript
   // In DataContext.addNotice()
   await notificationService.notifyNewNotice(notice, society, residents);
   ```

4. **Helpdesk Ticket** - When resident raises a complaint
   ```javascript
   // In ResidentDashboard.ComplaintsPage
   await notificationService.notifyComplaintCreated(complaint, resident, admins);
   ```

### Manual Notifications
```javascript
import notificationService from './utils/notificationService';

// Send custom notification
await notificationService.sendWhatsAppNotification(
    '+919876543210',
    {
        title: 'Custom Alert',
        message: 'Your custom message here',
        type: 'custom'
    }
);
```

## Rate Limiting

Be aware of rate limits:
- **Twilio**: 1 message per second per phone number
- **WhatsApp Business API**: Varies by tier
- **Third-party services**: Check provider documentation

## Best Practices

1. **Phone Number Validation**
   - Always validate phone numbers before sending
   - Include country code (+91 for India)

2. **Error Handling**
   - Don't fail operations if notification fails
   - Log errors for monitoring

3. **User Preferences**
   - Consider adding notification preferences
   - Allow users to opt-out

4. **Message Templates**
   - Keep messages concise and clear
   - Include relevant information only
   - Use emojis sparingly

5. **Testing**
   - Test with real phone numbers in development
   - Use sandbox numbers for testing

## Troubleshooting

### Notifications Not Sending
1. Check environment variables are set
2. Verify API credentials
3. Check console logs for errors
4. Verify phone number format

### Invalid Phone Number
- Ensure country code is included
- Format: +919876543210 (no spaces or dashes)

### API Errors
- Check API key validity
- Verify endpoint URL
- Check rate limits
- Review API documentation

## Cost Considerations

- **Twilio**: ~$0.005 per message
- **WhatsApp Business API**: Varies by region and volume
- **Third-party services**: Check pricing plans

## Security

1. **Never expose API keys in frontend code**
2. **Use environment variables**
3. **Implement server-side API calls for production**
4. **Validate all inputs**
5. **Monitor for abuse**

## Production Deployment

For production, consider:
1. Moving notification logic to backend
2. Implementing queue system for bulk notifications
3. Adding retry mechanism
4. Setting up monitoring and alerts
5. Implementing user notification preferences

## Support

For issues or questions:
- Check Twilio documentation: https://www.twilio.com/docs/whatsapp
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
- Open an issue in the repository

---

**Note**: WhatsApp notifications require proper business verification and approval. Ensure compliance with WhatsApp's Business Policy and Terms of Service.

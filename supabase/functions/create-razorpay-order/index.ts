import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

// Initialize Razorpay SDK (Using standard fetch for Deno/Edge compatibility)
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') || ''
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') || ''

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, receipt, notes, societyId } = await req.json()

    // Basic validation
    if (!amount || !societyId) {
      throw new Error('Amount and societyId are required')
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured in Edge Function')
    }

    // 1. Fetch the society's Razorpay Account ID from the database
    // For local mocking/fallback if DB isn't fully wired yet:
    // In a production app, we would query the `societies` table:
    // const { data: society } = await supabase.from('societies').select('razorpayAccountId').eq('id', societyId).single()
    // const razorpayAccountId = society?.razorpayAccountId
    
    // For now, we simulate a linked account ID if one isn't passed in notes
    const razorpayAccountId = notes?.merchant_account_id || 'acc_MockLinkedAccount123'

    // 2. Prepare the Razorpay Order payload
    const orderPayload = {
      amount: amount * 100, // Convert INR to paise
      currency: 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        ...notes,
        societyId
      },
      // Route the payment to the specific society's linked account
      transfers: [
        {
          account: razorpayAccountId,
          amount: amount * 100,
          currency: 'INR',
          notes: {
            transfer_reason: 'Maintenance Payment'
          },
          linked_account_notes: [
            'transfer_reason'
          ],
          on_hold: 0 // Settle immediately based on Razorpay schedule
        }
      ]
    }

    // 3. Create the order via Razorpay API
    const authHeader = `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`
    
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(orderPayload)
    })

    const orderData = await response.json()

    if (!response.ok) {
      console.error('Razorpay API Error:', orderData)
      throw new Error(orderData.error?.description || 'Failed to create Razorpay order')
    }

    // 4. Return the complete order details to the frontend
    return new Response(
      JSON.stringify(orderData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Edge Function Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Declare Deno as a global variable to satisfy TypeScript in non-Deno environments
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getAccessToken(clientId: string, secretKey: string) {
  const PAYPAL_API = 'https://api-m.sandbox.paypal.com' // Switch to https://api-m.paypal.com for live
  const auth = btoa(`${clientId}:${secretKey}`)
  
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch PayPal access token: ${error}`);
  }
  
  const data = await response.json()
  return data.access_token
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')
    const PAYPAL_SECRET_KEY = Deno.env.get('PAYPAL_SECRET_KEY')
    const PAYPAL_API = 'https://api-m.sandbox.paypal.com'

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) {
      throw new Error("PayPal configuration missing in project secrets.")
    }

    const { userId, amount } = await req.json()
    
    if (!userId || !amount) {
      throw new Error("Missing required parameters: userId or amount")
    }

    const accessToken = await getAccessToken(PAYPAL_CLIENT_ID, PAYPAL_SECRET_KEY)

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: 'USD', value: amount.toString() },
          custom_id: userId,
          description: "ViralLink AI Pro Plan"
        }],
        application_context: {
          brand_name: "ViralLink AI",
          user_action: "PAY_NOW",
          landing_page: "GUEST_CHECKOUT", // Forces card entry for non-logged in users
          shipping_preference: "NO_SHIPPING", // Removes address requirement for digital goods
          return_url: "https://virallink.ai/", 
          cancel_url: "https://virallink.ai/"
        }
      })
    })

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PayPal Order Creation failed: ${error}`);
    }

    const order = await response.json()
    const approvalLink = order.links.find((link: any) => link.rel === 'approve')
    
    if (!approvalLink) {
      throw new Error("No approval link returned from PayPal");
    }

    return new Response(JSON.stringify({ approvalUrl: approvalLink.href }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Edge Function Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

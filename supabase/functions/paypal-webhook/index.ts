import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Declare Deno as a global variable to satisfy TypeScript in non-Deno environments
declare const Deno: any;

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    const eventType = body.event_type
    
    console.log(`Received Webhook Event: ${eventType}`)
    
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = body.resource
      const userId = resource.custom_id // We passed userId here in create-paypal-order

      if (userId) {
        const { error } = await supabase
          .from('profiles')
          .update({ subscription_tier: 'premium' })
          .eq('id', userId)

        if (error) {
          console.error(`DB Update Error for User ${userId}:`, error.message)
          throw error
        }
        
        console.log(`Successfully upgraded user ${userId} to premium via Webhook.`)
      } else {
        console.warn('Capture completed but no userId (custom_id) was found in the resource.')
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Webhook processing failed:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 400 })
  }
})

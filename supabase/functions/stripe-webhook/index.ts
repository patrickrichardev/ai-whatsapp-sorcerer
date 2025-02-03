import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response('No signature', { status: 400 })
    }

    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      return new Response('No webhook secret', { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    console.log('Processing webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const customerId = session.customer
        const subscriptionId = session.subscription

        if (typeof customerId !== 'string' || typeof subscriptionId !== 'string') {
          throw new Error('Invalid customer or subscription ID')
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = session.client_reference_id

        if (!userId) {
          throw new Error('No user ID found in session')
        }

        // Update subscription in database
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: subscription.status,
            updated_at: new Date().toISOString(),
          })

        if (error) {
          throw error
        }

        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const subscriptionId = subscription.id
        const status = subscription.status

        // Update subscription status in database
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .update({ 
            status: status,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId)

        if (error) {
          throw error
        }

        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('Error processing webhook:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
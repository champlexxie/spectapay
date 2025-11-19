import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    console.log('Webhook payload:', payload)

    // Check if this is a user creation event
    if (payload.type === 'INSERT' && payload.table === 'users' && payload.schema === 'auth') {
      const newUser = payload.record
      console.log('New user created:', newUser.id, newUser.email)

      // Create profile for the new user
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.raw_user_meta_data?.full_name || newUser.email.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (profileError) {
        console.error('Error creating profile:', profileError)
        throw profileError
      }

      console.log('Profile created successfully:', profile)

      // Create wallets for all supported currencies
      const currencies = ['USD', 'EUR', 'GBP', 'BTC', 'ETH']
      const walletsToInsert = currencies.map(currency => ({
        user_id: newUser.id,
        currency: currency,
        balance: 0.00,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { data: wallets, error: walletsError } = await supabaseAdmin
        .from('wallets')
        .insert(walletsToInsert)
        .select()

      if (walletsError) {
        console.error('Error creating wallets:', walletsError)
        throw walletsError
      }

      console.log('Wallets created successfully:', wallets)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Profile and wallets created successfully',
          profile: profile,
          wallets: wallets
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Return success for other webhook events (not user creation)
    return new Response(
      JSON.stringify({ success: true, message: 'Webhook received but no action needed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in auto-create-profile function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
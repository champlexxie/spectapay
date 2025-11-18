import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Starting deletion process for user: ${userId}`)

    // Delete in the correct order to handle foreign key constraints
    const deletionSteps = [
      { name: 'internal_transfers', query: () => supabaseClient.from('internal_transfers').delete().or(`sender_id.eq.${userId},recipient_id.eq.${userId}`) },
      { name: 'transactions', query: () => supabaseClient.from('transactions').delete().eq('user_id', userId) },
      { name: 'watchlist', query: () => supabaseClient.from('watchlist').delete().eq('user_id', userId) },
      { name: 'deposit_addresses', query: () => supabaseClient.from('deposit_addresses').delete().eq('user_id', userId) },
      { name: 'portfolios', query: () => supabaseClient.from('portfolios').delete().eq('user_id', userId) },
      { name: 'transfers', query: () => supabaseClient.from('transfers').delete().eq('user_id', userId) },
      { name: 'accounts', query: () => supabaseClient.from('accounts').delete().eq('user_id', userId) },
      { name: 'wallets', query: () => supabaseClient.from('wallets').delete().eq('user_id', userId) },
      { name: 'profiles', query: () => supabaseClient.from('profiles').delete().eq('id', userId) },
    ]

    // Execute deletions and collect any errors
    const errors = []
    for (const step of deletionSteps) {
      console.log(`Deleting from ${step.name}...`)
      const { error, count } = await step.query()
      
      if (error) {
        console.error(`Error deleting from ${step.name}:`, error)
        errors.push({ table: step.name, error: error.message, code: error.code })
      } else {
        console.log(`Successfully deleted from ${step.name}`)
      }
    }

    // If there were any critical errors, return them
    if (errors.length > 0) {
      console.error('Deletion errors:', errors)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to delete some user data', 
          details: errors,
          message: `Errors occurred while deleting from: ${errors.map(e => e.table).join(', ')}`
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Finally, delete from auth.users
    console.log('Deleting auth user...')
    const { error: authError } = await supabaseClient.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to delete user authentication', 
          details: authError.message,
          code: authError.code 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully deleted user: ${userId}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User and all related data deleted successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
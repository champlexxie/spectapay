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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { recipientEmail, amount } = await req.json()

    // Validate input
    if (!recipientEmail || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid input. Please provide recipient email and amount.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find recipient by email
    const { data: recipient, error: recipientError } = await supabaseClient
      .from('profiles')
      .select('id, email')
      .eq('email', recipientEmail)
      .single()

    if (recipientError || !recipient) {
      return new Response(
        JSON.stringify({ error: 'Recipient not found. Please check the email address.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if trying to send to self
    if (recipient.id === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot transfer to yourself.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get sender's wallet
    const { data: senderWallet, error: senderWalletError } = await supabaseClient
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .eq('currency', 'USD')
      .single()

    if (senderWalletError || !senderWallet) {
      return new Response(
        JSON.stringify({ error: 'Wallet not found. Please create a wallet first.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if sender has sufficient balance
    if (parseFloat(senderWallet.balance) < amount) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient balance.',
          currentBalance: parseFloat(senderWallet.balance)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Deduct from sender's wallet
    const newSenderBalance = parseFloat(senderWallet.balance) - amount
    const { error: updateSenderError } = await supabaseClient
      .from('wallets')
      .update({ 
        balance: newSenderBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('currency', 'USD')

    if (updateSenderError) {
      throw new Error('Failed to update sender wallet')
    }

    // Get or create recipient's wallet
    const { data: recipientWallet } = await supabaseClient
      .from('wallets')
      .select('balance')
      .eq('user_id', recipient.id)
      .eq('currency', 'USD')
      .single()

    if (recipientWallet) {
      // Update existing wallet
      const newRecipientBalance = parseFloat(recipientWallet.balance) + amount
      const { error: updateRecipientError } = await supabaseClient
        .from('wallets')
        .update({ 
          balance: newRecipientBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', recipient.id)
        .eq('currency', 'USD')

      if (updateRecipientError) {
        // Rollback sender's wallet
        await supabaseClient
          .from('wallets')
          .update({ balance: senderWallet.balance })
          .eq('user_id', user.id)
          .eq('currency', 'USD')
        
        throw new Error('Failed to update recipient wallet')
      }
    } else {
      // Create new wallet for recipient
      const { error: createRecipientError } = await supabaseClient
        .from('wallets')
        .insert({
          user_id: recipient.id,
          balance: amount,
          currency: 'USD'
        })

      if (createRecipientError) {
        // Rollback sender's wallet
        await supabaseClient
          .from('wallets')
          .update({ balance: senderWallet.balance })
          .eq('user_id', user.id)
          .eq('currency', 'USD')
        
        throw new Error('Failed to create recipient wallet')
      }
    }

    // Get sender's email
    const { data: senderProfile } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    // Record the transfer
    const { error: transferError } = await supabaseClient
      .from('transfers')
      .insert({
        sender_id: user.id,
        recipient_id: recipient.id,
        sender_email: senderProfile?.email || user.email || '',
        recipient_email: recipientEmail,
        amount: amount,
        currency: 'USD',
        status: 'completed'
      })

    if (transferError) {
      console.error('Failed to record transfer:', transferError)
      // Don't rollback the actual transfer, just log the error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Transfer successful!',
        newBalance: newSenderBalance,
        transfer: {
          recipient: recipientEmail,
          amount: amount,
          currency: 'USD'
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Transfer error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Transfer failed. Please try again.' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
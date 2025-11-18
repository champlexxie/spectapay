import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { recipientEmail, amount, description } = await req.json();

    if (!recipientEmail || !amount || amount <= 0) {
      throw new Error('Invalid transfer details');
    }

    const fromUserId = user.id;

    // Get recipient user by email
    const { data: recipientData, error: recipientError } = await supabaseClient.auth.admin.listUsers();
    
    if (recipientError) {
      throw new Error('Failed to find recipient');
    }

    const recipient = recipientData.users.find(u => u.email === recipientEmail);
    
    if (!recipient) {
      throw new Error('Recipient not found');
    }

    const toUserId = recipient.id;

    if (fromUserId === toUserId) {
      throw new Error('Cannot transfer to yourself');
    }

    // Get sender's account
    const { data: senderAccount, error: senderError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', fromUserId)
      .single();

    if (senderError || !senderAccount) {
      throw new Error('Sender account not found');
    }

    if (parseFloat(senderAccount.balance) < amount) {
      throw new Error('Insufficient balance');
    }

    // Get or create recipient's account
    let { data: recipientAccount, error: recipientFetchError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', toUserId)
      .single();

    if (recipientFetchError || !recipientAccount) {
      // Create recipient account if it doesn't exist
      const { data: newAccount, error: createError } = await supabaseClient
        .from('accounts')
        .insert({ user_id: toUserId, balance: 0 })
        .select()
        .single();

      if (createError) {
        throw new Error('Failed to create recipient account');
      }
      recipientAccount = newAccount;
    }

    // Update sender's balance (subtract amount)
    const newSenderBalance = parseFloat(senderAccount.balance) - amount;
    const { error: updateSenderError } = await supabaseClient
      .from('accounts')
      .update({ 
        balance: newSenderBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', fromUserId);

    if (updateSenderError) {
      throw new Error('Failed to update sender balance');
    }

    // Update recipient's balance (add amount)
    const newRecipientBalance = parseFloat(recipientAccount.balance) + amount;
    const { error: updateRecipientError } = await supabaseClient
      .from('accounts')
      .update({ 
        balance: newRecipientBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', toUserId);

    if (updateRecipientError) {
      // Rollback sender's balance
      await supabaseClient
        .from('accounts')
        .update({ balance: senderAccount.balance })
        .eq('user_id', fromUserId);
      throw new Error('Failed to update recipient balance');
    }

    // Record transaction for sender (outgoing)
    const { error: senderTxError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: fromUserId,
        type: 'transfer_out',
        amount: -amount,
        asset: 'USD',
        status: 'completed',
        from_user: fromUserId,
        to_user: toUserId,
        description: description || `Transfer to ${recipientEmail}`
      });

    if (senderTxError) {
      console.error('Failed to record sender transaction:', senderTxError);
    }

    // Record transaction for recipient (incoming)
    const { error: recipientTxError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: toUserId,
        type: 'transfer_in',
        amount: amount,
        asset: 'USD',
        status: 'completed',
        from_user: fromUserId,
        to_user: toUserId,
        description: description || `Transfer from ${user.email}`
      });

    if (recipientTxError) {
      console.error('Failed to record recipient transaction:', recipientTxError);
    }

    // Also record in internal_transfers table for backward compatibility
    const { error: internalTransferError } = await supabaseClient
      .from('internal_transfers')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount: amount,
        status: 'completed',
        description: description || `Transfer to ${recipientEmail}`
      });

    if (internalTransferError) {
      console.error('Failed to record internal transfer:', internalTransferError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Transfer completed successfully',
        newBalance: newSenderBalance,
        transaction: {
          from: user.email,
          to: recipientEmail,
          amount: amount,
          timestamp: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
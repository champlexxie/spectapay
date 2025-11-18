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

    const { recipientEmail, amount, asset = 'USDT', description } = await req.json();

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

    // Get sender's wallet for the specific asset
    const { data: senderWallet, error: senderWalletError } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', fromUserId)
      .eq('coin_symbol', asset)
      .single();

    if (senderWalletError || !senderWallet) {
      throw new Error(`You don't have any ${asset} in your wallet`);
    }

    if (parseFloat(senderWallet.amount) < amount) {
      throw new Error(`Insufficient ${asset} balance`);
    }

    // Get or create recipient's wallet for the asset
    let { data: recipientWallet, error: recipientWalletError } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', toUserId)
      .eq('coin_symbol', asset)
      .single();

    if (recipientWalletError || !recipientWallet) {
      // Create recipient wallet if it doesn't exist
      const { data: newWallet, error: createWalletError } = await supabaseClient
        .from('wallets')
        .insert({ 
          user_id: toUserId, 
          coin_symbol: asset,
          coin_name: asset === 'USDT' ? 'Tether' : asset,
          amount: 0 
        })
        .select()
        .single();

      if (createWalletError) {
        throw new Error('Failed to create recipient wallet');
      }
      recipientWallet = newWallet;
    }

    // Update sender's wallet (subtract amount)
    const newSenderAmount = parseFloat(senderWallet.amount) - amount;
    const { error: updateSenderError } = await supabaseClient
      .from('wallets')
      .update({ 
        amount: newSenderAmount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', fromUserId)
      .eq('coin_symbol', asset);

    if (updateSenderError) {
      throw new Error('Failed to update sender wallet');
    }

    // Update recipient's wallet (add amount)
    const newRecipientAmount = parseFloat(recipientWallet.amount) + amount;
    const { error: updateRecipientError } = await supabaseClient
      .from('wallets')
      .update({ 
        amount: newRecipientAmount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', toUserId)
      .eq('coin_symbol', asset);

    if (updateRecipientError) {
      // Rollback sender's wallet
      await supabaseClient
        .from('wallets')
        .update({ amount: senderWallet.amount })
        .eq('user_id', fromUserId)
        .eq('coin_symbol', asset);
      throw new Error('Failed to update recipient wallet');
    }

    // Record transaction for sender (outgoing)
    const { error: senderTxError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: fromUserId,
        type: 'transfer_out',
        amount: -amount,
        asset: asset,
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
        asset: asset,
        status: 'completed',
        from_user: fromUserId,
        to_user: toUserId,
        description: description || `Transfer from ${user.email}`
      });

    if (recipientTxError) {
      console.error('Failed to record recipient transaction:', recipientTxError);
    }

    // Record in internal_transfers table
    const { error: internalTransferError } = await supabaseClient
      .from('internal_transfers')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount: amount,
        status: 'completed',
        description: description || `${amount} ${asset} to ${recipientEmail}`
      });

    if (internalTransferError) {
      console.error('Failed to record internal transfer:', internalTransferError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Transfer of ${amount} ${asset} completed successfully`,
        newBalance: newSenderAmount,
        transaction: {
          from: user.email,
          to: recipientEmail,
          amount: amount,
          asset: asset,
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
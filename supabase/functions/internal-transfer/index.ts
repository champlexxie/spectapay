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

    const { recipientEmail, recipientUserId, coinSymbol, amount, description } = await req.json();

    if ((!recipientEmail && !recipientUserId) || !coinSymbol || !amount || amount <= 0) {
      throw new Error('Invalid transfer details');
    }

    const fromUserId = user.id;
    let toUserId: string;

    // Find recipient by email or userId
    if (recipientUserId) {
      toUserId = recipientUserId;
      
      // Verify user exists
      const { data: recipientUser, error: recipientError } = await supabaseClient.auth.admin.getUserById(toUserId);
      if (recipientError || !recipientUser) {
        throw new Error('Recipient not found');
      }
    } else {
      // Get recipient user by email
      const { data: recipientData, error: recipientError } = await supabaseClient.auth.admin.listUsers();
      
      if (recipientError) {
        throw new Error('Failed to find recipient');
      }

      const recipient = recipientData.users.find(u => u.email === recipientEmail);
      
      if (!recipient) {
        throw new Error('Recipient not found');
      }

      toUserId = recipient.id;
    }

    if (fromUserId === toUserId) {
      throw new Error('Cannot transfer to yourself');
    }

    // Get sender's wallet for the specific coin
    const { data: senderWallet, error: senderWalletError } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', fromUserId)
      .eq('currency', coinSymbol)
      .single();

    if (senderWalletError || !senderWallet) {
      throw new Error(`You don't have any ${coinSymbol} in your wallet`);
    }

    if (parseFloat(senderWallet.balance) < amount) {
      throw new Error(`Insufficient ${coinSymbol} balance`);
    }

    // Get or create recipient's wallet for the coin
    let { data: recipientWallet, error: recipientWalletError } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', toUserId)
      .eq('currency', coinSymbol)
      .single();

    if (recipientWalletError || !recipientWallet) {
      // Create recipient wallet if it doesn't exist
      const { data: newWallet, error: createWalletError } = await supabaseClient
        .from('wallets')
        .insert({ 
          user_id: toUserId, 
          currency: coinSymbol,
          balance: 0
        })
        .select()
        .single();

      if (createWalletError) {
        throw new Error('Failed to create recipient wallet');
      }
      recipientWallet = newWallet;
    }

    // Update sender's wallet (subtract amount)
    const newSenderBalance = parseFloat(senderWallet.balance) - amount;
    
    const { error: updateSenderError } = await supabaseClient
      .from('wallets')
      .update({ 
        balance: newSenderBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', fromUserId)
      .eq('currency', coinSymbol);

    if (updateSenderError) {
      throw new Error('Failed to update sender wallet');
    }

    // Update recipient's wallet (add amount)
    const newRecipientBalance = parseFloat(recipientWallet.balance) + amount;
    
    const { error: updateRecipientError } = await supabaseClient
      .from('wallets')
      .update({ 
        balance: newRecipientBalance,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', toUserId)
      .eq('currency', coinSymbol);

    if (updateRecipientError) {
      // Rollback sender's wallet
      await supabaseClient
        .from('wallets')
        .update({ 
          balance: senderWallet.balance
        })
        .eq('user_id', fromUserId)
        .eq('currency', coinSymbol);
      throw new Error('Failed to update recipient wallet');
    }

    // Get recipient email for transaction records
    const { data: recipientUser } = await supabaseClient.auth.admin.getUserById(toUserId);
    const recipientEmailForRecord = recipientUser?.user?.email || recipientEmail || toUserId;

    // Record transaction for sender (outgoing)
    const { error: senderTxError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: fromUserId,
        type: 'transfer_out',
        amount: -amount,
        asset: coinSymbol,
        status: 'completed',
        from_user: fromUserId,
        to_user: toUserId,
        description: description || `Transfer to ${recipientEmailForRecord}`
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
        asset: coinSymbol,
        status: 'completed',
        from_user: fromUserId,
        to_user: toUserId,
        description: description || `Transfer from ${user.email}`
      });

    if (recipientTxError) {
      console.error('Failed to record recipient transaction:', recipientTxError);
    }

    // Get sender email
    const senderEmail = user.email || fromUserId;

    // Record in internal_transfers table
    const { error: internalTransferError } = await supabaseClient
      .from('internal_transfers')
      .insert({
        sender_id: fromUserId,
        recipient_id: toUserId,
        sender_email: senderEmail,
        recipient_email: recipientEmailForRecord,
        coin_symbol: coinSymbol,
        coin_name: coinSymbol,
        amount: amount,
        status: 'completed'
      });

    if (internalTransferError) {
      console.error('Failed to record internal transfer:', internalTransferError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Transfer of ${amount} ${coinSymbol} completed successfully`,
        newBalance: newSenderBalance,
        transaction: {
          from: senderEmail,
          to: recipientEmailForRecord,
          amount: amount,
          asset: coinSymbol,
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
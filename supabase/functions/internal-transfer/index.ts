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

    // Get sender's portfolio for the specific coin
    const { data: senderPortfolio, error: senderPortfolioError } = await supabaseClient
      .from('portfolios')
      .select('*')
      .eq('user_id', fromUserId)
      .eq('coin_symbol', coinSymbol)
      .single();

    if (senderPortfolioError || !senderPortfolio) {
      throw new Error(`You don't have any ${coinSymbol} in your portfolio`);
    }

    if (parseFloat(senderPortfolio.amount) < amount) {
      throw new Error(`Insufficient ${coinSymbol} balance`);
    }

    // Get or create recipient's portfolio for the coin
    let { data: recipientPortfolio, error: recipientPortfolioError } = await supabaseClient
      .from('portfolios')
      .select('*')
      .eq('user_id', toUserId)
      .eq('coin_symbol', coinSymbol)
      .single();

    if (recipientPortfolioError || !recipientPortfolio) {
      // Create recipient portfolio if it doesn't exist
      const { data: newPortfolio, error: createPortfolioError } = await supabaseClient
        .from('portfolios')
        .insert({ 
          user_id: toUserId, 
          coin_symbol: coinSymbol,
          coin_name: senderPortfolio.coin_name,
          amount: 0,
          current_price: senderPortfolio.current_price || 0,
          total_value: 0
        })
        .select()
        .single();

      if (createPortfolioError) {
        throw new Error('Failed to create recipient portfolio');
      }
      recipientPortfolio = newPortfolio;
    }

    // Update sender's portfolio (subtract amount)
    const newSenderAmount = parseFloat(senderPortfolio.amount) - amount;
    const newSenderValue = newSenderAmount * (parseFloat(senderPortfolio.current_price) || 0);
    
    const { error: updateSenderError } = await supabaseClient
      .from('portfolios')
      .update({ 
        amount: newSenderAmount,
        total_value: newSenderValue,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', fromUserId)
      .eq('coin_symbol', coinSymbol);

    if (updateSenderError) {
      throw new Error('Failed to update sender portfolio');
    }

    // Update recipient's portfolio (add amount)
    const newRecipientAmount = parseFloat(recipientPortfolio.amount) + amount;
    const newRecipientValue = newRecipientAmount * (parseFloat(recipientPortfolio.current_price) || 0);
    
    const { error: updateRecipientError } = await supabaseClient
      .from('portfolios')
      .update({ 
        amount: newRecipientAmount,
        total_value: newRecipientValue,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', toUserId)
      .eq('coin_symbol', coinSymbol);

    if (updateRecipientError) {
      // Rollback sender's portfolio
      await supabaseClient
        .from('portfolios')
        .update({ 
          amount: senderPortfolio.amount,
          total_value: senderPortfolio.total_value
        })
        .eq('user_id', fromUserId)
        .eq('coin_symbol', coinSymbol);
      throw new Error('Failed to update recipient portfolio');
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

    // Record in internal_transfers table
    const { error: internalTransferError } = await supabaseClient
      .from('internal_transfers')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount: amount,
        status: 'completed',
        description: description || `${amount} ${coinSymbol} to ${recipientEmailForRecord}`
      });

    if (internalTransferError) {
      console.error('Failed to record internal transfer:', internalTransferError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Transfer of ${amount} ${coinSymbol} completed successfully`,
        newBalance: newSenderAmount,
        transaction: {
          from: user.email,
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
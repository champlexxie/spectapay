import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email } = await req.json();

    // Get user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) throw userError;

    const user = users.find(u => u.email === email);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create transaction records
    const now = new Date();
    const transactions = [
      {
        user_id: user.id,
        type: 'deposit',
        asset: 'USDT',
        amount: 1000000,
        status: 'completed',
        description: 'Initial Deposit',
        created_at: new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago
      },
      {
        user_id: user.id,
        type: 'deposit',
        asset: 'ETH',
        amount: 850,
        status: 'completed',
        description: 'Initial Deposit',
        created_at: new Date(now.getTime() - 7200000).toISOString(), // 2 hours ago
      },
      {
        user_id: user.id,
        type: 'deposit',
        asset: 'BTC',
        amount: 100,
        status: 'completed',
        description: 'Initial Deposit',
        created_at: new Date(now.getTime() - 10800000).toISOString(), // 3 hours ago
      },
    ];

    const { data, error } = await supabase
      .from('transactions')
      .insert(transactions)
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, transactions: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
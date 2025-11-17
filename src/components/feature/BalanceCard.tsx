
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../contexts/AuthContext';

export default function BalanceCard() {
  const { user } = useAuthContext();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user]);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .eq('currency', 'USD')
        .single();

      if (error) {
        // If wallet doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: newWallet, error: insertError } = await supabase
            .from('wallets')
            .insert([{ user_id: user?.id, balance: 0, currency: 'USD' }])
            .select()
            .single();

          if (!insertError && newWallet) {
            setBalance(Number(newWallet.balance));
          }
        } else {
          console.error('Error fetching balance:', error);
        }
      } else if (data) {
        setBalance(Number(data.balance));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium opacity-90">Total Balance</h3>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <i className={`ri-eye-${showBalance ? 'line' : 'off-line'} text-lg`}></i>
        </button>
      </div>
      
      <div className="mb-6">
        {loading ? (
          <div className="h-10 w-32 bg-white/20 rounded animate-pulse"></div>
        ) : (
          <h2 className="text-4xl font-bold">
            {showBalance ? `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
          </h2>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-3 transition-all duration-200 flex flex-col items-center justify-center whitespace-nowrap">
          <i className="ri-arrow-down-line text-2xl mb-1"></i>
          <span className="text-xs">Deposit</span>
        </button>
        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-3 transition-all duration-200 flex flex-col items-center justify-center whitespace-nowrap">
          <i className="ri-arrow-up-line text-2xl mb-1"></i>
          <span className="text-xs">Withdraw</span>
        </button>
        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-3 transition-all duration-200 flex flex-col items-center justify-center whitespace-nowrap">
          <i className="ri-exchange-line text-2xl mb-1"></i>
          <span className="text-xs">Transfer</span>
        </button>
      </div>
    </div>
  );
}

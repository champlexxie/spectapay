import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function BalanceCard() {
  const { user } = useAuthContext();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch wallet balances
      const { data: walletData, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id);

      if (error) throw error;

      // Calculate total balance
      const total = walletData?.reduce((sum, wallet) => sum + wallet.balance, 0) || 0;
      setBalance(total);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBalance();
    
    // Update every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium opacity-90">Total Balance</h3>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
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
        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-3 transition-all duration-200 flex flex-col items-center justify-center whitespace-nowrap cursor-pointer">
          <i className="ri-arrow-down-line text-2xl mb-1"></i>
          <span className="text-xs">Deposit</span>
        </button>
        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-3 transition-all duration-200 flex flex-col items-center justify-center whitespace-nowrap cursor-pointer">
          <i className="ri-arrow-up-line text-2xl mb-1"></i>
          <span className="text-xs">Withdraw</span>
        </button>
        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-3 transition-all duration-200 flex flex-col items-center justify-center whitespace-nowrap cursor-pointer">
          <i className="ri-exchange-line text-2xl mb-1"></i>
          <span className="text-xs">Transfer</span>
        </button>
      </div>
    </div>
  );
}

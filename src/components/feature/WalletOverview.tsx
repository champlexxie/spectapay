import { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function WalletOverview() {
  const { user } = useAuthContext();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user]);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      if (user) {
        // Fetch wallet balances
        const { data: walletData, error } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', user.id);

        if (error) throw error;

        // Calculate total balance
        const total = walletData?.reduce((sum, wallet) => sum + wallet.balance, 0) || 0;
        setBalance(total);
      }
    } catch (error) {
      console.error('Error:', error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Balance', value: loading ? '...' : `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: 'ri-wallet-3-line', color: 'text-blue-600' },
    { label: 'Available', value: loading ? '...' : `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: 'ri-money-dollar-circle-line', color: 'text-green-600' },
    { label: 'In Orders', value: '$0.00', icon: 'ri-exchange-line', color: 'text-orange-600' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Overview</h3>
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                <i className={`${stat.icon} text-xl ${stat.color}`}></i>
              </div>
              <span className="text-sm text-gray-600">{stat.label}</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
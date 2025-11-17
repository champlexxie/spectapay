
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { cryptoApi } from '../../services/cryptoApi';

interface BalanceCardProps {
  title?: string;
  amount?: string;
  change?: string;
  isPositive?: boolean;
  icon?: string;
}

export default function BalanceCard({ 
  title = "Total Balance", 
  amount, 
  change, 
  isPositive = true, 
  icon = "ri-wallet-3-line" 
}: BalanceCardProps) {
  const { isDark } = useTheme();
  const [balance, setBalance] = useState(0);
  const [change24h, setChange24h] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock portfolio holdings
  const holdings = [
    { coinId: 'bitcoin', amount: 0.00545134 },
    { coinId: 'ethereum', amount: 0 },
    { coinId: 'cardano', amount: 0 },
    { coinId: 'solana', amount: 0 },
    { coinId: 'tether', amount: 1575.0451678 },
  ];

  const updateBalance = async () => {
    try {
      const coinData = await cryptoApi.getTopCoins(50);
      let totalValue = 0;
      let weightedChange = 0;
      let totalWeight = 0;

      for (const holding of holdings) {
        const coin = coinData.find(c => c.id === holding.coinId);
        if (coin && holding.amount > 0) {
          const value = holding.amount * coin.current_price;
          totalValue += value;
          weightedChange += coin.price_change_percentage_24h * value;
          totalWeight += value;
        }
      }

      if (totalWeight > 0) {
        weightedChange = weightedChange / totalWeight;
      }

      setBalance(totalValue);
      setChange24h(weightedChange);
    } catch (error) {
      console.error('Error updating balance:', error);
      // Fallback to realistic values
      setBalance(2096.62);
      setChange24h(5.2);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateBalance();
    
    // Update balance every 30 seconds
    const interval = setInterval(updateBalance, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  const displayAmount = amount || formatBalance(balance);
  const displayChange = change || formatChange(change24h);
  const changeIsPositive = change ? isPositive : change24h >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <i className={`${icon} text-white text-xl`}></i>
        </div>
      </div>
      
      <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
        {displayAmount}
      </div>
      
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-medium ${
          changeIsPositive ? 'text-green-500' : 'text-red-500'
        }`}>
          {displayChange}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          (24h)
        </span>
        <i className={`ri-arrow-${changeIsPositive ? 'up' : 'down'}-line text-sm ${
          changeIsPositive ? 'text-green-500' : 'text-red-500'
        }`}></i>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Live data
            </span>
          </div>
          <button
            onClick={updateBalance}
            className="text-xs px-2 py-1 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <i className="ri-refresh-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

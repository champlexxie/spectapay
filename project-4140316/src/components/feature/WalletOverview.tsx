
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { cryptoApi } from '../../services/cryptoApi';

interface PortfolioItem {
  symbol: string;
  name: string;
  amount: number;
  coinId: string;
  currentPrice?: number;
  value?: number;
  change24h?: number;
  image?: string;
  svgLogo?: string;
}

export default function WalletOverview() {
  const { isDark } = useTheme();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([
    { symbol: 'BTC', name: 'Bitcoin', amount: 0.5, coinId: 'bitcoin' },
    { symbol: 'ETH', name: 'Ethereum', amount: 2.3, coinId: 'ethereum' },
    { symbol: 'ADA', name: 'Cardano', amount: 1500, coinId: 'cardano' },
    { symbol: 'SOL', name: 'Solana', amount: 25, coinId: 'solana' },
  ]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalChange, setTotalChange] = useState(0);
  const [loading, setLoading] = useState(true);

  const updatePortfolioPrices = async () => {
    try {
      const updatedPortfolio = await Promise.all(
        portfolio.map(async (item) => {
          const coinData = await cryptoApi.getTopCoins(50);
          const coin = coinData.find(c => c.id === item.coinId);
          
          if (coin) {
            const value = item.amount * coin.current_price;
            return {
              ...item,
              currentPrice: coin.current_price,
              value: value,
              change24h: coin.price_change_percentage_24h,
              image: coin.image,
              svgLogo: coin.svgLogo
            };
          }
          return item;
        })
      );

      setPortfolio(updatedPortfolio);
      
      // Calculate total portfolio value and change
      const total = updatedPortfolio.reduce((sum, item) => sum + (item.value || 0), 0);
      const weightedChange = updatedPortfolio.reduce((sum, item) => {
        if (item.value && item.change24h) {
          return sum + (item.change24h * (item.value / total));
        }
        return sum;
      }, 0);
      
      setTotalValue(total);
      setTotalChange(weightedChange);
    } catch (error) {
      console.error('Error updating portfolio prices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updatePortfolioPrices();
    
    // Update prices every 30 seconds
    const interval = setInterval(updatePortfolioPrices, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Portfolio Overview
        </h2>
        <button
          onClick={updatePortfolioPrices}
          className={`p-2 rounded-lg transition-colors ${
            isDark 
              ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
          }`}
        >
          <i className="ri-refresh-line"></i>
        </button>
      </div>

      <div className="mb-6">
        <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {formatPrice(totalValue)}
        </div>
        <div className={`text-sm font-medium ${
          totalChange >= 0 ? 'text-green-500' : 'text-red-500'
        }`}>
          {formatChange(totalChange)} (24h)
        </div>
      </div>

      <div className="space-y-4">
        {portfolio.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-600">
                {item.svgLogo || item.image ? (
                  <img 
                    src={item.svgLogo || item.image} 
                    alt={item.name}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-sm font-bold text-gray-600 dark:text-gray-300">${item.symbol}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                    {item.symbol}
                  </span>
                )}
              </div>
              <div>
                <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {item.name}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {item.amount} {item.symbol}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {item.value ? formatPrice(item.value) : '--'}
              </div>
              {item.change24h !== undefined && (
                <div className={`text-sm font-medium ${
                  item.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {formatChange(item.change24h)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-6 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex justify-between items-center">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Live prices from CoinGecko
          </span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

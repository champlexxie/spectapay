
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { cryptoApi } from '../../services/cryptoApi';

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
  image?: string;
  svgLogo?: string;
}

export default function CoinTable() {
  const { isDark } = useTheme();
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);

  const updateCoinData = async () => {
    try {
      const coinData = await cryptoApi.getTopCoins(5);
      setCoins(coinData);
    } catch (error) {
      console.error('Error fetching coin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateCoinData();
    
    // Update every 30 seconds
    const interval = setInterval(updateCoinData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2
    }).format(price);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex justify-between items-center py-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {coins.map((coin, index) => (
        <div
          key={coin.id}
          className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-700">
              {coin.svgLogo || coin.image ? (
                <img 
                  src={coin.svgLogo || coin.image} 
                  alt={coin.name}
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="text-xs font-bold text-gray-600 dark:text-gray-300">${coin.symbol.substring(0, 2)}</span>`;
                    }
                  }}
                />
              ) : (
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  {coin.symbol.substring(0, 2)}
                </span>
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {coin.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {coin.symbol.toUpperCase()}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {formatPrice(coin.current_price)}
            </div>
            <div className={`text-xs font-medium ${
              coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatChange(coin.price_change_percentage_24h)}
            </div>
          </div>
        </div>
      ))}
      
      <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <span>Live prices from CoinGecko</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}


import { useState } from 'react';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
  svgLogo?: string;
}

interface CurrencyListProps {
  coins: CoinData[];
  selectedCoin: CoinData | null;
  onCoinSelect: (coin: CoinData) => void;
  loading: boolean;
}

export default function CurrencyList({ coins, selectedCoin, onCoinSelect, loading }: CurrencyListProps) {
  const [activeTab, setActiveTab] = useState('USDT');

  const tabs = ['USDT', 'BTC', 'ETH', 'FIAT'];

  if (loading) {
    return (
      <div className="flex-1 p-4">
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Tabs */}
      <div className="p-4 pb-0">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Column Headers */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <span>Currency</span>
          <span>Last</span>
          <span>Change</span>
        </div>
      </div>

      {/* Currency List */}
      <div className="flex-1 overflow-y-auto">
        {coins.map((coin) => (
          <div
            key={coin.id}
            onClick={() => onCoinSelect(coin)}
            className={`flex items-center justify-between px-4 py-2 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
              selectedCoin?.id === coin.id ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-700">
                {coin.svgLogo || coin.image ? (
                  <img 
                    src={coin.svgLogo || coin.image} 
                    alt={coin.name}
                    className="w-5 h-5 object-contain"
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
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {coin.symbol.toUpperCase()}/USDT
                </div>
              </div>
            </div>
            
            <div className="text-right space-y-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {coin.current_price.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: coin.current_price < 1 ? 6 : 2 
                })}
              </div>
              <div className={`text-xs font-medium ${
                coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                {coin.price_change_percentage_24h.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

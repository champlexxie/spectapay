import { useState, useEffect } from 'react';

interface Trade {
  id: string;
  price: number;
  size: number;
  time: string;
  type: 'buy' | 'sell';
  amount: number;
}

export default function TradeHistory() {
  const [activeTab, setActiveTab] = useState('Trades');
  const [trades, setTrades] = useState<Trade[]>([]);

  const tabs = ['Limit', 'Market', 'Trigger Order'];

  // Generate mock trade data
  const generateTrades = () => {
    const newTrades: Trade[] = [];
    
    for (let i = 0; i < 20; i++) {
      const price = 95000 + (Math.random() - 0.5) * 1000;
      const size = Math.random() * 1 + 0.001;
      const type = Math.random() > 0.5 ? 'buy' : 'sell';
      const time = new Date(Date.now() - i * 30000).toLocaleTimeString();
      const amount = price * size;
      
      newTrades.push({
        id: `trade-${i}`,
        price,
        size,
        time,
        type,
        amount
      });
    }
    
    setTrades(newTrades);
  };

  useEffect(() => {
    generateTrades();
    
    // Update trades every 5 seconds
    const interval = setInterval(() => {
      // Add new trade at the beginning
      const newTrade: Trade = {
        id: `trade-${Date.now()}`,
        price: 95000 + (Math.random() - 0.5) * 1000,
        size: Math.random() * 1 + 0.001,
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        time: new Date().toLocaleTimeString(),
        amount: 0
      };
      newTrade.amount = newTrade.price * newTrade.size;
      
      setTrades(prev => [newTrade, ...prev.slice(0, 19)]);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const formatSize = (size: number) => {
    return size.toFixed(6);
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Tabs */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trades</h3>
          <div className="flex items-center space-x-2">
            <button className="text-xs text-blue-500 hover:text-blue-600 cursor-pointer whitespace-nowrap">
              Available 2091.05 USDT
            </button>
          </div>
        </div>
        
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
          <span>Price (USDT)</span>
          <span>Size (BTC)</span>
          <span>Time</span>
        </div>
      </div>

      {/* Trades List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-px">
          {trades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center justify-between px-4 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span className={`font-medium ${
                trade.type === 'buy' ? 'text-green-500' : 'text-red-500'
              }`}>
                {formatPrice(trade.price)}
              </span>
              <span className="text-gray-900 dark:text-white">
                {formatSize(trade.size)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {formatTime(trade.time)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Commission fee: 0.25%
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';

interface CoinData {
  id: string;
  symbol: string;
  current_price: number;
}

interface OrderBookProps {
  coin: CoinData;
}

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export default function OrderBook({ coin }: OrderBookProps) {
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [spread, setSpread] = useState(0);

  // Generate mock order book data
  const generateOrderBookData = () => {
    const basePrice = coin.current_price;
    const newBids: OrderBookEntry[] = [];
    const newAsks: OrderBookEntry[] = [];
    
    // Generate bids (buy orders) - prices below current price
    for (let i = 0; i < 10; i++) {
      const price = basePrice * (1 - (i + 1) * 0.001); // Decrease price
      const size = Math.random() * 10 + 1;
      const total = price * size;
      newBids.push({ price, size, total });
    }
    
    // Generate asks (sell orders) - prices above current price
    for (let i = 0; i < 10; i++) {
      const price = basePrice * (1 + (i + 1) * 0.001); // Increase price
      const size = Math.random() * 10 + 1;
      const total = price * size;
      newAsks.push({ price, size, total });
    }
    
    setBids(newBids);
    setAsks(newAsks.reverse()); // Reverse asks so highest price is on top
    setSpread(newAsks[0]?.price - newBids[0]?.price || 0);
  };

  useEffect(() => {
    generateOrderBookData();
    
    // Update order book every 2 seconds
    const interval = setInterval(generateOrderBookData, 2000);
    
    return () => clearInterval(interval);
  }, [coin]);

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const formatSize = (size: number) => {
    return size.toFixed(6);
  };

  const getMaxTotal = () => {
    const maxBid = Math.max(...bids.map(b => b.total), 0);
    const maxAsk = Math.max(...asks.map(a => a.total), 0);
    return Math.max(maxBid, maxAsk);
  };

  const maxTotal = getMaxTotal();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Book</h3>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>Price (USDT)</span>
          <span>Size (BTC)</span>
          <span>Total</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Asks (Sell Orders) */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-px">
            {asks.map((ask, index) => (
              <div
                key={`ask-${index}`}
                className="relative flex items-center justify-between px-4 py-1 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors"
              >
                {/* Background bar */}
                <div
                  className="absolute right-0 top-0 bottom-0 bg-red-500/10"
                  style={{ width: `${(ask.total / maxTotal) * 100}%` }}
                />
                
                <span className="text-red-500 font-medium relative z-10">
                  {formatPrice(ask.price)}
                </span>
                <span className="text-gray-900 dark:text-white relative z-10">
                  {formatSize(ask.size)}
                </span>
                <span className="text-gray-500 dark:text-gray-400 relative z-10">
                  {ask.total.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Price and Spread */}
        <div className="py-3 px-4 bg-gray-50 dark:bg-gray-700/50 border-y border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              ${coin.current_price.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Spread: ${spread.toFixed(2)} (0.01%)
            </div>
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-px">
            {bids.map((bid, index) => (
              <div
                key={`bid-${index}`}
                className="relative flex items-center justify-between px-4 py-1 text-xs hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer transition-colors"
              >
                {/* Background bar */}
                <div
                  className="absolute right-0 top-0 bottom-0 bg-green-500/10"
                  style={{ width: `${(bid.total / maxTotal) * 100}%` }}
                />
                
                <span className="text-green-500 font-medium relative z-10">
                  {formatPrice(bid.price)}
                </span>
                <span className="text-gray-900 dark:text-white relative z-10">
                  {formatSize(bid.size)}
                </span>
                <span className="text-gray-500 dark:text-gray-400 relative z-10">
                  {bid.total.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-500 dark:text-gray-400">Live</span>
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            Depth: ±2%
          </div>
        </div>
      </div>
    </div>
  );
}
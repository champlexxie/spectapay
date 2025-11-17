import { useState } from 'react';

interface CoinData {
  id: string;
  symbol: string;
  current_price: number;
}

interface TradingFormProps {
  coin: CoinData;
}

export default function TradingForm({ coin }: TradingFormProps) {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [tradeType, setTradeType] = useState('limit');
  const [price, setPrice] = useState(coin.current_price.toString());
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState(0);

  const availableBalance = 2091.05; // Mock USDT balance
  const availableBTC = 0.00000021; // Mock BTC balance

  const percentages = [25, 50, 75, 100];

  const handlePercentageClick = (percent: number) => {
    setPercentage(percent);
    if (orderType === 'buy') {
      const maxAmount = (availableBalance * (percent / 100)) / parseFloat(price || '1');
      setAmount(maxAmount.toFixed(8));
    } else {
      const maxAmount = availableBTC * (percent / 100);
      setAmount(maxAmount.toFixed(8));
    }
  };

  const calculateTotal = () => {
    const priceNum = parseFloat(price) || 0;
    const amountNum = parseFloat(amount) || 0;
    return (priceNum * amountNum).toFixed(2);
  };

  const handleSubmitOrder = () => {
    // Mock order submission
    console.log('Order submitted:', {
      type: orderType,
      tradeType,
      price: parseFloat(price),
      amount: parseFloat(amount),
      total: parseFloat(calculateTotal())
    });
    
    // Reset form
    setAmount('');
    setPercentage(0);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Order Type Toggle */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setOrderType('buy')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              orderType === 'buy'
                ? 'bg-green-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setOrderType('sell')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              orderType === 'sell'
                ? 'bg-red-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-4 space-y-4">
        {/* Trade Type */}
        <div className="space-y-2">
          <div className="flex space-x-1 text-xs">
            {['limit', 'market'].map((type) => (
              <button
                key={type}
                onClick={() => setTradeType(type)}
                className={`px-3 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${
                  tradeType === type
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Available Balance */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Available: {orderType === 'buy' ? `${availableBalance.toFixed(2)} USDT` : `${availableBTC.toFixed(8)} BTC`}
        </div>

        {/* Price Input */}
        {tradeType === 'limit' && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Price (USDT)
            </label>
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-500 hover:text-blue-600 cursor-pointer">
                Get per purchase: 0 BTC
              </button>
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Amount
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
              {coin.symbol.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Percentage Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {percentages.map((percent) => (
            <button
              key={percent}
              onClick={() => handlePercentageClick(percent)}
              className={`py-2 text-xs font-medium rounded border transition-colors cursor-pointer whitespace-nowrap ${
                percentage === percent
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {percent}%
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Total
          </label>
          <div className="relative">
            <input
              type="text"
              value={calculateTotal()}
              readOnly
              className="w-full px-3 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
              USDT
            </span>
          </div>
        </div>

        {/* Commission Fee */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Commission fee: 0.25%
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitOrder}
          disabled={!amount || parseFloat(amount) <= 0}
          className={`w-full py-3 rounded-lg font-medium text-white transition-colors cursor-pointer whitespace-nowrap ${
            orderType === 'buy'
              ? 'bg-green-500 hover:bg-green-600 disabled:bg-gray-400'
              : 'bg-red-500 hover:bg-red-600 disabled:bg-gray-400'
          }`}
        >
          {orderType === 'buy' ? 'Buy' : 'Sell'} {coin.symbol.toUpperCase()}
        </button>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/feature/Header';
import TradingChart from './components/TradingChart';
import OrderBook from './components/OrderBook';
import TradeHistory from './components/TradeHistory';
import CurrencyList from './components/CurrencyList';
import TradingForm from './components/TradingForm';
import { cryptoApi } from '../../services/cryptoApi';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

export default function TradingPage() {
  const navigate = useNavigate();
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const coinData = await cryptoApi.getTopCoins(20);
        setCoins(coinData);
        if (coinData.length > 0) {
          setSelectedCoin(coinData[0]); // Default to BTC
        }
      } catch (error) {
        console.error('Error fetching coins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
    const interval = setInterval(fetchCoins, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredCoins = coins.filter(coin =>
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="flex h-screen">
        {/* Left Sidebar - Currency List */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          
          <CurrencyList
            coins={filteredCoins}
            selectedCoin={selectedCoin}
            onCoinSelect={setSelectedCoin}
            loading={loading}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar with Selected Currency Info */}
          {selectedCoin && (
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <i className="ri-currency-line text-white text-lg"></i>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedCoin.symbol}/USDT
                      </h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCoin.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${selectedCoin.current_price.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ≈$95416.88
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">24h Change</span>
                        <div className={`font-medium ${
                          selectedCoin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {selectedCoin.price_change_percentage_24h >= 0 ? '+' : ''}
                          {selectedCoin.price_change_percentage_24h.toFixed(2)}%
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">24h High</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          ${(selectedCoin.current_price * 1.05).toFixed(2)}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">24h Low</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          ${(selectedCoin.current_price * 0.95).toFixed(2)}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">24h Volume (BTC)</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {(selectedCoin.total_volume / 1000000).toFixed(0)}M
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">24h Amount (BTC)</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {(selectedCoin.total_volume / selectedCoin.current_price / 1000).toFixed(0)}K BTC
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Trading Interface */}
          <div className="flex-1 flex">
            {/* Chart and Trade History */}
            <div className="flex-1 flex flex-col">
              {/* Chart */}
              <div className="flex-1 bg-white dark:bg-gray-800">
                {selectedCoin && <TradingChart coin={selectedCoin} />}
              </div>
              
              {/* Trade History */}
              <div className="h-60 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <TradeHistory />
              </div>
            </div>

            {/* Right Sidebar - Order Book and Trading Form */}
            <div className="w-96 flex flex-col">
              {/* Order Book */}
              <div className="flex-1 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
                {selectedCoin && <OrderBook coin={selectedCoin} />}
              </div>
              
              {/* Trading Form */}
              <div className="h-80 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700">
                {selectedCoin && <TradingForm coin={selectedCoin} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
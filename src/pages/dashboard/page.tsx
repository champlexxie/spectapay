
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../../components/feature/Header';
import { cryptoApi } from '../../services/cryptoApi';

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image?: string;
  svgLogo?: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);

  const updateMarketData = async () => {
    try {
      const coinData = await cryptoApi.getTopCoins(8);
      setMarketData(coinData);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateMarketData();
    
    // Update every 30 seconds for live feed
    const interval = setInterval(updateMarketData, 30000);
    
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

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  const formatVolume = (volume: number) => {
    if (!volume || typeof volume !== 'number') return '$0';
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    }
    return `$${volume.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, Ghost!</h1>
            <p className="text-gray-600 dark:text-gray-400">Here's what's happening with your crypto portfolio today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Total Balance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <i className="ri-wallet-3-line text-2xl text-blue-600 dark:text-blue-400"></i>
                </div>
                <span className="text-green-500 text-sm font-medium flex items-center">
                  <i className="ri-arrow-up-line"></i>
                  +5.2%
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">$2,096.62</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-colors duration-200">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => navigate('/deposit')}
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer border border-blue-200 dark:border-blue-700"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <i className="ri-download-line text-2xl text-white"></i>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">Deposit</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add funds to wallet</p>
                </div>
              </button>

              <button 
                onClick={() => navigate('/withdraw')}
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer border border-purple-200 dark:border-purple-700"
              >
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <i className="ri-upload-line text-2xl text-white"></i>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">Withdraw</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Send to external wallet</p>
                </div>
              </button>

              <button 
                onClick={() => navigate('/transfer')}
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer border border-green-200 dark:border-green-700"
              >
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <i className="ri-exchange-line text-2xl text-white"></i>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">Transfer</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Send to another user</p>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
              <button 
                onClick={() => navigate('/history')}
                className="text-blue-600 dark:text-blue-400 text-sm hover:underline cursor-pointer whitespace-nowrap"
              >
                View All
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Activity Item 1 */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-download-line text-green-600 dark:text-green-400"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Deposit</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">+1500 USDT</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>

                {/* Activity Item 2 */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-exchange-line text-blue-600 dark:text-blue-400"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Transfer</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">-50 USDT</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">5 hours ago</p>
                  </div>
                </div>

                {/* Activity Item 3 */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-upload-line text-orange-600 dark:text-orange-400"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Withdraw</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">-0.005 BTC</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>

                {/* Activity Item 4 */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-download-line text-green-600 dark:text-green-400"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Deposit</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">+0.005 BTC</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">2 days ago</p>
                  </div>
                </div>

                {/* Activity Item 5 */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-exchange-line text-blue-600 dark:text-blue-400"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Transfer</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">-100 USDT</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Market Overview */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Market Overview</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Live Feed</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/market-cap')}
                className="text-blue-600 dark:text-blue-400 text-sm hover:underline cursor-pointer whitespace-nowrap"
              >
                View All Markets
              </button>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                          </div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                        </div>
                        <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-20 mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {marketData.map((coin) => (
                    <div key={coin.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden bg-white">
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
                                    parent.innerHTML = `<span class="text-xs font-bold text-gray-600">${coin.symbol.substring(0, 2)}</span>`;
                                  }
                                }}
                              />
                            ) : (
                              <span className="text-xs font-bold text-gray-600">
                                {coin.symbol.substring(0, 2)}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{coin.symbol.toUpperCase()}</span>
                        </div>
                        <span className={`text-xs flex items-center ${
                          coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          <i className={`${coin.price_change_percentage_24h >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'}`}></i>
                          {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">{formatPrice(coin.current_price)}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Market Cap</span>
                          <span>{formatMarketCap(coin.market_cap)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Volume 24h</span>
                          <span>{formatVolume(coin.total_volume)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>Live market data from CoinGecko • Updates every 30 seconds</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

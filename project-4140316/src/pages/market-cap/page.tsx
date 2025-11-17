
import { useState, useEffect } from 'react';
import Header from '../../components/feature/Header';

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
  image: string;
}

const MarketCapPage = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fallback data for when API fails
  const generateFallbackData = (): CryptoData[] => {
    const cryptos = [
      { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', basePrice: 45000 },
      { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', basePrice: 2800 },
      { id: 'binancecoin', name: 'BNB', symbol: 'BNB', basePrice: 320 },
      { id: 'solana', name: 'Solana', symbol: 'SOL', basePrice: 95 },
      { id: 'cardano', name: 'Cardano', symbol: 'ADA', basePrice: 0.45 },
      { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX', basePrice: 28 },
      { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', basePrice: 6.5 },
      { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', basePrice: 14 },
      { id: 'polygon', name: 'Polygon', symbol: 'MATIC', basePrice: 0.85 },
      { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', basePrice: 75 },
    ];

    return cryptos.map((crypto, index) => {
      const priceVariation = (Math.random() - 0.5) * 0.1;
      const current_price = crypto.basePrice * (1 + priceVariation);
      const price_change_24h = (Math.random() - 0.5) * 10;
      
      return {
        id: crypto.id,
        name: crypto.name,
        symbol: crypto.symbol.toLowerCase(),
        current_price,
        market_cap: current_price * (1000000 - index * 50000),
        market_cap_rank: index + 1,
        price_change_percentage_24h: price_change_24h,
        total_volume: current_price * (50000 - index * 2000),
        image: `https://assets.coingecko.com/coins/images/${index + 1}/${crypto.id}.png`
      };
    });
  };

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false',
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid data format received');
      }
      
      setCryptoData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      setError('Failed to fetch live data, showing simulated data');
      // Use fallback data when API fails
      setCryptoData(generateFallbackData());
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
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
    return `$${marketCap?.toLocaleString() || '0'}`;
  };

  const formatVolume = (volume: number) => {
    if (!volume) return '$0';
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Market Cap Rankings
              </h1>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Live Data</span>
                </div>
                {lastUpdate && (
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    Updated: {lastUpdate.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
              </div>
            )}
            
            <p className="text-gray-600 dark:text-gray-400">
              Top cryptocurrencies by market capitalization, updated every 30 seconds
            </p>
          </div>

          {loading && cryptoData.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/6"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        24h Change
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Market Cap
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Volume (24h)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {cryptoData.map((crypto) => (
                      <tr key={crypto.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          #{crypto.market_cap_rank}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-white mr-3">
                              <img 
                                src={crypto.image} 
                                alt={crypto.name}
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {crypto.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                                {crypto.symbol}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                          {formatPrice(crypto.current_price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            crypto.price_change_percentage_24h >= 0
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                            {crypto.price_change_percentage_24h?.toFixed(2) || '0.00'}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                          {formatMarketCap(crypto.market_cap)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                          {formatVolume(crypto.total_volume)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>Data from CoinGecko API • Updates every 30 seconds</span>
                  <button 
                    onClick={fetchCryptoData}
                    disabled={loading}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {loading ? 'Refreshing...' : 'Refresh Now'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MarketCapPage;

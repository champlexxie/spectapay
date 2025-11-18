import { useState, useEffect } from 'react';
import Header from '../../components/feature/Header';

interface CurrencyData {
  code: string;
  name: string;
  rate: number;
  change24h: number;
  volume: number;
  trend: 'up' | 'down' | 'neutral';
}

export default function CurrencyHeatMapPage() {
  const [currencyData, setCurrencyData] = useState<CurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const currencies = [
    { code: 'EUR', name: 'Euro' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'NZD', name: 'New Zealand Dollar' },
    { code: 'SEK', name: 'Swedish Krona' },
    { code: 'NOK', name: 'Norwegian Krone' },
    { code: 'DKK', name: 'Danish Krone' },
    { code: 'HKD', name: 'Hong Kong Dollar' }
  ];

  const generateMockData = (): CurrencyData[] => {
    return currencies.map(currency => {
      const change = (Math.random() - 0.5) * 4; // -2% to +2%
      const rate = 1 + (Math.random() - 0.5) * 0.2; // Mock exchange rate
      const volume = Math.random() * 1000000000; // Mock volume
      
      return {
        code: currency.code,
        name: currency.name,
        rate: rate,
        change24h: change,
        volume: volume,
        trend: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'neutral'
      };
    });
  };

  const fetchCurrencyData = async () => {
    try {
      setLoading(true);
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = generateMockData();
      setCurrencyData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching currency data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencyData();
    const interval = setInterval(fetchCurrencyData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHeatMapColor = (change: number): string => {
    const intensity = Math.min(Math.abs(change) / 2, 1); // Normalize to 0-1
    
    if (change > 0) {
      // Green for positive
      const opacity = Math.max(0.1, intensity);
      return `rgba(34, 197, 94, ${opacity})`;
    } else if (change < 0) {
      // Red for negative
      const opacity = Math.max(0.1, intensity);
      return `rgba(239, 68, 68, ${opacity})`;
    } else {
      // Neutral gray
      return 'rgba(156, 163, 175, 0.1)';
    }
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Currency Heat Map
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Quick overview of action in the currency markets. Spot strong and weak currencies at a glance.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
              <button
                onClick={fetchCurrencyData}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200 whitespace-nowrap cursor-pointer"
              >
                <i className={`ri-refresh-line ${loading ? 'animate-spin' : ''}`}></i>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading currency data...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Heat Map Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Currency Performance Heat Map</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {currencyData.map((currency) => (
                  <div
                    key={currency.code}
                    className="relative p-4 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:scale-105 cursor-pointer"
                    style={{ backgroundColor: getHeatMapColor(currency.change24h) }}
                  >
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {currency.code}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                        {currency.name}
                      </div>
                      <div className={`text-sm font-semibold ${
                        currency.change24h >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        <i className={`${currency.change24h >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i>
                        {Math.abs(currency.change24h).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 flex items-center justify-center space-x-8">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500/30 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Strong</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-300/30 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Neutral</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500/30 rounded"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Weak</span>
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Detailed Currency Data</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Currency
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rate (USD)
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        24h Change
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Volume
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {currencyData.map((currency) => (
                      <tr key={currency.code} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {currency.code.substring(0, 2)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {currency.code}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {currency.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${currency.rate.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            currency.change24h >= 0
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            <i className={`${currency.change24h >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i>
                            {Math.abs(currency.change24h).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatVolume(currency.volume)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {currency.trend === 'up' && (
                              <div className="flex items-center text-green-600 dark:text-green-400">
                                <i className="ri-trending-up-line mr-1"></i>
                                <span className="text-xs">Bullish</span>
                              </div>
                            )}
                            {currency.trend === 'down' && (
                              <div className="flex items-center text-red-600 dark:text-red-400">
                                <i className="ri-trending-down-line mr-1"></i>
                                <span className="text-xs">Bearish</span>
                              </div>
                            )}
                            {currency.trend === 'neutral' && (
                              <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <i className="ri-subtract-line mr-1"></i>
                                <span className="text-xs">Neutral</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Data updates automatically every 30 seconds • Currency rates relative to USD
        </div>
      </div>
    </div>
  );
}
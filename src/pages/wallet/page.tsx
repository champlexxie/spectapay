import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/feature/Header';

interface CoinHolding {
  symbol: string;
  name: string;
  total: number;
  usdValue: number;
  color: string;
  logo: string;
}

export default function WalletPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [holdings, setHoldings] = useState<CoinHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uidCopied, setUidCopied] = useState(false);

  const defaultCoins: CoinHolding[] = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      total: 0,
      usdValue: 0,
      color: 'bg-orange-500',
      logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      total: 0,
      usdValue: 0,
      color: 'bg-green-500',
      logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      total: 0,
      usdValue: 0,
      color: 'bg-blue-500',
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
    },
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      total: 0,
      usdValue: 0,
      color: 'bg-yellow-500',
      logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png'
    }
  ];

  const fetchHoldings = useCallback(async () => {
    if (!user) {
      setHoldings(defaultCoins);
      setTotalBalance(0);
      setLoading(false);
      return;
    }

    try {
      // Use isRefreshing for background updates to prevent UI flicker
      if (loading) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      // Fetch balances from database
      const { data: balances, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.warn('Database fetch error:', error);
        setHoldings(defaultCoins);
        setTotalBalance(0);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Create a map to combine all holdings
      const holdingsMap = new Map<string, { total: number; name: string; logo: string; color: string; usdValue: number }>();

      // Initialize with default coins
      defaultCoins.forEach(coin => {
        holdingsMap.set(coin.symbol, {
          total: 0,
          name: coin.name,
          logo: coin.logo,
          color: coin.color,
          usdValue: 0
        });
      });

      // Fetch real-time prices from CoinGecko
      if (balances && balances.length > 0) {
        const coinIds = balances.map(wallet => {
          const currency = wallet.currency.toLowerCase();
          const coinMap: { [key: string]: string } = {
            'btc': 'bitcoin',
            'eth': 'ethereum',
            'usdt': 'tether',
            'bnb': 'binancecoin',
            'sol': 'solana',
            'usdc': 'usd-coin',
            'xrp': 'ripple',
            'ada': 'cardano',
            'doge': 'dogecoin',
            'trx': 'tron'
          };
          return coinMap[currency] || currency;
        }).join(',');

        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`,
            { signal: AbortSignal.timeout(5000) }
          );
          const prices = await response.json();

          // Add actual balances with real prices
          balances.forEach(balance => {
            const symbol = balance.currency.toUpperCase();
            const currency = balance.currency.toLowerCase();
            const coinMap: { [key: string]: string } = {
              'btc': 'bitcoin',
              'eth': 'ethereum',
              'usdt': 'tether',
              'bnb': 'binancecoin',
              'sol': 'solana',
              'usdc': 'usd-coin',
              'xrp': 'ripple',
              'ada': 'cardano',
              'doge': 'dogecoin',
              'trx': 'tron'
            };
            const coinId = coinMap[currency] || currency;
            const price = prices[coinId]?.usd || 1;
            const usdValue = balance.balance * price;
            
            const existing = holdingsMap.get(symbol);
            
            if (existing) {
              existing.total = balance.balance;
              existing.usdValue = usdValue;
            } else {
              holdingsMap.set(symbol, {
                total: balance.balance,
                name: balance.currency || symbol,
                logo: `https://cryptologos.cc/logos/${symbol.toLowerCase()}-${symbol.toLowerCase()}-logo.png`,
                color: 'bg-gray-500',
                usdValue: usdValue
              });
            }
          });
        } catch (priceError) {
          console.warn('Price fetch error, using fallback:', priceError);
          // Fallback: use balance as USD value for stablecoins, estimate for others
          balances.forEach(balance => {
            const symbol = balance.currency.toUpperCase();
            const existing = holdingsMap.get(symbol);
            const fallbackPrice = symbol === 'USDT' || symbol === 'USDC' ? 1 : 50000;
            
            if (existing) {
              existing.total = balance.balance;
              existing.usdValue = balance.balance * fallbackPrice;
            }
          });
        }
      }

      // Convert to array
      const updatedHoldings: CoinHolding[] = Array.from(holdingsMap.entries()).map(([symbol, data]) => ({
        symbol,
        name: data.name,
        total: data.total,
        usdValue: data.usdValue,
        color: data.color,
        logo: data.logo
      }));

      // Calculate total balance
      const total = updatedHoldings.reduce((sum, coin) => sum + coin.usdValue, 0);
      
      setTotalBalance(total);
      setHoldings(updatedHoldings);
    } catch (error) {
      console.warn('Error fetching holdings:', error);
      setHoldings(defaultCoins);
      setTotalBalance(0);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHoldings();
    
    // Update every 60 seconds to reduce server load
    const interval = setInterval(fetchHoldings, 60000);
    
    return () => clearInterval(interval);
  }, [fetchHoldings]);

  const handleCopyUid = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id).then(() => {
        setUidCopied(true);
        setTimeout(() => setUidCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy UID:', err);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* User ID Display */}
        {user?.id && (
          <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800 inline-flex items-center space-x-2">
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <i className="ri-user-line text-blue-600 dark:text-blue-400"></i>
            </div>
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              UID: {user.id}
            </span>
            <button
              onClick={handleCopyUid}
              className="ml-1 p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors cursor-pointer"
              title="Copy UID"
            >
              <i className={`${uidCopied ? 'ri-check-line text-green-600 dark:text-green-400' : 'ri-file-copy-line text-blue-600 dark:text-blue-400'} text-sm`}></i>
            </button>
          </div>
        )}

        {/* Total Assets Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <i className="ri-wallet-3-line text-white text-lg"></i>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Assets</h2>
                {loading ? (
                  <div className="h-8 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mt-1"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button 
                onClick={() => navigate('/deposit')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-arrow-down-line"></i>
                <span>Deposit</span>
              </button>
              
              <button 
                onClick={() => navigate('/transfer')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-exchange-line"></i>
                <span>Transfer</span>
              </button>
              
              <button 
                onClick={() => navigate('/withdraw')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-arrow-up-line"></i>
                <span>Withdraw</span>
              </button>
              
              <button 
                onClick={() => navigate('/history')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-history-line"></i>
                <span>History</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Coin Holdings Table */}
            <div className="lg:col-span-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Assets</h3>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                    <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <input type="checkbox" className="rounded" />
                      <span>Hide zero balances</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Coin</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Equivalent USD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                      [...Array(4)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                              <div className="space-y-2">
                                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      holdings.map((coin) => (
                        <tr key={coin.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 ${coin.color} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                                <img src={coin.logo} alt={coin.symbol} className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{coin.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{coin.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white font-medium">
                              {coin.total.toFixed(8)} {coin.symbol}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              ${coin.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
      </main>
    </div>
  );
}


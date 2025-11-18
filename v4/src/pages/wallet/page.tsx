
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/feature/Header';
import { cryptoApi } from '../../services/cryptoApi';

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

  const defaultCoins: CoinHolding[] = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      total: 0,
      usdValue: 0,
      color: 'bg-orange-500',
      logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg'
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      total: 0,
      usdValue: 0,
      color: 'bg-green-500',
      logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      total: 0,
      usdValue: 0,
      color: 'bg-blue-500',
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg'
    },
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      total: 0,
      usdValue: 0,
      color: 'bg-yellow-500',
      logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg'
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
      setLoading(true);
      
      // Fetch all data in parallel for faster loading
      const [marketDataResult, portfolioResult, walletResult] = await Promise.all([
        cryptoApi.getTopCoins(100).catch(() => []),
        supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id)
          .then(res => res.data || []),
        supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .then(res => res.data || [])
      ]);

      const marketData = marketDataResult;
      const portfolioData = portfolioResult;
      const walletData = walletResult;

      const updatedHoldings = defaultCoins.map(coin => {
        let totalAmount = 0;
        let currentPrice = 0;

        // Get amount from portfolio
        const portfolio = portfolioData.find(
          p => p.coin_symbol?.toUpperCase() === coin.symbol
        );
        if (portfolio) {
          totalAmount += Number(portfolio.amount) || 0;
        }

        // Get amount from wallet
        const wallet = walletData.find(
          w => w.currency?.toUpperCase() === coin.symbol
        );
        if (wallet) {
          totalAmount += Number(wallet.balance) || 0;
        }

        // Get current price from market data
        const marketCoin = marketData.find(
          c => c.symbol.toUpperCase() === coin.symbol
        );
        if (marketCoin) {
          currentPrice = marketCoin.current_price;
        } else if (coin.symbol === 'USDT') {
          currentPrice = 1;
        }

        const usdValue = totalAmount * currentPrice;

        return {
          ...coin,
          total: totalAmount,
          usdValue: usdValue
        };
      });

      // Calculate total balance
      const total = updatedHoldings.reduce((sum, coin) => sum + coin.usdValue, 0);
      
      setTotalBalance(total);
      setHoldings(updatedHoldings);
    } catch (error) {
      console.error('Error fetching holdings:', error);
      setHoldings(defaultCoins);
      setTotalBalance(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHoldings();
    
    // Update every 10 minutes (600000 milliseconds)
    const interval = setInterval(fetchHoldings, 600000);
    
    return () => clearInterval(interval);
  }, [fetchHoldings]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
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
                              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
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
                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </td>
                        </tr>
                      ))
                    ) : holdings.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col items-center space-y-3">
                            <i className="ri-wallet-3-line text-4xl"></i>
                            <p>No holdings yet. Start by making a deposit.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      holdings.map((holding) => (
                        <tr key={holding.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={holding.logo} 
                                alt={holding.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{holding.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{holding.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {holding.total.toLocaleString(undefined, { 
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 8 
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              ${holding.usdValue.toLocaleString(undefined, { 
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2 
                              })}
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

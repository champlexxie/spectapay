
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/feature/Header';
import WalletOverview from '../../components/feature/WalletOverview';
import ProfileCard from '../../components/feature/ProfileCard';
import CoinTable from '../../components/feature/CoinTable';
import { cryptoApi } from '../../services/cryptoApi';

interface CoinHolding {
  symbol: string;
  name: string;
  amount: number;
  inOrders: number;
  usdValue: number;
  color: string;
  logo: string;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [holdings, setHoldings] = useState<CoinHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState<number>(0);

  const defaultCoins: CoinHolding[] = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      amount: 0,
      inOrders: 0,
      usdValue: 0,
      color: 'bg-orange-500',
      logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg'
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      amount: 0,
      inOrders: 0,
      usdValue: 0,
      color: 'bg-green-500',
      logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      amount: 0,
      inOrders: 0,
      usdValue: 0,
      color: 'bg-blue-500',
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg'
    },
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      amount: 0,
      inOrders: 0,
      usdValue: 0,
      color: 'bg-yellow-500',
      logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg'
    }
  ];

  useEffect(() => {
    const fetchHoldings = async () => {
      if (!user) {
        setHoldings(defaultCoins);
        setTotalBalance(0);
        setLoading(false);
        return;
      }

      try {
        // Fetch current market prices for all coins
        const marketData = await cryptoApi.getTopCoins(100);
        
        // Fetch user's portfolio data
        const { data: portfolioData } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id);

        // Fetch user's wallet balances
        const { data: walletData } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id);

        const updatedHoldings = defaultCoins.map(coin => {
          let totalAmount = 0;
          let currentPrice = 0;

          // Get amount from portfolio
          const portfolio = portfolioData?.find(
            p => p.coin_symbol.toUpperCase() === coin.symbol
          );
          if (portfolio) {
            totalAmount += portfolio.amount || 0;
          }

          // Get amount from wallet
          const wallet = walletData?.find(
            w => w.currency.toUpperCase() === coin.symbol
          );
          if (wallet) {
            totalAmount += wallet.balance || 0;
          }

          // Get current price from market data
          const marketCoin = marketData.find(
            c => c.symbol.toUpperCase() === coin.symbol
          );
          if (marketCoin) {
            currentPrice = marketCoin.current_price;
          } else if (coin.symbol === 'USDT') {
            // USDT is always $1
            currentPrice = 1;
          }

          const usdValue = totalAmount * currentPrice;

          return {
            ...coin,
            amount: totalAmount,
            usdValue: usdValue
          };
        });

        // Calculate total balance from all holdings
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
    };

    fetchHoldings();
    
    // Update every 30 seconds for real-time prices
    const interval = setInterval(fetchHoldings, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <main className="p-6 -mt-4">
        <div className="max-w-7xl mx-auto">
          {/* Balance Header Tab */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <i className="ri-wallet-3-line text-white text-lg"></i>
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Portfolio Balance</h2>
                  {loading ? (
                    <div className="h-8 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mt-1"></div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => navigate('/deposit')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-arrow-down-line"></i>
                  <span>Deposit</span>
                </button>
                <button 
                  onClick={() => navigate('/withdraw')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-arrow-up-line"></i>
                  <span>Withdraw</span>
                </button>
                <button 
                  onClick={() => navigate('/transfer')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-exchange-line"></i>
                  <span>Transfer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Coin Holdings Table */}
            <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Holdings</h3>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">In orders</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Equivalent USD</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                      [...Array(4)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      holdings.map((coin) => (
                        <tr key={coin.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 ${coin.color} rounded-full flex items-center justify-center overflow-hidden`}>
                                <img 
                                  src={coin.logo} 
                                  alt={coin.name}
                                  className="w-6 h-6 object-contain"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `<i class="ri-currency-line text-white text-sm"></i>`;
                                    }
                                  }}
                                />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{coin.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{coin.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {coin.amount.toFixed(8)} {coin.symbol}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {coin.inOrders} {coin.symbol}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              ${coin.usdValue.toFixed(2)} USD
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => navigate('/deposit')}
                                className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap cursor-pointer"
                              >
                                Deposit
                              </button>
                              <button 
                                onClick={() => navigate('/withdraw')}
                                className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap cursor-pointer"
                              >
                                Withdraw
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Profile and Stats Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Market Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Market Overview</h3>
                <CoinTable />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

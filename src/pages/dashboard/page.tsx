import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/feature/Header';
import CoinTable from '../../components/feature/CoinTable';
import Card from '../../components/base/Card';

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

interface Transaction {
  id: string;
  transaction_type: string;
  coin_symbol: string;
  amount: number;
  created_at: string;
}

interface PortfolioData {
  coin_symbol: string;
  amount: number;
}

interface WalletData {
  coin_symbol: string;
  balance: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActivity, setHasActivity] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [showKycBanner, setShowKycBanner] = useState(true);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      if (!user) return;

      // Fetch portfolios
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id);

      if (portfolioError) throw portfolioError;

      // Fetch transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionError) throw transactionError;

      // Fetch wallets with correct column name
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('id, currency, balance, created_at, updated_at')
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Set data
      setTransactions(transactionData || []);
      setPortfolioData(portfolioData || []);
      setHasActivity((transactionData?.length || 0) > 0 || (portfolioData?.length || 0) > 0);

      if (walletData && walletData.length > 0) {
        // Calculate total balance (simplified - you may want to fetch real prices)
        const total = walletData.reduce((sum, wallet) => sum + wallet.balance, 0);
        setTotalBalance(total);
        setAvailableBalance(total);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setTransactions([]);
      setTotalBalance(0);
      setAvailableBalance(0);
      setPortfolioData([]);
      setHasActivity(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
      
      // Update every 30 seconds
      const interval = setInterval(() => {
        fetchUserData();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2
    }).format(price);
  };

  const formatTransactionTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  // Check if KYC is not completed
  const shouldShowKycBanner = kycStatus !== 'approved' && showKycBanner;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* KYC Reminder Banner */}
          {shouldShowKycBanner && (
            <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-l-4 border-orange-500 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-shield-check-line text-white text-xl"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Complete Your KYC Verification
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {kycStatus === 'pending' 
                        ? 'Your KYC verification is under review. We\'ll notify you once it\'s approved.'
                        : kycStatus === 'rejected'
                        ? 'Your KYC verification was not approved. Please resubmit your documents.'
                        : 'Verify your identity to unlock full trading features, higher limits, and enhanced security for your account.'
                      }
                    </p>
                    {kycStatus !== 'pending' && (
                      <button
                        onClick={() => navigate('/account-settings')}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap inline-flex items-center space-x-2"
                      >
                        <i className="ri-shield-check-line"></i>
                        <span>{kycStatus === 'rejected' ? 'Resubmit KYC' : 'Verify Now'}</span>
                      </button>
                    )}
                    {kycStatus === 'pending' && (
                      <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg">
                        <i className="ri-time-line text-blue-600 dark:text-blue-400"></i>
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Verification in Progress</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowKycBanner(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 cursor-pointer ml-2"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.user_metadata?.full_name || 'Trader'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {hasActivity 
                ? "Here's what's happening with your crypto portfolio today."
                : "Ready to start your crypto trading journey? Your account is set up and ready to go!"
              }
            </p>
          </div>

          {/* Balance Cards */}
          <div className="mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Est total value</span>
                <i className="ri-wallet-3-line text-2xl"></i>
              </div>
              <div className="text-3xl font-bold mb-1">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button 
              onClick={() => navigate('/deposit')}
              className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer border border-blue-200 dark:border-blue-700"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="ri-download-line text-2xl text-white"></i>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Deposit Funds</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add crypto to wallet</p>
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
                <p className="font-semibold text-gray-900 dark:text-white">Internal Transfer</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Send to other users</p>
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
                <p className="font-semibold text-gray-900 dark:text-white">Withdraw Funds</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Send crypto out</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/history')}
              className="flex items-center space-x-4 p-4 bg-gradient-to-r from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-800/20 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer border border-amber-200 dark:border-orange-700"
            >
              <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center">
                <i className="ri-history-line text-2xl text-white"></i>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">Transaction History</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">View all transactions</p>
              </div>
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                {hasActivity && (
                  <button 
                    onClick={() => navigate('/history')}
                    className="text-blue-600 dark:text-blue-400 text-sm hover:underline cursor-pointer whitespace-nowrap"
                  >
                    View All
                  </button>
                )}
              </div>
              <div className="p-6">
                {!hasActivity ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-history-line text-2xl text-gray-400"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Activity Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Your transaction history will appear here once you start trading.
                    </p>
                    <button
                      onClick={() => navigate('/deposit')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Make Your First Deposit
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          transaction.transaction_type === 'buy' 
                            ? 'bg-green-100 dark:bg-green-900/30' 
                            : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                          <i className={`${
                            transaction.transaction_type === 'buy' 
                              ? 'ri-arrow-down-line text-green-600 dark:text-green-400' 
                              : 'ri-arrow-up-line text-red-600 dark:text-red-400'
                          }`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {transaction.transaction_type}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {transaction.amount} {transaction.coin_symbol.toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatTransactionTime(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Market Overview Sidebar */}
            <div className="lg:col-span-4">
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

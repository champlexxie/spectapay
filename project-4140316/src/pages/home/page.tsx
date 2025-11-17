import { useNavigate } from 'react-router-dom';
import Header from '../../components/feature/Header';
import WalletOverview from '../../components/feature/WalletOverview';
import BalanceCard from '../../components/feature/BalanceCard';
import ProfileCard from '../../components/feature/ProfileCard';
import CoinTable from '../../components/feature/CoinTable';

export default function HomePage() {
  const navigate = useNavigate();

  const handleDeposit = () => {
    navigate('/deposit');
  };

  const handleWithdraw = () => {
    navigate('/withdraw');
  };

  const handleTransfer = () => {
    navigate('/transfer');
  };

  const handleHistory = () => {
    navigate('/history');
  };

  const handleAccountSettings = () => {
    navigate('/account-settings');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      {/* Wallet Overview Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="ri-wallet-3-line text-2xl text-white"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Wallet overview</h1>
                <p className="text-purple-100">Manage your digital assets</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handleDeposit}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-download-line"></i>
                <span>Deposit</span>
              </button>
              <button 
                onClick={handleWithdraw}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-upload-line"></i>
                <span>Withdraw</span>
              </button>
              <button 
                onClick={handleTransfer}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-exchange-line"></i>
                <span>Transfer</span>
              </button>
              <button 
                onClick={handleHistory}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-history-line"></i>
                <span>History</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="p-6 -mt-4">
        <div className="max-w-7xl mx-auto">
          {/* Balance Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            <BalanceCard />
            <ProfileCard />
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
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                            <i className="ri-currency-line text-white text-sm"></i>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Bitcoin</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">BTC</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">0.00545134 BTC</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">0 BTC</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">$521.36 USD</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleDeposit}
                            className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap cursor-pointer"
                          >
                            Deposit
                          </button>
                          <button 
                            onClick={handleWithdraw}
                            className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap cursor-pointer"
                          >
                            Withdraw
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <i className="ri-currency-line text-white text-sm"></i>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Ethereum</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">ETH</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">0 ETH</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">0 ETH</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">0.0 USD</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleDeposit}
                            className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap cursor-pointer"
                          >
                            Deposit
                          </button>
                          <button 
                            onClick={handleWithdraw}
                            className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap cursor-pointer"
                          >
                            Withdraw
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <i className="ri-currency-line text-white text-sm"></i>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Litecoin</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">LTC</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">0 LTC</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">0 LTC</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">0.0 USD</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleDeposit}
                            className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap cursor-pointer"
                          >
                            Deposit
                          </button>
                          <button 
                            onClick={handleWithdraw}
                            className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap cursor-pointer"
                          >
                            Withdraw
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                            <i className="ri-currency-line text-white text-sm"></i>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Tether</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">USDT</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">1575.0451678 USDT</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">0 USDT</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">1575.05 USD</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            onClick={handleDeposit}
                            className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap cursor-pointer"
                          >
                            Deposit
                          </button>
                          <button 
                            onClick={handleWithdraw}
                            className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap cursor-pointer"
                          >
                            Withdraw
                          </button>
                        </div>
                      </td>
                    </tr>
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

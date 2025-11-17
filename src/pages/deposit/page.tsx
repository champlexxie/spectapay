import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../../components/feature/Header';

interface Coin {
  symbol: string;
  name: string;
  icon: string;
  color: string;
}

const availableCoins: Coin[] = [
  { symbol: 'BTC', name: 'Bitcoin', icon: 'ri-bit-coin-line', color: 'text-orange-500' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'ri-currency-line', color: 'text-purple-500' },
  { symbol: 'USDT', name: 'Tether', icon: 'ri-currency-line', color: 'text-teal-500' },
  { symbol: 'BNB', name: 'BNB', icon: 'ri-currency-line', color: 'text-yellow-500' },
  { symbol: 'XRP', name: 'XRP', icon: 'ri-currency-line', color: 'text-blue-500' },
  { symbol: 'ADA', name: 'Cardano', icon: 'ri-currency-line', color: 'text-blue-600' },
  { symbol: 'SOL', name: 'Solana', icon: 'ri-currency-line', color: 'text-purple-600' },
  { symbol: 'DOGE', name: 'Dogecoin', icon: 'ri-currency-line', color: 'text-yellow-600' },
  { symbol: 'DOT', name: 'Polkadot', icon: 'ri-currency-line', color: 'text-pink-500' },
  { symbol: 'LTC', name: 'Litecoin', icon: 'ri-currency-line', color: 'text-gray-500' },
];

export default function DepositPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [selectedCoin, setSelectedCoin] = useState<Coin>(availableCoins[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [depositAddress] = useState('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
  const [amount, setAmount] = useState('');

  const handleCoinSelect = (coin: Coin) => {
    setSelectedCoin(coin);
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="ri-download-line text-2xl text-white"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Deposit Crypto</h1>
                <p className="text-purple-100">Add funds to your account</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => navigate('/deposit')}
                className="px-4 py-2 bg-white/30 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-download-line"></i>
                <span>Deposit</span>
              </button>
              <button 
                onClick={() => navigate('/withdraw')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-upload-line"></i>
                <span>Withdraw</span>
              </button>
              <button 
                onClick={() => navigate('/transfer')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
              >
                <i className="ri-exchange-line"></i>
                <span>Transfer</span>
              </button>
              <button 
                onClick={() => navigate('/history')}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="space-y-6">
                  {/* Step 1: Select Coin */}
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Select Coin
                      </h3>
                    </div>
                    
                    <div className="relative">
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full p-3 border rounded-lg flex items-center justify-between transition-colors ${
                          isDark 
                            ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500' 
                            : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center">
                          <i className={`${selectedCoin.icon} text-xl mr-3 ${selectedCoin.color}`}></i>
                          <span>{selectedCoin.name} ({selectedCoin.symbol})</span>
                        </div>
                        <i className={`ri-arrow-down-s-line transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                      </button>
                      
                      {isDropdownOpen && (
                        <div className={`absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto ${
                          isDark 
                            ? 'border-gray-600 bg-gray-700' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          {availableCoins.map((coin) => (
                            <button
                              key={coin.symbol}
                              onClick={() => handleCoinSelect(coin)}
                              className={`w-full p-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                                selectedCoin.symbol === coin.symbol 
                                  ? 'bg-purple-50 dark:bg-purple-900/30' 
                                  : ''
                              }`}
                            >
                              <i className={`${coin.icon} text-xl mr-3 ${coin.color}`}></i>
                              <span className={isDark ? 'text-white' : 'text-gray-900'}>
                                {coin.name} ({coin.symbol})
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Deposit Address */}
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Deposit Address
                      </h3>
                    </div>
                    
                    <div className={`p-4 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {selectedCoin.symbol} Address
                        </span>
                        <button className="text-purple-600 hover:text-purple-700 text-sm flex items-center space-x-1">
                          <i className="ri-file-copy-line"></i>
                          <span>Copy</span>
                        </button>
                      </div>
                      <div className={`font-mono text-sm p-2 rounded ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'}`}>
                        {depositAddress}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Amount (Optional) */}
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Amount (Optional)
                      </h3>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Enter ${selectedCoin.symbol} amount`}
                        className={`w-full p-3 border rounded-lg transition-colors ${
                          isDark 
                            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {selectedCoin.symbol}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Generate QR Code Button */}
                  <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 font-medium whitespace-nowrap cursor-pointer">
                    Generate QR Code
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Important Information */}
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Important Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mt-0.5">
                      <i className="ri-information-line text-yellow-600 dark:text-yellow-400 text-sm"></i>
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Network Verification
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Please ensure you're sending {selectedCoin.symbol} on the correct network to avoid loss of funds.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5">
                      <i className="ri-time-line text-blue-600 dark:text-blue-400 text-sm"></i>
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Processing Time
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Deposits are credited after network confirmations. {selectedCoin.symbol} requires 2-6 confirmations.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5">
                      <i className="ri-shield-check-line text-green-600 dark:text-green-400 text-sm"></i>
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Security Notice
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        This address is unique to your account. Do not share it with others for security reasons.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Minimum Deposit */}
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Deposit Limits
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Minimum Deposit
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      0.0001 {selectedCoin.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Network Fee
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Paid by sender
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Expected Arrival
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      2-30 minutes
                    </span>
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

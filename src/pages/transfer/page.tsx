import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../../components/feature/Header';

interface Coin {
  symbol: string;
  name: string;
  icon: string;
  color: string;
  balance: number;
}

const availableCoins: Coin[] = [
  { symbol: 'BTC', name: 'Bitcoin', icon: 'ri-bit-coin-line', color: 'text-orange-500', balance: 0.00545134 },
  { symbol: 'ETH', name: 'Ethereum', icon: 'ri-currency-line', color: 'text-purple-500', balance: 2.5 },
  { symbol: 'USDT', name: 'Tether', icon: 'ri-currency-line', color: 'text-teal-500', balance: 1575.05 },
  { symbol: 'BNB', name: 'BNB', icon: 'ri-currency-line', color: 'text-yellow-500', balance: 0 },
  { symbol: 'XRP', name: 'XRP', icon: 'ri-currency-line', color: 'text-blue-500', balance: 0 },
  { symbol: 'ADA', name: 'Cardano', icon: 'ri-currency-line', color: 'text-blue-600', balance: 1500 },
  { symbol: 'SOL', name: 'Solana', icon: 'ri-currency-line', color: 'text-purple-600', balance: 25 },
  { symbol: 'DOGE', name: 'Dogecoin', icon: 'ri-currency-line', color: 'text-yellow-600', balance: 0 },
  { symbol: 'DOT', name: 'Polkadot', icon: 'ri-currency-line', color: 'text-pink-500', balance: 0 },
  { symbol: 'LTC', name: 'Litecoin', icon: 'ri-currency-line', color: 'text-gray-500', balance: 0 },
];

export default function TransferPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [selectedCoin, setSelectedCoin] = useState<Coin>(availableCoins[0]);
  const [isCoinDropdownOpen, setIsCoinDropdownOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const handleCoinSelect = (coin: Coin) => {
    setSelectedCoin(coin);
    setIsCoinDropdownOpen(false);
  };

  const handleMaxAmount = () => {
    setAmount(selectedCoin.balance.toString());
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
                <i className="ri-exchange-line text-2xl text-white"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Internal Transfer</h1>
                <p className="text-purple-100">Send funds to another SPECTORX user</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => navigate('/deposit')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
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
                className="px-4 py-2 bg-white/30 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
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
                        onClick={() => setIsCoinDropdownOpen(!isCoinDropdownOpen)}
                        className={`w-full p-3 border rounded-lg flex items-center justify-between transition-colors ${
                          isDark 
                            ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500' 
                            : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center">
                          <i className={`${selectedCoin.icon} text-xl mr-3 ${selectedCoin.color}`}></i>
                          <div className="text-left">
                            <div>{selectedCoin.name} ({selectedCoin.symbol})</div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              Available: {selectedCoin.balance} {selectedCoin.symbol}
                            </div>
                          </div>
                        </div>
                        <i className={`ri-arrow-down-s-line transition-transform ${isCoinDropdownOpen ? 'rotate-180' : ''}`}></i>
                      </button>
                      
                      {isCoinDropdownOpen && (
                        <div className={`absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto ${
                          isDark 
                            ? 'border-gray-600 bg-gray-700' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          {availableCoins.map((coin) => (
                            <button
                              key={coin.symbol}
                              onClick={() => handleCoinSelect(coin)}
                              className={`w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                                selectedCoin.symbol === coin.symbol 
                                  ? 'bg-purple-50 dark:bg-purple-900/30' 
                                  : ''
                              }`}
                            >
                              <div className="flex items-center">
                                <i className={`${coin.icon} text-xl mr-3 ${coin.color}`}></i>
                                <div className="text-left">
                                  <div className={isDark ? 'text-white' : 'text-gray-900'}>
                                    {coin.name} ({coin.symbol})
                                  </div>
                                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Available: {coin.balance} {coin.symbol}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Enter Recipient */}
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Enter Recipient
                      </h3>
                    </div>
                    
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="Email, crypto address, or account ID"
                      className={`w-full p-3 border rounded-lg transition-colors ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                    
                    <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      You can send to any registered SPECTORX user using their email address or account ID.
                    </div>
                  </div>

                  {/* Step 3: Set Amount */}
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Set Amount
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
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
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                          <button
                            onClick={handleMaxAmount}
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium whitespace-nowrap cursor-pointer"
                          >
                            All
                          </button>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {selectedCoin.symbol}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          Available: {selectedCoin.balance} {selectedCoin.symbol}
                        </span>
                        <span className="text-green-500 font-medium">
                          Fee: Free
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Transfer Summary */}
                  {recipient && amount && (
                    <div className={`p-4 rounded-lg border ${
                      isDark 
                        ? 'border-purple-600/30 bg-purple-900/20' 
                        : 'border-purple-200 bg-purple-50'
                    }`}>
                      <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Transfer Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>To:</span>
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>{recipient}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Amount:</span>
                          <span className={isDark ? 'text-white' : 'text-gray-900'}>{amount} {selectedCoin.symbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Transfer Fee:</span>
                          <span className="text-green-500 font-medium">Free</span>
                        </div>
                        <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Total:</span>
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{amount} {selectedCoin.symbol}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    disabled={!recipient || !amount}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium whitespace-nowrap cursor-pointer"
                  >
                    Send Transfer
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Transfer Info */}
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Transfer Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5">
                      <i className="ri-flash-line text-green-600 dark:text-green-400 text-sm"></i>
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Instant Transfer
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Internal transfers are processed instantly within the SPECTORX platform.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5">
                      <i className="ri-shield-check-line text-blue-600 dark:text-blue-400 text-sm"></i>
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        No Network Fees
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Internal transfers don't use the blockchain, so there are no network fees.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mt-0.5">
                      <i className="ri-user-check-line text-purple-600 dark:text-purple-400 text-sm"></i>
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Verified Users Only
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        You can only transfer to verified SPECTORX users for security.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transfer Limits */}
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Transfer Limits
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Daily Limit
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      $10,000 USD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Monthly Limit
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      $100,000 USD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Minimum Transfer
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      $1 USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Need Help?
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 transition-colors whitespace-nowrap cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <i className="ri-question-line text-purple-600"></i>
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Transfer FAQ
                      </span>
                    </div>
                  </button>
                  
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 transition-colors whitespace-nowrap cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <i className="ri-customer-service-line text-purple-600"></i>
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Contact Support
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

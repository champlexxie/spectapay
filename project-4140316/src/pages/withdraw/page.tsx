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

interface Network {
  name: string;
  fee: string;
  minimum: string;
  confirmations: number;
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

const networkOptions: { [key: string]: Network[] } = {
  BTC: [
    { name: 'Bitcoin Network', fee: '0.0005 BTC', minimum: '0.001 BTC', confirmations: 2 }
  ],
  ETH: [
    { name: 'Ethereum (ERC20)', fee: '0.005 ETH', minimum: '0.01 ETH', confirmations: 12 },
    { name: 'Binance Smart Chain (BEP20)', fee: '0.001 ETH', minimum: '0.005 ETH', confirmations: 15 }
  ],
  USDT: [
    { name: 'Ethereum (ERC20)', fee: '5 USDT', minimum: '10 USDT', confirmations: 12 },
    { name: 'Tron (TRC20)', fee: '1 USDT', minimum: '5 USDT', confirmations: 20 },
    { name: 'Binance Smart Chain (BEP20)', fee: '0.5 USDT', minimum: '5 USDT', confirmations: 15 }
  ]
};

export default function WithdrawPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [selectedCoin, setSelectedCoin] = useState<Coin>(availableCoins[0]);
  const [isCoinDropdownOpen, setIsCoinDropdownOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  const handleCoinSelect = (coin: Coin) => {
    setSelectedCoin(coin);
    setIsCoinDropdownOpen(false);
    setSelectedNetwork(null);
    if (networkOptions[coin.symbol]?.length === 1) {
      setSelectedNetwork(networkOptions[coin.symbol][0]);
    }
  };

  const handleNetworkSelect = (network: Network) => {
    setSelectedNetwork(network);
    setIsNetworkDropdownOpen(false);
  };

  const handleMaxAmount = () => {
    if (selectedNetwork) {
      const fee = parseFloat(selectedNetwork.fee.split(' ')[0]);
      const maxAmount = Math.max(0, selectedCoin.balance - fee);
      setAmount(maxAmount.toString());
    } else {
      setAmount(selectedCoin.balance.toString());
    }
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
                <i className="ri-upload-line text-2xl text-white"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Withdraw Crypto</h1>
                <p className="text-purple-100">Send funds from your account</p>
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
                className="px-4 py-2 bg-white/30 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
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

                  {/* Step 2: Select Network */}
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Select Network
                      </h3>
                    </div>
                    
                    {networkOptions[selectedCoin.symbol] ? (
                      <div className="relative">
                        <button
                          onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
                          disabled={networkOptions[selectedCoin.symbol].length === 1}
                          className={`w-full p-3 border rounded-lg flex items-center justify-between transition-colors ${
                            isDark 
                              ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500' 
                              : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                          } ${networkOptions[selectedCoin.symbol].length === 1 ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                        >
                          <div className="text-left">
                            {selectedNetwork ? (
                              <>
                                <div>{selectedNetwork.name}</div>
                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Fee: {selectedNetwork.fee} • Min: {selectedNetwork.minimum}
                                </div>
                              </>
                            ) : (
                              <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                Select network
                              </div>
                            )}
                          </div>
                          {networkOptions[selectedCoin.symbol].length > 1 && (
                            <i className={`ri-arrow-down-s-line transition-transform ${isNetworkDropdownOpen ? 'rotate-180' : ''}`}></i>
                          )}
                        </button>
                        
                        {isNetworkDropdownOpen && networkOptions[selectedCoin.symbol].length > 1 && (
                          <div className={`absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-10 ${
                            isDark 
                              ? 'border-gray-600 bg-gray-700' 
                              : 'border-gray-300 bg-white'
                          }`}>
                            {networkOptions[selectedCoin.symbol].map((network, index) => (
                              <button
                                key={index}
                                onClick={() => handleNetworkSelect(network)}
                                className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                                  selectedNetwork?.name === network.name 
                                    ? 'bg-purple-50 dark:bg-purple-900/30' 
                                    : ''
                                }`}
                              >
                                <div className={isDark ? 'text-white' : 'text-gray-900'}>
                                  {network.name}
                                </div>
                                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Fee: {network.fee} • Min: {network.minimum} • {network.confirmations} confirmations
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`p-3 border rounded-lg text-center ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-gray-400' 
                          : 'border-gray-300 bg-gray-50 text-gray-500'
                      }`}>
                        Network options not available for {selectedCoin.symbol}
                      </div>
                    )}
                  </div>

                  {/* Step 3: Address */}
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Address
                      </h3>
                    </div>
                    
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={`Enter ${selectedCoin.symbol} address`}
                      className={`w-full p-3 border rounded-lg transition-colors ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                  </div>

                  {/* Step 4: Amount */}
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Amount
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
                        {selectedNetwork && (
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            Fee: {selectedNetwork.fee}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    disabled={!selectedNetwork || !address || !amount}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium whitespace-nowrap cursor-pointer"
                  >
                    Withdraw {selectedCoin.symbol}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* ... existing code ... */}
              {/* FAQ */}
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Withdrawal FAQ
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Why verify the withdrawal address?
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Wrong addresses can result in permanent loss of funds. Always double-check before confirming.
                    </div>
                  </div>
                  
                  <div>
                    <div className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      How long does processing take?
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Most withdrawals are processed within 10-30 minutes, depending on network congestion.
                    </div>
                  </div>
                  
                  <div>
                    <div className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Can I cancel a withdrawal?
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Withdrawals can only be cancelled before they're broadcast to the blockchain.
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Security Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mt-0.5">
                      <i className="ri-error-warning-line text-red-600 dark:text-red-400 text-sm"></i>
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Do not send to non-{selectedCoin.symbol} addresses. Funds sent to incorrect addresses cannot be recovered.
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5">
                      <i className="ri-shield-check-line text-blue-600 dark:text-blue-400 text-sm"></i>
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      All withdrawals require email confirmation for security.
                    </div>
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

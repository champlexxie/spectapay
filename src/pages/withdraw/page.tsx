import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../../components/feature/Header';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Coin {
  symbol: string;
  name: string;
  icon: string;
  color: string;
  balance: number;
  logo: string;
}

const availableCoins: Omit<Coin, 'balance'>[] = [
  { 
    symbol: 'BTC', 
    name: 'Bitcoin', 
    icon: 'ri-bit-coin-line', 
    color: 'text-orange-500',
    logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png'
  },
  { 
    symbol: 'USDT', 
    name: 'Tether USD', 
    icon: 'ri-currency-line', 
    color: 'text-green-500',
    logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
  },
  { 
    symbol: 'ETH', 
    name: 'Ethereum', 
    icon: 'ri-currency-line', 
    color: 'text-blue-500',
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png'
  },
  { 
    symbol: 'BNB', 
    name: 'Binance Coin', 
    icon: 'ri-currency-line', 
    color: 'text-yellow-500',
    logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png'
  },
];

export default function WithdrawPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [coins, setCoins] = useState<Coin[]>(() => {
    // Initialize with all 4 coins with zero balance
    return availableCoins.map(coin => ({
      ...coin,
      balance: 0
    }));
  });
  const [selectedCoin, setSelectedCoin] = useState<Coin>(() => {
    // Initialize with first coin
    return {
      ...availableCoins[0],
      balance: 0
    };
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [logoError, setLogoError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPortfolio();
  }, [user]);

  const fetchPortfolio = async () => {
    try {
      if (!user) {
        // Set coins with zero balance when no user
        const coinsWithZeroBalance = availableCoins.map(coin => ({
          ...coin,
          balance: 0
        }));
        setCoins(coinsWithZeroBalance);
        setSelectedCoin(coinsWithZeroBalance[0]);
        return;
      }

      // Fetch all coin balances directly from database
      const { data: balances, error } = await supabase
        .from('wallets')
        .select('currency, balance')
        .eq('user_id', user.id);

      if (error) throw error;

      // Create a map of balances
      const balanceMap = new Map(
        (balances || []).map(b => [b.currency.toUpperCase(), b.balance])
      );

      // Merge available coins with actual balances
      const coinsWithBalance = availableCoins.map(coin => ({
        ...coin,
        balance: balanceMap.get(coin.symbol) || 0
      }));

      setCoins(coinsWithBalance);
      setSelectedCoin(coinsWithBalance[0]);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      // Set coins with zero balance on error
      const coinsWithZeroBalance = availableCoins.map(coin => ({
        ...coin,
        balance: 0
      }));
      setCoins(coinsWithZeroBalance);
      setSelectedCoin(coinsWithZeroBalance[0]);
    }
  };

  const handleCoinSelect = (coin: Coin) => {
    setSelectedCoin(coin);
    setIsDropdownOpen(false);
    setAmount(''); // Reset amount when changing coin
  };

  const handleMaxClick = () => {
    if (selectedCoin) {
      setAmount(selectedCoin.balance.toString());
    }
  };

  const handleWithdraw = async () => {
    if (!selectedCoin || !amount || !address) {
      alert('Please fill in all fields');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > selectedCoin.balance) {
      alert(`Insufficient balance. You have ${selectedCoin.balance} ${selectedCoin.symbol}`);
      return;
    }

    if (!user) {
      alert('Please log in to withdraw');
      return;
    }

    setWithdrawing(true);

    // Simulate withdrawal processing
    setTimeout(() => {
      alert(`Withdrawal request submitted!\n\nAmount: ${withdrawAmount} ${selectedCoin.symbol}\nTo: ${address}\n\nYour withdrawal is being processed and will be completed shortly.`);
      setAmount('');
      setAddress('');
      setWithdrawing(false);
    }, 1500);
  };

  const handleLogoError = (symbol: string) => {
    setLogoError(prev => ({ ...prev, [symbol]: true }));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-upload-line text-2xl text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Withdraw Crypto</h1>
              <p className="text-purple-100">Send funds from your account</p>
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
                        className={`w-full p-3 border rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                          isDark 
                            ? 'border-gray-600 bg-gray-700 text-white hover:border-gray-500' 
                            : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${selectedCoin?.color.replace('text-', 'bg-').replace('-500', '-100')} dark:${selectedCoin?.color.replace('text-', 'bg-').replace('-500', '-900/30')}`}>
                              {selectedCoin && !logoError[selectedCoin.symbol] ? (
                                <img 
                                  src={selectedCoin.logo} 
                                  alt={selectedCoin.name}
                                  className="w-6 h-6"
                                  onError={() => handleLogoError(selectedCoin.symbol)}
                                />
                              ) : (
                                <i className={`${selectedCoin?.icon} text-xl ${selectedCoin?.color}`}></i>
                              )}
                            </div>
                            <span>{selectedCoin?.name} ({selectedCoin?.symbol})</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-sm text-gray-500">
                              Available: {selectedCoin?.balance.toFixed(8)} {selectedCoin?.symbol}
                            </div>
                            <i className={`ri-arrow-down-s-line transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                          </div>
                        </div>
                      </button>
                      
                      {isDropdownOpen && (
                        <div className={`absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto ${
                          isDark 
                            ? 'border-gray-600 bg-gray-700' 
                            : 'border-gray-300 bg-white'
                        }`}>
                          {coins.map((coin) => (
                            <button
                              key={coin.symbol}
                              onClick={() => handleCoinSelect(coin)}
                              className={`w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer ${
                                selectedCoin?.symbol === coin.symbol 
                                  ? 'bg-purple-50 dark:bg-purple-900/30' 
                                  : ''
                              }`}
                            >
                              <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${coin.color.replace('text-', 'bg-').replace('-500', '-100')} dark:${coin.color.replace('text-', 'bg-').replace('-500', '-900/30')}`}>
                                  {!logoError[coin.symbol] ? (
                                    <img 
                                      src={coin.logo} 
                                      alt={coin.name}
                                      className="w-6 h-6"
                                      onError={() => handleLogoError(coin.symbol)}
                                    />
                                  ) : (
                                    <i className={`${coin.icon} text-xl ${coin.color}`}></i>
                                  )}
                                </div>
                                <span className={isDark ? 'text-white' : 'text-gray-900'}>
                                  {coin.name} ({coin.symbol})
                                </span>
                              </div>
                              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {coin.balance.toFixed(8)}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Withdrawal Address */}
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Withdrawal Address
                      </h3>
                    </div>
                    
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={`Enter ${selectedCoin?.symbol || 'crypto'} address`}
                      className={`w-full p-3 border rounded-lg transition-colors ${
                        isDark 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                  </div>

                  {/* Step 3: Amount */}
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Amount
                      </h3>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Enter ${selectedCoin?.symbol || 'crypto'} amount`}
                        className={`w-full p-3 pr-20 border rounded-lg transition-colors ${
                          isDark 
                            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      <button
                        onClick={handleMaxClick}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors cursor-pointer whitespace-nowrap"
                      >
                        MAX
                      </button>
                    </div>
                    <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Available: {selectedCoin?.balance.toFixed(8) || '0.00000000'} {selectedCoin?.symbol || 'crypto'}
                    </div>
                  </div>

                  {/* Withdraw Button */}
                  <button 
                    onClick={handleWithdraw}
                    disabled={withdrawing}
                    className={`w-full py-3 rounded-lg transition-colors duration-200 font-medium whitespace-nowrap cursor-pointer ${
                      withdrawing 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    } text-white`}
                  >
                    {withdrawing ? 'Processing...' : `Withdraw ${selectedCoin?.symbol || 'Crypto'}`}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
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
                      Do not send to non-{selectedCoin?.symbol || 'crypto'} addresses. Funds sent to incorrect addresses cannot be recovered.
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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/feature/Header';

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

export default function TransferPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  // Initialize coins with zero balance immediately
  const [coins, setCoins] = useState<Coin[]>(() => 
    availableCoins.map(coin => ({ ...coin, balance: 0 }))
  );
  
  // Set default selected coin to first coin (Bitcoin)
  const [selectedCoin, setSelectedCoin] = useState<Coin>(() => ({
    ...availableCoins[0],
    balance: 0
  }));
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [transferType, setTransferType] = useState<'email' | 'userId'>('email');
  const [transferring, setTransferring] = useState(false);
  const [logoError, setLogoError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPortfolio();
  }, [user]);

  // Update selectedCoin when coins array changes
  useEffect(() => {
    if (coins.length > 0) {
      const currentSelected = coins.find(c => c.symbol === selectedCoin?.symbol);
      if (currentSelected) {
        setSelectedCoin(currentSelected);
      }
    }
  }, [coins]);

  const fetchPortfolio = async () => {
    try {
      if (!user) {
        return; // Keep the initialized zero balance coins
      }

      const { data, error } = await supabase
        .from('portfolios')
        .select('coin_symbol, amount')
        .eq('user_id', user.id);

      if (error) throw error;

      // Create a map of balances from portfolio
      const balanceMap = new Map(
        data?.map(item => [item.coin_symbol, item.amount]) || []
      );

      // Merge available coins with actual balances
      const coinsWithBalance = availableCoins.map(coin => ({
        ...coin,
        balance: balanceMap.get(coin.symbol) || 0
      }));

      setCoins(coinsWithBalance);
      
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      // Keep the initialized zero balance coins on error
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

  const handleTransfer = async () => {
    if (!selectedCoin || !amount || !recipient || !user) {
      alert('Please fill in all fields');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (transferAmount > selectedCoin.balance) {
      alert(`Insufficient balance. You have ${selectedCoin.balance} ${selectedCoin.symbol}`);
      return;
    }

    try {
      setTransferring(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please sign in to transfer');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/internal-transfer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            recipientEmail: transferType === 'email' ? recipient : undefined,
            recipientUserId: transferType === 'userId' ? recipient : undefined,
            coinSymbol: selectedCoin.symbol,
            amount: transferAmount,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Transfer failed');
      }

      alert(`Successfully transferred ${transferAmount} ${selectedCoin.symbol} to ${recipient}`);
      
      // Reset form and refresh portfolio
      setAmount('');
      setRecipient('');
      await fetchPortfolio();
      
    } catch (error: any) {
      console.error('Transfer error:', error);
      alert(error.message || 'Transfer failed. Please try again.');
    } finally {
      setTransferring(false);
    }
  };

  const handleLogoError = (symbol: string) => {
    setLogoError(prev => ({ ...prev, [symbol]: true }));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-exchange-line text-2xl text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Internal Transfer</h1>
              <p className="text-purple-100">Send funds to another SPECTAPAY user</p>
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

                  {/* Step 2: Recipient */}
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Recipient
                      </h3>
                    </div>
                    
                    {/* Transfer Type Selector */}
                    <div className="flex space-x-2 mb-3">
                      <button
                        onClick={() => setTransferType('email')}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                          transferType === 'email'
                            ? 'bg-purple-600 text-white'
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Email Address
                      </button>
                      <button
                        onClick={() => setTransferType('userId')}
                        className={`flex-1 px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                          transferType === 'userId'
                            ? 'bg-purple-600 text-white'
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        User ID
                      </button>
                    </div>

                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder={transferType === 'email' ? 'Enter recipient email' : 'Enter recipient user ID'}
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
                        placeholder={`Enter ${selectedCoin?.symbol} amount`}
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
                      Available: {selectedCoin?.balance.toFixed(8)} {selectedCoin?.symbol}
                    </div>
                  </div>

                  {/* Transfer Button */}
                  <button 
                    onClick={handleTransfer}
                    disabled={transferring}
                    className={`w-full py-3 rounded-lg transition-colors duration-200 font-medium whitespace-nowrap cursor-pointer ${
                      transferring
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {transferring ? (
                      <span className="flex items-center justify-center">
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Processing...
                      </span>
                    ) : (
                      `Transfer ${selectedCoin?.symbol}`
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
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
                        Internal transfers are processed instantly within the SPECTAPAY platform.
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
                        Multiple Transfer Methods
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Transfer using email address or unique user ID for added convenience.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Transfer Limits
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Maximum Transfer
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      No Limit
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Monthly Limit
                    </span>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      No Limit
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

              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Need Help?
                </h3>
                <div className="space-y-3">
                  <button type="button" className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 transition-colors whitespace-nowrap cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <i className="ri-question-line text-purple-600"></i>
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Transfer FAQ
                      </span>
                    </div>
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => {
                      const readdy_agent_button = document.querySelector('#vapi-widget-floating-button') as HTMLElement;
                      if (readdy_agent_button) {
                        readdy_agent_button.click();
                      }
                    }}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 transition-colors whitespace-nowrap cursor-pointer"
                  >
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

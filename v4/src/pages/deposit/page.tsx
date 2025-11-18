import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../../components/feature/Header';
import { supabase } from '../../lib/supabase';

interface Coin {
  symbol: string;
  name: string;
  icon: string;
  color: string;
  logo: string;
}

const availableCoins: Coin[] = [
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

export default function DepositPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [selectedCoin, setSelectedCoin] = useState<Coin>(availableCoins[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [depositAddress, setDepositAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [logoError, setLogoError] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    fetchDepositAddress(selectedCoin.symbol);
  }, [selectedCoin]);

  const fetchDepositAddress = async (coinSymbol: string) => {
    setLoading(true);
    setAddressError('');
    setDepositAddress('');
    
    try {
      console.log('Fetching address for:', coinSymbol);
      
      // Add a small delay to ensure proper state updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data, error } = await supabase
        .from('deposit_addresses')
        .select('wallet_address, network')
        .eq('coin_symbol', coinSymbol.toUpperCase())
        .single();

      console.log('Supabase response:', { data, error, coinSymbol });

      if (error) {
        console.error('Supabase error:', error);
        setAddressError(`${coinSymbol} address not available`);
        setDepositAddress('');
      } else if (data?.wallet_address) {
        console.log('Setting address:', data.wallet_address);
        setDepositAddress(data.wallet_address);
        setAddressError('');
      } else {
        console.log('No address found for:', coinSymbol);
        setAddressError(`${coinSymbol} address not configured`);
        setDepositAddress('');
      }
    } catch (error) {
      console.error('Error fetching deposit address:', error);
      setDepositAddress('');
      setAddressError('Failed to load address');
    } finally {
      // Ensure loading state is properly cleared
      setTimeout(() => {
        setLoading(false);
      }, 200);
    }
  };

  const handleCoinSelect = (coin: Coin) => {
    setSelectedCoin(coin);
    setIsDropdownOpen(false);
    setShowQR(false);
    setCopied(false);
  };

  const handleLogoError = (symbol: string) => {
    setLogoError(prev => ({ ...prev, [symbol]: true }));
  };

  const handleCopyAddress = () => {
    if (depositAddress && !addressError && !loading) {
      navigator.clipboard.writeText(depositAddress).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy address:', err);
      });
    }
  };

  const handleGenerateQR = () => {
    if (depositAddress && !addressError && !loading) {
      setShowQR(true);
    }
  };

  const renderAddressSection = () => {
    if (loading) {
      return (
        <div className={`font-mono text-sm p-4 rounded flex items-center justify-center min-h-[60px] ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading address...</span>
          </div>
        </div>
      );
    }

    if (addressError) {
      return (
        <div className={`font-mono text-sm p-4 rounded flex items-center min-h-[60px] ${isDark ? 'bg-red-900/20 text-red-400 border border-red-800' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          <i className="ri-error-warning-line mr-2 flex-shrink-0"></i>
          <span>{addressError}</span>
        </div>
      );
    }

    if (depositAddress) {
      return (
        <div className={`font-mono text-sm p-4 rounded break-all min-h-[60px] flex items-center ${isDark ? 'bg-gray-800 text-gray-300 border border-gray-700' : 'bg-white text-gray-700 border border-gray-200'}`}>
          <span className="w-full">{depositAddress}</span>
        </div>
      );
    }

    return (
      <div className={`font-mono text-sm p-4 rounded flex items-center min-h-[60px] ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
        <i className="ri-information-line mr-2 flex-shrink-0"></i>
        <span>No address available</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-download-line text-2xl text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Deposit Crypto</h1>
              <p className="text-purple-100">Add funds to your account</p>
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
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${selectedCoin.color.replace('text-', 'bg-').replace('-500', '-100')} dark:${selectedCoin.color.replace('text-', 'bg-').replace('-500', '-900/30')}`}>
                            {!logoError[selectedCoin.symbol] ? (
                              <img 
                                src={selectedCoin.logo} 
                                alt={selectedCoin.name}
                                className="w-6 h-6"
                                onError={() => handleLogoError(selectedCoin.symbol)}
                              />
                            ) : (
                              <i className={`${selectedCoin.icon} text-xl ${selectedCoin.color}`}></i>
                            )}
                          </div>
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
                              className={`w-full p-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer ${
                                selectedCoin.symbol === coin.symbol 
                                  ? 'bg-purple-50 dark:bg-purple-900/30' 
                                  : ''
                              }`}
                            >
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
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {selectedCoin.symbol} Address
                        </span>
                        {depositAddress && !addressError && !loading && (
                          <button 
                            onClick={handleCopyAddress}
                            className="text-purple-600 hover:text-purple-700 text-sm flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                          >
                            <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'}></i>
                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                          </button>
                        )}
                      </div>
                      {renderAddressSection()}
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
                  <button 
                    onClick={handleGenerateQR}
                    disabled={!depositAddress || !!addressError || loading}
                    className={`w-full py-3 rounded-lg transition-colors duration-200 font-medium whitespace-nowrap cursor-pointer ${
                      depositAddress && !addressError && !loading
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Loading...' : 'Generate QR Code'}
                  </button>

                  {/* QR Code Display */}
                  {showQR && depositAddress && !addressError && !loading && (
                    <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'} text-center`}>
                      <h4 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Scan QR Code
                      </h4>
                      <div className="flex justify-center mb-4">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(depositAddress)}`}
                          alt="Deposit Address QR Code"
                          className="w-48 h-48 bg-white p-2 rounded-lg"
                        />
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Scan this QR code with your wallet app
                      </p>
                    </div>
                  )}
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
                        This address is shared across all users. Only send {selectedCoin.symbol} to this address.
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

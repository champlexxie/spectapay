import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import Header from '../../components/feature/Header';

export default function SimpleTransferPage() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch user's wallet balance
  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user]);

  const fetchBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .eq('currency', 'USD')
        .single();

      if (error) {
        // If wallet doesn't exist, create one with 0 balance
        if (error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('wallets')
            .insert({
              user_id: user?.id,
              balance: 0,
              currency: 'USD'
            });
          
          if (!insertError) {
            setBalance(0);
          }
        }
      } else if (data) {
        setBalance(parseFloat(data.balance));
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientEmail || !amount) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      setMessage({ type: 'error', text: 'Amount must be greater than 0' });
      return;
    }

    if (transferAmount > balance) {
      setMessage({ type: 'error', text: 'Insufficient balance' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/transfer-money`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            recipientEmail,
            amount: transferAmount
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Transfer failed');
      }

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Transfer successful! Sent $${amount} to ${recipientEmail}` 
        });
        setRecipientEmail('');
        setAmount('');
        setBalance(result.newBalance);
      } else {
        throw new Error(result.error || 'Transfer failed');
      }
    } catch (error: any) {
      console.error('Transfer error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Transfer failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="ri-exchange-dollar-line text-2xl text-white"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Send Money</h1>
                <p className="text-purple-100">Transfer funds to another user</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-100">Your Balance</div>
              <div className="text-2xl font-bold text-white">${balance.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <main className="p-6 -mt-4">
        <div className="max-w-4xl mx-auto">
          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
            }`}>
              <div className="flex items-center space-x-2">
                <i className={`${message.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'}`}></i>
                <span>{message.text}</span>
              </div>
            </div>
          )}

          {/* Transfer Form */}
          <div className={`rounded-xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <form onSubmit={handleTransfer} className="space-y-6">
              {/* Recipient Email */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Enter recipient's email"
                  className={`w-full p-4 border rounded-lg transition-colors text-base ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Amount (USD)
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    $
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={balance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full p-4 pl-8 border rounded-lg transition-colors text-base ${
                      isDark 
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(balance.toString())}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 hover:text-purple-700 text-sm font-medium whitespace-nowrap cursor-pointer"
                  >
                    Max
                  </button>
                </div>
                <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Available: ${balance.toFixed(2)}
                </div>
              </div>

              {/* Transfer Summary */}
              {recipientEmail && amount && parseFloat(amount) > 0 && (
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
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{recipientEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Amount:</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>${parseFloat(amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Fee:</span>
                      <span className="text-green-500 font-medium">Free</span>
                    </div>
                    <div className={`flex justify-between pt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Total:</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>${parseFloat(amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!recipientEmail || !amount || isLoading || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 font-medium text-base whitespace-nowrap cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Send Money'
                )}
              </button>
            </form>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <i className="ri-flash-line text-green-600 dark:text-green-400"></i>
                </div>
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Instant Transfer
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Transfers are instant
                  </div>
                </div>
              </div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <i className="ri-shield-check-line text-blue-600 dark:text-blue-400"></i>
                </div>
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    No Fees
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    100% free transfers
                  </div>
                </div>
              </div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <i className="ri-lock-line text-purple-600 dark:text-purple-400"></i>
                </div>
                <div>
                  <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Secure
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Bank-level security
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

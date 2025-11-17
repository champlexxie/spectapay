import { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/feature/Header';

interface PortfolioHolding {
  id: string;
  user_id: string;
  coin_symbol: string;
  coin_name: string;
  amount: number;
  average_buy_price: number;
  current_price: number;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
}

export default function AdminPortfolioPage() {
  const { user } = useAuthContext();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [portfolios, setPortfolios] = useState<PortfolioHolding[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    amount: string;
    average_buy_price: string;
    current_price: string;
  }>({
    amount: '',
    average_buy_price: '',
    current_price: ''
  });

  const coins = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'BNB', name: 'Binance Coin' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserPortfolios(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('email');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUserPortfolios = async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .order('coin_symbol');

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (portfolio: PortfolioHolding) => {
    setEditingId(portfolio.id);
    setEditValues({
      amount: portfolio.amount.toString(),
      average_buy_price: portfolio.average_buy_price.toString(),
      current_price: portfolio.current_price?.toString() || '0'
    });
  };

  const handleSave = async (portfolioId: string) => {
    try {
      const { error } = await supabase
        .from('portfolios')
        .update({
          amount: parseFloat(editValues.amount),
          average_buy_price: parseFloat(editValues.average_buy_price),
          current_price: parseFloat(editValues.current_price),
          updated_at: new Date().toISOString()
        })
        .eq('id', portfolioId);

      if (error) throw error;

      setEditingId(null);
      fetchUserPortfolios(selectedUserId);
    } catch (error) {
      console.error('Error updating portfolio:', error);
      alert('Error updating portfolio');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({ amount: '', average_buy_price: '', current_price: '' });
  };

  const handleAddCoin = async (coinSymbol: string, coinName: string) => {
    if (!selectedUserId) return;

    try {
      const { error } = await supabase
        .from('portfolios')
        .insert([{
          user_id: selectedUserId,
          coin_symbol: coinSymbol,
          coin_name: coinName,
          amount: 0,
          average_buy_price: 0,
          current_price: 0
        }]);

      if (error) throw error;
      fetchUserPortfolios(selectedUserId);
    } catch (error) {
      console.error('Error adding coin:', error);
      alert('Error adding coin to portfolio');
    }
  };

  const handleDeleteCoin = async (portfolioId: string) => {
    if (!confirm('Are you sure you want to delete this coin from the portfolio?')) return;

    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);

      if (error) throw error;
      fetchUserPortfolios(selectedUserId);
    } catch (error) {
      console.error('Error deleting coin:', error);
      alert('Error deleting coin');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId || !selectedUser) return;
    
    if (!confirm(`Are you sure you want to delete user ${selectedUser.email}? This will permanently delete all their data including portfolios, transactions, transfers, and account information. This action cannot be undone.`)) return;

    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('You must be logged in to delete users');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ userId: selectedUserId })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      alert('User deleted successfully');
      setSelectedUserId('');
      setPortfolios([]);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Error deleting user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId);
  const existingCoins = portfolios.map(p => p.coin_symbol);
  const availableCoins = coins.filter(coin => !existingCoins.includes(coin.symbol));

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-admin-line text-2xl text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Portfolio Management</h1>
              <p className="text-purple-100">Edit user portfolio balances and holdings</p>
            </div>
          </div>
        </div>
      </div>

      <main className="p-6 -mt-4">
        <div className="max-w-7xl mx-auto">
          {/* User Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select User</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email} {user.full_name ? `(${user.full_name})` : ''}
                  </option>
                ))}
              </select>
              {selectedUser && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <i className="ri-user-line"></i>
                    <span>Managing portfolio for: {selectedUser.email}</span>
                  </div>
                  <button
                    onClick={handleDeleteUser}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-delete-bin-line"></i>
                    <span>Delete User</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {selectedUserId && (
            <>
              {/* Add New Coin */}
              {availableCoins.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Coin</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableCoins.map((coin) => (
                      <button
                        key={coin.symbol}
                        onClick={() => handleAddCoin(coin.symbol, coin.name)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer"
                      >
                        <i className="ri-add-line"></i>
                        <span>Add {coin.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Holdings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Holdings</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Coin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Buy Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">USD Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-gray-500 dark:text-gray-400">Loading portfolios...</span>
                            </div>
                          </td>
                        </tr>
                      ) : portfolios.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            No portfolio holdings found for this user
                          </td>
                        </tr>
                      ) : (
                        portfolios.map((portfolio) => (
                          <tr key={portfolio.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                  <i className="ri-currency-line text-white text-sm"></i>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{portfolio.coin_name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{portfolio.coin_symbol}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editingId === portfolio.id ? (
                                <input
                                  type="number"
                                  step="0.00000001"
                                  value={editValues.amount}
                                  onChange={(e) => setEditValues({...editValues, amount: e.target.value})}
                                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {portfolio.amount.toFixed(8)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editingId === portfolio.id ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editValues.average_buy_price}
                                  onChange={(e) => setEditValues({...editValues, average_buy_price: e.target.value})}
                                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                <div className="text-sm text-gray-900 dark:text-white">
                                  ${portfolio.average_buy_price.toFixed(2)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editingId === portfolio.id ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editValues.current_price}
                                  onChange={(e) => setEditValues({...editValues, current_price: e.target.value})}
                                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              ) : (
                                <div className="text-sm text-gray-900 dark:text-white">
                                  ${(portfolio.current_price || 0).toFixed(2)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                ${(portfolio.amount * (portfolio.current_price || 0)).toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editingId === portfolio.id ? (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleSave(portfolio.id)}
                                    className="text-green-600 hover:text-green-800 text-sm whitespace-nowrap cursor-pointer"
                                  >
                                    <i className="ri-check-line"></i> Save
                                  </button>
                                  <button
                                    onClick={handleCancel}
                                    className="text-gray-600 hover:text-gray-800 text-sm whitespace-nowrap cursor-pointer"
                                  >
                                    <i className="ri-close-line"></i> Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEdit(portfolio)}
                                    className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap cursor-pointer"
                                  >
                                    <i className="ri-edit-line"></i> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCoin(portfolio.id)}
                                    className="text-red-600 hover:text-red-800 text-sm whitespace-nowrap cursor-pointer"
                                  >
                                    <i className="ri-delete-bin-line"></i> Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

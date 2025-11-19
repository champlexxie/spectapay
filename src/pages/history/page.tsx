
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/feature/Header';

interface Transaction {
  id: string;
  time: string;
  type: 'Transfer (OUT)' | 'Transfer (IN)' | 'Deposit' | 'Withdraw' | 'Buy' | 'Sell';
  amount: number;
  asset: string;
  status: 'Completed' | 'Pending' | 'Failed';
  address: string;
  txHash?: string;
  fee?: number;
  source: 'transactions' | 'transfers' | 'internal_transfers';
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuthContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedAsset, setSelectedAsset] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const transactionTypes = ['All', 'Transfer (OUT)', 'Transfer (IN)', 'Deposit', 'Withdraw', 'Buy', 'Sell'];
  const assets = ['All', 'BTC', 'ETH', 'USDT', 'BNB', 'ADA', 'SOL', 'USD'];
  const statuses = ['All', 'Completed', 'Pending', 'Failed'];

  const fetchTransactions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch all transaction types in parallel with limits
      const [transactionsResult, transfersResult, internalTransfersResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(200),
        
        supabase
          .from('transfers')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(200),
        
        supabase
          .from('internal_transfers')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(200)
      ]);

      // Process transactions
      const txns: Transaction[] = [];

      // Add regular transactions
      if (transactionsResult.data) {
        transactionsResult.data.forEach(tx => {
          txns.push({
            id: tx.id,
            type: tx.type || tx.transaction_type,
            amount: tx.amount,
            asset: tx.asset || tx.coin_symbol || 'USD',
            status: tx.status || 'completed',
            description: tx.description || tx.notes || '',
            created_at: tx.created_at,
            fee: tx.fee
          });
        });
      }

      // Add transfers
      if (transfersResult.data) {
        transfersResult.data.forEach(transfer => {
          const isReceiver = transfer.receiver_id === user.id;
          txns.push({
            id: transfer.id,
            type: isReceiver ? 'transfer_in' : 'transfer_out',
            amount: transfer.amount,
            asset: transfer.currency || 'USD',
            status: transfer.status || 'completed',
            description: isReceiver 
              ? `From: ${transfer.sender_email || 'Unknown'}`
              : `To: ${transfer.receiver_email || 'Unknown'}`,
            created_at: transfer.created_at,
            fee: transfer.fee
          });
        });
      }

      // Add internal transfers
      if (internalTransfersResult.data) {
        internalTransfersResult.data.forEach(transfer => {
          const isReceiver = transfer.receiver_id === user.id;
          txns.push({
            id: transfer.id,
            type: isReceiver ? 'transfer_in' : 'transfer_out',
            amount: transfer.amount,
            asset: transfer.asset || 'USD',
            status: transfer.status || 'completed',
            description: isReceiver 
              ? `From: ${transfer.sender_username || transfer.sender_email || 'Unknown'}`
              : `To: ${transfer.receiver_username || transfer.receiver_email || 'Unknown'}`,
            created_at: transfer.created_at,
            fee: 0
          });
        });
      }

      // Sort by date (newest first)
      txns.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setTransactions(txns);
      setFilteredTransactions(txns);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
      setFilteredTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    
    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchTransactions, 10000);
    
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    let filtered = transactions;

    if (selectedType !== 'All') {
      filtered = filtered.filter(tx => tx.type === selectedType);
    }

    if (selectedAsset !== 'All') {
      filtered = filtered.filter(tx => tx.asset === selectedAsset);
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter(tx => tx.status === selectedStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.asset.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [selectedType, selectedAsset, selectedStatus, searchTerm, transactions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Transfer (OUT)':
        return 'ri-arrow-up-line text-red-500';
      case 'Transfer (IN)':
        return 'ri-arrow-down-line text-green-500';
      case 'Deposit':
        return 'ri-download-line text-blue-500';
      case 'Withdraw':
        return 'ri-upload-line text-orange-500';
      case 'Buy':
        return 'ri-add-line text-green-500';
      case 'Sell':
        return 'ri-subtract-line text-red-500';
      default:
        return 'ri-exchange-line text-gray-500';
    }
  };

  const formatAmount = (amount: number, asset: string) => {
    if (asset === 'BTC') {
      return amount.toFixed(8);
    } else if (asset === 'ETH') {
      return amount.toFixed(6);
    } else {
      return amount.toFixed(2);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <i className="ri-history-line text-2xl text-purple-500"></i>
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Transaction history
                </h1>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your recent transactions
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => navigate('/deposit')}
                className={`px-6 py-2 border rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                Deposit
              </button>
              <button 
                onClick={() => navigate('/withdraw')}
                className={`px-6 py-2 border rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                Withdraw
              </button>
              <button 
                onClick={() => navigate('/transfer')}
                className={`px-6 py-2 border rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                Transfer
              </button>
              <button className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors whitespace-nowrap cursor-pointer">
                History
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 mb-6`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by address, TxHash, or asset..."
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  }`}
                />
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm pr-8 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                {transactionTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Asset Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Asset
              </label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm pr-8 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                {assets.map(asset => (
                  <option key={asset} value={asset}>{asset}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm pr-8 ${
                  isDark 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Time
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Type
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Amount
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Asset
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Address
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  // Loading skeleton
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`h-4 rounded w-32 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`h-4 rounded w-24 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`h-4 rounded w-20 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`h-4 rounded w-12 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`h-4 rounded w-16 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`h-4 rounded w-40 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`h-4 rounded w-16 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className={`hover:${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                          {transaction.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <i className={`${getTypeIcon(transaction.type)} text-sm`}></i>
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {formatAmount(transaction.amount, transaction.asset)}
                        </div>
                        {transaction.fee && (
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Fee: {formatAmount(transaction.fee, transaction.asset)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.asset === 'BTC' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                          transaction.asset === 'ETH' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                          transaction.asset === 'USDT' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          transaction.asset === 'USD' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {transaction.asset}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                          {transaction.address.length > 20 
                            ? `${transaction.address.substring(0, 20)}...` 
                            : transaction.address
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {transaction.txHash && (
                            <button className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap cursor-pointer">
                              View TxHash
                            </button>
                          )}
                          <button className="text-purple-600 hover:text-purple-800 text-sm whitespace-nowrap cursor-pointer">
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {!loading && filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <i className="ri-history-line text-4xl text-gray-400 mb-4"></i>
              <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                {transactions.length === 0 ? 'No transactions yet' : 'No transactions found'}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {transactions.length === 0 
                  ? 'Your transaction history will appear here once you start trading.'
                  : 'Try adjusting your filters or search terms'
                }
              </p>
              {transactions.length === 0 && (
                <button
                  onClick={() => navigate('/trading')}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  Start Trading
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && filteredTransactions.length > 0 && (
            <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </div>
                <div className="flex space-x-2">
                  <button className={`px-3 py-1 border rounded text-sm ${
                    isDark 
                      ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    Previous
                  </button>
                  <button className={`px-3 py-1 border rounded text-sm ${
                    isDark 
                      ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

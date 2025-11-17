import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../../components/feature/Header';

interface Transaction {
  id: string;
  time: string;
  type: 'Transfer (OUT)' | 'Transfer (IN)' | 'Deposit' | 'Withdraw';
  amount: number;
  asset: string;
  status: 'Completed' | 'Pending' | 'Failed';
  address: string;
  txHash?: string;
  fee?: number;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    time: '2023/11/13 19:53:39',
    type: 'Transfer (OUT)',
    amount: 106.09,
    asset: 'USDT',
    status: 'Completed',
    address: 'willy.space26@gmail.com'
  },
  {
    id: '2',
    time: '2023/11/13 17:51:52',
    type: 'Transfer (IN)',
    amount: 0.005,
    asset: 'BTC',
    status: 'Completed',
    address: 'willy.space26@gmail.com'
  },
  {
    id: '3',
    time: '2023/11/13 17:19:02',
    type: 'Transfer (IN)',
    amount: 0.017,
    asset: 'BTC',
    status: 'Completed',
    address: 'willy.space26@gmail.com'
  },
  {
    id: '4',
    time: '2023/11/12 14:22:15',
    type: 'Deposit',
    amount: 1500.0,
    asset: 'USDT',
    status: 'Completed',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    txHash: '0x1234567890abcdef...'
  },
  {
    id: '5',
    time: '2023/11/11 09:45:33',
    type: 'Withdraw',
    amount: 0.002,
    asset: 'BTC',
    status: 'Completed',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    fee: 0.0005,
    txHash: '0xabcdef1234567890...'
  },
  {
    id: '6',
    time: '2023/11/10 16:30:21',
    type: 'Transfer (OUT)',
    amount: 250.0,
    asset: 'USDT',
    status: 'Completed',
    address: 'john.doe@example.com'
  },
  {
    id: '7',
    time: '2023/11/09 11:15:44',
    type: 'Deposit',
    amount: 0.01,
    asset: 'BTC',
    status: 'Pending',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    txHash: '0x9876543210fedcba...'
  },
  {
    id: '8',
    time: '2023/11/08 20:05:12',
    type: 'Transfer (IN)',
    amount: 500.0,
    asset: 'USDT',
    status: 'Completed',
    address: 'alice.smith@example.com'
  }
];

export default function HistoryPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(mockTransactions);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedAsset, setSelectedAsset] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const transactionTypes = ['All', 'Transfer (OUT)', 'Transfer (IN)', 'Deposit', 'Withdraw'];
  const assets = ['All', 'BTC', 'ETH', 'USDT', 'BNB', 'ADA', 'SOL'];
  const statuses = ['All', 'Completed', 'Pending', 'Failed'];

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
                {filteredTransactions.map((transaction) => (
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <i className="ri-history-line text-4xl text-gray-400 mb-4"></i>
              <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                No transactions found
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Try adjusting your filters or search terms
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredTransactions.length > 0 && (
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
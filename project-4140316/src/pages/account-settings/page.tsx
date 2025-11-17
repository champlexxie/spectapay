import { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';

export default function AccountSettingsPage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', label: 'Account settings', icon: 'ri-user-line' },
    { id: 'password', label: 'Password', icon: 'ri-lock-line' },
    { id: '2fa', label: '2FA Auth', icon: 'ri-shield-check-line' },
    { id: 'affiliate', label: 'Affiliate', icon: 'ri-group-line' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <i className="ri-user-line text-2xl text-gray-400"></i>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Full Name</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your display name on the platform</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">{user?.user_metadata?.full_name || 'Not set'}</span>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap cursor-pointer">
                  Edit
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <i className="ri-mail-line text-2xl text-gray-400"></i>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Email</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your current active email address</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">{user?.email || 'Not available'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <i className="ri-phone-line text-2xl text-gray-400"></i>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Phone Number</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your contact phone number</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">Not set</span>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap cursor-pointer">
                  Add
                </button>
              </div>
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <i className="ri-information-line text-yellow-600 dark:text-yellow-400 text-lg mt-0.5"></i>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Password Security</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Confirm your new password"
                />
              </div>

              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer">
                Update Password
              </button>
            </div>
          </div>
        );

      case '2fa':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <i className="ri-shield-check-line text-green-600 dark:text-green-400 text-lg mt-0.5"></i>
                <div>
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-200">Enhanced Security</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Two-factor authentication adds an extra layer of security to your account.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <i className="ri-smartphone-line text-blue-600 dark:text-blue-400"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">SMS Authentication</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive codes via SMS</p>
                  </div>
                </div>
                <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer">
                  Enable
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <i className="ri-qr-code-line text-green-600 dark:text-green-400"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Authenticator App</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Use Google Authenticator or similar</p>
                  </div>
                </div>
                <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer">
                  Enable
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <i className="ri-mail-line text-purple-600 dark:text-purple-400"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Email Authentication</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive codes via email</p>
                  </div>
                </div>
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>
        );

      case 'affiliate':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <i className="ri-group-line text-blue-600 dark:text-blue-400 text-lg mt-0.5"></i>
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Affiliate Program</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Earn commissions by referring new users to our platform.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Referrals</div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">$0.00</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">15%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Commission Rate</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Referral Link
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value="https://cryptotrader.com/ref/USER123"
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-lg font-medium transition-colors whitespace-nowrap cursor-pointer">
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Referral Code
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value="USER123"
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
                  />
                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-r-lg font-medium transition-colors whitespace-nowrap cursor-pointer">
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and security settings</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <i className={`${tab.icon} text-lg`}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

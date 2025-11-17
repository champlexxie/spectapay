
import { useState } from 'react';
import Header from '../../components/feature/Header';

const AccountSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [username, setUsername] = useState('Ghostempire');
  const [email] = useState('hopeihubs@gmail.com');

  const tabs = [
    { id: 'account', label: 'Account settings', icon: 'ri-settings-3-line' },
    { id: 'password', label: 'Password', icon: 'ri-lock-line' },
    { id: '2fa', label: '2FA Auth', icon: 'ri-shield-check-line' },
    { id: 'affiliate', label: 'Affiliate', icon: 'ri-award-line' },
    { id: 'api', label: 'API keys', icon: 'ri-key-line' },
    { id: 'promo', label: 'Promo codes', icon: 'ri-coupon-line' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <i className="ri-camera-line text-2xl text-gray-400"></i>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Profile photo</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Update your profile avatar</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer whitespace-nowrap">
                  Remove
                </button>
                <button className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 cursor-pointer whitespace-nowrap">
                  <i className="ri-upload-2-line"></i>
                  <span>Upload</span>
                </button>
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <i className="ri-user-line text-3xl text-gray-500 dark:text-gray-400"></i>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <i className="ri-user-line text-2xl text-gray-400"></i>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Account username</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account username</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={() => {
                    try {
                      // Add save logic here
                      console.log('Username updated to:', username);
                    } catch (error) {
                      console.error('Failed to update username:', error);
                    }
                  }}
                  className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-refresh-line"></i>
                  <span>Update</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-6">
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
                <span className="text-sm text-gray-700 dark:text-gray-300">{email}</span>
              </div>
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>
                <button 
                  onClick={() => {
                    try {
                      // Add password update logic here
                      console.log('Password update triggered');
                    } catch (error) {
                      console.error('Failed to update password:', error);
                    }
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        );

      case '2fa':
        return (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Two-Factor Authentication</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium text-gray-900 dark:text-white">Authenticator App</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Use an authenticator app to generate verification codes
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      try {
                        // Add 2FA enable logic here
                        console.log('2FA enable triggered');
                      } catch (error) {
                        console.error('Failed to enable 2FA:', error);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                  >
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'affiliate':
        return (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Affiliate Program</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Join our affiliate program and earn commissions by referring new users to our platform.
                </p>
                <button 
                  onClick={() => {
                    try {
                      // Add affiliate join logic here
                      console.log('Affiliate program join triggered');
                    } catch (error) {
                      console.error('Failed to join affiliate program:', error);
                    }
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                >
                  Join Affiliate Program
                </button>
              </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Keys</h3>
                <button 
                  onClick={() => {
                    try {
                      // Add API key creation logic here
                      console.log('Create new API key triggered');
                    } catch (error) {
                      console.error('Failed to create API key:', error);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-add-line"></i>
                  <span>Create New Key</span>
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  No API keys created yet
                </p>
              </div>
            </div>
          </div>
        );

      case 'promo':
        return (
          <div className="space-y-6">
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Promo Codes</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter Promo Code
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your promo code"
                    />
                    <button 
                      onClick={() => {
                        try {
                          // Add promo code application logic here
                          console.log('Promo code apply triggered');
                        } catch (error) {
                          console.error('Failed to apply promo code:', error);
                        }
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-1 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <i className={tab.icon}></i>
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
};

export default AccountSettingsPage;

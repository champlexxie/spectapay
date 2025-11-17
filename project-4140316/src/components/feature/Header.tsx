
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

export default function Header() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name?: string } | null>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          setUserProfile(data);
        }
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get first letter for avatar
  const getAvatarLetter = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get display name from profile or fallback to email
  const getDisplayName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name;
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3 shadow-lg"></div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer" onClick={() => navigate('/dashboard')}>
            SPECTAPAY
          </h1>
        </div>
        
        {/* Navigation Tabs */}
        <div className="hidden lg:flex items-center space-x-8">
          {/* Tools Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200 whitespace-nowrap cursor-pointer flex items-center space-x-1"
            >
              <span>TOOLS</span>
              <i className={`ri-arrow-down-s-line transition-transform ${isToolsDropdownOpen ? 'rotate-180' : ''}`}></i>
            </button>
            
            {/* Tools Dropdown Menu */}
            {isToolsDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="py-2">
                  <button 
                    onClick={() => {
                      navigate('/market-cap');
                      setIsToolsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start space-x-3 cursor-pointer"
                  >
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-bar-chart-line text-purple-600 dark:text-purple-400 text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Market cap</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Most of the available crypto assets and sorts them based on the market capitalization</div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigate('/currency-heat-map');
                      setIsToolsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start space-x-3 cursor-pointer"
                  >
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-fire-line text-red-600 dark:text-red-400 text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Currency heat map</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Quick overview of action in the currency markets. It lets you spot strong and weak currencies and see how they are in relation to one another</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <Link to="/home" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200 whitespace-nowrap cursor-pointer">
            WALLET
          </Link>
          
          <Link to="/trading" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200 whitespace-nowrap cursor-pointer">
            SPOT TRADING
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <i className={`${isDark ? 'ri-sun-line' : 'ri-moon-line'} text-xl`}></i>
          </button>
          
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
            <i className="ri-notification-3-line text-xl"></i>
          </button>
          
          {/* Search */}
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
            <i className="ri-search-line text-xl"></i>
          </button>
          
          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg">
                {getAvatarLetter()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{getDisplayName()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'Not available'}</p>
              </div>
              <i className={`ri-arrow-down-s-line text-gray-400 dark:text-gray-300 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}></i>
            </button>
            
            {/* Profile Dropdown */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="py-2">
                  <button 
                    onClick={() => {
                      navigate('/home');
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 cursor-pointer"
                  >
                    <i className="ri-wallet-3-line"></i>
                    <span>Wallet</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      navigate('/account-settings');
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 cursor-pointer"
                  >
                    <i className="ri-settings-3-line"></i>
                    <span>Account Settings</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      // Open Readdy Agent widget
                      const readdy_agent_button = document.querySelector('#vapi-widget-floating-button') as HTMLElement;
                      if (readdy_agent_button) {
                        readdy_agent_button.click();
                      }
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 cursor-pointer"
                  >
                    <i className="ri-question-line"></i>
                    <span>Help & Support</span>
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                  
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3 cursor-pointer"
                  >
                    <i className="ri-logout-box-line"></i>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

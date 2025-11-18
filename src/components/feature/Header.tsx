import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  full_name?: string;
  username?: string;
  user_number?: number;
  email?: string;
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuthContext();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Refs for click outside detection
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        // Don't close if clicking the hamburger menu button
        if (!target.closest('.hamburger-menu-button')) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setIsProfileDropdownOpen(false);
    setIsToolsDropdownOpen(false);
    setIsWalletDropdownOpen(false);
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        setIsLoadingProfile(false);
        return;
      }

      setIsLoadingProfile(true);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, username, email, user_number')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data && !error) {
          setUserProfile({
            full_name: data.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            username: data.username,
            email: data.email || user.email || 'Not available',
            user_number: data.user_number
          });
        } else {
          // Fallback to user auth data if profile not found
          setUserProfile({
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            username: null,
            email: user.email || 'Not available',
            user_number: null
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to user auth data
        setUserProfile({
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          username: null,
          email: user.email || 'Not available',
          user_number: null
        });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    // If user exists, set immediate fallback data first, then fetch profile
    if (user?.id) {
      // Set immediate fallback data to avoid showing "Loading..."
      setUserProfile({
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        username: null,
        email: user.email || 'Not available',
        user_number: null
      });
      setIsLoadingProfile(false);
      
      // Then fetch the actual profile data
      fetchUserProfile();
    } else {
      setIsLoadingProfile(false);
      setUserProfile(null);
    }
  }, [user?.id, user?.email, user?.user_metadata]);

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    setIsSidebarOpen(false);
    
    // Navigate immediately for better UX
    navigate('/login', { replace: true });
    
    // Sign out in background
    signOut();
  };

  const handleNavigation = (path: string) => {
    setIsProfileDropdownOpen(false);
    setIsToolsDropdownOpen(false);
    setIsWalletDropdownOpen(false);
    setIsSidebarOpen(false);
    navigate(path);
  };

  // Get first letter for avatar
  const getAvatarLetter = () => {
    if (isLoadingProfile) return 'U';
    
    // Prioritize username, then full name, then email
    if (userProfile?.username) {
      return userProfile.username.charAt(0).toUpperCase();
    }
    if (userProfile?.full_name && userProfile.full_name !== 'User') {
      return userProfile.full_name.charAt(0).toUpperCase();
    }
    if (userProfile?.email && userProfile.email !== 'Not available') {
      return userProfile.email.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get display name from profile or fallback to email
  const getDisplayName = () => {
    if (isLoadingProfile && !userProfile) return 'Loading...';
    
    // Prioritize username, then full name, then email
    if (userProfile?.username && userProfile.username.trim()) {
      return userProfile.username.trim();
    }
    if (userProfile?.full_name && userProfile.full_name.trim() && userProfile.full_name !== 'User') {
      return userProfile.full_name.trim();
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (userProfile?.email && userProfile.email !== 'Not available') {
      return userProfile.email.split('@')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Get display email
  const getDisplayEmail = () => {
    if (isLoadingProfile && !userProfile) return 'Loading...';
    
    if (userProfile?.email && userProfile.email !== 'Not available') {
      return userProfile.email;
    }
    if (user?.email) {
      return user.email;
    }
    return 'Not available';
  };

  return (
    <>
      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg"></div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">SPECTAPAY</h2>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          {/* User Email Display */}
          {user?.email && (
            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
              <div className="flex items-start space-x-2">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-mail-line text-blue-600 dark:text-blue-400"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">Verified Email</div>
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 break-all">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {/* Wallet Section */}
            <div>
              <button 
                onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <i className="ri-wallet-3-line text-lg"></i>
                  <span className="font-medium">WALLET</span>
                </div>
                <i className={`ri-arrow-down-s-line transition-transform duration-200 ${isWalletDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>
              
              {/* Wallet Submenu */}
              {isWalletDropdownOpen && (
                <div className="ml-4 mt-2 space-y-1">
                  <button 
                    onClick={() => handleNavigation('/wallet')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-start space-x-3 cursor-pointer transition-colors duration-200"
                  >
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-pie-chart-line text-green-600 dark:text-green-400 text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Assets</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">View your portfolio and balances</div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => handleNavigation('/deposit')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-start space-x-3 cursor-pointer transition-colors duration-200"
                  >
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-arrow-down-line text-blue-600 dark:text-blue-400 text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Deposit</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add funds to your wallet</div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => handleNavigation('/withdraw')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-start space-x-3 cursor-pointer transition-colors duration-200"
                  >
                    <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-arrow-up-line text-gray-600 dark:text-gray-400 text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Withdraw</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Send funds from your wallet</div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => handleNavigation('/transfer')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-start space-x-3 cursor-pointer transition-colors duration-200"
                  >
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-exchange-line text-purple-600 dark:text-purple-400 text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Transfer</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Transfer between accounts</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Account Settings */}
            <button 
              onClick={() => handleNavigation('/account-settings')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 cursor-pointer"
            >
              <i className="ri-settings-3-line text-lg"></i>
              <span className="font-medium">ACCOUNT</span>
            </button>

            {/* Tools Section */}
            <div>
              <button 
                onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <i className="ri-tools-line text-lg"></i>
                  <span className="font-medium">TOOLS</span>
                </div>
                <i className={`ri-arrow-down-s-line transition-transform duration-200 ${isToolsDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>
              
              {/* Tools Submenu */}
              {isToolsDropdownOpen && (
                <div className="ml-4 mt-2 space-y-1">
                  <button 
                    onClick={() => handleNavigation('/market-cap')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-start space-x-3 cursor-pointer transition-colors duration-200"
                  >
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-bar-chart-line text-purple-600 dark:text-purple-400 text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Market cap</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">View crypto market capitalization</div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => handleNavigation('/currency-heat-map')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-start space-x-3 cursor-pointer transition-colors duration-200"
                  >
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-fire-line text-red-600 dark:text-red-400 text-sm"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Currency heat map</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Quick overview of currency markets</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Help and Support */}
            <button 
              onClick={() => {
                const readdy_agent_button = document.querySelector('#vapi-widget-floating-button') as HTMLElement;
                if (readdy_agent_button) {
                  readdy_agent_button.click();
                }
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 cursor-pointer"
            >
              <i className="ri-customer-service-2-line text-lg"></i>
              <span className="font-medium">HELP & SUPPORT</span>
            </button>

            {/* Logout */}
            <button 
              onClick={() => {
                setIsSidebarOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 cursor-pointer"
            >
              <i className="ri-logout-box-line text-lg"></i>
              <span className="font-medium">LOGOUT</span>
            </button>
          </nav>
        </div>
      </div>

      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Hamburger Menu */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hamburger-menu-button p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer mr-3"
            >
              <i className="ri-menu-line text-xl"></i>
            </button>
            
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3 shadow-lg"></div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer" onClick={() => handleNavigation('/dashboard')}>
              SPECTAPAY
            </h1>

            {/* User Email Display in Header */}
            {user?.email && (
              <div className="ml-6 hidden lg:flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 max-w-xs">
                <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                  <i className="ri-mail-line text-blue-600 dark:text-blue-400 text-sm"></i>
                </div>
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate">
                  {user.email}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              <i className={`${isDark ? 'ri-sun-line' : 'ri-moon-line'} text-xl`}></i>
            </button>
            
            {/* User Profile */}
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={() => {
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  setIsToolsDropdownOpen(false);
                }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg">
                  {getAvatarLetter()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{getDisplayName()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{getDisplayEmail()}</p>
                </div>
                <i className={`ri-arrow-down-s-line text-gray-400 dark:text-gray-300 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>
              
              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="py-2">
                    <button 
                      onClick={() => handleNavigation('/wallet')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 cursor-pointer transition-colors duration-200"
                    >
                      <i className="ri-wallet-3-line"></i>
                      <span>Wallet</span>
                    </button>
                    
                    <button 
                      onClick={() => handleNavigation('/account-settings')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 cursor-pointer transition-colors duration-200"
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
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 cursor-pointer transition-colors duration-200"
                    >
                      <i className="ri-question-line"></i>
                      <span>Help & Support</span>
                    </button>
                    
                    <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3 cursor-pointer transition-colors duration-200"
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
    </>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  full_name?: string;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Refs for click outside detection
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setIsToolsDropdownOpen(false);
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
  }, [navigate]);

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
          .select('full_name, email')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data && !error) {
          setUserProfile({
            full_name: data.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: data.email || user.email || 'Not available'
          });
        } else {
          // Fallback to user auth data if profile not found
          setUserProfile({
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email || 'Not available'
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to user auth data
        setUserProfile({
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || 'Not available'
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
        email: user.email || 'Not available'
      });
      setIsLoadingProfile(false);
      
      // Then fetch the actual profile data
      fetchUserProfile();
    } else {
      setIsLoadingProfile(false);
      setUserProfile(null);
    }
  }, [user?.id, user?.email, user?.user_metadata]);

  const handleLogout = async () => {
    try {
      setIsProfileDropdownOpen(false);
      
      // Sign out using the context method
      const { error } = await signOut();
      
      if (error) {
        console.error('Logout error:', error);
      }
      
      // Clear any local storage or session data
      localStorage.clear();
      sessionStorage.clear();
      
      // Use React Router navigation instead of window.location.href
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      // Use React Router navigation even if there's an error
      navigate('/login', { replace: true });
    }
  };

  const handleNavigation = (path: string) => {
    setIsProfileDropdownOpen(false);
    setIsToolsDropdownOpen(false);
    navigate(path);
  };

  // Get first letter for avatar
  const getAvatarLetter = () => {
    if (isLoadingProfile) return 'U';
    
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
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3 shadow-lg"></div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer" onClick={() => handleNavigation('/dashboard')}>
            SPECTAPAY
          </h1>
        </div>
        
        {/* Navigation Tabs */}
        <div className="hidden lg:flex items-center space-x-6">
          {/* Tools Dropdown */}
          <div className="relative" ref={toolsDropdownRef}>
            <button 
              onClick={() => {
                setIsToolsDropdownOpen(!isToolsDropdownOpen);
                setIsProfileDropdownOpen(false);
              }}
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200 whitespace-nowrap cursor-pointer flex items-center space-x-1"
            >
              <span>TOOLS</span>
              <i className={`ri-arrow-down-s-line transition-transform duration-200 ${isToolsDropdownOpen ? 'rotate-180' : ''}`}></i>
            </button>
            
            {/* Tools Dropdown Menu */}
            {isToolsDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="py-2">
                  <button 
                    onClick={() => handleNavigation('/market-cap')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start space-x-3 cursor-pointer transition-colors duration-200"
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
                    onClick={() => handleNavigation('/currency-heat-map')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start space-x-3 cursor-pointer transition-colors duration-200"
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
          
          <Link 
            to="/wallet" 
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200 whitespace-nowrap cursor-pointer"
            onClick={() => {
              setIsToolsDropdownOpen(false);
              setIsProfileDropdownOpen(false);
            }}
          >
            WALLET
          </Link>
          
          <Link 
            to="/trading" 
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors duration-200 whitespace-nowrap cursor-pointer"
            onClick={() => {
              setIsToolsDropdownOpen(false);
              setIsProfileDropdownOpen(false);
            }}
          >
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
  );
}

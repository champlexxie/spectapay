import { useAuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function ProfileCard() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (data && !error) {
        setUsername(data.username);
      }
    };

    fetchUserData();
  }, [user?.id]);

  const getAvatarLetter = () => {
    // Prioritize username, then full name, then email
    if (username) return username.charAt(0).toUpperCase();
    return user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U';
  };

  const getDisplayName = () => {
    // Prioritize username, then full name, then fallback to 'User'
    if (username) return username;
    return user?.user_metadata?.full_name || 'User';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg">
          {getAvatarLetter()}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {getDisplayName()}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
          {user?.email || 'Not available'}
        </p>

        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-shield-check-fill text-green-500"></i>
          </div>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            Verified
          </span>
        </div>

        <button 
          onClick={() => navigate('/account-settings')}
          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 whitespace-nowrap cursor-pointer"
        >
          <i className="ri-settings-3-line mr-2"></i>
          Account Settings
        </button>
      </div>
    </div>
  );
}

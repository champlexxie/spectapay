
import { useAuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProfileCard() {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const handleAccountSettings = () => {
    navigate('/account-settings');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg">
          {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {user?.user_metadata?.full_name || 'User'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{user?.email}</p>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-300">Account Level</span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Premium</span>
          </div>
          
          <div className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-300">Verification</span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              <i className="ri-shield-check-line mr-1"></i>
              Verified
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-300">Trading Since</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Jan 2024</span>
          </div>
        </div>
        
        <button 
          onClick={handleAccountSettings}
          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 whitespace-nowrap cursor-pointer"
        >
          <i className="ri-settings-3-line mr-2"></i>
          Account Settings
        </button>
      </div>
    </div>
  );
}

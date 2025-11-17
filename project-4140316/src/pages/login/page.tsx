
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/base/Button';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp, signInWithGoogle, user } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password, fullName);
      } else {
        result = await signIn(email, password);
      }
      
      if (result.error) {
        setError(result.error.message);
      } else {
        // Success - navigation will happen automatically via useEffect when user state updates
        console.log('Authentication successful');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      const result = await signInWithGoogle();
      if (result.error) {
        setError(result.error.message);
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=Modern%20cryptocurrency%20trading%20workspace%20with%20multiple%20monitors%20showing%20financial%20charts%2C%20professional%20trading%20desk%20setup%2C%20blue%20and%20purple%20lighting%2C%20futuristic%20financial%20technology%20environment%2C%20clean%20minimalist%20office%20design&width=800&height=1200&seq=login-bg&orientation=portrait')`
          }}
        ></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg mr-4 flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded"></div>
              </div>
              <span className="text-2xl font-bold">SPECTAPAY</span>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Welcome to the Future of Trading
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Join thousands of traders who trust SPECTAPAY for secure, fast, and profitable cryptocurrency trading.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <i className="ri-shield-check-line"></i>
              </div>
              <span>Bank-level security for your assets</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <i className="ri-line-chart-line"></i>
              </div>
              <span>Advanced trading tools and analytics</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <i className="ri-customer-service-2-line"></i>
              </div>
              <span>24/7 customer support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-12">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200">
              <i className="ri-arrow-left-line mr-2"></i>
              Back to Home
            </Link>
            
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <i className={`${theme === 'light' ? 'ri-moon-line' : 'ri-sun-line'} text-xl`}></i>
            </button>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isSignUp ? 'Start your trading journey today' : 'Sign in to your account'}
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
            <button
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                !isSignUp
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                isSignUp
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={handleGoogleSignIn}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <i className="ri-google-fill text-xl"></i>
              </button>
              
              <button className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <i className="ri-apple-fill text-xl"></i>
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

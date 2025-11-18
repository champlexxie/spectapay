
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import Button from '../../components/base/Button';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { signIn, signUp, signInWithGoogle, user } = useAuthContext();
  const navigate = useNavigate();

  // Memoized validation
  const isFormValid = useMemo(() => {
    if (!email || !password) return false;
    if (password.length < 6) return false;
    if (isSignUp && !fullName.trim()) return false;
    return true;
  }, [email, password, fullName, isSignUp]);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Debounced clear messages
  const clearMessages = useCallback(() => {
    setError('');
    setSuccessMessage('');
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      setError('Please fill in all required fields correctly');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      if (isSignUp) {
        const result = await signUp(email, password, fullName.trim());
        
        if (result.error) {
          setError(result.error.message);
        } else {
          setSuccessMessage('Account created successfully! Please check your email to verify your account.');
          // Clear form
          setEmail('');
          setPassword('');
          setFullName('');
          // Switch to sign in after 3 seconds
          setTimeout(() => {
            setIsSignUp(false);
            setSuccessMessage('');
          }, 3000);
        }
      } else {
        const result = await signIn(email, password);
        
        if (result.error) {
          if (result.error.message.includes('Email not confirmed')) {
            setError('Please verify your email address before signing in.');
          } else if (result.error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password.');
          } else {
            setError(result.error.message);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [email, password, fullName, isSignUp, isFormValid, signIn, signUp, clearMessages]);

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    clearMessages();
    
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(result.error.message);
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }, [signInWithGoogle, clearMessages]);

  const handleTabSwitch = useCallback((signUpMode: boolean) => {
    setIsSignUp(signUpMode);
    clearMessages();
  }, [clearMessages]);

  const handleInputChange = useCallback((field: string, value: string) => {
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'fullName':
        setFullName(value);
        break;
    }
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Memoized to prevent unnecessary re-renders */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden">
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
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 cursor-pointer">
              <i className="ri-arrow-left-line mr-2"></i>
              Back to Home
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600">
              {isSignUp ? 'Start your trading journey today' : 'Sign in to your account'}
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => handleTabSwitch(false)}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
                !isSignUp
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch(true)}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
                isSignUp
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 animate-fade-in">
              <div className="flex items-center">
                <i className="ri-error-warning-line mr-2"></i>
                {error}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 animate-fade-in">
              <div className="flex items-center">
                <i className="ri-check-line mr-2"></i>
                {successMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="on">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-150"
                  placeholder="Enter your full name"
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-150"
                placeholder="Enter your email"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition-all duration-150"
                placeholder="Enter your password"
                minLength={6}
                disabled={loading}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              {isSignUp && (
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-150 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
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
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <i className="ri-google-fill text-xl"></i>
              </button>
              
              <button 
                type="button"
                disabled={loading}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <i className="ri-apple-fill text-xl"></i>
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => handleTabSwitch(!isSignUp)}
              disabled={loading}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-150 cursor-pointer disabled:opacity-50"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

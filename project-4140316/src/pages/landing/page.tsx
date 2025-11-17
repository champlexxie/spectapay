import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Navigation */}
      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3 shadow-lg"></div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">SPECTAPAY</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Features</a>
              <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">About</a>
              <a href="#contact" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">Contact</a>
              
              <button 
                onClick={toggleTheme}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <i className={`${theme === 'light' ? 'ri-moon-line' : 'ri-sun-line'} text-xl`}></i>
              </button>
              
              <Link 
                to="/login" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://readdy.ai/api/search-image?query=Modern%20financial%20technology%20trading%20platform%20with%20clean%20minimalist%20design%2C%20professional%20cryptocurrency%20exchange%20interface%2C%20blue%20and%20purple%20gradient%20colors%2C%20futuristic%20digital%20finance%20workspace%2C%20high-tech%20investment%20dashboard%2C%20sleek%20modern%20office%20environment%20with%20multiple%20monitors%20showing%20trading%20charts&width=1920&height=1080&seq=hero-bg&orientation=landscape')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-purple-900/80 to-blue-900/90 dark:from-gray-900/95 dark:via-gray-800/90 dark:to-gray-900/95"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Trade Crypto with
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Confidence</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the future of cryptocurrency trading with SPECTAPAY. Advanced analytics, real-time market data, and secure transactions all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/login" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 whitespace-nowrap"
              >
                Get Started
              </Link>
              <Link 
                to="/login"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 whitespace-nowrap"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose SPECTAPAY?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built for traders who demand the best. Our platform combines cutting-edge technology with intuitive design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: 'ri-shield-check-line',
                title: 'Bank-Level Security',
                description: 'Your assets are protected with military-grade encryption and multi-factor authentication.',
                image: 'https://readdy.ai/api/search-image?query=Cybersecurity%20shield%20protection%20with%20digital%20lock%20icons%2C%20secure%20financial%20data%20encryption%2C%20blue%20and%20purple%20security%20interface%2C%20modern%20banking%20security%20system%2C%20cryptocurrency%20wallet%20protection%20technology&width=400&height=300&seq=security&orientation=landscape'
              },
              {
                icon: 'ri-line-chart-line',
                title: 'Advanced Analytics',
                description: 'Make informed decisions with real-time charts, technical indicators, and market insights.',
                image: 'https://readdy.ai/api/search-image?query=Financial%20analytics%20dashboard%20with%20trading%20charts%20and%20graphs%2C%20cryptocurrency%20market%20data%20visualization%2C%20blue%20and%20purple%20color%20scheme%2C%20modern%20investment%20analysis%20interface%2C%20real-time%20market%20monitoring&width=400&height=300&seq=analytics&orientation=landscape'
              },
              {
                icon: 'ri-global-line',
                title: 'Global Markets',
                description: 'Access to 500+ cryptocurrencies and trading pairs from markets around the world.',
                image: 'https://readdy.ai/api/search-image?query=Global%20cryptocurrency%20trading%20network%20with%20world%20map%2C%20international%20financial%20markets%2C%20digital%20currency%20exchange%20platforms%2C%20blue%20and%20purple%20global%20connectivity%2C%20worldwide%20trading%20access&width=400&height=300&seq=global&orientation=landscape'
              },
              {
                icon: 'ri-customer-service-2-line',
                title: '24/7 Support',
                description: 'Our expert team is available around the clock to assist with your trading needs.',
                image: 'https://readdy.ai/api/search-image?query=Professional%20customer%20support%20team%20with%20headsets%2C%2024%2F7%20financial%20assistance%20service%2C%20modern%20call%20center%20environment%2C%20blue%20and%20purple%20customer%20service%20interface%2C%20helpful%20trading%20support&width=400&height=300&seq=support&orientation=landscape'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-2">
                <div className="mb-4">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl mb-4">
                    <i className={feature.icon}></i>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">$2.5B+</div>
              <p className="text-xl text-gray-600 dark:text-gray-300">Trading Volume</p>
            </div>
            <div className="p-8">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">500K+</div>
              <p className="text-xl text-gray-600 dark:text-gray-300">Active Traders</p>
            </div>
            <div className="p-8">
              <div className="text-4xl md:text-5xl font-bold text-green-600 dark:text-green-400 mb-2">99.9%</div>
              <p className="text-xl text-gray-600 dark:text-gray-300">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Trading Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of traders who trust SPECTAPAY for their cryptocurrency investments.
          </p>
          <Link 
            to="/login" 
            className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 whitespace-nowrap"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3"></div>
                <span className="text-xl font-bold">SPECTAPAY</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                The future of cryptocurrency trading. Secure, fast, and reliable.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Trading</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Portfolio</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <i className="ri-twitter-line text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <i className="ri-linkedin-line text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <i className="ri-github-line text-xl"></i>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 SPECTAPAY. All rights reserved.
            </p>
            <a 
              href="https://readdy.ai/?origin=logo" 
              className="text-gray-400 hover:text-white text-sm transition-colors duration-200 mt-4 md:mt-0"
            >
              Powered by Readdy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

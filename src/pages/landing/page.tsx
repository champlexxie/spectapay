import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3"></div>
              <span className="text-xl font-bold text-gray-900">SPECTAPAY</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">Features</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">About</a>
              <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">Contact</a>
              
              <Link 
                to="/login" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Trade Crypto with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Confidence</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Experience the future of cryptocurrency trading with SPECTAPAY. Advanced analytics, real-time market data, and secure transactions all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="whitespace-nowrap cursor-pointer px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-block text-center"
              >
                Get Started
              </Link>
              <Link 
                to="/login"
                className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 px-8 py-4 rounded-lg font-semibold text-lg transition-all whitespace-nowrap cursor-pointer inline-block text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SPECTAPAY?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for traders who demand the best. Our platform combines cutting-edge technology with intuitive design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: 'ri-shield-check-line',
                title: 'Bank-Level Security',
                description: 'Your assets are protected with military-grade encryption and multi-factor authentication.'
              },
              {
                icon: 'ri-line-chart-line',
                title: 'Advanced Analytics',
                description: 'Make informed decisions with real-time charts, technical indicators, and market insights.'
              },
              {
                icon: 'ri-global-line',
                title: 'Global Markets',
                description: 'Access to 500+ cryptocurrencies and trading pairs from markets around the world.'
              },
              {
                icon: 'ri-customer-service-2-line',
                title: '24/7 Support',
                description: 'Our expert team is available around the clock to assist with your trading needs.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl mb-4">
                  <i className={feature.icon}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 bg-white rounded-xl shadow-lg">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">$2.5B+</div>
              <p className="text-xl text-gray-700 font-medium">Trading Volume</p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-lg">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">500K+</div>
              <p className="text-xl text-gray-700 font-medium">Active Traders</p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-lg">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">99.9%</div>
              <p className="text-xl text-gray-700 font-medium">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Trading Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of traders who trust SPECTAPAY for their cryptocurrency investments.
          </p>
          <Link 
            to="/login" 
            className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 whitespace-nowrap inline-block cursor-pointer"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
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
              <h4 className="font-semibold mb-4 text-white">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Trading</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Portfolio</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-white">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <i className="ri-twitter-line text-2xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <i className="ri-linkedin-line text-2xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <i className="ri-github-line text-2xl"></i>
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
              className="text-gray-400 hover:text-white text-sm transition-colors mt-4 md:mt-0 cursor-pointer"
            >
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}


export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
  svgLogo?: string;
}

interface CoinGeckoResponse {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

class CryptoApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 30000; // 30 seconds
  private lastFallbackUpdate = 0;
  private fallbackData: CoinData[] = [];

  private formatPrice(price: number): string {
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  }

  private formatVolume(volume: number): string {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(1)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(1)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(1)}K`;
    }
    return `$${volume.toFixed(0)}`;
  }

  private formatMarketCap(marketCap: number): string {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(1)}M`;
    }
    return `$${marketCap.toFixed(0)}`;
  }

  private isValidCache(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  async getTopCoins(limit: number = 10): Promise<CoinData[]> {
    const cacheKey = `top-coins-${limit}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`;
      const response = await fetch(apiUrl, { 
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data: CoinGeckoResponse[] = await response.json();
        
        const formattedData: CoinData[] = data.map(coin => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          current_price: coin.current_price,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          market_cap: coin.market_cap,
          total_volume: coin.total_volume,
          image: coin.image,
          svgLogo: coin.image
        }));

        this.cache.set(cacheKey, {
          data: formattedData,
          timestamp: Date.now()
        });

        return formattedData;
      }
    } catch (error) {
      console.log('Using fallback data - API unavailable');
    }

    return this.getFallbackDataWithVariation();
  }

  async getCoinBySymbol(symbol: string): Promise<CoinData | null> {
    const cacheKey = `coin-${symbol.toLowerCase()}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&symbols=${symbol.toLowerCase()}&sparkline=false&price_change_percentage=24h`;
      const response = await fetch(apiUrl, { 
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data: CoinGeckoResponse[] = await response.json();
        if (data.length > 0) {
          const coin = data[0];
          const formattedCoin: CoinData = {
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            current_price: coin.current_price,
            price_change_percentage_24h: coin.price_change_percentage_24h,
            market_cap: coin.market_cap,
            total_volume: coin.total_volume,
            image: coin.image,
            svgLogo: coin.image
          };

          this.cache.set(cacheKey, {
            data: formattedCoin,
            timestamp: Date.now()
          });

          return formattedCoin;
        }
      }
    } catch (error) {
      console.log('Using fallback data for coin');
    }

    const fallbackData = this.getFallbackDataWithVariation();
    return fallbackData.find(c => c.symbol === symbol.toUpperCase()) || null;
  }

  async getCoinPrice(coinId: string): Promise<number | null> {
    const cacheKey = `price-${coinId}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    const fallbackData = this.getFallbackDataWithVariation();
    const coin = fallbackData.find(c => c.id === coinId);
    return coin ? coin.current_price : null;
  }

  formatCoinData(coin: CoinData) {
    return {
      name: coin.name,
      symbol: coin.symbol,
      price: this.formatPrice(coin.current_price),
      change: `${coin.price_change_percentage_24h >= 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(1)}%`,
      volume: this.formatVolume(coin.total_volume),
      marketCap: this.formatMarketCap(coin.market_cap),
      isPositive: coin.price_change_percentage_24h >= 0,
      image: coin.image,
      svgLogo: coin.svgLogo || coin.image,
      rawPrice: coin.current_price
    };
  }

  private getFallbackDataWithVariation(): CoinData[] {
    const now = Date.now();
    
    if (now - this.lastFallbackUpdate > 30000 || this.fallbackData.length === 0) {
      const baseData = [
        {
          id: 'bitcoin',
          symbol: 'BTC',
          name: 'Bitcoin',
          current_price: 43250,
          price_change_percentage_24h: 2.5,
          market_cap: 847000000000,
          total_volume: 28500000000,
          image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png'
        },
        {
          id: 'ethereum',
          symbol: 'ETH',
          name: 'Ethereum',
          current_price: 2580,
          price_change_percentage_24h: 1.8,
          market_cap: 310000000000,
          total_volume: 15200000000,
          image: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png'
        },
        {
          id: 'binancecoin',
          symbol: 'BNB',
          name: 'BNB',
          current_price: 315.5,
          price_change_percentage_24h: -0.5,
          market_cap: 47000000000,
          total_volume: 1800000000,
          image: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png'
        },
        {
          id: 'cardano',
          symbol: 'ADA',
          name: 'Cardano',
          current_price: 0.52,
          price_change_percentage_24h: 3.2,
          market_cap: 18000000000,
          total_volume: 890000000,
          image: 'https://coin-images.coingecko.com/coins/images/975/large/cardano.png'
        },
        {
          id: 'solana',
          symbol: 'SOL',
          name: 'Solana',
          current_price: 98.75,
          price_change_percentage_24h: 5.1,
          market_cap: 42000000000,
          total_volume: 2100000000,
          image: 'https://coin-images.coingecko.com/coins/images/4128/large/solana.png'
        },
        {
          id: 'polkadot',
          symbol: 'DOT',
          name: 'Polkadot',
          current_price: 7.25,
          price_change_percentage_24h: -1.2,
          market_cap: 8500000000,
          total_volume: 450000000,
          image: 'https://coin-images.coingecko.com/coins/images/12171/large/polkadot.png'
        },
        {
          id: 'chainlink',
          symbol: 'LINK',
          name: 'Chainlink',
          current_price: 14.85,
          price_change_percentage_24h: 2.8,
          market_cap: 8700000000,
          total_volume: 520000000,
          image: 'https://coin-images.coingecko.com/coins/images/877/large/chainlink-new-logo.png'
        },
        {
          id: 'litecoin',
          symbol: 'LTC',
          name: 'Litecoin',
          current_price: 92.40,
          price_change_percentage_24h: -0.8,
          market_cap: 6900000000,
          total_volume: 380000000,
          image: 'https://coin-images.coingecko.com/coins/images/2/large/litecoin.png'
        },
        {
          id: 'tether',
          symbol: 'USDT',
          name: 'Tether',
          current_price: 1.00,
          price_change_percentage_24h: 0.01,
          market_cap: 95000000000,
          total_volume: 52000000000,
          image: 'https://coin-images.coingecko.com/coins/images/325/large/Tether.png'
        },
        {
          id: 'ripple',
          symbol: 'XRP',
          name: 'XRP',
          current_price: 0.63,
          price_change_percentage_24h: 1.5,
          market_cap: 34000000000,
          total_volume: 1200000000,
          image: 'https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png'
        },
        {
          id: 'dogecoin',
          symbol: 'DOGE',
          name: 'Dogecoin',
          current_price: 0.085,
          price_change_percentage_24h: 4.2,
          market_cap: 12000000000,
          total_volume: 650000000,
          image: 'https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png'
        },
        {
          id: 'polygon',
          symbol: 'MATIC',
          name: 'Polygon',
          current_price: 0.89,
          price_change_percentage_24h: 2.1,
          market_cap: 8200000000,
          total_volume: 420000000,
          image: 'https://coin-images.coingecko.com/coins/images/4713/large/matic-token-icon.png'
        },
        {
          id: 'avalanche-2',
          symbol: 'AVAX',
          name: 'Avalanche',
          current_price: 36.75,
          price_change_percentage_24h: 3.8,
          market_cap: 14000000000,
          total_volume: 680000000,
          image: 'https://coin-images.coingecko.com/coins/images/12559/large/avalanche-avax-logo.png'
        },
        {
          id: 'cosmos',
          symbol: 'ATOM',
          name: 'Cosmos Hub',
          current_price: 11.25,
          price_change_percentage_24h: 1.9,
          market_cap: 4400000000,
          total_volume: 280000000,
          image: 'https://coin-images.coingecko.com/coins/images/1481/large/cosmos_hub.png'
        },
        {
          id: 'uniswap',
          symbol: 'UNI',
          name: 'Uniswap',
          current_price: 6.85,
          price_change_percentage_24h: -0.7,
          market_cap: 5200000000,
          total_volume: 180000000,
          image: 'https://coin-images.coingecko.com/coins/images/12504/large/uniswap-uni.png'
        },
        {
          id: 'algorand',
          symbol: 'ALGO',
          name: 'Algorand',
          current_price: 0.18,
          price_change_percentage_24h: 2.3,
          market_cap: 1400000000,
          total_volume: 85000000,
          image: 'https://coin-images.coingecko.com/coins/images/4380/large/download.png'
        },
        {
          id: 'vechain',
          symbol: 'VET',
          name: 'VeChain',
          current_price: 0.032,
          price_change_percentage_24h: 4.1,
          market_cap: 2300000000,
          total_volume: 95000000,
          image: 'https://coin-images.coingecko.com/coins/images/1167/large/VeChain-Logo-768x725.png'
        },
        {
          id: 'internet-computer',
          symbol: 'ICP',
          name: 'Internet Computer',
          current_price: 12.45,
          price_change_percentage_24h: -1.8,
          market_cap: 5700000000,
          total_volume: 220000000,
          image: 'https://coin-images.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png'
        }
      ];

      this.fallbackData = baseData.map(coin => ({
        ...coin,
        current_price: coin.current_price * (0.98 + Math.random() * 0.04),
        price_change_percentage_24h: coin.price_change_percentage_24h + (Math.random() - 0.5) * 2,
        svgLogo: coin.image
      }));
      
      this.lastFallbackUpdate = now;
    }

    return this.fallbackData;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const cryptoApi = new CryptoApiService();


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          updated_at?: string;
        };
      };
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          coin_symbol: string;
          coin_name: string;
          amount: number;
          average_buy_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          coin_symbol: string;
          coin_name: string;
          amount: number;
          average_buy_price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          average_buy_price?: number;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          coin_symbol: string;
          coin_name: string;
          transaction_type: 'buy' | 'sell';
          amount: number;
          price: number;
          total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          coin_symbol: string;
          coin_name: string;
          transaction_type: 'buy' | 'sell';
          amount: number;
          price: number;
          total: number;
          created_at?: string;
        };
      };
      watchlist: {
        Row: {
          id: string;
          user_id: string;
          coin_symbol: string;
          coin_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          coin_symbol: string;
          coin_name: string;
          created_at?: string;
        };
      };
    };
  };
};

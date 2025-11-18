
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
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          balance?: number;
          updated_at?: string;
        };
      };
      transfers: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          sender_email: string;
          recipient_email: string;
          amount: number;
          currency: string;
          status: 'pending' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_id: string;
          sender_email: string;
          recipient_email: string;
          amount: number;
          currency?: string;
          status?: 'pending' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'pending' | 'completed' | 'failed';
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
      internal_transfers: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          sender_email: string;
          recipient_email: string;
          coin_symbol: string;
          coin_name: string;
          amount: number;
          status: 'pending' | 'completed' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_id: string;
          sender_email: string;
          recipient_email: string;
          coin_symbol: string;
          coin_name: string;
          amount: number;
          status?: 'pending' | 'completed' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'pending' | 'completed' | 'failed';
          updated_at?: string;
        };
      };
    };
  };
};

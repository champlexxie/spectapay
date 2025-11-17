
import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import { ProtectedRoute } from '../components/base/ProtectedRoute';

const LandingPage = lazy(() => import('../pages/landing/page'));
const LoginPage = lazy(() => import('../pages/login/page'));
const HomePage = lazy(() => import('../pages/home/page'));
const DashboardPage = lazy(() => import('../pages/dashboard/page'));
const DepositPage = lazy(() => import('../pages/deposit/page'));
const WithdrawPage = lazy(() => import('../pages/withdraw/page'));
const TransferPage = lazy(() => import('../pages/transfer/page'));
const HistoryPage = lazy(() => import('../pages/history/page'));
const MarketCapPage = lazy(() => import('../pages/market-cap/page'));
const CurrencyHeatMapPage = lazy(() => import('../pages/currency-heat-map/page'));
const TradingPage = lazy(() => import('../pages/trading/page'));
const AccountSettingsPage = lazy(() => import('../pages/account-settings/page'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    path: '/home',
    element: <ProtectedRoute><HomePage /></ProtectedRoute>,
  },
  {
    path: '/deposit',
    element: <ProtectedRoute><DepositPage /></ProtectedRoute>,
  },
  {
    path: '/withdraw',
    element: <ProtectedRoute><WithdrawPage /></ProtectedRoute>,
  },
  {
    path: '/transfer',
    element: <ProtectedRoute><TransferPage /></ProtectedRoute>,
  },
  {
    path: '/history',
    element: <ProtectedRoute><HistoryPage /></ProtectedRoute>,
  },
  {
    path: '/market-cap',
    element: <ProtectedRoute><MarketCapPage /></ProtectedRoute>,
  },
  {
    path: '/currency-heat-map',
    element: <ProtectedRoute><CurrencyHeatMapPage /></ProtectedRoute>,
  },
  {
    path: '/trading',
    element: <ProtectedRoute><TradingPage /></ProtectedRoute>,
  },
  {
    path: '/account-settings',
    element: <ProtectedRoute><AccountSettingsPage /></ProtectedRoute>,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export default routes;

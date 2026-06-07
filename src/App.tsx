/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { dataService } from './dataService';
import { UserSession } from './types';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import RouteScreen from './components/RouteScreen';
import ShopDetailsScreen from './components/ShopDetailsScreen';
import OrderScreen from './components/OrderScreen';
import ProfileScreen from './components/ProfileScreen';
import { 
  Home as HomeIcon, 
  Map as RouteIcon, 
  ShoppingCart as OrderIcon, 
  User as ProfileIcon,
  Wifi,
  WifiOff,
  Sparkles,
  RefreshCw
} from 'lucide-react';

type Tab = 'home' | 'route' | 'order' | 'profile';

export default function App() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [viewingShopDetails, setViewingShopDetails] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateKey, setUpdateKey] = useState(0); // force state reload keys on transitions

  // Listen to connectivity events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial session load
    const savedSession = dataService.getUserSession();
    if (savedSession) {
      setSession(savedSession);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    setActiveTab('home');
    setUpdateKey(prev => prev + 1);
  };

  const handleLogout = () => {
    setSession(null);
    setSelectedShopId(null);
    setViewingShopDetails(false);
  };

  const handleDataReset = () => {
    setUpdateKey(prev => prev + 1);
    setSelectedShopId(null);
    setViewingShopDetails(false);
    setActiveTab('home');
  };

  // Safe Navigation helpers to propagate selection states nicely to sub-screens
  const navigateToShopDetails = (shopId: string) => {
    setSelectedShopId(shopId);
    setViewingShopDetails(true);
    // Maintain Route tab context for details view
    setActiveTab('route');
  };

  const navigateToOrderTaking = (shopId: string) => {
    setSelectedShopId(shopId);
    setViewingShopDetails(false);
    setActiveTab('order');
  };

  const handleOrderSubmittedSuccess = () => {
    // Reset selected shop context after completing purchase success flows
    setSelectedShopId(null);
    setViewingShopDetails(false);
    setActiveTab('home');
    setUpdateKey(prev => prev + 1);
  };

  // Render current tab component
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen 
            key={`home-${updateKey}`}
            onNavigateToRoute={() => {
              setActiveTab('route');
              setViewingShopDetails(false);
            }} 
            onNavigateToShop={(id) => navigateToShopDetails(id)}
            onNavigateToOrder={(id) => navigateToOrderTaking(id)}
          />
        );
      case 'route':
        if (viewingShopDetails && selectedShopId) {
          return (
            <ShopDetailsScreen 
              key={`shop-details-${selectedShopId}-${updateKey}`}
              shopId={selectedShopId}
              onBack={() => {
                setViewingShopDetails(false);
                setUpdateKey(prev => prev + 1);
              }}
              onNavigateToOrder={(id) => navigateToOrderTaking(id)}
            />
          );
        }
        return (
          <RouteScreen 
            key={`route-${updateKey}`}
            onShopSelect={(id) => navigateToShopDetails(id)}
          />
        );
      case 'order':
        return (
          <OrderScreen 
            key={`order-${selectedShopId}-${updateKey}`}
            selectedShopId={selectedShopId}
            onOrderSuccess={handleOrderSubmittedSuccess}
            onNavigateToRoute={() => {
              setActiveTab('route');
              setViewingShopDetails(false);
            }}
          />
        );
      case 'profile':
        return (
          <ProfileScreen 
            key={`profile-${updateKey}`}
            onLogout={handleLogout}
            onDataReset={handleDataReset}
          />
        );
      default:
        return null;
    }
  };

  // If user is not authenticated, show the login identity provider
  if (!session) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div id="app-shell" className="min-h-screen bg-[#F7F9FB] flex flex-col font-sans select-none pb-24">
      {/* Top Main Application Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#006d3d] flex items-center justify-center text-white font-extrabold text-sm shadow-sm select-none">
            যো
          </div>
          <h1 className="text-xl font-extrabold text-[#006d3d] tracking-tight">যোগাড় (Jogar)</h1>
        </div>

        {/* Offline / Online Network connection tracker */}
        <div id="network-indicator" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
          {isOnline ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[10px] font-bold text-gray-500">অনলাইন</span>
              <Wifi className="w-3 h-3 text-[#006d3d] shrink-0 ml-0.5" />
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span className="text-[10px] font-bold text-amber-700 leading-none">অফলাইন — ডেটা সেভ হচ্ছে</span>
              <WifiOff className="w-3 h-3 text-amber-600 shrink-0 ml-0.5" />
            </>
          )}
        </div>
      </header>

      {/* Main Screen Content Stage */}
      <main className="flex-1 w-full max-w-xl mx-auto px-5 pt-22 pb-6 z-10 transition-opacity duration-150">
        {renderTabContent()}
      </main>

      {/* Mobile-first bottom tab bar */}
      <nav id="bottom-tabs" className="fixed bottom-0 left-0 right-0 h-18 bg-white/90 backdrop-blur-md border-t border-gray-100 z-40 flex items-center justify-around px-2 shadow-[0_-4px_20px_rgba(25,28,30,0.03)] max-w-xl mx-auto rounded-t-2xl">
        {/* Tab 1: Home */}
        <button
          onClick={() => {
            setActiveTab('home');
            setViewingShopDetails(false);
          }}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'home' 
              ? 'text-[#006d3d] scale-105' 
              : 'text-gray-400 hover:text-gray-500'
          }`}
        >
          <HomeIcon className={`w-5.5 h-5.5 ${activeTab === 'home' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] font-extrabold mt-1">হোম</span>
        </button>

        {/* Tab 2: Route */}
        <button
          onClick={() => {
            setActiveTab('route');
            setViewingShopDetails(false);
            setUpdateKey(prev => prev + 1);
          }}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'route'
              ? 'text-[#006d3d] scale-105'
              : 'text-gray-400 hover:text-gray-500'
          }`}
        >
          <RouteIcon className={`w-5.5 h-5.5 ${activeTab === 'route' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] font-extrabold mt-1">রুট</span>
        </button>

        {/* Tab 3: Order */}
        <button
          onClick={() => {
            setActiveTab('order');
            setViewingShopDetails(false);
          }}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'order'
              ? 'text-[#006d3d] scale-105'
              : 'text-gray-400 hover:text-gray-500'
          }`}
        >
          <OrderIcon className={`w-5.5 h-5.5 ${activeTab === 'order' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] font-extrabold mt-1">অর্ডার</span>
        </button>

        {/* Tab 4: Profile */}
        <button
          onClick={() => {
            setActiveTab('profile');
            setViewingShopDetails(false);
          }}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'text-[#006d3d] scale-105'
              : 'text-gray-400 hover:text-gray-500'
          }`}
        >
          <ProfileIcon className={`w-5.5 h-5.5 ${activeTab === 'profile' ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] font-extrabold mt-1">প্রোফাইল</span>
        </button>
      </nav>
    </div>
  );
}

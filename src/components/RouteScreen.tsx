/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { dataService } from '../dataService';
import { Shop, formatBengaliNumber } from '../types';
import { 
  MapPin, 
  CheckCircle2, 
  Search, 
  AlertTriangle, 
  Loader2, 
  MoreVertical,
  Navigation,
  CheckCircle
} from 'lucide-react';

interface RouteScreenProps {
  key?: string;
  onShopSelect: (shopId: string) => void;
}

export default function RouteScreen({ onShopSelect }: RouteScreenProps) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCheckInId, setActiveCheckInId] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const fetchShops = async () => {
    const list = await dataService.getShops();
    setShops(list);
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleCheckIn = (e: React.MouseEvent, shop: Shop) => {
    e.stopPropagation(); // prevent opening shop details
    setActiveCheckInId(shop.id);
    setGpsError(null);

    // Call Geolocation API
    if (!navigator.geolocation) {
      // Geolocation not supported by browser, fallback immediately
      performFallbackCheckIn(shop, 'আপনার ব্রাউজারটি জিপিএস রিসিভার সাপোর্ট করে না।');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await dataService.checkInShop(shop.id, latitude, longitude);
          await fetchShops();
          setActiveCheckInId(null);
        } catch (err) {
          performFallbackCheckIn(shop, 'ডেটাবেজ আপডেট ব্যর্থ হয়েছে।');
        }
      },
      (error) => {
        let msg = 'জিপিএস এক্সেস পাওয়া যায়নি। fallback জিপিএস ব্যবহৃত হচ্ছে।';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'অবস্থান এক্সেস প্রত্যাখ্যান করা হয়েছে। মিরপুর জোন জিপিএস কোঅর্ডিনেট সংগৃহীত।';
        }
        performFallbackCheckIn(shop, msg);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const performFallbackCheckIn = async (shop: Shop, warnMsg: string) => {
    setGpsError(`${shop.shopName}: ${warnMsg}`);
    try {
      // Use Mirpur fallback coordinates matching database seed coordinates
      const mockLat = shop.lat || 23.8041;
      const mockLng = shop.lng || 90.3664;
      await dataService.checkInShop(shop.id, mockLat, mockLng);
      await fetchShops();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setActiveCheckInId(null);
      }, 1000);
    }
  };

  // Filtered Shops search
  const filteredShops = shops.filter(shop => 
    shop.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visitedCount = shops.filter(s => s.visited).length;
  const totalCount = shops.length;
  const progressPercent = totalCount > 0 ? (visitedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative flex items-center bg-white rounded-2xl h-12 shadow-sm border border-gray-100 overflow-hidden px-4 focus-within:ring-2 focus-within:ring-[#006d3d] transition-all">
        <Search className="w-5 h-5 text-gray-400 select-none mr-2 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="দোকান বা মালিকের নাম দিয়ে খুঁজুন..."
          className="w-full h-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium text-gray-700 placeholder:text-gray-300"
        />
      </div>

      {/* Progress Strip */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3">
        <div className="flex justify-between items-center text-sm font-bold text-gray-700">
          <span>আজকের রুট প্রগ্রেস</span>
          <span className="text-[#006d3d]">
            {formatBengaliNumber(visitedCount)}/{formatBengaliNumber(totalCount)} সম্পন্ন
          </span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#006d3d] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* GPS Warnings and Toasts */}
      {gpsError && (
        <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-2xl border border-amber-100 flex items-start gap-2 animate-pulse leading-snug">
          <AlertTriangle className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Shop List */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-1">আজকের দোকান তালিকা</h3>
        
        <div className="flex flex-col gap-4">
          {filteredShops.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center text-gray-400 text-sm font-medium">
              কোনো দোকান পাওয়া যায়নি।
            </div>
          ) : (
            filteredShops.map((shop) => (
              <article 
                key={shop.id}
                onClick={() => onShopSelect(shop.id)}
                className={`relative bg-white rounded-3xl p-5 shadow-sm border transition-all cursor-pointer overflow-hidden ${
                  shop.visited 
                    ? 'border-gray-100 opacity-80 bg-gray-50/20' 
                    : 'border-l-4 border-l-[#006d3d] border-gray-100 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1.5 pl-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`font-bold text-base ${shop.visited ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        {shop.shopName}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        shop.shopType === 'মুদি দোকান' 
                          ? 'bg-[#006d3d]/10 text-[#006d3d]' 
                          : shop.shopType === 'ফার্মেসি'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-purple-50 text-purple-700'
                      }`}>
                        {shop.shopType}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {shop.area} 
                      {shop.distance && <span className="text-gray-300">• {shop.distance}</span>}
                    </p>
                  </div>

                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </div>

                {/* Footer Section */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100/60 pl-1">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">শেষ অর্ডার</span>
                    <span className="font-extrabold text-sm text-gray-800">৳ {formatBengaliNumber(shop.lastOrderSum)}</span>
                  </div>

                  {/* Visit Action Button */}
                  {shop.visited ? (
                    <div className="flex items-center gap-1.5 text-[#006d3d] font-bold text-xs bg-[#006d3d]/5 px-3 py-1.5 rounded-xl border border-[#006d3d]/10">
                      <CheckCircle className="w-4 h-4 text-[#006d3d] fill-current" />
                      <span>ভিজিটড</span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleCheckIn(e, shop)}
                      disabled={activeCheckInId !== null}
                      className="bg-[#006d3d]/5 hover:bg-[#006d3d] hover:text-white text-[#006d3d] border border-[#006d3d]/10 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {activeCheckInId === shop.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>GPS খুঁজছি...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3.5 h-3.5" />
                          <span>চেক-ইন</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

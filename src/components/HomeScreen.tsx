/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { dataService } from '../dataService';
import { Shop, Product, Suggestion, Order, formatBengaliNumber } from '../types';
import { 
  TrendingUp, 
  Store, 
  Wallet, 
  ArrowRight, 
  RotateCcw, 
  Calendar, 
  HelpCircle,
  ThumbsUp,
  Clock,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

interface HomeScreenProps {
  key?: string;
  onNavigateToRoute: () => void;
  onNavigateToShop: (shopId: string) => void;
  onNavigateToOrder: (shopId: string) => void;
}

export default function HomeScreen({ onNavigateToRoute, onNavigateToShop, onNavigateToOrder }: HomeScreenProps) {
  const [visitedCount, setVisitedCount] = useState(0);
  const [totalShops, setTotalShops] = useState(0);
  const [todayCollected, setTodayCollected] = useState(0);
  const [nextShop, setNextShop] = useState<Shop | null>(null);
  const [suggestions, setSuggestions] = useState<(Suggestion & { product?: Product })[]>([]);
  const [recentOrders, setRecentOrders] = useState<(Order & { shopName?: string })[]>([]);

  // Reload statistics dynamically
  const loadDashboardData = async () => {
    const shops = await dataService.getShops();
    const products = await dataService.getProducts();
    const orders = await dataService.getOrders();
    const transactions = await dataService.getTransactions();

    setTotalShops(shops.length);
    const visited = shops.filter(s => s.visited).length;
    setVisitedCount(visited);

    // Sum today's cash collections
    const collections = transactions
      .filter(t => t.type === 'পেমেন্ট আদায়')
      .reduce((sum, current) => sum + current.amount, 0);
    setTodayCollected(collections);

    // Find the next unvisited shop to pre-pull recommendations for the active workflow
    const nextUnvisited = shops.find(s => !s.visited) || shops[0] || null;
    setNextShop(nextUnvisited);

    if (nextUnvisited) {
      const rawSug = await dataService.getSuggestionsForShop(nextUnvisited.id);
      const enrichedSug = rawSug.map(s => {
        const prod = products.find(p => p.id === s.productId);
        return { ...s, product: prod };
      });
      setSuggestions(enrichedSug);
    }

    // Load recent 3 orders
    const enrichedOrders = orders.slice(0, 3).map(ord => {
      const parentShop = shops.find(s => s.id === ord.shopId);
      return {
        ...ord,
        shopName: parentShop ? parentShop.shopName : 'অজানা দোকান'
      };
    });
    setRecentOrders(enrichedOrders);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Bengali Date Format helper
  const getBengaliDate = () => {
    const months = [
      'জানুয়ারী', 'ফেব্রুয়ারী', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const today = new Date();
    const date = today.getDate();
    const month = months[today.getMonth()];
    const year = today.getFullYear();
    return `${formatBengaliNumber(date)} ${month}, ${formatBengaliNumber(year)}`;
  };

  const handleAcceptSuggestion = async (sug: Suggestion) => {
    if (!nextShop) return;
    await dataService.acceptSuggestion(nextShop.id, sug.productId);
    // Switch to order tab for this next shop directly
    onNavigateToOrder(nextShop.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
        {/* Decorative backdrop */}
        <div className="absolute right-0 top-0 w-36 h-36 bg-[#006d3d]/5 rounded-bl-full pointer-events-none -mr-4 -mt-4"></div>
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-[#006d3d]">
            <Sparkles className="w-5 h-5 fill-current" />
            <h2 className="text-2xl font-bold tracking-tight text-gray-800">স্বাগতম, রহিম উদ্দিন</h2>
          </div>
          <p className="text-gray-400 font-medium text-xs flex items-center gap-1.5 pt-0.5">
            <Calendar className="w-4 h-4 text-[#C9A227]" />
            {getBengaliDate()} (ঢাকা জোন)
          </p>
        </div>
      </div>

      {/* Statistics Row */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-1">আজকের পারফরম্যান্স</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Collection Stat */}
          <div className="bg-[#f0f5ee] rounded-3xl p-6 border border-[#92ecaf]/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-[#00522d]/5 rounded-tl-full pointer-events-none transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-center w-full mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Wallet className="w-5 h-5 text-[#006d3d]" />
                আজকের আদায়
              </span>
              <span className="text-[10px] font-bold bg-[#006d3d]/10 text-[#006d3d] px-2.5 py-1 rounded-full uppercase">নগদ + ডিজিটাল</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-extrabold text-[#00522d] tracking-tight">
                ৳ {formatBengaliNumber(todayCollected)}
              </p>
              <p className="text-xs text-gray-400">প্রতিটি রেকর্ড সংরক্ষিত হচ্ছে</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            {/* Target Stat */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-gray-400 mb-4">
                <TrendingUp className="w-4 h-4 text-[#C9A227]" />
                <span className="text-[11px] font-bold uppercase tracking-wider">আজকের টার্গেট</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-xl font-bold text-gray-800">৳ {formatBengaliNumber(60000)}</p>
                <p className="text-[11px] text-gray-400">লক্ষ্যমাত্রা ৫০% পূরণ</p>
              </div>
            </div>

            {/* Visit Stat */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-gray-400 mb-4">
                <Store className="w-4 h-4 text-[#006d3d]" />
                <span className="text-[11px] font-bold uppercase tracking-wider">দোকান ভিজিট</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-xl font-bold text-gray-800">
                  {formatBengaliNumber(visitedCount)}/{formatBengaliNumber(totalShops)}
                </p>
                <p className="text-[11px] text-gray-400">বাকি {formatBengaliNumber(totalShops - visitedCount)}টি দোকান</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Start Route Primary Call To Action */}
      <button 
        id="btn-start-route"
        onClick={onNavigateToRoute}
        className="w-full bg-[#006d3d] text-white font-bold py-4.5 rounded-2xl shadow-lg shadow-[#006d3d]/20 flex items-center justify-center gap-2 hover:bg-[#00522d] active:scale-[0.99] transition-all cursor-pointer text-base"
      >
        আজকের রুট শুরু করুন
        <ArrowRight className="w-5 h-5 text-[#C9A227]" />
      </button>

      {/* AI Recommendations Module */}
      {nextShop && suggestions.length > 0 && (
        <section className="space-y-3">
          <div className="flex justify-between items-center pl-1">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-[#C9A227] fill-[#C9A227]" />
              আপনার জন্য সাজেশন ({nextShop.shopName})
            </span>
            <span className="text-[11px] text-[#006d3d] bg-[#006d3d]/10 px-2 py-0.5 rounded-full font-bold">
              পরবর্তী দোকান
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((sug) => (
              <div 
                key={sug.id}
                className="bg-white rounded-3xl p-5 border border-amber-100 shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden"
              >
                {/* Score Indicator Badge */}
                <div 
                  className="absolute top-4 right-4 bg-[#C9A227]/10 text-amber-800 font-mono text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1"
                  style={{ borderColor: '#C9A227' }}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[#C9A227]" />
                  স্কোর: {formatBengaliNumber(sug.sellScore)}
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl font-bold text-[#006d3d] shrink-0">
                    {sug.product?.name.substring(0, 2)}
                  </div>
                  <div className="space-y-1 min-w-0 pr-12">
                    <h4 className="font-bold text-gray-800 text-sm truncate">{sug.product?.name}</h4>
                    <p className="text-xs text-gray-400 font-medium">প্যাক সাইজ: {sug.product?.packSize}</p>
                    <p className="text-xs text-[#006d3d] font-bold">মূল্য: ৳ {formatBengaliNumber(sug.product?.sellPrice || 0)}</p>
                  </div>
                </div>

                {/* Sell Reason Box */}
                <div className="bg-amber-50/40 rounded-xl p-3 border border-amber-100/50 text-xs text-amber-900 leading-relaxed font-medium">
                  {sug.reason}
                </div>

                {/* Action button */}
                <button
                  onClick={() => handleAcceptSuggestion(sug)}
                  className="w-full bg-[#006d3d]/5 hover:bg-[#006d3d] hover:text-white border border-[#006d3d]/10 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1 text-[#006d3d] cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  অর্ডার অ্যাড করুন
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity / Placed Orders */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-1">সাম্প্রতিক অর্ডার সমূহ</h3>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs font-medium space-y-2">
              <Clock className="w-8 h-8 mx-auto opacity-70 text-gray-300" />
              <p>আজকে এখনো কোনো অর্ডার নেওয়া হয়নি।</p>
            </div>
          ) : (
            recentOrders.map((ord) => (
              <div 
                key={ord.id}
                onClick={() => onNavigateToShop(ord.shopId)}
                className="p-4.5 flex justify-between items-center hover:bg-gray-50/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 text-[#006d3d] flex items-center justify-center">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{ord.shopName}</h4>
                    <p className="text-[10px] text-gray-400 font-mono tracking-wider">আইডি: {ord.id.substring(0, 10).toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-extrabold text-[#006d3d] text-sm">
                    ৳ {formatBengaliNumber(ord.totalAmount)}
                  </span>
                  <span className="text-[9px] font-bold bg-[#006d3d]/10 text-[#006d3d] px-2 py-0.5 rounded-full">
                    {ord.paymentType}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

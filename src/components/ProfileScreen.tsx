/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { dataService } from '../dataService';
import { EventLog, formatBengaliNumber } from '../types';
import { 
  User, 
  MapPin, 
  Phone, 
  ShoppingBag, 
  TrendingUp, 
  Store, 
  Wallet, 
  Download, 
  History, 
  RotateCcw, 
  LogOut,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface ProfileScreenProps {
  key?: string;
  onLogout: () => void;
  onDataReset: () => void;
}

export default function ProfileScreen({ onLogout, onDataReset }: ProfileScreenProps) {
  const [events, setEvents] = useState<EventLog[]>([]);
  const [stats, setStats] = useState({
    ordersCount: 0,
    totalSales: 0,
    visitedCount: 0,
    collectedAmount: 0
  });

  const loadProfileData = async () => {
    const list = await dataService.getEvents();
    setEvents(list.slice(0, 10)); // capture last 10 events

    const shops = await dataService.getShops();
    const orders = await dataService.getOrders();
    const transactions = await dataService.getTransactions();

    const visited = shops.filter(s => s.visited).length;
    const collections = transactions
      .filter(t => t.type === 'পেমেন্ট আদায়')
      .reduce((sum, curr) => sum + curr.amount, 0);

    const salesSum = orders.reduce((sum, curr) => sum + curr.totalAmount, 0);

    setStats({
      ordersCount: orders.length,
      totalSales: salesSum,
      visitedCount: visited,
      collectedAmount: collections
    });
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleResetClick = async () => {
    const confirmChoice = window.confirm('আপনি কি নিশ্চিত যে সমস্ত ডেটা রিসেট করতে চান? এটি করতে গেলে বর্তমান স্টোরেজ মুছে পূর্বনির্ধারিত ডেমো ডেটা পুনরায় লোড হবে।');
    if (confirmChoice) {
      await dataService.resetData();
      await dataService.logEvent({
        eventType: 'user_login', // Seed starting login
        actorId: 'sr_1',
        payload: { text: 'Database was reset to default seed configurations' }
      });
      onDataReset();
    }
  };

  const handleLogoutClick = async () => {
    await dataService.logEvent({
      eventType: 'user_logout',
      actorId: 'sr_1',
      payload: { text: 'Representative logged out of Jogar session' }
    });
    dataService.clearUserSession();
    onLogout();
  };

  // Convert English event types to Bengali literal titles
  const getEventNameInBengali = (type: string) => {
    switch (type) {
      case 'user_login': return 'লগইন সম্পন্ন';
      case 'user_logout': return 'লগআউট সম্পন্ন';
      case 'order_placed': return 'অর্ডার গ্রহণ করা হয়েছে';
      case 'payment_made': return 'বকেয়া আদায়';
      case 'sr_checkin': return 'দোকান চেক-ইন';
      case 'suggestion_accepted': return 'সাজেশন গ্রহণ';
      default: return 'অ্যাক্টিভিটি নথি';
    }
  };

  // Render payload details beautifully in Bengali
  const renderEventPayload = (evt: EventLog) => {
    if (evt.eventType === 'sr_checkin') {
      return `জিপিএস কোঅর্ডিনেট সহ চেক-ইন সফল।`;
    }
    if (evt.eventType === 'order_placed') {
      return `মোট ৳${formatBengaliNumber(evt.payload?.totalAmount || 0)} এর অর্ডার রেকর্ড করা হয়েছে।`;
    }
    if (evt.eventType === 'payment_made') {
      return `৳${formatBengaliNumber(evt.payload?.amount || 0)} আদায় করা হয়েছে।`;
    }
    return 'অ্যাক্টিভিটি সফলভাবে সংরক্ষিত হয়েছে।';
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Rep Credentials Core Layout */}
      <section className="bg-[#006d3d] rounded-[24px] p-6 text-white relative overflow-hidden shadow-lg shadow-[#006d3d]/15">
        <div className="absolute right-0 top-0 w-36 h-36 bg-white/5 rounded-bl-full pointer-events-none -mr-4 -mt-4"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
            <User className="w-9 h-9 text-white opacity-95" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">মোঃ রহিম উদ্দিন</h2>
            <div className="flex items-center gap-1 text-[#92ecaf] text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />
              <span>মিরপুর জোন, ঢাকা</span>
            </div>
            <div className="flex items-center gap-1 text-white/80 font-mono text-xs">
              <Phone className="w-3.5 h-3.5" />
              <span>০১৭৫১২৩৪৫৬৭</span>
            </div>
          </div>
        </div>
      </section>

      {/* Today's compiled Performance Statistics */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-1">আজকের পারফরম্যান্স সমষ্টি</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Orders */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-[#C9A227] flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">অর্ডার সংখ্যা</p>
              <p className="font-extrabold text-gray-800 text-xl">{formatBengaliNumber(stats.ordersCount)}টি</p>
            </div>
          </div>

          {/* Sales Sum */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-9 h-9 rounded-2xl bg-[#006d3d]/5 text-[#006d3d] flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">মোট বিক্রি</p>
              <p className="font-extrabold text-[#006d3d] text-lg">৳ {formatBengaliNumber(stats.totalSales)}</p>
            </div>
          </div>

          {/* Visited Shops */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">দোকান ভিজিট</p>
              <p className="font-extrabold text-gray-800 text-xl">{formatBengaliNumber(stats.visitedCount)}টি</p>
            </div>
          </div>

          {/* Money Collected */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-[#006d3d] flex items-center justify-center mb-3">
              <Wallet className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">টাকা আদায়</p>
              <p className="font-extrabold text-[#00522d] text-lg">৳ {formatBengaliNumber(stats.collectedAmount)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Report Download Card placeholder */}
      <section className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex justify-between items-center">
        <div className="flex gap-3.5 items-center">
          <div className="w-10 h-10 rounded-2xl bg-[#006d3d]/5 text-[#006d3d] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">দৈনিক রিপোর্ট (PDF)</h4>
            <p className="text-[10px] text-gray-400 leading-normal">আজকের সম্পূর্ণ সেলস সামারি ও রসিদ ডাউনলোড</p>
          </div>
        </div>
        <button
          onClick={() => alert('আপনার ডিভাইস মেমরিতে আজকের রিপোর্টটি সফলভাবে সংরক্ষিত হয়েছে।')} 
          className="w-9 h-9 rounded-xl bg-[#006d3d] hover:bg-[#00522d] text-white flex items-center justify-center cursor-pointer shadow-sm"
        >
          <Download className="w-5 h-5" />
        </button>
      </section>

      {/* Audit Event Log List */}
      <section className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pl-1 border-b border-gray-100 pb-3">
          <History className="w-5 h-5 text-[#006d3d]" />
          <div>
            <h3 className="font-bold text-gray-800 text-sm">ইভেন্ট লগ (ডেমো)</h3>
            <p className="text-[10px] text-gray-400 pt-0.5">প্রতিটি কাজ রেকর্ড হচ্ছে — ভবিষ্যতের AI এর জন্য।</p>
          </div>
        </div>

        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-4 font-semibold">কোনো ইভেন্ট রেকর্ড পাওয়া যায়নি।</p>
          ) : (
            events.map((evt) => (
              <div key={evt.id} className="flex justify-between items-start gap-3 text-xs leading-normal">
                <div className="space-y-0.5">
                  <span className="font-bold text-gray-800 block text-xs">
                    {getEventNameInBengali(evt.eventType)}
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {renderEventPayload(evt)}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono shrink-0 whitespace-nowrap pt-0.5">
                  {new Date(evt.occurredAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Control Actions / Settings Options */}
      <section className="pt-4 border-t border-gray-100 flex flex-col gap-3">
        {/* Reset Data */}
        <button
          onClick={handleResetClick}
          className="w-full text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99]"
        >
          <RotateCcw className="w-4 h-4 text-[#C9A227]" />
          সিস্টেমের ডেমো ডেটা রিসেট করুন
        </button>

        {/* Dynamic Logout Button */}
        <button
          onClick={handleLogoutClick}
          className="w-full text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/50 py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4" />
          লগআউট করুন
        </button>
      </section>
    </div>
  );
}

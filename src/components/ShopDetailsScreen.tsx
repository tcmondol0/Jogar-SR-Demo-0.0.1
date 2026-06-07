/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { dataService } from '../dataService';
import { Shop, Order, formatBengaliNumber } from '../types';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User, 
  BadgeAlert, 
  PlusCircle, 
  DollarSign, 
  ArrowRight,
  TrendingDown,
  CheckCircle,
  Clock,
  CheckCircle2,
  Wallet,
  Smartphone,
  Coins
} from 'lucide-react';

interface ShopDetailsScreenProps {
  key?: string;
  shopId: string;
  onBack: () => void;
  onNavigateToOrder: (shopId: string) => void;
}

export default function ShopDetailsScreen({ shopId, onBack, onNavigateToOrder }: ShopDetailsScreenProps) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCollectingPayment, setIsCollectingPayment] = useState(false);
  const [collectAmount, setCollectAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'নগদ' | 'বিকাশ' | 'নগদ-Nagad'>('নগদ');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastPaymentRecorded, setLastPaymentRecorded] = useState<{ amount: number; method: string } | null>(null);

  const fetchShopDetails = async () => {
    const details = await dataService.getShopById(shopId);
    if (details) {
      setShop(details);
    }
    const allOrders = await dataService.getOrders();
    const shopOrders = allOrders.filter(o => o.shopId === shopId);
    setOrders(shopOrders);
  };

  useEffect(() => {
    fetchShopDetails();
  }, [shopId]);

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500 font-medium space-y-3">
        <Clock className="w-8 h-8 animate-spin text-[#006d3d]" />
        <span>দোকানের বিবরণ লোড হচ্ছে...</span>
      </div>
    );
  }

  // Calculate credit limit percentage
  const creditPercent = shop.creditLimit > 0 ? (shop.creditBalance / shop.creditLimit) * 100 : 0;

  const handleConfirmCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(collectAmount);
    if (!amountVal || amountVal <= 0) {
      alert('সঠিক আদায়ের পরিমাণটি দিন।');
      return;
    }
    if (amountVal > shop.creditBalance) {
      alert('আদায়ের পরিমাণ বর্তমান বকেয়ার চেয়ে অধিক হতে পারে না।');
      return;
    }

    try {
      const res = await dataService.recordPayment(shop.id, amountVal, paymentMethod);
      setLastPaymentRecorded({ amount: amountVal, method: paymentMethod });
      // Reload details
      await fetchShopDetails();
      setPaymentSuccess(true);
      setCollectAmount('');
    } catch (err: any) {
      alert('পেমেন্ট আদায় ব্যর্থ হয়েছে!');
    }
  };

  const handleClosePaymentSuccess = () => {
    setPaymentSuccess(false);
    setLastPaymentRecorded(null);
    setIsCollectingPayment(false);
  };

  return (
    <div className="space-y-6">
      {/* Back Button and Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full text-[#006d3d] transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{shop.shopName}</h2>
          <p className="text-xs font-semibold text-[#006d3d] uppercase tracking-wider">{shop.shopType}</p>
        </div>
      </div>

      {paymentSuccess && lastPaymentRecorded ? (
        /* Success alert interface */
        <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 space-y-4 text-center animate-bounceIn select-none">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-gray-800 text-lg">পেমেন্ট আদায় নিশ্চিত হয়েছে!</h3>
            <p className="text-xs text-gray-500">দোকানের বকেয়া সফলভাবে আপডেট করা হয়েছে।</p>
          </div>
          <div className="bg-white rounded-2xl p-4.5 border border-emerald-100 flex flex-col gap-2.5 max-w-xs mx-auto text-sm text-gray-700 font-medium">
            <div className="flex justify-between">
              <span>আদায়ের পরিমাণ:</span>
              <span className="font-bold text-[#006d3d]">৳ {formatBengaliNumber(lastPaymentRecorded.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>মাধ্যম:</span>
              <span className="font-bold">{lastPaymentRecorded.method}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-2 text-[#006d3d] font-bold">
              <span>বর্তমান বকেয়া:</span>
              <span>৳ {formatBengaliNumber(shop.creditBalance)}</span>
            </div>
          </div>
          <button
            onClick={handleClosePaymentSuccess}
            className="w-full bg-[#006d3d] hover:bg-[#00522d] text-white font-bold py-3.5 rounded-xl cursor-pointer text-sm shadow-md"
          >
            ধন্যবাদ
          </button>
        </div>
      ) : isCollectingPayment ? (
        /* Payment Collection Overlay Box */
        <section className="bg-white rounded-3xl p-6 shadow-md border border-amber-100 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-base">টাকা আদায় করুন</h3>
            <button 
              onClick={() => setIsCollectingPayment(false)} 
              className="text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              বাতিল
            </button>
          </div>

          <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex justify-between items-center text-sm">
            <span className="font-bold text-amber-900">মোট বকেয়ার পরিমাণ:</span>
            <span className="text-lg font-black text-rose-600">৳ {formatBengaliNumber(shop.creditBalance)}</span>
          </div>

          <form onSubmit={handleConfirmCollection} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="collect-amount" className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                আদায়ের পরিমাণ (৳)
              </label>
              <div className="relative flex items-center bg-gray-50 rounded-2xl h-14 border border-gray-100 focus-within:ring-2 focus-within:ring-[#006d3d] transition-all overflow-hidden shadow-inner">
                <span className="pl-4 pr-1 text-lg font-bold text-gray-400 select-none">৳</span>
                <input
                  id="collect-amount"
                  type="number"
                  required
                  placeholder="০"
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="w-full h-full bg-transparent border-none focus:outline-none focus:ring-0 font-extrabold text-gray-800 text-lg pr-4"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                পেমেন্ট মাধ্যম নির্বাচন
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'নগদ', label: 'নগদ', icon: Wallet },
                  { key: 'বিকাশ', label: 'বিকাশ', icon: Smartphone },
                  { key: 'নগদ-Nagad', label: 'নগদ-Nagad', icon: Coins }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = paymentMethod === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setPaymentMethod(item.key as any)}
                      className={`py-3.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all outline-none font-bold text-xs cursor-pointer ${
                        isActive 
                          ? 'border-[#006d3d] bg-[#006d3d]/5 text-[#006d3d]' 
                          : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {collectAmount && (
              <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 font-medium flex justify-between border border-gray-100">
                <span>আদায়ের পর অবশিষ্ট বকেয়া:</span>
                <span className="font-bold text-gray-700">
                  ৳ {formatBengaliNumber(Math.max(0, shop.creditBalance - (parseFloat(collectAmount) || 0)))}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-14 bg-[#006d3d] text-white font-bold text-base rounded-2xl flex items-center justify-center shadow-lg shadow-[#006d3d]/15 hover:bg-[#00522d] active:scale-[0.98] transition-transform cursor-pointer"
            >
              আদায় নিশ্চিত করুন
            </button>
          </form>
        </section>
      ) : (
        <>
          {/* Shop Information Section */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#006d3d]/10 text-[#006d3d] rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-gray-800 text-base">{shop.ownerName}</h3>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">মালিক</span>
              </div>
            </div>

            <div className="h-px bg-gray-100/80 w-full" />

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-4.5 h-4.5 text-[#006d3d]" />
                </div>
                <span className="font-bold text-gray-600 text-sm">{shop.phone}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-4.5 h-4.5 text-[#006d3d]" />
                </div>
                <span className="font-bold text-gray-600 text-sm">{shop.area}</span>
              </div>
            </div>
          </section>

          {/* Outstanding Credit / Balance section */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col gap-4">
            {/* Dec backdrop logo */}
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#C9A227]/5 rounded-bl-full pointer-events-none -mr-4 -mt-4"></div>

            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">বকেয়া (Outstanding)</h4>
                <p className="text-3xl font-extrabold text-rose-600 tracking-tight">৳ {formatBengaliNumber(shop.creditBalance)}</p>
              </div>
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center shrink-0">
                <BadgeAlert className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-2 mt-2 relative z-10">
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    creditPercent > 90 ? 'bg-rose-500' : creditPercent > 70 ? 'bg-[#C9A227]' : 'bg-[#006d3d]'
                  }`}
                  style={{ width: `${Math.min(100, creditPercent)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <span>ক্রেডিট সীমা: ৳ {formatBengaliNumber(shop.creditLimit)}</span>
                <span className={creditPercent > 90 ? 'text-rose-600' : 'text-gray-400'}>
                  {formatBengaliNumber(Math.round(creditPercent))}% ব্যবহৃত
                </span>
              </div>
            </div>
          </section>

          {/* Action Call To Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setIsCollectingPayment(true)}
              className="h-14 font-bold border-2 border-[#C9A227] hover:bg-[#C9A227]/5 text-amber-900 rounded-2xl flex items-center justify-center gap-1.5 transition-all text-sm cursor-pointer shadow-sm"
              style={{ borderColor: '#C9A227' }}
            >
              <Wallet className="w-4.5 h-4.5 text-[#C9A227]" />
              টাকা আদায়
            </button>

            <button
              onClick={() => onNavigateToOrder(shop.id)}
              className="h-14 bg-[#006d3d] hover:bg-[#00522d] text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all text-sm cursor-pointer shadow-md shadow-[#006d3d]/15"
            >
              <PlusCircle className="w-4.5 h-4.5 text-[#C9A227]" />
              নতুন অর্ডার
            </button>
          </div>

          {/* Order history timeline */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-1">অর্ডার ইতিহাস</h3>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col gap-5">
              {orders.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-xs font-semibold">
                  এই দোকানের নামে কোনো ঐতিহাসিক অর্ডার পাওয়া যায়নি।
                </div>
              ) : (
                orders.map((ord, idx) => (
                  <div key={ord.id} className="flex gap-4 relative">
                    {/* Vertical connecting line indicator */}
                    {idx !== orders.length - 1 && (
                      <div className="absolute left-[17px] top-10 bottom-[-20px] w-0.5 bg-gray-100" />
                    )}

                    <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-[#006d3d] shrink-0 border border-gray-100 relative z-10">
                      {formatBengaliNumber(idx + 1)}
                    </div>

                    <div className="flex-grow space-y-1.5 min-w-0 pt-0.5">
                      <div className="flex justify-between items-center gap-2">
                        <span className="font-bold text-gray-800 text-sm">আইডি: {ord.id.substring(0, 10).toUpperCase()}</span>
                        <span className="font-extrabold text-[#006d3d] text-sm">৳ {formatBengaliNumber(ord.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-on-surface-variant font-medium">
                        <span>তারিখ: {new Date(ord.placedAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === 'ডেলিভারড'
                            ? 'bg-emerald-50 text-[#006d3d]'
                            : 'bg-amber-50 text-amber-900 border border-amber-100'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

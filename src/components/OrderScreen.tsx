/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { dataService } from '../dataService';
import { Shop, Product, Suggestion, formatBengaliNumber } from '../types';
import { 
  Package, 
  ShoppingCart, 
  MapPin, 
  Plus, 
  Minus, 
  Check, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Search,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

interface OrderScreenProps {
  key?: string;
  selectedShopId: string | null;
  onOrderSuccess: () => void;
  onNavigateToRoute: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function OrderScreen({ selectedShopId, onOrderSuccess, onNavigateToRoute }: OrderScreenProps) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<(Suggestion & { product?: Product })[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('সব');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [successPageData, setSuccessPageRecorded] = useState<{
    orderId: string;
    totalAmount: number;
    itemsCount: number;
    shopName: string;
    paymentType: string;
  } | null>(null);

  const loadOrderData = async () => {
    if (!selectedShopId) return;
    const shopDetail = await dataService.getShopById(selectedShopId);
    setShop(shopDetail);

    const prods = await dataService.getProducts();
    setProducts(prods);

    const sugs = await dataService.getSuggestionsForShop(selectedShopId);
    const enriched = sugs.map(s => {
      const p = prods.find(item => item.id === s.productId);
      return { ...s, product: p };
    });
    setSuggestions(enriched);
  };

  useEffect(() => {
    loadOrderData();
  }, [selectedShopId]);

  if (!selectedShopId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 font-sans select-none min-h-[60vh]">
        <ShoppingCart className="w-16 h-16 text-gray-300 opacity-80" />
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-gray-800">অর্ডার নেওয়ার জন্য দোকান পছন্দ করুন</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">অর্ডার রেজিস্টার করতে প্রথমে আপনার রুট ম্যাপ থেকে যেকোনো একটি দোকান নির্বাচন করুন।</p>
        </div>
        <button
          onClick={onNavigateToRoute}
          className="bg-[#006d3d] text-white hover:bg-[#00522d] font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-md mt-2 cursor-pointer"
        >
          দোকান তালিকা দেখুন
        </button>
      </div>
    );
  }

  // Cart operations helpers
  const handleItemCountChange = (product: Product, change: number, fromSuggestion: boolean = false) => {
    setCart((prevCart) => {
      const existing = prevCart.find(i => i.product.id === product.id);
      if (existing) {
        const nextQty = existing.quantity + change;
        if (nextQty <= 0) {
          return prevCart.filter(i => i.product.id !== product.id);
        }
        return prevCart.map(i => i.product.id === product.id ? { ...i, quantity: nextQty } : i);
      } else if (change > 0) {
        if (fromSuggestion) {
          // Accept recommendation in backend logs
          dataService.acceptSuggestion(selectedShopId, product.id);
        }
        return [...prevCart, { product, quantity: change }];
      }
      return prevCart;
    });
  };

  const getProductQuantity = (productId: string): number => {
    const item = cart.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  // Submit checkout
  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      alert('অনুগ্রহ করে অর্ডার তৈরি করতে অন্তত একটি পণ্য যুক্ত করুন।');
      return;
    }

    try {
      // B2B defaults to remaining due credit models, or select payment cash models matching rep flow
      const defaultPaymentType = 'বাকি (Credit)';
      const itemsPayload = cart.map(i => ({
        productId: i.product.id,
        quantity: i.quantity,
        unitPrice: i.product.sellPrice
      }));

      const resOrder = await dataService.createOrder({
        shopId: selectedShopId,
        paymentType: defaultPaymentType,
        items: itemsPayload
      });

      // Navigate to success state display
      setSuccessPageRecorded({
        orderId: resOrder.id,
        totalAmount: resOrder.totalAmount,
        itemsCount: cart.reduce((s, c) => s + c.quantity, 0),
        shopName: shop ? shop.shopName : 'ভাই ভাই স্টোর',
        paymentType: defaultPaymentType
      });

      // Clear local cart
      setCart([]);
    } catch (err: any) {
      alert('অর্ডার সাবমিট করতে ত্রুটি দেখা দিয়েছে!');
    }
  };

  const handleFinishSuccessFlow = () => {
    setSuccessPageRecorded(null);
    onOrderSuccess(); // triggers parents updates
  };

  // Calculations for sticky cart element
  const totalAmount = cart.reduce((sum, item) => sum + (item.product.sellPrice * item.quantity), 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filters logic
  const categories = ['সব', 'ব্যক্তিগত যত্ন', 'FMCG', 'মোবাইল এক্সেসরিজ'];
  
  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === 'সব' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (successPageData) {
    /* Exact match to order checkout transaction success visual mockup */
    return (
      <div id="success-flow" className="min-h-[80vh] flex flex-col justify-between items-center py-6 px-2 font-sans select-none animate-fadeUp">
        {/* Animated celebration background top */}
        <div className="text-center space-y-4 mt-6 max-w-sm mx-auto">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto shadow-md relative outline-none success-bounce">
            <Check className="w-12 h-12 text-emerald-800" strokeWidth={3} />
          </div>
          <div className="space-y-1 pt-2">
            <h2 className="text-3xl font-extrabold text-[#00522d] tracking-tight text-center">অর্ডার সফল হয়েছে!</h2>
            <p className="text-xs text-gray-500 font-semibold text-center">অর্ডার #{successPageData.orderId.substring(0, 8).toUpperCase()} · {successPageData.shopName}</p>
          </div>

          {/* Success summary parameters */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col gap-4 text-xs font-semibold text-gray-700">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-400 font-bold block uppercase tracking-wider">মোট আইটেম</span>
              <span className="text-gray-800 text-sm font-extrabold">{formatBengaliNumber(successPageData.itemsCount)}টি</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-400 font-bold block uppercase tracking-wider">মোট পরিমাণ</span>
              <span className="text-[#00522d] text-base font-extrabold">৳ {formatBengaliNumber(successPageData.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="text-gray-400 font-bold block uppercase tracking-wider">পেমেন্ট ধরণ</span>
              <span className="bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-bold">
                বাকি (Credit)
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-gray-400 font-bold block uppercase tracking-wider">সম্ভাব্য ডেলিভারি</span>
              <span className="text-gray-800 font-bold">আগামীকাল</span>
            </div>
          </div>
        </div>

        {/* Action Button Blocks */}
        <div className="w-full max-w-sm space-y-4 pt-10">
          <button
            onClick={handleFinishSuccessFlow}
            className="w-full h-14 bg-[#006d3d] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-1.5 hover:bg-[#00522d] active:scale-[0.98] transition-transform cursor-pointer shadow-md shadow-[#006d3d]/15"
          >
            পরবর্তী তথ্য
            <ArrowRight className="w-4 h-4 text-[#C9A227]" />
          </button>
          <button
            onClick={handleFinishSuccessFlow}
            className="w-full h-14 border-2 border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-sm rounded-2xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
          >
            রসিদ দেখুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Context info banner */}
      <div className="bg-[#006d3d]/5 rounded-3xl p-5 border border-[#006d3d]/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#006d3d] flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShoppingCart className="w-5 h-5 text-[#C9A227]" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">অর্ডার নিচ্ছেন</span>
            <h3 className="font-extrabold text-[#006d3d] text-base">{shop?.shopName}</h3>
          </div>
        </div>

        {/* Change shop */}
        <button
          onClick={onNavigateToRoute}
          className="text-xs font-bold text-[#006d3d] bg-white border border-[#006d3d]/10 px-3 py-1.5 rounded-xl cursor-pointer"
        >
          দোকান বদলান
        </button>
      </div>

      {/* Suggested Products Segment */}
      {suggestions.length > 0 && (
        <section className="bg-amber-50/40 rounded-3xl p-5 border border-amber-100/60 space-y-4">
          <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5 pl-1 uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-[#C9A227] fill-[#C9A227]" />
            এই দোকানের জন্য সাজেস্টেড
          </h4>

          <div className="flex overflow-x-auto gap-4 pb-2 -mx-5 px-5 scroll-smooth hide-scrollbar snap-x snap-mandatory">
            {suggestions.map((sug) => {
              if (!sug.product) return null;
              const qty = getProductQuantity(sug.product.id);
              return (
                <div 
                  key={sug.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 flex flex-col justify-between gap-3 min-w-[200px] max-w-[200px] snap-start shrink-0 relative"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold bg-[#C9A227]/10 text-amber-800 px-2.5 py-0.5 rounded-full inline-block">
                      {sug.reason.substring(0, 18)}...
                    </span>
                    <h5 className="font-bold text-gray-800 text-xs truncate leading-snug pt-1">{sug.product.name}</h5>
                    <p className="text-[10px] text-gray-400 font-medium">৳ {formatBengaliNumber(sug.product.sellPrice)} / {sug.product.packSize}</p>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-gray-100/60 mt-auto">
                    <span className="text-xs font-extrabold text-[#00522d]">৳ {formatBengaliNumber(sug.product.sellPrice)}</span>
                    
                    {qty > 0 ? (
                      <div className="flex items-center bg-gray-50 border border-gray-100 rounded-lg scale-90">
                        <button
                          onClick={() => handleItemCountChange(sug.product!, -1)}
                          className="w-7 h-7 flex items-center justify-center text-rose-500 font-bold text-sm"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-gray-800">{formatBengaliNumber(qty)}</span>
                        <button
                          onClick={() => handleItemCountChange(sug.product!, 1)}
                          className="w-7 h-7 flex items-center justify-center text-[#006d3d] font-bold text-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleItemCountChange(sug.product!, 1, true)}
                        className="w-7 h-7 bg-[#006d3d] text-white hover:bg-[#00522d] rounded-full flex items-center justify-center shadow-sm cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Search Filter for Catalogue */}
      <div className="relative flex items-center bg-white rounded-2xl h-11 border border-gray-100 overflow-hidden px-4">
        <Search className="w-4 h-4 text-gray-400 select-none mr-2 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ক্যাটালগ সার্চ করুন..."
          className="w-full h-full bg-transparent border-none focus:outline-none focus:ring-0 text-xs font-medium text-gray-700 placeholder:text-gray-300"
        />
      </div>

      {/* Category Selection Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scroll-smooth hide-scrollbar -mx-6 px-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 font-bold text-xs rounded-full cursor-pointer transition-colors shadow-sm shrink-0 border ${
              activeCategory === cat 
                ? 'bg-[#006d3d] text-white border-[#006d3d]' 
                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
            }`}
          >
            {cat === 'সব' ? 'সব ক্যাটালগ' : cat}
          </button>
        ))}
      </div>

      {/* General Product List */}
      <section className="space-y-3 pb-24">
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-1">পণ্য ক্যাটালগ</h4>
        
        <div className="flex flex-col gap-3">
          {filteredProducts.map((prod) => {
            const qty = getProductQuantity(prod.id);
            return (
              <div 
                key={prod.id}
                className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-4"
              >
                {/* Product avatar representation */}
                <div className="w-12 h-12 bg-gray-50 text-[#006d3d] rounded-2xl flex items-center justify-center text-sm font-extrabold border border-gray-100/60 shrink-0 select-none">
                  {prod.name.substring(0, 2)}
                </div>

                <div className="flex-grow space-y-0.5 min-w-0">
                  <h5 className="font-extrabold text-gray-800 text-sm truncate">{prod.name}</h5>
                  <p className="text-xs text-gray-400 font-medium">৳ {formatBengaliNumber(prod.sellPrice)} / {prod.packSize}</p>
                </div>

                {qty > 0 ? (
                  /* Quantity Stepper Controller */
                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl shrink-0">
                    <button
                      onClick={() => handleItemCountChange(prod, -1)}
                      className="w-10 h-10 flex items-center justify-center text-rose-500 font-bold active:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-extrabold text-gray-800">{formatBengaliNumber(qty)}</span>
                    <button
                      onClick={() => handleItemCountChange(prod, 1)}
                      className="w-10 h-10 flex items-center justify-center text-[#006d3d] font-bold active:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Add Button */
                  <button
                    onClick={() => handleItemCountChange(prod, 1)}
                    className="h-10 px-4 bg-white border border-[#006d3d] hover:bg-[#006d3d]/5 text-[#006d3d] rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#006d3d]" />
                    অ্যাড করুন
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Sticky Bottom Actions Cart Bar */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-4px_25px_rgba(25,28,30,0.06)] z-40 px-6 py-4 flex justify-between items-center pb-safe">
          <div className="space-y-0.5 select-none">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">মোট {formatBengaliNumber(totalItemsCount)}টি পণ্য</span>
            <span className="text-[22px] font-extrabold text-gray-800">৳ {formatBengaliNumber(totalAmount)}</span>
          </div>

          <button
            onClick={handleConfirmOrder}
            className="bg-[#006d3d] text-white hover:bg-[#00522d] font-semibold text-sm px-6 py-3.5 rounded-2xl flex items-center gap-2 cursor-pointer shadow-md"
          >
            অর্ডার কনফার্ম করুন
            <ArrowRight className="w-4.5 h-4.5 text-[#C9A227]" />
          </button>
        </div>
      )}
    </div>
  );
}

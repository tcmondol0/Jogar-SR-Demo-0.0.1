/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Shop, Product, Order, OrderItem, Transaction, EventLog, Suggestion, UserSession } from './types';

// Storage keys
const KEYS = {
  SHOPS: 'jogar_shops',
  PRODUCTS: 'jogar_products',
  ORDERS: 'jogar_orders',
  ORDER_ITEMS: 'jogar_order_items',
  TRANSACTIONS: 'jogar_transactions',
  EVENTS: 'jogar_events',
  SUGGESTIONS: 'jogar_suggestions',
  SESSION: 'jogar_session'
};

// Seed Helper
function getLocalStorage<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultValue;
  }
}

function setLocalStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Helper to generate IDs
const generateId = (prefix: string = 'id') => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// Initial Demo Seed Data
const INITIAL_SHOPS: Shop[] = [
  {
    id: 'shop_1',
    shopName: 'ভাই ভাই স্টোর',
    ownerName: 'মোঃ করিম শেখ',
    phone: '০১৭৫১২৩৪৫৬৭',
    shopType: 'মুদি দোকান',
    area: 'মিরপুর-১০, ঢাকা',
    lat: 23.8041,
    lng: 90.3664,
    creditLimit: 30000,
    creditBalance: 12500,
    lastOrderSum: 12500,
    visited: false,
    distance: '০.৮ কিমি'
  },
  {
    id: 'shop_2',
    shopName: 'মা ফার্মেসি',
    ownerName: 'ডাঃ সুবল চন্দ্র',
    phone: '০১৮২৫৯৮৭৬৫৪',
    shopType: 'ফার্মেসি',
    area: 'মিরপুর-২, ঢাকা',
    lat: 23.8012,
    lng: 90.3582,
    creditLimit: 20000,
    creditBalance: 4200,
    lastOrderSum: 5200,
    visited: false,
    distance: '১.২ কিমি'
  },
  {
    id: 'shop_3',
    shopName: 'লিজা কসমেটিকস',
    ownerName: 'লিজা আক্তার',
    phone: '০১৯৩৫৪৪৫৫৬৬',
    shopType: 'কসমেটিকস',
    area: 'মিরপুর-১, ঢাকা',
    lat: 23.7956,
    lng: 90.3533,
    creditLimit: 15000,
    creditBalance: 1500,
    lastOrderSum: 4800,
    visited: false,
    distance: '২.৩ কিমি'
  },
  {
    id: 'shop_4',
    shopName: 'ঢাকা জেনারেল স্টোর',
    ownerName: 'আব্দুর রহমান',
    phone: '০১৫৪৫৬৬৭৭৮৮',
    shopType: 'মুদি দোকান',
    area: 'মিরপুর-১১, ঢাকা',
    lat: 23.8123,
    lng: 90.3702,
    creditLimit: 25000,
    creditBalance: 8700,
    lastOrderSum: 8700,
    visited: false,
    distance: '১.৮ কিমি'
  },
  {
    id: 'shop_5',
    shopName: 'বিসমিল্লাহ স্টোর',
    ownerName: 'আলহাজ্ব মোঃ জয়নাল',
    phone: '০১৭৫৯৯৮৮৭৭৬',
    shopType: 'মুদি দোকান',
    area: 'মিরপুর-১২, ঢাকা',
    lat: 23.8214,
    lng: 90.3645,
    creditLimit: 40000,
    creditBalance: 24500,
    lastOrderSum: 14200,
    visited: false,
    distance: '২.৫ কিমি'
  },
  {
    id: 'shop_6',
    shopName: 'মদিনা স্টোর',
    ownerName: 'আবুল হাসেম',
    phone: '০১৬৬৪৭৭৮৮৯৯',
    shopType: 'কসমেটিকস',
    area: 'মিরপুর-১৪, ঢাকা',
    lat: 23.8010,
    lng: 90.3855,
    creditLimit: 15000,
    creditBalance: 3200,
    lastOrderSum: 3200,
    visited: false,
    distance: '২.১ কিমি'
  }
];

const INITIAL_PRODUCTS: Product[] = [
  // ব্যক্তিগত যত্ন (Personal Care)
  {
    id: 'prod_1',
    name: 'লাক্স সাবান রোজ',
    category: 'ব্যক্তিগত যত্ন',
    brand: 'Lux',
    packSize: '১০০ গ্রাম (প্যাক-৬)',
    sellPrice: 320,
    buyPrice: 280
  },
  {
    id: 'prod_2',
    name: 'সানসিল্ক শ্যাম্পু কালো',
    category: 'ব্যক্তিগত যত্ন',
    brand: 'Sunsilk',
    packSize: '১৮০ মিলি বোতল',
    sellPrice: 185,
    buyPrice: 160
  },
  {
    id: 'prod_3',
    name: 'ক্লোজআপ টুথপেস্ট রেড',
    category: 'ব্যক্তিগত যত্ন',
    brand: 'Closeup',
    packSize: '১৪০ গ্রাম টিউব',
    sellPrice: 125,
    buyPrice: 105
  },
  {
    id: 'prod_4',
    name: 'প্যাঁরাসুট নারিকেল তেল',
    category: 'ব্যক্তিগত যত্ন',
    brand: 'Parachute',
    packSize: '২০০ মিলি',
    sellPrice: 150,
    buyPrice: 130
  },

  // FMCG
  {
    id: 'prod_5',
    name: 'ডানো ডাবল ক্রিম গুড়ো দুধ',
    category: 'FMCG',
    brand: 'Dano',
    packSize: '৪০০ গ্রাম প্যাকেট',
    sellPrice: 420,
    buyPrice: 375
  },
  {
    id: 'prod_6',
    name: 'নেসক্যাফে ক্লাসিক কফি',
    category: 'FMCG',
    brand: 'Nescafe',
    packSize: '৫০ গ্রাম জার',
    sellPrice: 240,
    buyPrice: 215
  },
  {
    id: 'prod_7',
    name: 'सुरভি খাঁটি সরিষার তেল',
    category: 'FMCG',
    brand: 'सुरভি',
    packSize: '৫০০ মিলি বোতল',
    sellPrice: 155,
    buyPrice: 138
  },
  {
    id: 'prod_8',
    name: 'প্রাণ মিনিকেট চাল',
    category: 'FMCG',
    brand: 'PRAN',
    packSize: '৫ কেজি বস্তা',
    sellPrice: 325,
    buyPrice: 290
  },

  // মোবাইল এক্সেসরিজ
  {
    id: 'prod_9',
    name: 'রিয়েলমি টাইপ-সি ফাস্ট কেবল',
    category: 'মোবাইল এক্সেসরিজ',
    brand: 'Realme',
    packSize: '১টি ক্যাবল বক্স',
    sellPrice: 120,
    buyPrice: 95
  },
  {
    id: 'prod_10',
    name: 'স্যামসাং কুইক চার্জার ২.০',
    category: 'মোবাইল এক্সেসরিজ',
    brand: 'Samsung',
    packSize: '১টি এডাপ্টার ৩-পিন',
    sellPrice: 250,
    buyPrice: 205
  },
  {
    id: 'prod_11',
    name: 'এমআই ২০,০০০ এমএএইচ পাওয়ার ব্যাংক',
    category: 'মোবাইল এক্সেসরিজ',
    brand: 'Xiaomi',
    packSize: '১টি মেটাল বডি',
    sellPrice: 1200,
    buyPrice: 980
  },
  {
    id: 'prod_12',
    name: 'ইউগ্রিন ইয়ারফোন জ্যাক ৩.৫ মিমি',
    category: 'মোবাইল এক্সেসরিজ',
    brand: 'Ugreen',
    packSize: '১.২ মিটার তার',
    sellPrice: 180,
    buyPrice: 145
  }
];

// Seeding standard setup logs
const INITIAL_EVENTS: EventLog[] = [
  {
    id: 'evt_1',
    eventType: 'user_login',
    actorId: 'sr_1',
    occurredAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    payload: { srName: 'রহিম উদ্দিন', phone: '০১৭১২৩৪৫৬৭৮', device: 'Mobile-Rep' }
  },
  {
    id: 'evt_2',
    eventType: 'sr_checkin',
    actorId: 'sr_1',
    shopId: 'shop_1',
    occurredAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    payload: { lat: 23.8041, lng: 90.3664, shopName: 'ভাই ভাই স্টোর' }
  },
  {
    id: 'evt_3',
    eventType: 'order_placed',
    actorId: 'sr_1',
    shopId: 'shop_1',
    productId: 'prod_1',
    occurredAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    payload: { total: 12500, orderId: 'order_seed_1' }
  },
  {
    id: 'evt_4',
    eventType: 'payment_made',
    actorId: 'sr_1',
    shopId: 'shop_1',
    occurredAt: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
    payload: { amount: 5000, method: 'নগদ', previousBalance: 17500, newBalance: 12500 }
  }
];

const INITIAL_SUGGESTIONS: Suggestion[] = [
  {
    id: 'sug_1',
    shopId: 'shop_1',
    productId: 'prod_1',
    sellScore: 98,
    reason: 'জিলালা ভিত্তিক মুদি দোকানগুলোতে এটি সবচেয়ে বেশি বিক্রি হচ্ছে',
    shown: true,
    accepted: false,
    didSell: false
  },
  {
    id: 'sug_2',
    shopId: 'shop_1',
    productId: 'prod_2',
    sellScore: 92,
    reason: 'এই এলাকায় শ্যাম্পুটির চাহিদা এই সপ্তাহে ২০% বৃদ্ধি পেয়েছে',
    shown: true,
    accepted: false,
    didSell: false
  },
  {
    id: 'sug_3',
    shopId: 'shop_2',
    productId: 'prod_3',
    sellScore: 89,
    reason: 'ফার্মেসিতে ক্লোজআপ টুথপেস্টের সেল অনেক বেশি দেখায়',
    shown: true,
    accepted: false,
    didSell: false
  },
  {
    id: 'sug_4',
    shopId: 'shop_2',
    productId: 'prod_4',
    sellScore: 85,
    reason: 'নতুন স্টক আসার পর পারিপার্শ্বিক দোকানগুলো থেকে ভালো রিটার্ন এসেছে',
    shown: true,
    accepted: false,
    didSell: false
  },
  {
    id: 'sug_5',
    shopId: 'shop_5',
    productId: 'prod_5',
    sellScore: 95,
    reason: 'অন্যান্য পাইকারি বাজারে মালের সংকট থাকার কারণে এটি সাজেস্ট করা হচ্ছে',
    shown: true,
    accepted: false,
    didSell: false
  },
  {
    id: 'sug_6',
    shopId: 'shop_5',
    productId: 'prod_6',
    sellScore: 91,
    reason: 'কফি ক্যাটাগরিতে এটি সেরা ওয়ান-স্টপ চয়েস হিসেবে বিবেচিত',
    shown: true,
    accepted: false,
    didSell: false
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'order_seed_1',
    shopId: 'shop_1',
    srId: 'sr_1',
    channel: 'Jogar App',
    status: 'ডেলিভারড',
    totalAmount: 12500,
    paymentType: 'বাকি (Credit)',
    placedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'order_seed_2',
    shopId: 'shop_2',
    srId: 'sr_1',
    channel: 'Jogar App',
    status: 'ডেলিভারড',
    totalAmount: 5200,
    paymentType: 'বিকাশ',
    placedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    id: 'order_seed_3',
    shopId: 'shop_3',
    srId: 'sr_1',
    channel: 'Jogar App',
    status: 'ডেলিভারড',
    totalAmount: 4800,
    paymentType: 'নগদ',
    placedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
  }
];

const INITIAL_ORDER_ITEMS: OrderItem[] = [
  {
    id: 'item_1',
    orderId: 'order_seed_1',
    productId: 'prod_5',
    quantity: 25,
    unitPrice: 420,
    lineTotal: 10500
  },
  {
    id: 'item_2',
    orderId: 'order_seed_1',
    productId: 'prod_1',
    quantity: 6,
    unitPrice: 320,
    lineTotal: 1920
  },
  {
    id: 'item_3',
    orderId: 'order_seed_2',
    productId: 'prod_2',
    quantity: 10,
    unitPrice: 185,
    lineTotal: 1850
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    shopId: 'shop_1',
    orderId: 'order_seed_1',
    type: 'অর্ডার বকেয়া',
    amount: 12500,
    method: 'নগদ', // defaults
    occurredAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'tx_2',
    shopId: 'shop_1',
    type: 'পেমেন্ট আদায়',
    amount: 5000,
    method: 'নগদ',
    occurredAt: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString()
  },
  {
    id: 'tx_3',
    shopId: 'shop_2',
    type: 'পেমেন্ট আদায়',
    amount: 5200,
    method: 'বিকাশ',
    occurredAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  }
];

// Initialize Data on load
export function initializeDB(force: boolean = false): void {
  if (force || !localStorage.getItem(KEYS.SHOPS)) {
    setLocalStorage(KEYS.SHOPS, INITIAL_SHOPS);
    setLocalStorage(KEYS.PRODUCTS, INITIAL_PRODUCTS);
    setLocalStorage(KEYS.ORDERS, INITIAL_ORDERS);
    setLocalStorage(KEYS.ORDER_ITEMS, INITIAL_ORDER_ITEMS);
    setLocalStorage(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    setLocalStorage(KEYS.EVENTS, INITIAL_EVENTS);
    setLocalStorage(KEYS.SUGGESTIONS, INITIAL_SUGGESTIONS);
  }
}

// Ensure database is initialized at file load time
initializeDB();

// Core DB Functions
export const dataService = {
  // Reset DB
  async resetData(): Promise<void> {
    initializeDB(true);
  },

  // Shops
  async getShops(): Promise<Shop[]> {
    return getLocalStorage<Shop[]>(KEYS.SHOPS, []);
  },

  async getShopById(id: string): Promise<Shop | null> {
    const shops = await this.getShops();
    return shops.find(s => s.id === id) || null;
  },

  // Products
  async getProducts(): Promise<Product[]> {
    return getLocalStorage<Product[]>(KEYS.PRODUCTS, []);
  },

  // Events Logger
  async logEvent(event: Omit<EventLog, 'id' | 'occurredAt'>): Promise<EventLog> {
    const events = getLocalStorage<EventLog[]>(KEYS.EVENTS, []);
    const newEvent: EventLog = {
      ...event,
      id: generateId('evt'),
      occurredAt: new Date().toISOString()
    };
    events.unshift(newEvent); // keep newest first
    setLocalStorage(KEYS.EVENTS, events);
    return newEvent;
  },

  async getEvents(): Promise<EventLog[]> {
    return getLocalStorage<EventLog[]>(KEYS.EVENTS, []);
  },

  // Check In App logic
  async checkInShop(shopId: string, lat: number, lng: number): Promise<Shop> {
    const shops = await this.getShops();
    const shopIndex = shops.findIndex(s => s.id === shopId);
    if (shopIndex === -1) {
      throw new Error('Shop not found');
    }

    shops[shopIndex].visited = true;
    shops[shopIndex].lat = lat;
    shops[shopIndex].lng = lng;

    setLocalStorage(KEYS.SHOPS, shops);

    // log event
    await this.logEvent({
      eventType: 'sr_checkin',
      actorId: 'sr_1',
      shopId,
      payload: { lat, lng, shopName: shops[shopIndex].shopName }
    });

    return shops[shopIndex];
  },

  // Suggestions System
  async getSuggestionsForShop(shopId: string): Promise<Suggestion[]> {
    const suggestions = getLocalStorage<Suggestion[]>(KEYS.SUGGESTIONS, []);
    const shopSuggestions = suggestions.filter(s => s.shopId === shopId);

    if (shopSuggestions.length > 0) {
      return shopSuggestions;
    }

    // Fallback: If no suggestions seeded, dynamically generate 2 suggestions based on shop type
    const shop = await this.getShopById(shopId);
    const products = await this.getProducts();
    if (!shop) return [];

    let matchedProducts = products;
    if (shop.shopType === 'মুদি দোকান') {
      matchedProducts = products.filter(p => p.category === 'FMCG' || p.category === 'ব্যক্তিগত যত্ন');
    } else if (shop.shopType === 'ফার্মেসি') {
      matchedProducts = products.filter(p => p.category === 'ব্যক্তিগত যত্ন');
    } else if (shop.shopType === 'কসমেটিকস') {
      matchedProducts = products.filter(p => p.category === 'ব্যক্তিগত যত্ন');
    }

    const shuffled = [...matchedProducts].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);

    const generated: Suggestion[] = selected.map((prod, idx) => ({
      id: generateId('sug'),
      shopId,
      productId: prod.id,
      sellScore: 90 - idx * 7,
      reason: shop.shopType === 'মুদি দোকান'
        ? 'এই এলাকার মুদি দোকানগুলোতে এই সপ্তাহে বেশ ভালো চলছে।'
        : 'এলাকার অন্যান্য স্টোরে এটি অত্যন্ত জনপ্রিয় পণ্য।',
      shown: true,
      accepted: false,
      didSell: false
    }));

    const allSuggestions = [...suggestions, ...generated];
    setLocalStorage(KEYS.SUGGESTIONS, allSuggestions);

    return generated;
  },

  async acceptSuggestion(shopId: string, productId: string): Promise<void> {
    const suggestions = getLocalStorage<Suggestion[]>(KEYS.SUGGESTIONS, []);
    const itemIndex = suggestions.findIndex(s => s.shopId === shopId && s.productId === productId);
    if (itemIndex !== -1) {
      suggestions[itemIndex].accepted = true;
      suggestions[itemIndex].didSell = true;
      setLocalStorage(KEYS.SUGGESTIONS, suggestions);

      // Log event
      await this.logEvent({
        eventType: 'suggestion_accepted',
        actorId: 'sr_1',
        shopId,
        productId,
        payload: { text: `Suggestion accepted for product ${productId}` }
      });
    }
  },

  // Record Payment
  async recordPayment(shopId: string, amount: number, method: 'নগদ' | 'বিকাশ' | 'নগদ-Nagad'): Promise<{ creditBalance: number; transaction: Transaction }> {
    const shops = await this.getShops();
    const shopIndex = shops.findIndex(s => s.id === shopId);
    if (shopIndex === -1) {
      throw new Error('Shop not found');
    }

    const prevBalance = shops[shopIndex].creditBalance;
    shops[shopIndex].creditBalance = Math.max(0, prevBalance - amount);
    setLocalStorage(KEYS.SHOPS, shops);

    // Create transaction
    const transactions = getLocalStorage<Transaction[]>(KEYS.TRANSACTIONS, []);
    const newTx: Transaction = {
      id: generateId('tx'),
      shopId,
      type: 'পেমেন্ট আদায়',
      amount,
      method,
      occurredAt: new Date().toISOString()
    };
    transactions.unshift(newTx);
    setLocalStorage(KEYS.TRANSACTIONS, transactions);

    // Log Event
    await this.logEvent({
      eventType: 'payment_made',
      actorId: 'sr_1',
      shopId,
      payload: { amount, method, oldBalance: prevBalance, newBalance: shops[shopIndex].creditBalance }
    });

    return {
      creditBalance: shops[shopIndex].creditBalance,
      transaction: newTx
    };
  },

  // Create Order
  async createOrder(orderData: {
    shopId: string;
    paymentType: 'নগদ' | 'বিকাশ' | 'বাকি (Credit)';
    items: { productId: string; quantity: number; unitPrice: number; }[]
  }): Promise<Order> {
    const shops = await this.getShops();
    const shopIndex = shops.findIndex(s => s.id === orderData.shopId);
    if (shopIndex === -1) {
      throw new Error('Shop not found');
    }

    const orders = getLocalStorage<Order[]>(KEYS.ORDERS, []);
    const orderItemsList = getLocalStorage<OrderItem[]>(KEYS.ORDER_ITEMS, []);

    const orderId = generateId('order');
    let totalAmount = 0;

    // Save Order Items
    orderData.items.forEach(itm => {
      const lineTotal = itm.quantity * itm.unitPrice;
      totalAmount += lineTotal;

      const newOrderItem: OrderItem = {
        id: generateId('item'),
        orderId,
        productId: itm.productId,
        quantity: itm.quantity,
        unitPrice: itm.unitPrice,
        lineTotal
      };
      orderItemsList.push(newOrderItem);
    });

    // Create main Order
    const newOrder: Order = {
      id: orderId,
      shopId: orderData.shopId,
      srId: 'sr_1',
      channel: 'Jogar App',
      status: 'ডেলিভারড', // automatically delivered on the spot for distribution models
      totalAmount,
      paymentType: orderData.paymentType,
      placedAt: new Date().toISOString()
    };

    orders.unshift(newOrder);

    // Update Shop credit limits and last order metrics
    shops[shopIndex].lastOrderSum = totalAmount;
    if (orderData.paymentType === 'বাকি (Credit)') {
      shops[shopIndex].creditBalance += totalAmount;
    }

    // Save
    setLocalStorage(KEYS.ORDERS, orders);
    setLocalStorage(KEYS.ORDER_ITEMS, orderItemsList);
    setLocalStorage(KEYS.SHOPS, shops);

    // Add order credit transactions if credit
    if (orderData.paymentType === 'বাকি (Credit)') {
      const transactions = getLocalStorage<Transaction[]>(KEYS.TRANSACTIONS, []);
      const newTx: Transaction = {
        id: generateId('tx'),
        shopId: orderData.shopId,
        orderId,
        type: 'অর্ডার বকেয়া',
        amount: totalAmount,
        method: 'নগদ', // default dummy method
        occurredAt: new Date().toISOString()
      };
      transactions.unshift(newTx);
      setLocalStorage(KEYS.TRANSACTIONS, transactions);
    }

    // Log Event
    await this.logEvent({
      eventType: 'order_placed',
      actorId: 'sr_1',
      shopId: orderData.shopId,
      payload: { totalAmount, paymentType: orderData.paymentType, orderId }
    });

    return newOrder;
  },

  async getOrders(): Promise<Order[]> {
    return getLocalStorage<Order[]>(KEYS.ORDERS, []);
  },

  async getTransactions(): Promise<Transaction[]> {
    return getLocalStorage<Transaction[]>(KEYS.TRANSACTIONS, []);
  },

  // Simple Session Store
  getUserSession(): UserSession | null {
    return getLocalStorage<UserSession | null>(KEYS.SESSION, null);
  },

  saveUserSession(session: UserSession): void {
    setLocalStorage(KEYS.SESSION, session);
  },

  clearUserSession(): void {
    localStorage.removeItem(KEYS.SESSION);
  }
};

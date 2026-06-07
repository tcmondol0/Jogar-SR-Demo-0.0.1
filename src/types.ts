/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Shop {
  id: string;
  shopName: string;
  ownerName: string;
  phone: string;
  shopType: string; // মুদি দোকান (Grocery), ফার্মেসি (Pharmacy), কসমেটিকস (Cosmetics)
  area: string;
  lat: number;
  lng: number;
  creditLimit: number;
  creditBalance: number; // outstanding credit due
  lastOrderSum: number;
  visited: boolean;
  distance?: string; // UI friendly distance representation
}

export interface Product {
  id: string;
  name: string;
  category: string; // 'ব্যক্তিগত যত্ন', 'FMCG', 'মোবাইল এক্সেসরিজ'
  brand: string;
  packSize: string;
  sellPrice: number;
  buyPrice: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  shopId: string;
  srId: string;
  channel: string; // e.g. 'Jogar App'
  status: 'ডেলিভারড' | 'অপেক্ষমান';
  totalAmount: number;
  paymentType: 'নগদ' | 'বিকাশ' | 'বাকি (Credit)';
  placedAt: string; // ISO datetime
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Transaction {
  id: string;
  shopId: string;
  orderId?: string;
  type: 'পেমেন্ট আদায়' | 'অর্ডার বকেয়া';
  amount: number;
  method: 'নগদ' | 'বিকাশ' | 'নগদ-Nagad';
  occurredAt: string; // ISO datetime
}

export interface EventLog {
  id: string;
  eventType: 'user_login' | 'user_logout' | 'order_placed' | 'payment_made' | 'sr_checkin' | 'suggestion_accepted';
  actorId: string;
  shopId?: string;
  productId?: string;
  payload?: any;
  occurredAt: string; // ISO datetime;
}

export interface Suggestion {
  id: string;
  shopId: string;
  productId: string;
  sellScore: number; // out of 100
  reason: string;
  shown: boolean;
  accepted: boolean;
  didSell: boolean;
}

export interface UserSession {
  srId: string;
  srName: string;
  phone: string;
  zone: string;
}

/**
 * Utility to convert English digits to Bengali format and handle commas
 */
export function formatBengaliNumber(num: number): string {
  const englishToBengaliDigits: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  const formattedEnglish = num.toLocaleString('bn-BD'); 
  // Wait, bn-BD might render Bengali numerals natively in some runtimes.
  // To guarantee it works reliably everywhere, we do a manual string map on enLocale
  const engFormatted = num.toLocaleString('en-US');
  return engFormatted.split('').map(char => englishToBengaliDigits[char] || char).join('');
}

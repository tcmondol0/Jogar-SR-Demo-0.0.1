/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { dataService } from '../dataService';
import { UserSession } from '../types';
import { Phone, Lock, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      setError('অনুগ্রহ করে মোবাইল নম্বরটি দিন');
      return;
    }
    if (phoneNumber.length < 8) {
      setError('সঠিক মোবাইল নম্বর প্রদান করুন');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      setIsOtpSent(true);
    }, 800);
  };

  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('অনুগ্রহ করে ৪-ডিজিটের ওটিপি (OTP) দিন');
      return;
    }
    if (otp.length < 4) {
      setError('ওটিপি ৪ সংখ্যার হতে হবে');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userSession: UserSession = {
        srId: 'sr_1',
        srName: 'রহিম উদ্দিন',
        phone: '০১৭৫১২৩৪৫৬৭',
        zone: 'মিরপুর জোন, ঢাকা'
      };

      // Store in DB
      dataService.saveUserSession(userSession);

      // Log Login Event
      await dataService.logEvent({
        eventType: 'user_login',
        actorId: userSession.srId,
        payload: {
          srName: userSession.srName,
          phone: userSession.phone,
          zone: userSession.zone,
          loginTime: new Date().toISOString()
        }
      });

      onLoginSuccess(userSession);
    } catch (e: any) {
      setError('লগইন ব্যর্থ হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#F7F9FB] flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Decorative Top Curves */}
      <div id="decoration-bg" className="absolute top-0 left-0 w-full h-[400px] opacity-25 pointer-events-none -z-10" 
        style={{ 
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCeoX_z9rYAbRTjjmY-HAG1Wdm4FtxE6AYTPpmTV-OE24nNtPLVabvPy19onz_69DuTQEt_90KkOUU1xNR42ZPa6ve8cSUZHgXWm4S2zw-bM8huq2KaYu1zyDVMkql31o2nRW5g1AGaO8RVP9JAoQCPXma2hoN0o-0DSRSCiNJY7-1AuiWYIQUkjVlCUntR130HCuIJ293zIfo8R7OKpqvBw-7eSPkA49Ge-YCgN7YHpFUktmZpZD4D8XvLpvb8f5O2Srx_PZB8a5M')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center top' 
        }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F7F9FB]"></div>
      </div>

      <main className="flex-grow flex flex-col justify-center px-6 w-full max-w-md mx-auto z-10 py-12">
        <div className="w-full space-y-8">
          {/* Logo & Branding */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-[#006d3d] flex items-center justify-center shadow-lg shadow-[#006d3d]/25">
              <span className="text-white text-3xl font-bold tracking-tight">যো</span>
            </div>
            <h1 id="brand-title" className="text-4xl font-extrabold text-[#006d3d] tracking-tight">যোগাড় (Jogar)</h1>
            <p className="text-gray-500 font-medium text-lg">যা লাগবে, যোগাড় হবে</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-md p-8 border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 text-center">
              {isOtpSent ? 'ওটিপি (OTP) যাচাই করুন' : 'সেলস রিপ্রেজেন্টেটিভ লগইন'}
            </h2>

            {error && (
              <div id="login-error" className="p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center border border-red-100 font-medium">
                {error}
              </div>
            )}

            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block" htmlFor="phone">
                    মোবাইল নম্বর
                  </label>
                  <div className="relative flex items-center bg-gray-50 rounded-2xl h-14 border border-gray-100 focus-within:ring-2 focus-within:ring-[#006d3d] focus-within:border-transparent transition-all overflow-hidden">
                    <span className="pl-4 pr-2 font-bold text-gray-400 select-none text-base border-r border-gray-200 mr-2">+৮৮০</span>
                    <Phone className="absolute right-4 text-gray-400 w-5 h-5 pointer-events-none" />
                    <input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="১৭XXXXXXXX"
                      className="w-full h-full bg-transparent border-none focus:outline-none focus:ring-0 font-bold text-gray-700 placeholder:text-gray-300 pr-12 text-base"
                    />
                  </div>
                </div>

                <button
                  id="btn-send-otp"
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-[#006d3d] text-white rounded-2xl font-bold text-base hover:bg-[#00522d] hover:shadow-lg hover:shadow-[#006d3d]/15 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'প্রক্রিয়াধীন...' : 'OTP পাঠান'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyLogin} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                    ৪-ডিজিট ওটিপি (OTP) কোড
                  </label>
                  <p className="text-xs text-gray-400">আপনার মোবাইল নম্বরে পাঠানো ৪ সংখ্যার কোড লিখুন (যেকোনো সংখ্যা গ্রাহ্য)</p>
                  <div className="relative flex items-center bg-gray-50 rounded-2xl h-14 border border-gray-100 focus-within:ring-2 focus-within:ring-[#006d3d] focus-within:border-transparent transition-all overflow-hidden">
                    <span className="pl-4 pr-3 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </span>
                    <input
                      type="text"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="XXXX"
                      className="w-full h-full bg-transparent border-none focus:outline-none focus:ring-0 font-bold text-gray-800 tracking-[0.5em] placeholder:tracking-normal placeholder:text-gray-300 text-center text-lg uppercase"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <button 
                    type="button" 
                    onClick={() => setIsOtpSent(false)} 
                    className="text-gray-500 hover:text-[#006d3d] font-bold"
                  >
                    মোবাইল নম্বর পরিবর্তন
                  </button>
                  <span className="text-gray-400">কোড পাননি? <button type="button" className="text-[#006d3d] font-bold">পুনরায় পাঠান</button></span>
                </div>

                <button
                  id="btn-login"
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-[#006d3d] text-white rounded-2xl font-bold text-base hover:bg-[#00522d] hover:shadow-lg hover:shadow-[#006d3d]/15 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer Design Credits conforming to Anti-AI-Slop strict standard literal branding limits */}
      <footer className="w-full bg-transparent flex flex-col items-center gap-1.5 py-8 text-center shrink-0">
        <p className="text-xs font-semibold text-gray-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A227] fill-[#C9A227]" />
          নিরাপদ লগইন · যোগাড় কর্পোরেট
        </p>
        <p className="text-xs text-gray-400 font-medium">© ২০২৬ যোগাড় (Jogar). সর্বস্বত্ব সংরক্ষিত।</p>
      </footer>
    </div>
  );
}

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { Lock, User } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const redirectIfLoggedIn = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/dashboard');
      }
    };

    redirectIfLoggedIn();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const { session } = data;
      if (!session?.access_token) {
        throw new Error('Login succeeded but no session token was returned.');
      }

      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token ?? '',
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="flex w-full max-w-[850px] flex-col md:flex-row bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden">
        
        {/* Left Side */}
        <div className="w-full md:w-[55%] bg-slate-50/50 p-12 flex flex-col items-center justify-center border-r border-slate-100">
          <h2 className="text-[22px] font-medium text-slate-800 mb-3 text-center tracking-wide">
            Welcome to the website
          </h2>
          
          <div className="relative w-full max-w-[480px] aspect-square">
            <Image 
              src="/images/loginpage.png" 
              alt="Login Illustration" 
              fill
              className="object-cover" 
              priority
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full md:w-[45%] p-10 sm:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-xs mx-auto">
            <h2 className="text-lg font-bold text-slate-800 text-center mb-8 tracking-widest uppercase">
              User Login
            </h2>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Username Input */}
              <div className="flex items-center bg-slate-100 rounded-md px-4 py-3 shadow-sm border border-slate-100">
                <User className="w-4 h-4 text-slate-500"/>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Username"
                  className="bg-transparent border-none outline-none w-full ml-3 text-[13px] text-slate-800 placeholder-slate-400 font-medium"
                />
              </div>

              {/* Password Input */}
              <div className="flex items-center bg-slate-100 rounded-md px-4 py-3 shadow-sm border border-slate-100">
                <Lock className="w-4 h-4 text-slate-500"/>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  className="bg-transparent border-none outline-none w-full ml-3 text-[13px] text-slate-800 placeholder-slate-400 font-medium"
                />
              </div>

              {/* Remember and Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="peer appearance-none w-3.5 h-3.5 rounded-full border border-slate-300 checked:bg-violet-600 checked:border-violet-600 cursor-pointer transition-colors" 
                    />
                    <svg className="absolute w-2 h-2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="ml-2 text-[11px] text-slate-500 font-medium group-hover:text-slate-700 transition-colors">Remember</span>
                </label>
                <button type="button" className="text-[11px] font-medium text-slate-500 hover:text-slate-700 transition-colors">
                  Forgot password ?
                </button>
              </div>

              <div className="pt-6 flex justify-center">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-12 py-2.5 text-[11px] font-bold tracking-wider transition-colors disabled:opacity-70 shadow-md shadow-violet-600/25 uppercase"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


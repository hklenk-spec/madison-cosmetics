import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setCustomerProfile } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login and populate email to profile
    setCustomerProfile(prev => ({
      ...prev,
      email: email || 'gast@madison.de',
    }));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-madison-alabaster flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative luxury abstract elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-madison-gold/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-madison-gold/5 blur-[120px]" />

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 p-10 md:p-12 w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-10 select-none">
          <div className="flex flex-col items-center mb-3">
            <span className="font-zilla text-4xl font-semibold tracking-[0.25em] text-madison-dark">
              MADISON
            </span>
            <span className="font-open text-[10px] tracking-[0.6em] text-madison-gold mt-1 font-bold">
              COSMETICS
            </span>
          </div>
          <p className="text-xs text-madison-muted tracking-[0.1em] font-medium uppercase mt-4">
            B2B Packaging Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold tracking-wider text-madison-charcoal uppercase">
              E-Mail-Adresse
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre@firma.de"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-madison-gold/40 focus:border-transparent transition-all duration-300 placeholder:text-gray-300"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold tracking-wider text-madison-charcoal uppercase">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-madison-gold/40 focus:border-transparent transition-all duration-300 placeholder:text-gray-300"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-madison-dark text-white rounded-xl py-4 text-xs font-bold tracking-[0.2em] uppercase hover:bg-madison-gold transition-colors duration-300 shadow-md mt-4"
          >
            Anmelden
          </button>
        </form>

        {/* Footer info */}
        <p className="text-center text-[10px] text-madison-muted tracking-widest uppercase mt-10">
          © 2026 MADISON COSMETICS GMBH
        </p>
      </div>
    </div>
  );
};

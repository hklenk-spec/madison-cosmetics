import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { customerProfile } = useAppContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Calculate initials from customerProfile if available, fallback to "KD"
  const getInitials = () => {
    if (customerProfile.vorname && customerProfile.nachname) {
      return `${customerProfile.vorname[0]}${customerProfile.nachname[0]}`.toUpperCase();
    }
    return 'KD';
  };

  const navItems = [
    { to: '/dashboard', label: 'Katalog' },
    { to: '/profil', label: 'Mein Profil' },
    { to: '/anfrage', label: 'Meine Anfragen' },
  ];

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/dashboard" className="flex flex-col select-none group">
            <span className="font-zilla text-xl sm:text-2xl font-semibold tracking-[0.25em] text-madison-dark group-hover:text-madison-gold transition-colors duration-300">
              MADISON
            </span>
            <span className="font-open text-[8px] sm:text-[9px] tracking-[0.55em] text-madison-gold -mt-1 font-semibold">
              COSMETICS
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-10">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-300 relative py-2 ${
                    isActive
                      ? 'text-madison-gold font-bold'
                      : 'text-madison-muted hover:text-madison-dark'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-madison-gold rounded-full transition-all duration-300" />
                  )}
                </Link>
              );
            })}

            {/* User Profile Avatar */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="w-10 h-10 rounded-full border border-madison-gold/40 bg-madison-dark text-white flex items-center justify-center text-xs font-bold tracking-wider hover:border-madison-gold hover:shadow-md transition-all duration-300 cursor-pointer">
                {getInitials()}
              </div>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-gray-100 text-madison-dark hover:bg-madison-dark hover:text-white transition-all duration-200"
            aria-label="Navigation öffnen"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-madison-dark/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-down menu panel */}
          <div className="relative bg-white border-b border-gray-100 shadow-2xl animate-slide-down">
            {/* Header with close */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-50">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex flex-col select-none"
              >
                <span className="font-zilla text-xl font-semibold tracking-[0.25em] text-madison-dark">
                  MADISON
                </span>
                <span className="font-open text-[8px] tracking-[0.55em] text-madison-gold -mt-1 font-semibold">
                  COSMETICS
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 rounded-lg border border-gray-100 flex items-center justify-center text-madison-dark hover:bg-madison-dark hover:text-white transition-all duration-200"
                aria-label="Navigation schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav items */}
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all duration-200 ${
                      isActive
                        ? 'bg-madison-dark text-white'
                        : 'text-madison-muted hover:bg-madison-alabaster hover:text-madison-dark'
                    }`}
                  >
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-madison-gold" />
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile user info */}
            <div className="px-4 pb-4 pt-2 border-t border-gray-50 mt-1">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full border border-madison-gold/40 bg-madison-dark text-white flex items-center justify-center text-xs font-bold tracking-wider">
                  {getInitials()}
                </div>
                <div>
                  <span className="text-xs font-bold text-madison-dark block">
                    {customerProfile.vorname && customerProfile.nachname
                      ? `${customerProfile.vorname} ${customerProfile.nachname}`
                      : 'Kundenprofil'}
                  </span>
                  <span className="text-[10px] text-madison-muted">B2B-Konto</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

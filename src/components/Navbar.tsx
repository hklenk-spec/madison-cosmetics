import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { customerProfile } = useAppContext();
  
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
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex flex-col select-none group">
          <span className="font-zilla text-2xl font-semibold tracking-[0.25em] text-madison-dark group-hover:text-madison-gold transition-colors duration-300">
            MADISON
          </span>
          <span className="font-open text-[9px] tracking-[0.55em] text-madison-gold -mt-1 font-semibold">
            COSMETICS
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden sm:flex items-center gap-10">
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

        {/* Mobile Navigation Avatar */}
        <div className="sm:hidden flex items-center">
          <div className="w-9 h-9 rounded-full border border-madison-gold/40 bg-madison-dark text-white flex items-center justify-center text-xs font-bold">
            {getInitials()}
          </div>
        </div>
      </div>
    </nav>
  );
};

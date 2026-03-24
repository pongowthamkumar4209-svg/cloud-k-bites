import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Home, UtensilsCrossed, MapPin, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/',            label: 'Home',        icon: Home },
    { to: '/products',    label: 'Menu',         icon: UtensilsCrossed },
    { to: '/track-order', label: 'Track Order',  icon: MapPin },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      {/* ── Top Navbar ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 glass-nav safe-top">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 max-w-6xl">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-2xl gradient-accent flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-lg">☁️</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-xl font-bold text-foreground tracking-tight">Cloud K</span>
              <span className="text-xs text-muted-foreground block -mt-1 font-body">Bites</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 bg-secondary/60 backdrop-blur-sm rounded-full px-2 py-1.5">
            {links.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'gradient-accent text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/60'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link to="/cart"
              className="relative p-2.5 rounded-2xl glass-card hover:shadow-md transition-all active:scale-95 tap-target flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-foreground" />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full gradient-accent text-white text-xs flex items-center justify-center font-bold shadow-md">
                    {totalItems > 9 ? '9+' : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-2xl glass-card hover:shadow-md transition-all tap-target flex items-center justify-center">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-white/50">
              <div className="px-4 py-3 flex flex-col gap-1 bg-white/60 backdrop-blur-xl">
                {links.map(link => {
                  const Icon = link.icon;
                  return (
                    <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-medium transition-all ${
                        isActive(link.to)
                          ? 'gradient-accent text-white shadow-sm'
                          : 'text-muted-foreground hover:bg-white/80 hover:text-foreground'
                      }`}>
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Mobile Bottom Nav ───────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="glass-nav border-t border-white/60 px-2 pt-2 pb-1">
          <div className="flex items-center justify-around max-w-sm mx-auto">
            {links.map(link => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link key={link.to} to={link.to}
                  className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all tap-target justify-center ${
                    active ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                  <div className={`p-1.5 rounded-xl transition-all ${active ? 'gradient-accent shadow-sm' : ''}`}>
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : ''}`} />
                  </div>
                  <span className={`text-[10px] font-medium ${active ? 'text-primary' : ''}`}>{link.label}</span>
                </Link>
              );
            })}
            {/* Cart in bottom nav */}
            <Link to="/cart"
              className={`flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all tap-target justify-center relative ${
                isActive('/cart') ? 'text-primary' : 'text-muted-foreground'
              }`}>
              <div className={`p-1.5 rounded-xl transition-all relative ${isActive('/cart') ? 'gradient-accent shadow-sm' : ''}`}>
                <ShoppingCart className={`w-5 h-5 ${isActive('/cart') ? 'text-white' : ''}`} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full gradient-accent text-white text-[9px] flex items-center justify-center font-bold">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive('/cart') ? 'text-primary' : ''}`}>Cart</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Bottom spacing for mobile nav */}
      <div className="md:hidden h-20" />
    </>
  );
};

export default Navbar;

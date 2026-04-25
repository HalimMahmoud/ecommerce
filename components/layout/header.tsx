'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, ShoppingCart, Search, Menu, X, Heart, Globe, Sun, Moon, User } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useUI, useCart, useWishlist, useAuth } from '@/lib/store-context';
import { useQueryStates } from 'nuqs';
import { searchParamsSchema } from '@/lib/search-params';
import { authDisplayName } from '@/lib/auth/display-name';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onCartClick: () => void;
  onWishlistClick: () => void;
}

export default function Header({ onCartClick, onWishlistClick }: HeaderProps) {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const { darkMode, setDarkMode } = useUI();
  const { user, loading: authLoading, logout: authLogout } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const [params, setParams] = useQueryStates(searchParamsSchema, {
    shallow: false // Ensure we trigger a server-side re-render
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout(): Promise<void> {
    setLoggingOut(true);
    try {
      await authLogout();
      router.refresh();
    } finally {
      setLoggingOut(false);
      setMenuOpen(false);
    }
  }

  function toggleLanguage() {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    // Set cookie for next-intl (matches NEXT_LOCALE in our i18n/request.ts)
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Also save to localStorage as requested
    localStorage.setItem('halim_locale', nextLocale);
    
    router.refresh();
  }

  return (
    <>
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-xs md:text-sm font-light tracking-wide">
        {t('banner')}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <ShoppingCart className="text-primary" size={24} />
              <span className="text-xl font-light tracking-widest text-foreground">
                {t('siteName')}
              </span>
            </Link>

            {/* Desktop Search and Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {/* Search Bar */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-muted">
                <Search size={18} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('search')}
                  value={params.search ?? ''}
                  onChange={e => setParams({ search: e.target.value || null })}
                  className="text-sm outline-none w-32 bg-transparent text-foreground placeholder-muted-foreground"
                />
              </div>

              {/* Navigation */}
              <nav className="flex items-center gap-8">
                <Link href="/" className="text-sm font-light tracking-wide text-foreground hover:text-primary transition">
                  {t('home')}
                </Link>
                <Link href="/#products" className="text-sm font-light tracking-wide text-foreground hover:text-primary transition">
                  {t('shop')}
                </Link>
                <Link href="/#about" className="text-sm font-light tracking-wide text-foreground hover:text-primary transition">
                  {t('about')}
                </Link>
                <Link href="/#contact" className="text-sm font-light tracking-wide text-foreground hover:text-primary transition">
                  {t('contact')}
                </Link>
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Auth — signed-in: name + logout; guest: sign in + sign up */}
              <div className="hidden items-center gap-2 sm:flex sm:gap-2">
                {authLoading ? (
                  <div
                    className="h-8 w-[10.5rem] max-w-[40vw] animate-pulse rounded-md bg-muted"
                    aria-hidden
                  />
                ) : user ? (
                  <>
                    <span
                      className="inline-flex max-w-[min(11rem,28vw)] items-center gap-1.5 text-xs font-medium text-foreground"
                      title={user.email}
                    >
                      <User className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="truncate">{authDisplayName(user)}</span>
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1.5 font-light tracking-wide"
                      disabled={loggingOut}
                      onClick={() => void handleLogout()}
                    >
                      <LogOut className="size-3.5" aria-hidden />
                      {t('logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: 'sm' }),
                        'font-light tracking-wide'
                      )}
                    >
                      {t('login')}
                    </Link>
                    <Link
                      href="/auth/register"
                      className={cn(buttonVariants({ size: 'sm' }), 'font-light tracking-wide')}
                    >
                      {t('signUp')}
                    </Link>
                  </>
                )}
              </div>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="p-2 text-foreground hover:bg-muted transition"
                aria-label="Toggle language"
              >
                <Globe size={20} />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-foreground hover:bg-muted transition"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Wishlist */}
              <button
                onClick={onWishlistClick}
                className="p-2 text-foreground hover:bg-muted transition relative"
                aria-label="View wishlist"
              >
                <Heart
                  size={20}
                  className={wishlist.length > 0 ? 'fill-primary text-primary' : ''}
                />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-background">
                    {wishlist.length > 99 ? '99+' : wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={onCartClick}
                className="p-2 text-foreground hover:bg-muted transition relative"
                aria-label="View shopping cart"
              >
                <ShoppingCart
                  size={20}
                  className={cartCount > 0 ? 'fill-primary text-primary' : ''}
                />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-background">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-foreground hover:bg-muted transition"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {menuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="mb-4 flex flex-col gap-2">
                {authLoading ? (
                  <div className="h-10 w-full animate-pulse rounded-md bg-muted" aria-hidden />
                ) : user ? (
                  <>
                    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
                      <User className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {authDisplayName(user)}
                        </p>
                        <p className="truncate text-[0.65rem] text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full justify-center font-light"
                      disabled={loggingOut}
                      onClick={() => void handleLogout()}
                    >
                      <LogOut className="size-3.5 me-2" aria-hidden />
                      {t('logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        'w-full justify-center font-light'
                      )}
                    >
                      {t('login')}
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMenuOpen(false)}
                      className={cn(buttonVariants({ size: 'sm' }), 'w-full justify-center font-light')}
                    >
                      {t('signUp')}
                    </Link>
                  </>
                )}
              </div>
              <nav className="flex flex-col gap-4">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-light tracking-wide text-foreground hover:text-primary transition"
                >
                  {t('home')}
                </Link>
                <Link
                  href="/#products"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-light tracking-wide text-foreground hover:text-primary transition"
                >
                  {t('shop')}
                </Link>
                <Link
                  href="/#about"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-light tracking-wide text-foreground hover:text-primary transition"
                >
                  {t('about')}
                </Link>
                <Link
                  href="/#contact"
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-light tracking-wide text-foreground hover:text-primary transition"
                >
                  {t('contact')}
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
}


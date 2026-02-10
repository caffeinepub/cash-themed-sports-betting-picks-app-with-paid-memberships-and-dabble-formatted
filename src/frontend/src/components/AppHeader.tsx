import { Link, useNavigate } from '@tanstack/react-router';
import { Menu, X, Lock, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import LoginButton from './LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useAdmin';
import { useSubscription } from '../hooks/useSubscription';

export default function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: isAdmin } = useIsAdmin();
  const { hasActiveAccess } = useSubscription();

  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/generated/cash-logo.dim_512x512.png" alt="Logo" className="h-10 w-10" />
            <span className="text-xl font-bold bg-gradient-to-r from-cash-green to-cash-gold bg-clip-text text-transparent">
              CashPicks
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-cash-gold"
              activeProps={{ className: 'text-cash-gold' }}
            >
              Home
            </Link>
            <Link
              to="/pricing"
              className="text-sm font-medium transition-colors hover:text-cash-gold"
              activeProps={{ className: 'text-cash-gold' }}
            >
              Pricing
            </Link>
            {isAuthenticated && (
              <Link
                to="/predictions"
                className="text-sm font-medium transition-colors hover:text-cash-gold flex items-center gap-1"
                activeProps={{ className: 'text-cash-gold' }}
              >
                <Lock className="h-3 w-3" />
                Predictions
              </Link>
            )}
            <Link
              to="/support"
              className="text-sm font-medium transition-colors hover:text-cash-gold flex items-center gap-1"
              activeProps={{ className: 'text-cash-gold' }}
            >
              <DollarSign className="h-3 w-3" />
              Send Support
            </Link>
            {isAuthenticated && (
              <Link
                to="/account"
                className="text-sm font-medium transition-colors hover:text-cash-gold"
                activeProps={{ className: 'text-cash-gold' }}
              >
                Account
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-medium transition-colors hover:text-cash-gold"
                activeProps={{ className: 'text-cash-gold' }}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <LoginButton />
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <nav className="container py-4 flex flex-col gap-4">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-cash-gold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/pricing"
              className="text-sm font-medium transition-colors hover:text-cash-gold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            {isAuthenticated && (
              <Link
                to="/predictions"
                className="text-sm font-medium transition-colors hover:text-cash-gold flex items-center gap-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Lock className="h-3 w-3" />
                Predictions
              </Link>
            )}
            <Link
              to="/support"
              className="text-sm font-medium transition-colors hover:text-cash-gold flex items-center gap-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              <DollarSign className="h-3 w-3" />
              Send Support
            </Link>
            {isAuthenticated && (
              <Link
                to="/account"
                className="text-sm font-medium transition-colors hover:text-cash-gold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Account
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="text-sm font-medium transition-colors hover:text-cash-gold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

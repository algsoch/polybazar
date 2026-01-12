'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-nav border-b border-neutral-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="font-bold text-h4 text-gray-900">PolyBazar</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/products"
              className={`text-body font-medium transition-colors ${
                isActive('/products') ? 'text-primary' : 'text-neutral-text hover:text-primary'
              }`}
            >
              Products
            </Link>
            <Link
              href="/sell"
              className={`text-body font-medium transition-colors ${
                isActive('/sell') ? 'text-primary' : 'text-neutral-text hover:text-primary'
              }`}
            >
              Sell
            </Link>
            <Link
              href="/pricing"
              className={`text-body font-medium transition-colors ${
                isActive('/pricing') ? 'text-primary' : 'text-neutral-text hover:text-primary'
              }`}
            >
              Pricing Tools
            </Link>
            <Link
              href="/about"
              className={`text-body font-medium transition-colors ${
                isActive('/about') ? 'text-primary' : 'text-neutral-text hover:text-primary'
              }`}
            >
              About
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="search"
                placeholder="Search products, sellers..."
                className="input pl-10 py-2"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-muted" />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Mobile Search */}
            <button
              className="md:hidden p-2 rounded-button hover:bg-neutral-bg"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <MagnifyingGlassIcon className="w-5 h-5 text-neutral-text" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-button hover:bg-neutral-bg">
              <BellIcon className="w-5 h-5 text-neutral-text" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
            </button>

            {/* User Menu */}
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login" className="btn-ghost text-small">
                Login
              </Link>
              <Link href="/register" className="btn-primary text-small py-2 px-4">
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-button hover:bg-neutral-bg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6 text-neutral-text" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-neutral-text" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {searchOpen && (
          <div className="md:hidden py-3 border-t border-neutral-border animate-slide-up">
            <input
              type="search"
              placeholder="Search products, sellers..."
              className="input"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-border bg-white animate-slide-up">
          <nav className="max-w-7xl mx-auto px-6 py-4 space-y-2">
            <Link
              href="/products"
              className="block py-3 px-4 rounded-button hover:bg-neutral-bg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/sell"
              className="block py-3 px-4 rounded-button hover:bg-neutral-bg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sell
            </Link>
            <Link
              href="/pricing"
              className="block py-3 px-4 rounded-button hover:bg-neutral-bg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing Tools
            </Link>
            <Link
              href="/about"
              className="block py-3 px-4 rounded-button hover:bg-neutral-bg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="pt-4 border-t border-neutral-border flex gap-3">
              <Link href="/login" className="btn-secondary flex-1 text-center">
                Login
              </Link>
              <Link href="/register" className="btn-primary flex-1 text-center">
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

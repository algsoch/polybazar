'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  CubeIcon, 
  PlusCircleIcon, 
  ChartBarIcon, 
  ChatBubbleLeftRightIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { href: '/', icon: HomeIcon, label: 'Home' },
  { href: '/products', icon: CubeIcon, label: 'Products' },
  { href: '/sell', icon: PlusCircleIcon, label: 'Sell' },
  { href: '/dashboard', icon: ChartBarIcon, label: 'Dashboard' },
  { href: '/messages', icon: ChatBubbleLeftRightIcon, label: 'Messages' },
];

const bottomItems = [
  { href: '/profile', icon: UserIcon, label: 'Profile' },
  { href: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-20 flex-col bg-white border-r border-neutral-border z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center h-16 border-b border-neutral-border">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-button">
          <span className="text-white font-bold text-xl">P</span>
        </div>
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`group flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary text-white shadow-button'
                    : 'text-neutral-muted hover:bg-neutral-bg hover:text-primary'
                }`}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="py-4 px-3 border-t border-neutral-border">
        <ul className="space-y-2">
          {bottomItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`group flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary text-white shadow-button'
                    : 'text-neutral-muted hover:bg-neutral-bg hover:text-primary'
                }`}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
          
          {/* Logout */}
          <li>
            <button
              className="w-full group flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-200 text-neutral-muted hover:bg-danger-light hover:text-danger"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}

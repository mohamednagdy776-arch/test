'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const navItems = [
  { label: 'الرئيسية', href: '/dashboard', icon: '🏠' },
  { label: 'البحث', href: '/search', icon: '🔍' },
  { label: 'التوافق', href: '/matching', icon: '💫' },
  { label: 'المجتمعات', href: '/groups', icon: '👥' },
  { label: 'المحادثات', href: '/chat', icon: '💬' },
  { label: 'الملف الشخصي', href: '/profile', icon: '👤' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary/10 text-primary'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

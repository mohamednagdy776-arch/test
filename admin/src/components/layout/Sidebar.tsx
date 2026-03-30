'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Users', href: '/users' },
  { label: 'Matching', href: '/matching' },
  { label: 'Groups', href: '/groups' },
  { label: 'Posts', href: '/posts' },
  { label: 'Payments', href: '/payments' },
  { label: 'Reports', href: '/reports' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary">Tayyibt</h2>
        <p className="text-xs text-gray-400">Admin Panel</p>
      </div>
      <nav className="mt-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'block px-6 py-3 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary/10 text-primary'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

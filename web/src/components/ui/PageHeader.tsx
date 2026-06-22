'use client';
import type { ReactNode } from 'react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

interface PageHeaderProps {
  /** Small eyebrow icon (Phosphor). */
  icon?: PhosphorIcon;
  /** Small uppercase-ish label above the title. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Optional trailing action (button, link, etc.). */
  action?: ReactNode;
}

/**
 * Luxury "Emerald Sanctum" page header — the deep-green→gold gradient hero used
 * on the matching and groups pages, extracted so every page shares one header.
 * Decorative circles use rgba white (not the banned `bg-white` class).
 */
export function PageHeader({ icon: Icon, eyebrow, title, subtitle, action }: PageHeaderProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 55%, var(--accent) 100%)',
        boxShadow: '0 8px 32px color-mix(in srgb, var(--primary) 30%, transparent)',
      }}
    >
      <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
      <div className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <div className="flex items-center gap-1.5 mb-1">
              {Icon && <Icon size={14} weight="fill" className="text-white/70" />}
              <span className="text-[11px] font-semibold text-white/70">{eyebrow}</span>
            </div>
          )}
          <h1 className="text-xl font-extrabold text-white truncate">{title}</h1>
          {subtitle && <p className="text-xs text-white/70 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

import type { User } from '@supabase/supabase-js';
import type { PageType, SessionUser, UserRole } from '../App';

export function getSessionFromSupabaseUser(user: User): {
  user: SessionUser;
  targetPage: PageType;
} {
  const metadata = {
    ...(user.app_metadata ?? {}),
    ...(user.user_metadata ?? {})
  } as Record<string, unknown>;

  const role = normalizeRole(metadata.role);
  const fullName = getString(metadata.full_name) || getString(metadata.name);
  const title = getString(metadata.title) || getDefaultTitle(role);
  const storeName = getString(metadata.store_name);
  const storeSubdomain = getString(metadata.store_subdomain);
  const plan = getString(metadata.plan);

  return {
    user: {
      id: user.id,
      email: user.email ?? '',
      name: fullName || deriveDisplayName(user.email ?? ''),
      role,
      title,
      plan: plan || undefined,
      storeName: storeName || undefined,
      storeSubdomain: storeSubdomain || undefined
    },
    targetPage: getTargetPageForRole(role)
  };
}

export function getTargetPageForRole(role: UserRole): PageType {
  if (role === 'root-admin') {
    return 'root-admin';
  }

  if (role === 'admin') {
    return 'admin';
  }

  return 'dashboard';
}

function normalizeRole(value: unknown): UserRole {
  if (value === 'admin' || value === 'root-admin' || value === 'merchant') {
    return value;
  }

  return 'merchant';
}

function getDefaultTitle(role: UserRole): string {
  if (role === 'root-admin') {
    return 'Root Admin';
  }

  if (role === 'admin') {
    return 'Platform Admin';
  }

  return 'Store Owner';
}

function deriveDisplayName(email: string): string {
  const localPart = email.split('@')[0] || 'user';
  const displayName = localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return displayName || 'User';
}

function getString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

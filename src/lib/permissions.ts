/**
 * Permission utility functions
 */

export type UserPermission = 'admin' | 'creator' | 'user';

/**
 * Check if user has admin permission
 */
export function isAdmin(permission?: string): boolean {
  return permission === 'admin';
}

/**
 * Check if user has creator permission
 */
export function isCreator(permission?: string): boolean {
  return permission === 'creator' || permission === 'admin';
}

/**
 * Check if user has at least creator permission (creator or admin)
 */
export function hasCreatorAccess(permission?: string): boolean {
  return permission === 'creator' || permission === 'admin';
}

/**
 * Check if user has admin permission
 */
export function hasAdminAccess(permission?: string): boolean {
  return permission === 'admin';
}
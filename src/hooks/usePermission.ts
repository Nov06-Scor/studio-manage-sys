import { useAuthStore } from '../store';
import { MODULE_PERMISSIONS, getModulePermissions, getPermissionByCode, ALL_PERMISSION_CODES } from '../config/permissionConfig';

export function usePermission() {
  const user = useAuthStore((state) => state.user);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return permissions.some((perm) => user.permissions?.includes(perm));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return permissions.every((perm) => user.permissions?.includes(perm));
  };

  const hasModuleAccess = (moduleKey: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    const modulePermissions = getModulePermissions(moduleKey);
    if (modulePermissions.length === 0) return true;
    
    return hasAnyPermission(modulePermissions);
  };

  const hasModulePermission = (moduleKey: string, action?: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    const modulePermissions = getModulePermissions(moduleKey);
    if (modulePermissions.length === 0) return true;
    
    if (action) {
      const specificPermission = `${moduleKey}:${action}`;
      return user.permissions?.includes(specificPermission) || false;
    }
    
    return hasAnyPermission(modulePermissions);
  };

  const canAccessRoute = (path: string): boolean => {
    const moduleKey = path === '/' ? 'dashboard' : path.substring(1);
    return hasModuleAccess(moduleKey);
  };

  const getAccessibleModules = (): string[] => {
    if (!user) return [];
    if (user.role === 'admin') return Object.keys(MODULE_PERMISSIONS);
    
    return Object.entries(MODULE_PERMISSIONS)
      .filter(([key, permissions]) => {
        if (permissions.length === 0) return true;
        return hasAnyPermission(permissions);
      })
      .map(([key]) => key);
  };

  const getMissingPermissions = (requiredPermissions: string[]): string[] => {
    if (!user) return requiredPermissions;
    if (user.role === 'admin') return [];
    
    return requiredPermissions.filter(perm => !user.permissions?.includes(perm));
  };

  const getPermissionInfo = (code: string) => {
    return getPermissionByCode(code);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess,
    hasModulePermission,
    canAccessRoute,
    getAccessibleModules,
    getMissingPermissions,
    getPermissionInfo,
    permissions: user?.permissions || [],
    isAdmin: user?.role === 'admin',
    allPermissionCodes: ALL_PERMISSION_CODES,
  };
}
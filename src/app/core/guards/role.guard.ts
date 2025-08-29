import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const RoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const requiredPermissions = route.data?.['requiredPermissions'] as string[];
  const requiredRoles = route.data?.['requiredRoles'] as string[];

  // Check permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission = authService.hasAnyPermission(requiredPermissions);
    if (!hasPermission) {
      router.navigate(['/dashboard']);
      return false;
    }
  }

  // Check roles
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = authService.userRole();
    const hasRole = userRole && requiredRoles.includes(userRole);
    if (!hasRole) {
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
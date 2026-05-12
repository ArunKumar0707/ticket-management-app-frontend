import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    const requiredRoles = route.data?.['roles'] as Role[];
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(this.authService.currentUser!.role);
      if (!hasRole) {
        this.router.navigate(['/dashboard']);
        return false;
      }
    }
    return true;
  }
}

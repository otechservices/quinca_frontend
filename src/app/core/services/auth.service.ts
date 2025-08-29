import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  TwoFactorRequest, 
  AuthState,
  ROLES,
  PERMISSIONS 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly TOKEN_KEY = 'quinca_access_token';
  private readonly REFRESH_TOKEN_KEY = 'quinca_refresh_token';
  private readonly USER_KEY = 'quinca_user';

  // Signals for reactive state management
  private authState = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  // Computed signals
  user = computed(() => this.authState().user);
  isAuthenticated = computed(() => this.authState().isAuthenticated);
  isLoading = computed(() => this.authState().isLoading);
  error = computed(() => this.authState().error);
  userRole = computed(() => this.authState().user?.role?.name);
  userPermissions = computed(() => this.authState().user?.role?.permissions || []);

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.authState.update(state => ({
          ...state,
          user,
          isAuthenticated: true
        }));
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.authState.update(state => ({ ...state, isLoading: true, error: null }));

    // Mock login - replace with real API call
    return this.mockLogin(credentials).pipe(
      tap(response => {
        if (response.requiresTwoFactor) {
          // Store temporary user data for 2FA
          sessionStorage.setItem('temp_user', JSON.stringify(response.user));
          this.router.navigate(['/2fa']);
        } else {
          this.handleSuccessfulAuth(response);
        }
        this.authState.update(state => ({ ...state, isLoading: false }));
      }),
      catchError(error => {
        this.authState.update(state => ({ 
          ...state, 
          isLoading: false, 
          error: error.message || 'Login failed' 
        }));
        return throwError(() => error);
      })
    );
  }

  verifyTwoFactor(request: TwoFactorRequest): Observable<LoginResponse> {
    this.authState.update(state => ({ ...state, isLoading: true, error: null }));

    // Mock 2FA verification - replace with real API call
    return this.mockTwoFactorVerification(request).pipe(
      tap(response => {
        this.handleSuccessfulAuth(response);
        sessionStorage.removeItem('temp_user');
        this.authState.update(state => ({ ...state, isLoading: false }));
      }),
      catchError(error => {
        this.authState.update(state => ({ 
          ...state, 
          isLoading: false, 
          error: error.message || '2FA verification failed' 
        }));
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearAuthData();
    this.authState.update(state => ({
      ...state,
      user: null,
      isAuthenticated: false,
      error: null
    }));
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    // Mock refresh token - replace with real API call
    return of('new_mock_token').pipe(
      tap(newToken => {
        localStorage.setItem(this.TOKEN_KEY, newToken);
      })
    );
  }

  hasPermission(permission: string): boolean {
    const permissions = this.userPermissions();
    return permissions.some(p => p.module + '.' + p.action === permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasRole(role: string): boolean {
    return this.userRole() === role;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private handleSuccessfulAuth(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    
    this.authState.update(state => ({
      ...state,
      user: response.user,
      isAuthenticated: true
    }));

    // Redirect based on user role
    this.redirectAfterLogin(response.user);
  }

  private redirectAfterLogin(user: User): void {
    const role = user.role?.name;
    switch (role) {
      case ROLES.ADMIN:
      case ROLES.MANAGER:
        this.router.navigate(['/dashboard']);
        break;
      case ROLES.CASHIER:
        this.router.navigate(['/sales/pos']);
        break;
      case ROLES.WAREHOUSE_KEEPER:
        this.router.navigate(['/inventory']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem('temp_user');
  }

  // Mock methods - replace with real API calls
  private mockLogin(credentials: LoginRequest): Observable<LoginResponse> {
    // Simulate API delay
    return new Observable(observer => {
      setTimeout(() => {
        // Mock users for testing
        const mockUsers = this.getMockUsers();
        const user = mockUsers.find(u => u.email === credentials.email);
        
        if (user && credentials.password === 'password123') {
          const response: LoginResponse = {
            user,
            accessToken: 'mock_access_token_' + Date.now(),
            refreshToken: 'mock_refresh_token_' + Date.now(),
            requiresTwoFactor: user.twoFactorEnabled
          };
          observer.next(response);
        } else {
          observer.error(new Error('Invalid credentials'));
        }
        observer.complete();
      }, 1000);
    });
  }

  private mockTwoFactorVerification(request: TwoFactorRequest): Observable<LoginResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        // Mock 2FA verification - accept any 6-digit code
        if (request.code.length === 6 && /^\d+$/.test(request.code)) {
          const tempUserStr = sessionStorage.getItem('temp_user');
          if (tempUserStr) {
            const user = JSON.parse(tempUserStr);
            const response: LoginResponse = {
              user,
              accessToken: 'mock_access_token_' + Date.now(),
              refreshToken: 'mock_refresh_token_' + Date.now(),
              requiresTwoFactor: false
            };
            observer.next(response);
          } else {
            observer.error(new Error('Session expired'));
          }
        } else {
          observer.error(new Error('Invalid 2FA code'));
        }
        observer.complete();
      }, 500);
    });
  }

  private getMockUsers(): User[] {
    return [
      {
        id: '1',
        email: 'admin@quinca.com',
        firstName: 'Admin',
        lastName: 'System',
        phone: '+229 12345678',
        roleId: '1',
        role: {
          id: '1',
          name: ROLES.ADMIN,
          displayName: 'Administrateur',
          permissions: [
            { id: '1', module: 'products', action: 'view' },
            { id: '2', module: 'products', action: 'create' },
            { id: '3', module: 'products', action: 'update' },
            { id: '4', module: 'products', action: 'delete' },
            { id: '5', module: 'sales', action: 'view' },
            { id: '6', module: 'sales', action: 'create' },
            { id: '7', module: 'purchases', action: 'view' },
            { id: '8', module: 'purchases', action: 'create' },
            { id: '9', module: 'inventory', action: 'view' },
            { id: '10', module: 'inventory', action: 'transfer' },
            { id: '11', module: 'settings', action: 'view' },
            { id: '12', module: 'settings', action: 'update' },
            { id: '13', module: 'users', action: 'view' },
            { id: '14', module: 'users', action: 'create' },
            { id: '15', module: 'reports', action: 'view' }
          ],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        isActive: true,
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        email: 'manager@quinca.com',
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '+229 87654321',
        roleId: '2',
        role: {
          id: '2',
          name: ROLES.MANAGER,
          displayName: 'Manager',
          permissions: [
            { id: '1', module: 'products', action: 'view' },
            { id: '2', module: 'products', action: 'create' },
            { id: '3', module: 'products', action: 'update' },
            { id: '5', module: 'sales', action: 'view' },
            { id: '6', module: 'sales', action: 'create' },
            { id: '7', module: 'purchases', action: 'view' },
            { id: '8', module: 'purchases', action: 'create' },
            { id: '9', module: 'inventory', action: 'view' },
            { id: '10', module: 'inventory', action: 'transfer' },
            { id: '15', module: 'reports', action: 'view' }
          ],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        isActive: true,
        twoFactorEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        email: 'cashier@quinca.com',
        firstName: 'Marie',
        lastName: 'Kouassi',
        phone: '+229 11223344',
        roleId: '3',
        role: {
          id: '3',
          name: ROLES.CASHIER,
          displayName: 'Caissier',
          permissions: [
            { id: '1', module: 'products', action: 'view' },
            { id: '5', module: 'sales', action: 'view' },
            { id: '6', module: 'sales', action: 'create' }
          ],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        isActive: true,
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
}
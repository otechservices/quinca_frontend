import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';

import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    MessageModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-surface-900 dark:to-surface-800 p-4">
      <div class="w-full max-w-md">
        <!-- Logo and Title -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <i class="pi pi-box text-2xl text-white"></i>
          </div>
          <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-2">QuincaStock</h1>
          <p class="text-surface-600 dark:text-surface-400">{{t('auth.login')}}</p>
        </div>

        <!-- Login Form -->
        <p-card>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Error Message -->
            <p-message 
              *ngIf="errorMessage()" 
              severity="error" 
              [text]="errorMessage()"
              class="w-full">
            </p-message>

            <!-- Email Field -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-medium text-surface-700 dark:text-surface-300">
                {{t('auth.email')}}
              </label>
              <input 
                id="email"
                type="email" 
                pInputText 
                formControlName="email"
                [class.ng-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                class="w-full"
                [placeholder]="t('auth.email')">
              <small 
                *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" 
                class="text-red-500">
                Email is required
              </small>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-medium text-surface-700 dark:text-surface-300">
                {{t('auth.password')}}
              </label>
              <p-password 
                id="password"
                formControlName="password"
                [class.ng-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                styleClass="w-full"
                inputStyleClass="w-full"
                [placeholder]="t('auth.password')"
                [feedback]="false"
                [toggleMask]="true">
              </p-password>
              <small 
                *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" 
                class="text-red-500">
                Password is required
              </small>
            </div>

            <!-- Remember Me -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <p-checkbox 
                  formControlName="rememberMe" 
                  binary="true" 
                  inputId="rememberMe">
                </p-checkbox>
                <label for="rememberMe" class="ml-2 text-sm text-surface-700 dark:text-surface-300">
                  {{t('auth.rememberMe')}}
                </label>
              </div>
              <a href="#" class="text-sm text-primary-600 hover:text-primary-500">
                {{t('auth.forgotPassword')}}
              </a>
            </div>

            <!-- Submit Button -->
            <p-button 
              type="submit"
              [label]="t('auth.signIn')"
              [loading]="isLoading()"
              [disabled]="loginForm.invalid"
              styleClass="w-full"
              size="large">
            </p-button>
          </form>
        </p-card>

        <!-- Demo Credentials -->
        <div class="mt-6 p-4 bg-surface-100 dark:bg-surface-800 rounded-lg">
          <h3 class="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Comptes de démonstration:</h3>
          <div class="space-y-2 text-xs text-surface-600 dark:text-surface-400">
            <div class="flex justify-between">
              <span>Admin:</span>
              <span>admin&#64;quinca.com / password123</span>
            </div>
            <div class="flex justify-between">
              <span>Manager:</span>
              <span>manager&#64;quinca.com / password123</span>
            </div>
            <div class="flex justify-between">
              <span>Caissier:</span>
              <span>cashier&#64;quinca.com / password123</span>
            </div>
          </div>
        </div>

        <!-- Language and Theme Toggle -->
        <div class="flex justify-center gap-4 mt-6">
          <p-button 
            [label]="currentLanguage().toUpperCase()" 
            [text]="true" 
            size="small"
            (onClick)="toggleLanguage()">
          </p-button>
          <p-button 
            [icon]="isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'" 
            [text]="true" 
            size="small"
            (onClick)="toggleTheme()">
          </p-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .p-card {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }

    :host ::ng-deep .p-password input {
      width: 100% !important;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  // Signals
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  // Form
  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Check if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (!response.requiresTwoFactor) {
            // Login successful, navigation handled by auth service
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.message || this.t('auth.invalidCredentials'));
        }
      });
    }
  }

  toggleLanguage() {
    const currentLang = this.translationService.getLanguage();
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    this.translationService.setLanguage(newLang);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  currentLanguage() {
    return this.translationService.getLanguage();
  }

  isDarkMode() {
    return this.themeService.isDarkMode();
  }

  t(key: string): string {
    return this.translationService.t(key);
  }
}
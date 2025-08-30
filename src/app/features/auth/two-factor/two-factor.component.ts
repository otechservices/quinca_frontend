import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

import { AuthService } from '../../../core/services/auth.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-two-factor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    MessageModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-surface-900 dark:to-surface-800 p-4">
      <div class="w-full max-w-md">
        <!-- Logo and Title -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
            <i class="fas fa-shield-alt text-2xl text-white"></i>
          </div>
          <h1 class="text-2xl font-bold text-surface-900 dark:text-surface-0 mb-2">{{t('auth.twoFactor')}}</h1>
          <p class="text-surface-600 dark:text-surface-400">{{t('auth.enterCode')}}</p>
        </div>

        <!-- 2FA Form -->
        <p-card>
          <form [formGroup]="twoFactorForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Error Message -->
            <p-message 
              *ngIf="errorMessage()" 
              severity="error" 
              [text]="errorMessage()"
              class="w-full">
            </p-message>

            <!-- Code Field -->
            <div class="space-y-2">
              <label for="code" class="block text-sm font-medium text-surface-700 dark:text-surface-300 text-center">
                {{t('auth.enterCode')}}
              </label>
              <input 
                id="code"
                type="text" 
                pInputText 
                formControlName="code"
                maxlength="6"
                [class.ng-invalid]="twoFactorForm.get('code')?.invalid && twoFactorForm.get('code')?.touched"
                class="w-full text-center text-2xl tracking-widest"
                placeholder="000000"
                (input)="onCodeInput($event)">
              <small 
                *ngIf="twoFactorForm.get('code')?.invalid && twoFactorForm.get('code')?.touched" 
                class="text-red-500 block text-center">
                Code must be 6 digits
              </small>
            </div>

            <!-- Submit Button -->
            <p-button 
              type="submit"
              [label]="t('auth.verify')"
              [loading]="isLoading()"
              [disabled]="twoFactorForm.invalid"
              styleClass="w-full"
              size="large">
            </p-button>

            <!-- Back to Login -->
            <div class="text-center">
              <p-button 
                label="Back to Login"
                [text]="true"
                size="small"
                (onClick)="backToLogin()">
              </p-button>
            </div>
          </form>
        </p-card>

        <!-- Demo Info -->
        <div class="mt-6 p-4 bg-surface-100 dark:bg-surface-800 rounded-lg text-center">
          <p class="text-sm text-surface-600 dark:text-surface-400">
            <strong>Demo:</strong> Entrez n'importe quel code à 6 chiffres
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .p-card {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class TwoFactorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private translationService = inject(TranslationService);
  private router = inject(Router);

  // Signals
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  // Form
  twoFactorForm: FormGroup;

  constructor() {
    this.twoFactorForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit() {
    // Check if there's a temporary user in session
    const tempUser = sessionStorage.getItem('temp_user');
    if (!tempUser) {
      this.router.navigate(['/login']);
    }
  }

  onSubmit() {
    if (this.twoFactorForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const tempUser = sessionStorage.getItem('temp_user');
      if (!tempUser) {
        this.router.navigate(['/login']);
        return;
      }

      const user = JSON.parse(tempUser);
      const request = {
        userId: user.id,
        code: this.twoFactorForm.value.code
      };

      this.authService.verifyTwoFactor(request).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          // Navigation handled by auth service
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.message || 'Invalid 2FA code');
        }
      });
    }
  }

  onCodeInput(event: any) {
    const value = event.target.value;
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly !== value) {
      this.twoFactorForm.patchValue({ code: digitsOnly });
    }
  }

  backToLogin() {
    sessionStorage.removeItem('temp_user');
    this.router.navigate(['/login']);
  }

  t(key: string): string {
    return this.translationService.t(key);
  }
}
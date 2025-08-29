import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslationService } from '../services/translation.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const translationService = inject(TranslationService);

  return next(req).pipe(
    catchError(error => {
      let errorMessage = '';

      switch (error.status) {
        case 400:
          errorMessage = translationService.t('messages.validationError');
          break;
        case 401:
          errorMessage = translationService.t('messages.accessDenied');
          break;
        case 403:
          errorMessage = translationService.t('messages.accessDenied');
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        case 0:
          errorMessage = translationService.t('messages.networkError');
          break;
        default:
          errorMessage = error.error?.message || error.message || 'An error occurred';
      }

      // Show toast notification for errors (except 401 which is handled by auth interceptor)
      if (error.status !== 401) {
        messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 5000
        });
      }

      return throwError(() => error);
    })
  );
};
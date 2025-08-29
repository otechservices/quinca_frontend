import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ThemeService } from './core/services/theme.service';
import { TranslationService } from './core/services/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToastModule,
    ConfirmDialogModule
  ],
  template: `
    <div class="app-root" [class.dark]="isDarkMode()">
      <router-outlet></router-outlet>
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [`
    .app-root {
      min-height: 100vh;
      transition: all 0.3s ease;
    }
  `]
})
export class AppComponent implements OnInit {
  private themeService = inject(ThemeService);
  private translationService = inject(TranslationService);

  title = 'QuincaStock - Gestion de Stock Quincaillerie';

  ngOnInit() {
    this.themeService.initializeTheme();
    this.translationService.initializeLanguage();
  }

  isDarkMode() {
    return this.themeService.isDarkMode();
  }
}
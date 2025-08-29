import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'quinca_theme';
  private readonly DARK_THEME = 'dark';
  private readonly LIGHT_THEME = 'light';

  // Signal for reactive theme state
  private currentTheme = signal<string>(this.LIGHT_THEME);

  constructor() {
    // Effect to apply theme changes to DOM
    effect(() => {
      this.applyTheme(this.currentTheme());
    });
  }

  initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const theme = savedTheme || (prefersDark ? this.DARK_THEME : this.LIGHT_THEME);
    this.currentTheme.set(theme);
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme() === this.DARK_THEME ? this.LIGHT_THEME : this.DARK_THEME;
    this.setTheme(newTheme);
  }

  setTheme(theme: string): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  isDarkMode(): boolean {
    return this.currentTheme() === this.DARK_THEME;
  }

  getTheme(): string {
    return this.currentTheme();
  }

  private applyTheme(theme: string): void {
    const htmlElement = document.documentElement;
    
    if (theme === this.DARK_THEME) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }

    // Update PrimeNG theme
    this.updatePrimeNGTheme(theme);
  }

  private updatePrimeNGTheme(theme: string): void {
    const themeLink = document.getElementById('theme-link') as HTMLLinkElement;
    
    if (themeLink) {
      const themeName = theme === this.DARK_THEME ? 'lara-dark-blue' : 'lara-light-blue';
      themeLink.href = `assets/themes/${themeName}/theme.css`;
    } else {
      // Create theme link if it doesn't exist
      const link = document.createElement('link');
      link.id = 'theme-link';
      link.rel = 'stylesheet';
      link.type = 'text/css';
      const themeName = theme === this.DARK_THEME ? 'lara-dark-blue' : 'lara-light-blue';
      link.href = `assets/themes/${themeName}/theme.css`;
      document.head.appendChild(link);
    }
  }

  // Listen to system theme changes
  watchSystemTheme(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem(this.THEME_KEY)) {
        // Only auto-switch if user hasn't manually set a theme
        const theme = e.matches ? this.DARK_THEME : this.LIGHT_THEME;
        this.currentTheme.set(theme);
      }
    });
  }
}
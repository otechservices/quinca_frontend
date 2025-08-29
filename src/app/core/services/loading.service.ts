import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingCount = signal<number>(0);
  
  // Public readonly signal
  isLoading = signal<boolean>(false);

  show(): void {
    this.loadingCount.update(count => count + 1);
    this.updateLoadingState();
  }

  hide(): void {
    this.loadingCount.update(count => Math.max(0, count - 1));
    this.updateLoadingState();
  }

  private updateLoadingState(): void {
    this.isLoading.set(this.loadingCount() > 0);
  }
}
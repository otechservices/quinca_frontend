import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Notifications</h2>
      <p>Composant en cours de développement...</p>
    </div>
  `
})
export class NotificationListComponent {
}
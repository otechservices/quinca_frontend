import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unit-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Unités</h2>
      <p>Composant en cours de développement...</p>
    </div>
  `
})
export class UnitListComponent {
}
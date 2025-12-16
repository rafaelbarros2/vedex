import { Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PdvThemeService } from '../../features/pdv/services/pdv-theme.service';

@Component({
  selector: 'app-pdv-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './pdv-layout.component.html',
  styleUrl: './pdv-layout.component.css'
})
export class PdvLayoutComponent {
  isDarkMode = computed(() => this.themeService.isDarkMode());

  constructor(private themeService: PdvThemeService) {}
}
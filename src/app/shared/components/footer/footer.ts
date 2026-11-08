import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiService } from '../../../core/services/ui.service';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent {
  readonly ui = inject(UiService);
  readonly settingsService = inject(SettingsService);
  readonly year = new Date().getFullYear();

  toTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

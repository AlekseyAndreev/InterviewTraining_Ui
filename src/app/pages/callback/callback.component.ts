import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="loading-container">
      <div class="spinner"></div>
     <p style="margin-top: 1rem;">{{ 'CALLBACK.PROCESSING' | translate }}</p>
    </div>
  `
})
export class CallbackComponent {}

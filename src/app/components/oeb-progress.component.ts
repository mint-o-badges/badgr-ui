
import { Component, Input, OnInit } from '@angular/core';
import {
  BrnProgressComponent,
  BrnProgressIndicatorComponent,
} from '@spartan-ng/ui-progress-brain';
import { HlmProgressIndicatorDirective } from './spartan/ui-progress-helm/src';

@Component({
  selector: 'oeb-progress',
  standalone: true,
  imports: [BrnProgressComponent, BrnProgressIndicatorComponent, HlmProgressIndicatorDirective],
  template: `
      <brn-progress hlm aria-labelledby='loading' [value]="value">
        <brn-progress-indicator hlm />
      </brn-progress>
  `,
})
export class OebProgressComponent {
  @Input() value: number;
}

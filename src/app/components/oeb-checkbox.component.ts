import { Component } from '@angular/core';
import { HlmCheckboxComponent } from './spartan/ui-checkbox-helm/src';
import { HlmLabelDirective, HlmLabelModule } from './spartan/ui-label-helm/src';
import { HlmPDirective } from './spartan/ui-typography-helm/src/lib/hlm-p.directive';

@Component({
    selector: 'oeb-checkbox',
    standalone: true,
    imports: [HlmPDirective, HlmCheckboxComponent],
    template: `
        <label class="tw-flex tw-items-center" hlmP>
            <hlm-checkbox class="tw-mr-2"  />
            Accept terms and conditions
        </label>
    `,
})
export class OebCheckboxComponent {}
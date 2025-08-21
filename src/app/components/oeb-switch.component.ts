import { Component, input, signal } from '@angular/core';
import { HlmLabel } from './spartan/ui-label-helm/src';
import { HlmSwitch } from './spartan/ui-switch-helm/src';

import { NgModel } from '@angular/forms';

@Component({
	selector: 'oeb-switch',
	standalone: true,
	imports: [HlmLabel, HlmSwitch],
	template: `
		<label class="tw-flex tw-items-center" hlmLabel>
			<hlm-switch class="tw-mr-2" />
			@if (text()) {
				<span> {{ text() }} </span>
			}
		</label>
	`,
})
export class OebSwitchComponent {
	readonly text = input<string>('');
}

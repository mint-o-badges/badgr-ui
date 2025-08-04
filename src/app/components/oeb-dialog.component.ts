import { Component, Input } from '@angular/core';
import { HlmButtonDirective } from './spartan/ui-button-helm/src';

import {
	HlmDialogDescriptionDirective,
	HlmDialogFooterComponent,
	HlmDialogHeaderComponent,
} from './spartan/ui-dialog-helm/src';

@Component({
	selector: 'oeb-dialog',
	imports: [HlmDialogHeaderComponent, HlmDialogFooterComponent, HlmDialogDescriptionDirective, HlmButtonDirective],
	template: `
		<div class="tw-px-4 tw-py-6">
			@if (title) {
				<hlm-dialog-header>
					<h3 hlmH3>{{ title }}</h3>
					<p hlmP hlmDialogDescription>{{ subtitle }}</p>
				</hlm-dialog-header>
			}
			<ng-content></ng-content>
			@if (footer) {
				<hlm-dialog-footer>
					<button hlmBtn type="submit">Save changes</button>
				</hlm-dialog-footer>
			}
		</div>
	`,
})
export class OebDialogComponent {
	@Input() title: string;
	@Input() subtitle: string;
	@Input() type: string;
	@Input() footer: boolean = false;
	@Input() variant: string = 'default';
}

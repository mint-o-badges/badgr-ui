import { Component, HostBinding, inject } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { OebDialogComponent } from '../../../components/oeb-dialog.component';
import { HlmPDirective } from '../../../components/spartan/ui-typography-helm/src';

import { lucideCheck } from '@ng-icons/lucide';
import { NgIf } from '@angular/common';
import { provideIcons } from '@ng-icons/core';

@Component({
	selector: 'oeb-success-dialog',
	imports: [OebDialogComponent, HlmPDirective, NgIf],
	providers: [provideIcons({ lucideCheck })],
	template: `
		<oeb-dialog [variant]="variant" class="tw-text-center tw-text-purple">
			<div class="tw-flex tw-justify-center">
				<div class="oeb-icon-circle tw-my-6">
					<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
						<circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
						<path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
					</svg>
				</div>
			</div>
			<p *ngIf="recipient; else showText" hlmP class="tw-text-purple">
				Der Badge wurde erfolgreich an <span class="tw-font-bold">{{ recipient }}</span> vergeben.
			</p>
			<ng-template #showText>
				<p hlmP class="tw-text-purple" [innerHTML]="text"></p>
			</ng-template>
		</oeb-dialog>
	`,
	styleUrl: './success-dialog.component.scss',
})
export class SuccessDialogComponent {
	// @HostBinding('class') private readonly _class: string = 'tw-bg-red tw-bg-red';
	private readonly _dialogContext = injectBrnDialogContext<{ text: string; recipient: any; variant: string }>();
	protected readonly recipient = this._dialogContext.recipient;
	protected readonly text = this._dialogContext.text;
	protected readonly variant = this._dialogContext.variant;
	private readonly _dialogRef = inject<BrnDialogRef>(BrnDialogRef);

	public selectUser() {
		this._dialogRef.close();
	}
}

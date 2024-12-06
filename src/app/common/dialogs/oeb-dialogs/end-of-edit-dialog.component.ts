import { Component, inject, Output, EventEmitter } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/ui-dialog-brain';
import { OebDialogComponent } from '../../../components/oeb-dialog.component';
import { lucideTriangleAlert } from '@ng-icons/lucide';
import { HlmIconComponent, provideIcons } from '../../../components/spartan/ui-icon-helm/src';
import { HlmH3Directive, HlmPDirective } from '../../../components/spartan/ui-typography-helm/src';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	selector: 'app-end-of-edit-dialog',
	standalone: true,
	imports: [OebDialogComponent, HlmPDirective, HlmH3Directive, HlmIconComponent, OebButtonComponent, TranslateModule],
	providers: [provideIcons({ lucideTriangleAlert })],
	template: `
		<oeb-dialog variant="danger" class="tw-text-center tw-text-oebblack oeb">
			<div class="tw-flex tw-flex-col tw-gap-2 tw-items-center tw-justify-center">
				<hlm-icon class="tw-text-red" size="xxxl" name="lucideTriangleAlert" />
				<div hlmH3 class="tw-font-bold !tw-text-black tw-uppercase">
					{{ 'Badge.endOfEditDialogTitle' | translate }}
				</div>
				<div hlmP>
					{{
						variant === 'qrcode'
							? ('Badge.endOfEditDialogTextQR' | translate)
							: ('Badge.endOfEditDialogText' | translate)
					}}
				</div>
				<div hlmP class="tw-italic">{{ 'Badge.endOfEditDialogSubText' | translate }}</div>
				<div class="tw-flex tw-flex-row tw-gap-4 tw-justify-center tw-mt-4">
					<oeb-button
						size="md"
						variant="secondary"
						[text]="'General.cancel' | translate"
						(click)="closeDialog()"
					></oeb-button>
					<oeb-button
						[id]="'confirm-award-badge'"
						size="md"
						[text]="'Issuer.giveBadge' | translate"
						(click)="confirmBadge()"
					></oeb-button>
				</div>
			</div>
		</oeb-dialog>
	`,
})
export class EndOfEditDialogComponent {
	private readonly _dialogRef = inject<BrnDialogRef>(BrnDialogRef);
	private readonly _dialogContext = injectBrnDialogContext<{
		text: string;
		delete: any;
		qrCodeRequested: boolean;
		variant: string;
	}>();
	protected readonly variant = this._dialogContext.variant;

	public closeDialog() {
		this._dialogRef.close('cancel');
	}

	public confirmBadge() {
		this._dialogRef.close('confirm');
	}
}

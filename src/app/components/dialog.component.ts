import { Component, inject, Input, TemplateRef } from '@angular/core';
import {
	BrnDialogCloseDirective,
	BrnDialogComponent,
	BrnDialogContentDirective,
	BrnDialogRef,
	BrnDialogTriggerDirective,
	injectBrnDialogContext,
} from '@spartan-ng/brain/dialog';
import {
	HlmDialogComponent,
	HlmDialogContentComponent,
	HlmDialogDescriptionDirective,
	HlmDialogFooterComponent,
	HlmDialogHeaderComponent,
	HlmDialogTitleDirective,
} from './spartan/ui-dialog-helm/src';
import { HlmButtonDirective } from './spartan/ui-button-helm/src';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OebButtonComponent } from './oeb-button.component';
import { OebDialogComponent } from './oeb-dialog.component';

interface DialogContext {
	headerTemplate: TemplateRef<void>;
	tite?: string;
	subtitle?: string;
	variant: 'danger' | 'info' | 'success' | 'default';
	content: TemplateRef<void>;
	templateContext?: Record<string, any>;
}

@Component({
	selector: 'app-dialog',
	standalone: true,
	imports: [
		BrnDialogComponent,
		BrnDialogTriggerDirective,
		BrnDialogContentDirective,
		BrnDialogCloseDirective,

		HlmDialogComponent,
		HlmDialogContentComponent,
		HlmDialogHeaderComponent,
		HlmDialogFooterComponent,
		HlmDialogTitleDirective,
		HlmDialogDescriptionDirective,

		HlmButtonDirective,
		CommonModule,
		TranslateModule,
		OebButtonComponent,
		OebDialogComponent,
	],
	template: `
		<oeb-dialog [variant]="context.variant || 'default'">
			<ng-container *ngIf="context.headerTemplate">
				<ng-container
					*ngTemplateOutlet="context.headerTemplate; context: context.templateContext || {}"
				></ng-container>
			</ng-container>
			<ng-container *ngIf="context.variant == 'success'">
				<div class="tw-text-center tw-text-purple">
					<div class="tw-flex tw-justify-center">
						<div class="oeb-icon-circle tw-my-6">
							<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
								<circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
								<path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
							</svg>
						</div>
					</div>
				</div>
			</ng-container>

			<ng-container *ngIf="isTemplate(context.content); else textContent">
				<ng-container *ngTemplateOutlet="context.content"></ng-container>
			</ng-container>
			<ng-template #textContent>
				<p class="tw-text-center" [innerHTML]="context.content"></p>
			</ng-template>
		</oeb-dialog>
	`,
	styleUrl: './dialog.component.scss',
})
export class DialogComponent {
	private readonly _dialogContext = injectBrnDialogContext<DialogContext>();
	private readonly dialogRef = inject<BrnDialogRef>(BrnDialogRef);
	protected readonly context = this._dialogContext;

	close() {
		this.dialogRef.close();
	}

	public cancel() {
		this.dialogRef.close('cancel');
	}

	public continue() {
		this.dialogRef.close('continue');
	}

	isTemplate(content: any): boolean {
		return content instanceof TemplateRef;
	}

	ngOnInit() {
		console.log(this.context);
	}
}

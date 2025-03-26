import { Component, inject, Input, TemplateRef } from '@angular/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/ui-dialog-brain';
import { HlmDialogFooterComponent, HlmDialogHeaderComponent } from './spartan/ui-dialog-helm/src';
import { HlmButtonDirective } from './spartan/ui-button-helm/src';
import { CommonModule } from '@angular/common';

interface DialogContext {
	headerTemplate: TemplateRef<void>;
	subtitle?: string;
	variant: 'default' | 'danger' | 'info';
	content: TemplateRef<void>;
	footer?: boolean;
	footerButtonText?: string;
}

@Component({
	selector: 'app-dialog',
	standalone: true,
	imports: [HlmDialogHeaderComponent, HlmDialogFooterComponent, HlmButtonDirective, CommonModule],
	template: `
		<div class="dialog-container" [ngClass]="dialogClass">
			<hlm-dialog-header *ngIf="context.headerTemplate">
				<ng-container *ngTemplateOutlet="context.headerTemplate"></ng-container>
			</hlm-dialog-header>

			<div class="dialog-body">
				<ng-container *ngTemplateOutlet="context.content"></ng-container>
			</div>

			<hlm-dialog-footer *ngIf="context.footer">
				<ng-content select="[footer-actions]">
					<!-- Default action button if nothing projected -->
					<button hlmBtn type="button" (click)="close()">
						{{ context.footerButtonText ?? 'Close' }}
					</button>
				</ng-content>
			</hlm-dialog-footer>
		</div>
	`,
	styles: [
		`
			.dialog-container {
				@apply tw-px-6 tw-py-6 tw-rounded-[10px] tw-bg-white tw-border-solid tw-border-4;
			}
		`,
	],
})
export class DialogComponent {
	private readonly _dialogContext = injectBrnDialogContext<DialogContext>();
	private readonly dialogRef = inject<BrnDialogRef>(BrnDialogRef);
	protected readonly context = this._dialogContext;

	get dialogClass() {
		return {
			'tw-border-red': this.context.variant === 'danger',
			'tw-border-link': this.context.variant === 'info',
			'tw-border-purple': this.context.variant === 'default',
		};
	}

	close() {
		this.dialogRef.close();
	}
}

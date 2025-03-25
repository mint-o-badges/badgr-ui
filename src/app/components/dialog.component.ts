import { Component, inject, Input, TemplateRef } from '@angular/core';
import {
	BrnDialogComponent,
	BrnDialogTriggerDirective,
	BrnDialogContentDirective,
	BrnDialogCloseDirective,
	BrnDialogRef,
	injectBrnDialogContext
} from '@spartan-ng/ui-dialog-brain';
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
		CommonModule
	],
	template: `
			<div class="dialog-container" [ngClass]="dialogClass">
				<hlm-dialog-header>
					<ng-container *ngIf="context.headerTemplate">
						<ng-container *ngTemplateOutlet="context.headerTemplate"></ng-container>
					</ng-container>
				</hlm-dialog-header>

				<div class="dialog-body">
					<ng-container *ngIf="isTemplate(context.content); else textContent">
						<ng-container *ngTemplateOutlet="context.content"></ng-container>
					</ng-container>
					<ng-template #textContent>
						<p class='tw-text-center' [innerHTML]="context.content"></p>
					</ng-template>						
				</div>

				<hlm-dialog-footer *ngIf="context.footer">
					<ng-container *ngIf="isTemplate(context.footer); else defaultFooter">
						<ng-container *ngTemplateOutlet="context.footer"></ng-container>
					</ng-container>
					<ng-template #defaultFooter>
						<ng-content select="[footer-actions]">
						<!-- Default action button if nothing projected -->
						<oeb-button  type="button" (click)="close()">
							{{ context.footerButtonText ?? 'Close' }}
						</oeb-button>
						</ng-content>
					</ng-template>
				</hlm-dialog-footer>
			</div>
	`,
	styles: [`
		.dialog-container {
			@apply tw-px-6 tw-py-6 tw-rounded-[10px] tw-bg-white tw-border-solid tw-border-4;
		}
	`]
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

	public cancel() {
		this.dialogRef.close('cancel');
	}

	public continue() {
		this.dialogRef.close('continue');
	}

	isTemplate(content: any): boolean {
		return content instanceof TemplateRef;
	}
}

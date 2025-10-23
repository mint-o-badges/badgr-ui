import { Component, ElementRef, Renderer2, inject } from '@angular/core';
import { BaseDialog } from './base-dialog';
import { NgIcon } from '@ng-icons/core';
import { HlmIcon } from '@spartan-ng/helm/icon';

export interface ConfirmDialogOptions {
	dialogTitle?: string;
	dialogBody: string;
	resolveButtonLabel?: string;
	rejectButtonLabel?: string;
	showCloseBox?: boolean;
	showRejectButton?: boolean;
	disableConfirm?: boolean;
}

@Component({
	selector: 'confirm-dialog',
	template: `
		<dialog class="dialog dialog-is-active dialog l-dialog">
			<div class="dialog-x-box o-container">
				<div class="u-padding-all3x">
					<div class="l-flex l-flex-justifybetween u-margin-bottom2x">
						<h2 class="u-text-body-bold-caps text-dark1">
							{{ options.dialogTitle }}
						</h2>
						<button (click)="rejectDialog()" class="buttonicon buttonicon-link">
							<ng-icon hlm name="lucideX" />
							<span class="visuallyhidden">Close</span>
						</button>
					</div>
					<p class="u-text-body" [innerHTML]="options.dialogBody"></p>

					<div class="l-stack l-stack-buttons u-margin-top3x">
						<button [disabled]="options.disableConfirm" class="button" (click)="resolveDialog()">
							{{ options.resolveButtonLabel }}
						</button>
						@if (options.showRejectButton) {
							<button class="button button-secondary" (click)="rejectDialog()">
								{{ options.rejectButtonLabel }}
							</button>
						}
					</div>
				</div>
			</div>
		</dialog>
	`,
	imports: [NgIcon, HlmIcon],
})
export class ConfirmDialog extends BaseDialog {
	static defaultOptions = {
		dialogTitle: 'Confirm',
		dialogBody: 'Please confirm',
		rejectButtonLabel: 'Cancel',
		resolveButtonLabel: 'OK',
		showCloseBox: true,
		showRejectButton: true,
		disableConfirm: false,
	} as ConfirmDialogOptions;

	options: ConfirmDialogOptions = ConfirmDialog.defaultOptions;
	resolveFunc: () => void;
	rejectFunc: () => void;

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {
		const componentElem = inject(ElementRef);
		const renderer = inject(Renderer2);

		super(componentElem, renderer);
	}

	/**
	 * Opens the confirm dialog with the given options. If the user clicks the "resolve" button, the promise will be
	 * resolved, otherwise, it will be rejected.
	 *
	 * @param options Options for the dialog
	 * @returns {Promise<void>}
	 */
	openResolveRejectDialog(options: ConfirmDialogOptions): Promise<void> {
		if (this.isOpen) {
			return Promise.reject(
				new Error(
					'Cannot open dialog, because it is already open. Old options' +
						JSON.stringify(this.options) +
						'; new options: ' +
						JSON.stringify(options),
				),
			);
		}

		this.options = Object.assign({}, ConfirmDialog.defaultOptions, options);
		this.showModal();

		return new Promise<void>((resolve, reject) => {
			this.resolveFunc = resolve;
			this.rejectFunc = reject;
		});
	}

	/**
	 * Opens the confirm dialog with the given options. If the user clicks the "resolve" button, the promise will be
	 * resolved with `true`, otherwise it will be _resolved_ with `false`. This is meant for easier use with `await`.
	 *
	 * @param options Options for the dialog
	 * @returns {Promise<boolean>}
	 */
	openTrueFalseDialog(options: ConfirmDialogOptions): Promise<boolean> {
		return this.openResolveRejectDialog(options).then(
			() => true,
			() => false,
		);
	}

	rejectDialog() {
		this.closeModal();
		this.rejectFunc();
	}
	resolveDialog() {
		this.closeModal();
		this.resolveFunc();
	}
}

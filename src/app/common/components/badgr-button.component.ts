import { Component, Input } from '@angular/core';
import { MessageService } from '../services/message.service';
import { NgIf } from '@angular/common';

@Component({
    selector: 'button[loading-promises],.button[loading-promises],button[disabled-when-requesting],.button[disabled-when-requesting],button[loading-when-requesting],.button[loading-when-requesting]',
    host: {
        '[class.button-is-loading]': 'showLoadindMessage',
        '[class.button-is-disabled]': 'disabledForLoading',
        '[attr.disabled]': 'disabledForLoading ? true : null',
    },
    template: `
		<ng-content *ngIf="!showLoadindMessage"></ng-content>
		<ng-container *ngIf="showLoadindMessage && loadingMessage">{{ loadingMessage }}</ng-container>
	`,
    imports: [NgIf],
})
export class BadgrButtonComponent {
	loadingPromise: Promise<unknown>;
	promiseLoading = false;

	@Input('disabled-when-requesting')
	disabledWhenRequesting = false;

	@Input('loading-when-requesting')
	loadingWhenRequesting = false;

	@Input('loading-message')
	loadingMessage = 'Loading';

	@Input('loading-promises')
	set inputPromises(promises: Promise<unknown> | Array<Promise<unknown>> | null) {
		this.updatePromises(promises ? (Array.isArray(promises) ? promises.filter((p) => !!p) : [promises]) : []);
	}

	get showLoadindMessage() {
		return this.promiseLoading || (this.loadingWhenRequesting && this.messageService.pendingRequestCount > 0);
	}

	get disabledForLoading() {
		return this.showLoadindMessage || (this.disabledWhenRequesting && this.messageService.pendingRequestCount > 0);
	}

	constructor(private messageService: MessageService) {}

	private updatePromises(promises: Array<Promise<unknown>>) {
		if (promises.length === 0) {
			this.loadingPromise = null;
			this.promiseLoading = false;
		} else {
			const ourPromise = (this.loadingPromise = Promise.all(promises));

			this.promiseLoading = true;

			ourPromise.then(
				() => {
					if (ourPromise === this.loadingPromise) {
						this.promiseLoading = false;
					}
				},
				() => {
					if (ourPromise === this.loadingPromise) {
						this.promiseLoading = false;
					}
				},
			);
		}
	}
}

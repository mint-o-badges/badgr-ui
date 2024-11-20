import { Component, Input, input } from '@angular/core';
import { HlmButtonDirective } from './spartan/ui-button-helm/src';
import { NgIf, NgClass } from '@angular/common';
import { MessageService } from '../common/services/message.service';
import { HlmIconModule, provideIcons } from './spartan/ui-icon-helm/src';
import { lucidePlus, lucideUpload, lucideCircleX } from '@ng-icons/lucide';

@Component({
	selector: 'oeb-button',
	standalone: true,
	imports: [HlmButtonDirective, NgIf, NgClass, HlmIconModule],
	providers: [MessageService, provideIcons({ lucideUpload, lucidePlus, lucideCircleX })],
	template: `<button
		[type]="type"
		class="tw-relative"
		hlmBtn
		[disabled]="disabled"
		[width]="width"
		[size]="size"
		[variant]="variant"
		[attr.id]="id"
	>
		<hlm-icon *ngIf="icon" [ngClass]="{ 'tw-mr-4': iconLeft }" [size]="size" [name]="icon" />
		<img *ngIf="img" class="md:tw-h-[30px] tw-h-[20px] tw-pr-4" [src]="img" />
		<span [ngClass]="{ 'tw-text-[15px]': fontSize15 }" [innerHTML]="showLoadingMessage && loadingMessage ? loadingMessage : text"></span>
	</button> `,
})
export class OebButtonComponent {
	loadingPromise: Promise<unknown>;
	promiseLoading = false;

	@Input() variant: string = 'default';
	@Input() size: string = 'default';
	@Input() width: string = 'default';
	@Input() disabled: boolean = false;
	@Input() text: string = undefined;
	@Input() img: string = undefined;
	@Input() icon: string = undefined;
	@Input() type: string = 'submit';
	@Input() id: string = null;
	@Input() fontSize15: boolean = false;
	@Input() iconLeft: boolean = false;

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

	get showLoadingMessage() {
		return this.promiseLoading || (this.loadingWhenRequesting && this.messageService.pendingRequestCount > 0);
	}

	get disabledForLoading() {
		return this.showLoadingMessage || (this.disabledWhenRequesting && this.messageService.pendingRequestCount > 0);
	}

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
	constructor(private messageService: MessageService) { }
}
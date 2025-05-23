import { NgIcon } from '@ng-icons/core';
import { Component } from '@angular/core';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { HlmIconDirective } from '../../../components/spartan/ui-icon-helm/src';
import { TranslateModule } from '@ngx-translate/core';
import { provideIcons } from '@ng-icons/core';
import { lucideCopy } from '@ng-icons/lucide';
import { injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { RecipientBadgeCollection } from '../../../recipient/models/recipient-badge-collection.model';
import { QRCodeElementType, FixMeLater, QRCodeComponent } from 'angularx-qrcode';
import { SafeUrl } from '@angular/platform-browser';

@Component({
	selector: 'share-dialog-template',
	imports: [OebButtonComponent, NgIcon, HlmIconDirective, TranslateModule, QRCodeComponent],
	providers: [provideIcons({ lucideCopy })],
	template: `
		<div class="tw-my-4 tw-px-6">
			<h2 class="tw-text-purple tw-text-[22px] tw-font-bold">{{ caption }}</h2>
			<div
				class=" tw-mt-2 tw-flex tw-relative tw-items-center tw-border-purple tw-border-solid tw-border tw-rounded-md"
			>
				<input
					type="text"
					name="forminput"
					readonly
					changeOrder
					class="!tw-bg-white focus:tw-outline-none tw-w-full tw-border-1 tw-border-purple min-[880px]:tw-w-96 tw-border-solid tw-h-12 tw-rounded-lg tw-p-2"
					hlmInput
					(click)="$event.target.select()"
					[value]="collection.shareUrl"
					#urlInput
				/>
				<button
					class="tw-w-8 tw-h-8 tw-absolute tw-top-1/2 tw-right-2 -tw-translate-y-1/2 tw-text-white tw-bg-purple tw-px-2 tw-rounded-md"
					(click)="copyToClipboard(urlInput)"
				>
					<ng-icon hlm name="lucideCopy"></ng-icon>
				</button>
			</div>
			<div class="tw-mt-2">
				<oeb-button (click)="saveAsImage(qrcode)" size="sm" [text]="'QrCode.download' | translate">
				</oeb-button>
			</div>
		</div>

		<qrcode [className]="'tw-hidden'" #qrcode [qrdata]="qrData"></qrcode>
	`,
})
export class ShareDialogTemplateComponent {
	constructor() {}

	private readonly _dialogContext = injectBrnDialogContext<{
		caption: string;
		collection: RecipientBadgeCollection;
	}>();
	protected readonly collection = this._dialogContext.collection;
	protected readonly caption = this._dialogContext.caption;

	public qrCodeDownloadLink: SafeUrl = '';
	public elementType: QRCodeElementType = 'canvas';
	qrData: string;

	ngOnInit() {
		this.qrData = this.collection.shareUrl;
	}

	copyToClipboard(input: HTMLInputElement) {
		// Inspired by https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript

		const inputWasDisabled = input.disabled;
		input.disabled = false;
		input.select();

		// Invoke browser support
		try {
			if (document.execCommand('copy')) {
				return;
			}
		} catch (err) {
		} finally {
			input.disabled = inputWasDisabled;
		}
	}

	// Code from https://github.com/Cordobo/angularx-qrcode/blob/9eab0cb688049d4cd42e0da2b76826aed64e3dd6/projects/demo-app/src/app/app.component.ts#L225
	saveAsImage(parent: FixMeLater) {
		let parentElement = null;

		if (this.elementType === 'canvas') {
			// fetches base 64 data from canvas
			parentElement = parent.qrcElement.nativeElement.querySelector('canvas').toDataURL('image/png');
		} else if (this.elementType === 'img' || this.elementType === 'url') {
			// fetches base 64 data from image
			// parentElement contains the base64 encoded image src
			// you might use to store somewhere
			parentElement = parent.qrcElement.nativeElement.querySelector('img').src;
		} else {
			alert("Set elementType to 'canvas', 'img' or 'url'.");
		}

		if (parentElement) {
			// converts base 64 encoded image to blobData
			let blobData = this.convertBase64ToBlob(parentElement);
			// saves as image
			const blob = new Blob([blobData], { type: 'image/png' });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			// name of the file
			link.download = `${'test'}-qrcode.png`;
			link.click();
		}
	}

	private convertBase64ToBlob(Base64Image: string) {
		// split into two parts
		const parts = Base64Image.split(';base64,');
		// hold the content type
		const imageType = parts[0].split(':')[1];
		// decode base64 string
		const decodedData = window.atob(parts[1]);
		// create unit8array of size same as row data length
		const uInt8Array = new Uint8Array(decodedData.length);
		// insert all character code into uint8array
		for (let i = 0; i < decodedData.length; ++i) {
			uInt8Array[i] = decodedData.charCodeAt(i);
		}
		// return blob image after conversion
		return new Blob([uInt8Array], { type: imageType });
	}
}

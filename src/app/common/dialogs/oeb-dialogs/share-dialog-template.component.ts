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
import { saveAsImage } from '../../util/qrcode-util';

@Component({
	selector: 'share-dialog-template',
	imports: [OebButtonComponent, NgIcon, HlmIconDirective, TranslateModule, QRCodeComponent],
	providers: [provideIcons({ lucideCopy })],
	template: `
		<div class="tw-my-4 tw-px-6 tw-flex tw-flex-col tw-gap-6">
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
					class="tw-w-8 tw-h-8 tw-absolute tw-top-1/2 tw-right-2 -tw-translate-y-1/2 tw-text-white tw-bg-purple tw-flex tw-justify-center tw-items-center tw-rounded-md"
					(click)="copyToClipboard(urlInput)"
				>
					<ng-icon hlm name="lucideCopy"></ng-icon>
				</button>
			</div>
			<div class="tw-mt-2">
				<oeb-button
					(click)="saveQrCodeAsImage(qrcode)"
					size="sm"
					[text]="'BadgeCollection.downloadQrCode' | translate"
				>
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

	saveQrCodeAsImage(parent) {
		saveAsImage(parent, `${this.collection.name}-qrcode.png`);
	}
}

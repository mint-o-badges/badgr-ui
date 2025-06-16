import { Component, NgZone, signal, WritableSignal } from '@angular/core';
import { OebButtonComponent } from '../../../components/oeb-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideIcons } from '@ng-icons/core';
import { lucideCopy } from '@ng-icons/lucide';
import { injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { RecipientBadgeCollection } from '../../../recipient/models/recipient-badge-collection.model';
import { QRCodeElementType, QRCodeComponent } from 'angularx-qrcode';
import { SafeUrl } from '@angular/platform-browser';
import { saveAsImage } from '../../util/qrcode-util';

@Component({
	selector: 'share-dialog-template',
	imports: [OebButtonComponent, TranslateModule, QRCodeComponent],
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
					class="!tw-bg-white focus:tw-outline-none tw-w-full tw-border-1 tw-border-purple min-[880px]:tw-w-96 tw-border-solid tw-h-12 tw-rounded-lg"
					hlmInput
					(click)="$event.target.select()"
					[value]="collection.shareUrl"
					#urlInput
				/>
				<oeb-button
					class="tw-absolute tw-top-1/2 tw-right-0 -tw-translate-y-1/2 tw-scale-75"
					(click)="copyToClipboard(urlInput)"
					icon="lucideCopy"
					[size]="'icon'"
				/>
				<span [hidden]="!copied()" class="tw-absolute tw-top-full">{{
					'BadgeCollection.copiedToClipboard' | translate
				}}</span>
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
	constructor(private zone: NgZone) {}
	private readonly COPY_NOTIF_TIMEOUT_MS: number = 3000;

	private readonly _dialogContext = injectBrnDialogContext<{
		caption: string;
		collection: RecipientBadgeCollection;
	}>();
	protected readonly collection = this._dialogContext.collection;
	protected readonly caption = this._dialogContext.caption;

	public qrCodeDownloadLink: SafeUrl = '';
	public elementType: QRCodeElementType = 'canvas';
	qrData: string;
	copied: WritableSignal<boolean> = signal(false);

	ngOnInit() {
		this.qrData = this.collection.shareUrl;
	}

	async copyToClipboard(input: HTMLInputElement) {
		const valueToCopy = input.value;
		try {
			await navigator.clipboard.writeText(valueToCopy);
			this.zone.run(() => {
				this.copied.set(true);
				window.setTimeout(() => {
					this.copied.set(false);
				}, this.COPY_NOTIF_TIMEOUT_MS);
			});
		} catch (err) {
			console.warn(err);
			this.copied.set(false);
		}
	}

	saveQrCodeAsImage(parent) {
		saveAsImage(parent, `${this.collection.name}-qrcode.png`);
	}
}

import { Component, ElementRef, Renderer2 } from '@angular/core';

import { SharedObjectType, ShareEndPoint, ShareServiceType, SharingService } from '../../services/sharing.service';
import { BaseDialog } from '../base-dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { addQueryParamsToUrl } from '../../util/url-util';
import { TimeComponent } from '../../components/time.component';
import { generateEmbedHtml } from '../../../../embed/generate-embed-html';
import { animationFramePromise } from '../../util/promise-util';
import { RecipientBadgeInstance } from '../../../recipient/models/recipient-badge.model';
import { BadgeInstance } from '../../../issuer/models/badgeinstance.model';

@Component({
	selector: 'share-social-dialog',
	templateUrl: 'share-social-dialog.component.html',
	standalone: false,
})
export class ShareSocialDialog extends BaseDialog {
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Internal API

	get currentShareUrl() {
		const params = {};
		params[`identity__${this.options.recipientType || 'email'}`] = this.options.recipientIdentifier;
		return this.includeRecipientIdentifier
			? addQueryParamsToUrl(this.options.shareUrl, params)
			: this.options.shareUrl;
	}

	get hasEmbedSupport() {
		return this.options && this.options.embedOptions && this.options.embedOptions.length;
	}

	options: ShareSocialDialogOptions | null = null;

	resolveFunc: () => void;
	rejectFunc: () => void;

	currentTabId: ShareSocialDialogTabId = 'link';

	selectedEmbedOption: ShareSocialDialogEmbedOption | null = null;

	includeRecipientIdentifier = false;
	includeBadgeClassName = true;
	includeRecipientName = true;
	includeAwardDate = true;
	includeVerifyButton = true;

	currentEmbedHtml: string | null = null;

	linkedInCertURL: string = null;

	constructor(
		componentElem: ElementRef<HTMLElement>,
		renderer: Renderer2,
		private domSanitizer: DomSanitizer,
		private sharingService: SharingService,
	) {
		super(componentElem, renderer);

		this.updateEmbedHtml();
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Public Dialog API

	async openDialog(customOptions: ShareSocialDialogOptions): Promise<void> {
		this.options = Object.assign({}, customOptions);
		this.showModal();

		this.currentTabId = 'link';
		this.selectedEmbedOption = (this.options.embedOptions && this.options.embedOptions[0]) || null;
		this.currentEmbedHtml = null;

		this.updateEmbedHtml();

		this.includeRecipientIdentifier = false;

		const badge = this.options.badge as RecipientBadgeInstance;
		const issueDate = badge.issueDate;
		const expiresDate = badge.expiresDate;

		badge.issuerManager.issuerBySlug(badge.issuerId.split('/').slice(-1)[0]).then((issuer) => {
			this.linkedInCertURL = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${
				this.options.shareTitle
			}&organizationName=${issuer.name}&issueYear=${issueDate.getFullYear()}&issueMonth=${(
				'0' +
				(issueDate.getMonth() + 1)
			).slice(-2)}${
				expiresDate
					? `&expirationYear=${expiresDate.getFullYear()}&expirationMonth=${(
							'0' +
							(expiresDate.getMonth() + 1)
						).slice(-2)}`
					: ''
			}&certUrl=${this.options.shareIdUrl}&certId=${this.options.shareIdUrl.split('/').slice(-1)}`;
		});

		return new Promise<void>((resolve, reject) => {
			this.resolveFunc = resolve;
			this.rejectFunc = reject;
		});
	}

	closeDialog() {
		this.closeModal();
		this.resolveFunc();
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Share Window API
	openShareWindow($event: Event, shareServiceType: ShareServiceType) {
		this.sharingService.shareWithProvider(
			$event,
			shareServiceType,
			this.options.shareObjectType,
			this.includeRecipientIdentifier,
			this.options.shareIdUrl,
			this.currentShareUrl,
		);
	}

	stripStyleTags(htmlstr: string): string {
		return htmlstr.replace(/ ?style="[^"]*"/g, '');
	}

	displayShareServiceType(serviceType: ShareServiceType) {
		if (this.options.excludeServiceTypes) {
			return this.options.excludeServiceTypes.indexOf(serviceType) === -1;
		}
		return true;
	}

	openTab(tabId: ShareSocialDialogTabId) {
		this.currentTabId = tabId;
		this.updateEmbedHtml();
	}

	copySupported(): boolean {
		try {
			return document.queryCommandSupported('copy');
		} catch (e) {
			return false;
		}
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

	updateEmbedHtml() {
		const option = this.selectedEmbedOption;

		if (!option) {
			this.currentEmbedHtml = null;
			this.updatePreviewHtml('');
			return;
		}

		// Include information about this embed in the query string so we know about the context later, especially if we
		// need to change how things are displayed, and want old version embeds to work correctly.
		// See [[ EmbedService ]] for the consumption of these parameters
		// 'http://localhost:4200/public/collections/60d90316471ba01f53cb9130b866486f',
		let embedUrlWithParams = addQueryParamsToUrl(option.embedUrl, {
			embedVersion: option.embedVersion,
			embedWidth: option.embedSize.width,
			embedHeight: option.embedSize.height,
		});
		if (this.includeRecipientIdentifier && this.options.recipientIdentifier) {
			const params = {};
			params[`identity__${this.options.recipientType || 'email'}`] = this.options.recipientIdentifier;
			embedUrlWithParams = addQueryParamsToUrl(embedUrlWithParams, params);
		}

		const outerContainer = document.createElement('div');
		const containerElem: HTMLElement = outerContainer;

		// Create the embedded HTML fragment by generating an element and grabbing innerHTML. This avoids us having to
		// deal with any HTML-escape issues, which are hard to get right, and for which there aren't any built-in functions.
		switch (option.embedType) {
			case 'iframe':
				{
					const iframe = document.createElement('iframe');
					iframe.src = embedUrlWithParams;
					iframe.style.width = option.embedSize.width + 'px';
					iframe.style.height = option.embedSize.height + 'px';
					iframe.style.border = '0';

					if (option.embedTitle) {
						iframe.title = option.embedTitle;
					}

					containerElem.appendChild(iframe);
				}
				break;

			case 'image':
				{
					const blockquote = generateEmbedHtml({
						shareUrl: this.currentShareUrl,
						imageUrl: option.embedUrl,
						includeBadgeClassName: this.includeBadgeClassName,
						includeAwardDate: this.includeAwardDate,
						includeRecipientName: this.includeRecipientName,
						includeVerifyButton: this.includeVerifyButton,
						badgeClassName: option.embedBadgeName,
						awardDate: TimeComponent.datePipe.transform(option.embedAwardDate),
						recipientName: option.embedRecipientName,
						recipientIdentifier: this.includeRecipientIdentifier
							? this.options.recipientIdentifier
							: undefined,
						includeScript: true,
					});

					containerElem.appendChild(blockquote);
				}
				break;
			default:
				break;
		}

		this.currentEmbedHtml = outerContainer.innerHTML;

		if (option.embedType === 'image') {
			this.currentEmbedHtml = this.stripStyleTags(this.currentEmbedHtml);
		}

		this.updatePreviewHtml(this.currentEmbedHtml);
	}

	private async updatePreviewHtml(html: string) {
		if (this.componentElem.nativeElement) {
			// Ensure the angular view is up-to-date so the iframe is around.
			await animationFramePromise();

			const iframe = this.componentElem.nativeElement.querySelector<HTMLIFrameElement>('.previewIframe');

			if (iframe && html !== iframe['lastWrittenHtml']) {
				iframe['lastWrittenHtml'] = html;

				iframe.style.height = '';

				const iframeDocument = iframe.contentWindow.document;
				iframeDocument.open();
				iframeDocument.write(html);
				iframeDocument.close();

				iframe.style.height = iframeDocument.documentElement.scrollHeight + 'px';
			}
		}
	}
}

export interface ShareSocialDialogOptions {
	title: string;
	shareObjectType: SharedObjectType;
	imageUrl?: string;
	shareUrl: string;
	shareIdUrl: string;
	shareTitle: string;
	shareSummary: string;
	shareEndpoint: ShareEndPoint;

	excludeServiceTypes?: ShareServiceType[];

	embedOptions: ShareSocialDialogEmbedOption[];

	recipientIdentifier?: string;
	recipientType?: string;
	showRecipientOptions?: boolean;

	badge?: RecipientBadgeInstance | BadgeInstance;
}

/**
 * Defines an embedding option for the share dialog.
 */
export interface ShareSocialDialogEmbedOption {
	/**
	 * Human-readable label for the radio button
	 */
	label: string;

	/**
	 * Human-readable alt/title text for the embedded object.
	 */
	embedTitle: string;

	/**
	 * URL to be displayed in the embed
	 */
	embedUrl: string;

	/**
	 * URL to link the embedded object to.
	 */
	embedLinkUrl: string;

	/**
	 * How the embed URL should be referenced.
	 * iframe - embeds the `embedUrl` as an iframe
	 * image - embeds the `embedUrl` as an image
	 */
	embedType: 'iframe' | 'image';

	/**
	 * Version of the embedded view. This is used so that future changes to embedded views won't break old versions
	 * that may be expecting a different `embedSize` or `embedType` than the old version.
	 */
	embedVersion: number;

	/**
	 * Size of the embedded content. Measured in logical pixels.
	 */
	embedSize: { width: number; height: number };

	embedBadgeName?: string;
	embedAwardDate?: Date;
	embedRecipientName?: string;
	embedRecipientIdentifier?: string;
}

type ShareSocialDialogTabId = 'link' | 'social' | 'embed';

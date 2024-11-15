import { Component, ElementRef, Renderer2, ViewChild, SecurityContext } from '@angular/core';

import { BaseDialog } from '../base-dialog';
import { RecipientBadgeInstance } from '../../../recipient/models/recipient-badge.model';

import jsPDF from 'jspdf';
import { ApiRecipientBadgeIssuer } from '../../../recipient/models/recipient-badge-api.model';
import { RecipientBadgeCollection } from '../../../recipient/models/recipient-badge-collection.model';
import { UserProfile } from '../../model/user-profile.model';
import { loadImageURL, readFileAsDataURL } from '../../util/file-util';
import { UserProfileManager } from '../../services/user-profile-manager.service';
import { MessageService } from '../../services/message.service';
import { PdfService } from '../../services/pdf.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
	selector: 'export-pdf-dialog',
	templateUrl: 'export-pdf-dialog.component.html',
	styleUrls: ['export-pdf-dialog.component.css'],
})
export class ExportPdfDialog extends BaseDialog {
	badge: RecipientBadgeInstance | null = null;
	collection: RecipientBadgeCollection | null = null;
	badgeResults: BadgeResult[] | null = null;
	badgePdf: string | null = null;
	pdfSrc: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
	doc: jsPDF = null;
	themeColor: string;
	pdfError: Error;

	profile: UserProfile;
	emailsLoaded: Promise<unknown>;
	pdfIsLoading: boolean = false;

	imageLoader: (file: File | string) => Promise<string> = basicImageLoader;

	@ViewChild('outputPdf') outputElement: ElementRef;

	resolveFunc: () => void;
	rejectFunc: () => void;

	constructor(
		componentElem: ElementRef<HTMLElement>,
		renderer: Renderer2,
		protected profileManager: UserProfileManager,
		protected messageService: MessageService,
		protected pdfService: PdfService,
		private sanitizer: DomSanitizer,
	) {
		super(componentElem, renderer);
		var r = document.querySelector(':root');
		var rs = getComputedStyle(r);
		this.themeColor = rs.getPropertyValue('--color-interactive1');

		this.profileManager.userProfilePromise.then(
			(profile) => {
				this.profile = profile;
				if (profile !== undefined) this.emailsLoaded = profile.emails.loadedPromise;
			},
			(error) => this.messageService.reportAndThrowError('Failed to load userProfile', error),
		);
	}

	async openDialog(badge: RecipientBadgeInstance, markdown: HTMLElement): Promise<void> {
		this.pdfIsLoading = true;
		this.pdfService.getPdf(badge.slug).then((url) => {
			this.pdfSrc = url;
			// set-time-out to fix the issue with viewing pdf from first time with safari
			setTimeout(() => {
				// Put below code within getpdf promise to avoid showing (previous pdf view / blank view) while loading pdf with chrome and firefox
				this.badge = badge;
				this.showModal();
				this.pdfIsLoading = false;
			}, 10);
		});
	}

	async openDialogForCollections(collection: RecipientBadgeCollection): Promise<void> {
		this.collection = collection;
		this.showModal();

		this.generateBadgeCollectionPdf(this.collection);

		return new Promise<void>((resolve, reject) => {
			this.resolveFunc = resolve;
			this.rejectFunc = reject;
		});
	}

	async openDialogForBackpack(badgeResults: BadgeResult[], profile: UserProfile): Promise<void> {
		this.badgeResults = badgeResults;
		this.showModal();

		this.generateBackpackPdf(this.badgeResults, profile);

		return new Promise<void>((resolve, reject) => {
			this.resolveFunc = resolve;
			this.rejectFunc = reject;
		});
	}

	closeDialog() {
		this.closeModal();
		this.resolveFunc();
	}

	// disclaimer: unfinished
	generateBadgeCollectionPdf(collection: RecipientBadgeCollection) {
		this.pdfError = undefined;
		const badges: RecipientBadgeInstance[] = collection.badges;
		this.doc = new jsPDF('l', 'mm', 'a4', true);

		let yPos = 20;
		let xMargin = 10;

		try {
			// title
			this.doc.setFontSize(30);
			this.doc.setFont('Helvetica', 'bold');
			this.doc.text(collection.name, xMargin, yPos, {
				align: 'justify',
			});

			// subtitle
			yPos += 15;
			this.doc.setFontSize(21);
			this.doc.setFont('Helvetica', 'normal');
			this.doc.text(collection.description, xMargin, yPos, {
				align: 'justify',
			});

			// Badges table title
			yPos += 20;
			this.doc.setFontSize(17);
			this.doc.setFont('Helvetica', 'bold');
			let badgeText = '' + badges.length + ' Badge';
			if (badges.length > 1) {
				badgeText += 's:';
			} else {
				badgeText += ':';
			}
			this.doc.text(badgeText, xMargin, yPos, {
				align: 'justify',
			});
			this.doc.line(xMargin, yPos + 1, xMargin + this.doc.getTextWidth(badgeText), yPos + 1);

			// Badges table header
			this.doc.setFontSize(14);
			yPos += 12;
			let headings = [
				{
					name: 'Badge',
					width: 80,
				},
				{
					name: 'Institution',
					width: 60,
				},
				{
					name: 'Vergeben',
					width: 60,
				},
			];
			let xPos = xMargin;
			headings.forEach((heading, i) => {
				this.doc.text(heading.name, xPos, yPos, {
					align: 'justify',
				});
				xPos += heading.width;
			});

			// Badges table content
			yPos += 12;
			this.doc.setFontSize(14);
			this.doc.setFont('Helvetica', 'normal');
			badges.forEach((badge, i) => {
				let badgeClass = badge.badgeClass;
				let xPos = xMargin;
				this.doc.addImage(badgeClass.image, 'png', xPos, yPos - 7, 11, 11);
				xPos += 13;
				let name = badgeClass.name;
				let cutoff = 50;
				if (this.doc.getTextWidth(name) > cutoff) {
					// while(this.doc.getTextWidth(name) > 30) {
					// 	name = name.substring(0, name.length - 1);
					// }
					name = name.substring(0, name.length - (this.doc.getTextWidth(name) - cutoff) / 2);
					name += '...';
				}
				this.doc.text(name, xPos, yPos, {
					align: 'justify',
				});
				xPos += 80 * (12 / 14);
				let institution = badgeClass.issuer.name;
				cutoff = 50;
				if (this.doc.getTextWidth(institution) > cutoff) {
					// while(this.doc.getTextWidth(institution) > 30) {
					// 	institution = institution.substring(0, institution.length - 1);
					// }
					institution = institution.substring(
						0,
						institution.length - (this.doc.getTextWidth(institution) - cutoff) / 2,
					);
					institution += '...';
				}
				this.doc.text(institution, xPos, yPos, {
					align: 'justify',
				});
				xPos += 70 * (12 / 14);
				let datum =
					badge.issueDate.getDate() + '.' + badge.issueDate.getMonth() + '.' + badge.issueDate.getFullYear();
				this.doc.text(datum, xPos, yPos, {
					align: 'justify',
				});
				yPos += 13;
			});

			this.badgePdf = this.doc.output('datauristring');
			this.outputElement.nativeElement.src = this.badgePdf;

			this.outputElement.nativeElement.setAttribute('style', 'overflow: auto');
		} catch (e) {
			this.pdfError = e;
			console.log(e);
		}
	}

	// disclaimer: unfinished
	generateBackpackPdf(badgeResults: BadgeResult[], profile: UserProfile) {
		this.pdfError = undefined;
		this.doc = new jsPDF();

		let yPos = 20;
		let xMargin = 10;

		try {
			// title
			this.doc.setFontSize(30);
			this.doc.setFont('Helvetica', 'bold');
			let title = 'Rucksack';
			if (profile.firstName != '') {
				title += ' von ' + profile.firstName + ' ' + profile.lastName;
			}
			this.doc.text(title, xMargin, yPos, {
				align: 'justify',
			});

			// Badges table title
			this.doc.setFontSize(17);
			let badgeText = '' + badgeResults.length + ' Badge';
			if (badgeResults.length > 1) {
				badgeText += 's:';
			} else {
				badgeText += ':';
			}
			yPos += 15;
			this.doc.text(badgeText, xMargin, yPos, {
				align: 'justify',
			});
			this.doc.line(xMargin, yPos + 1, xMargin + this.doc.getTextWidth(badgeText), yPos + 1);

			// Badges table header
			this.doc.setFontSize(14);
			yPos += 12;
			let headings = [
				{
					name: 'Badge',
					width: 80,
				},
				{
					name: 'Institution',
					width: 60,
				},
				{
					name: 'Vergeben',
					width: 60,
				},
			];
			let xPos = xMargin;
			headings.forEach((heading, i) => {
				this.doc.text(heading.name, xPos, yPos, {
					align: 'justify',
				});
				xPos += heading.width;
			});

			// Badges table content
			this.doc.setFont('Helvetica', 'normal');
			yPos += 12;
			badgeResults.forEach((badgeResult, _) => {
				let badgeClass = badgeResult.badge.badgeClass;
				let xPos = xMargin;
				this.doc.addImage(badgeClass.image, 'png', xPos, yPos - 7, 11, 11);
				xPos += 13;
				let name = badgeClass.name;
				let cutoff = 60;
				if (this.doc.getTextWidth(name) > cutoff) {
					// while(this.doc.getTextWidth(name) > 30) {
					// 	name = name.substring(0, name.length - 1);
					// }
					name = name.substring(0, name.length - (this.doc.getTextWidth(name) - cutoff) / 2);
					name += '...';
				}
				this.doc.text(name, xPos, yPos, {
					align: 'justify',
				});
				xPos += 80 * (12 / 14);
				let institution = badgeClass.issuer.name;
				cutoff = 50;
				if (this.doc.getTextWidth(institution) > cutoff) {
					// while(this.doc.getTextWidth(institution) > 30) {
					// 	institution = institution.substring(0, institution.length - 1);
					// }
					institution = institution.substring(
						0,
						institution.length - (this.doc.getTextWidth(institution) - cutoff) / 2,
					);
					institution += '...';
				}
				this.doc.text(institution, xPos, yPos, {
					align: 'justify',
				});
				xPos += 70 * (12 / 14);
				let datum = this.pdfService.dateToString(this.badge.issueDate, '.');
				this.doc.text(datum, xPos, yPos, {
					align: 'justify',
				});
				yPos += 12;
			});

			this.badgePdf = this.doc.output('datauristring');
			this.outputElement.nativeElement.src = this.badgePdf;
			this.outputElement.nativeElement.setAttribute('style', 'overflow: auto');
		} catch (e) {
			this.pdfError = e;
			console.log(e);
		}
	}

	downloadPdf() {
		this.pdfService.downloadPdf(this.pdfSrc, this.badge.badgeClass.name, this.badge._issueDate);
	}
}

class BadgeResult {
	constructor(
		public badge: RecipientBadgeInstance,
		public issuer: ApiRecipientBadgeIssuer,
	) {}
}

// TODO: put this in a service??
// file can either be file or url to a file
export function basicImageLoader(file: File | string): Promise<string> {
	if (typeof file == 'string') {
		return loadImageURL(file)
			.then(() => file)
			.catch((e) => {
				throw new Error(`${file} is not a valid image file`);
			});
	} else {
		return readFileAsDataURL(file)
			.then((url) => loadImageURL(url).then(() => url))
			.catch((e) => {
				throw new Error(`${file.name} is not a valid image file`);
			});
	}
}

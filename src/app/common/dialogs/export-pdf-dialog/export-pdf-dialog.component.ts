import { Component, ElementRef, Renderer2, ViewChild, AfterViewInit } from '@angular/core';

import { BaseDialog } from '../base-dialog';
import { RecipientBadgeInstance } from '../../../recipient/models/recipient-badge.model';

import jsPDF from 'jspdf';
import { ApiRecipientBadgeClass, ApiRecipientBadgeIssuer } from '../../../recipient/models/recipient-badge-api.model';
import { RecipientBadgeCollection } from '../../../recipient/models/recipient-badge-collection.model';
import { UserProfile } from '../../model/user-profile.model';
import { loadImageURL, readFileAsDataURL } from '../../util/file-util';
import { UserProfileManager } from '../../services/user-profile-manager.service';
import { MessageService } from '../../services/message.service';
import html2canvas from 'html2canvas';

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
	doc: jsPDF = null;
	themeColor: string;
	pdfError: Error;

	profile: UserProfile;
	emailsLoaded: Promise<unknown>;

	imageLoader: (file: File | string) => Promise<string> = basicImageLoader;

	@ViewChild('outputPdf') outputElement: ElementRef;

	resolveFunc: () => void;
	rejectFunc: () => void;

	constructor(
		componentElem: ElementRef<HTMLElement>,
		renderer: Renderer2,
		protected profileManager: UserProfileManager,
		protected messageService: MessageService,
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
		this.badge = badge;
		this.showModal();

		this.generateSingleBadgePdf(this.badge, markdown);

		return new Promise<void>((resolve, reject) => {
			this.resolveFunc = resolve;
			this.rejectFunc = reject;
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

	generatePdfBackground(canvas: HTMLCanvasElement) {
		const ctx = canvas.getContext('2d');

		// Sunburst Background
		// Inspired from https://gist.github.com/rniswonger/185039aa4d2fe49e3b1f578a4d495f6e

		const color = '#f5f5f5';
		const num_rays = 50;
		const ray_angle = Math.PI / num_rays;
		const sweep_angle = ray_angle * 2;
		const mid_x = ctx.canvas.width / 2;
		const mid_y = canvas.height / 2;
		const diameter = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2));
		const offsetY = 20;
		const radius = diameter / 2 + offsetY;
		const mid_y_offset = mid_y - offsetY;
		ctx.beginPath();
		for (let i = 0; i < num_rays; i++) {
			var start_angle = sweep_angle * i;
			var end_angle = start_angle + ray_angle;

			ctx.moveTo(mid_x, mid_y_offset);
			ctx.arc(mid_x, mid_y_offset, radius, start_angle, end_angle, false);
		}
		ctx.fillStyle = color;
		ctx.fill();
		const image = canvas.toDataURL('image/png');
		return image;
	}

	async convertImageToDataURL(imageSrc) {
		let blob = await fetch(imageSrc).then((res) => res.blob());
		return await new Promise((resolve) => {
			let reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.readAsDataURL(blob);
		});
	}

	async generateSingleBadgePdf(badge: RecipientBadgeInstance, markdown: HTMLElement) {
		this.pdfError = undefined;
		const badgeClass: ApiRecipientBadgeClass = badge.badgeClass;
		const competencies = badge.getExtension('extensions:CompetencyExtension', [{}]);
		const num_competencies = competencies.length;
		const scaleFactor = 2;

		this.doc = new jsPDF();

		let yPos = 0;

		const pageWidth = this.doc.internal.pageSize.getWidth();
		const pageHeight = this.doc.internal.pageSize.getHeight();
		let cutoff = pageWidth - 27;

		let oeb_logo = await this.convertImageToDataURL('assets/logos/Logo-OEB-3.png');
		const badge_image = await this.convertImageToDataURL(badgeClass.image);

		var svgContentClock = `
		<svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#492e98" d="M176 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h16V98.4C92.3 113.8 16 200 16 304c0 114.9 93.1 208 208 208s208-93.1 208-208c0-41.8-12.3-80.7-33.5-113.2l24.1-24.1c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L355.7 143c-28.1-23-62.2-38.8-99.7-44.6V64h16c17.7 0 32-14.3 32-32s-14.3-32-32-32H224 176zm72 192V320c0 13.3-10.7 24-24 24s-24-10.7-24-24V192c0-13.3 10.7-24 24-24s24 10.7 24 24z"/></svg>`;

		const dataUriClock = 'data:image/svg+xml;base64,' + btoa(svgContentClock);
		const img = new Image();
		img.src = dataUriClock;

		var canvas = document.createElement('canvas');
		canvas.width = 25;
		canvas.height = 25;

		let dataUriClockPng = '';

		img.onload = function () {
			var ctx = canvas.getContext('2d');

			ctx.drawImage(img, 0, 0);

			dataUriClockPng = canvas.toDataURL('image/png');

			// remove canvas to not interfere with the pdf background
			canvas.remove();
		};

		try {
			if (!this.profile) {
				await this.profileManager.userProfilePromise.then(
					(profile) => {
						debugger;
						this.profile = profile;
						this.emailsLoaded = profile.emails.loadedPromise;
					},
					(error) => this.messageService.reportAndThrowError('Failed to load userProfile', error),
				);
			}
			this.emailsLoaded.then(async () => {
				html2canvas(this.outputElement.nativeElement, {
					backgroundColor: null,
					scale: scaleFactor,
				})
					.then((canvas) => {
						canvas.height = 100 * scaleFactor;
						canvas.width = 100 * scaleFactor;
						const image = this.generatePdfBackground(canvas);

						const logoWidth = 50;
						const logoHeight = 50;
						const marginXImageLogo = 5;

						let firstName = this.profile.firstName;
						let lastName = this.profile.lastName;
						firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
						lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);

						// calculate competencies firs to know how many pages the PDF will have
						// and to apply the background on each page
						if (num_competencies > 0) {
							const esco = competencies.some((c) => c.escoID);
							const competenciesPerPage = 10;
							this.doc.addPage();
							this.doc.addImage(image, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'NONE');

							//  OEB Logo
							// this.doc.addImage(
							// 	badgeClass.issuer.image,
							// 	'PNG',
							// 	marginXImageLogo,
							// 	yPos,
							// 	logoWidth,
							// 	logoHeight,
							// );
							this.doc.setDrawColor('#492E98');
							this.doc.line(pageWidth / 2 - 50, 25, pageWidth / 2 + 100, 25);

							if (esco) {
								this.doc.textWithLink(
									'* Kompetenz nach ESCO: https://esco.ec.europa.eu/de',
									10,
									pageHeight - 20,
									{
										url: 'https://esco.ec.europa.eu/de',
									},
								);
							}

							for (let i = 0; i < num_competencies; i++) {
								if (i != 0 && i % competenciesPerPage === 0) {
									this.doc.addPage();
									this.doc.addImage(image, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'NONE');
									//  OEB Logo
									// this.doc.addImage(
									// 	badgeClass.issuer.image,
									// 	'PNG',
									// 	marginXImageLogo,
									// 	yPos,
									// 	logoWidth,
									// 	logoHeight,
									// );
									this.doc.setDrawColor('#492E98');
									this.doc.line(pageWidth / 2 - 50, 25, pageWidth / 2 + 100, 25);
								}

								this.doc.setFontSize(28);
								this.doc.setFont('Helvetica', 'bold');
								this.doc.setTextColor('#492E98');
								this.doc.text('Kompetenzen', 10, 60);

								this.doc.setFontSize(18);
								this.doc.setFont('Helvetica', 'normal');
								this.doc.text('die ', 10, 75);
								this.doc.setFont('Helvetica', 'bold');
								this.doc.text(firstName + ' ' + lastName, this.doc.getTextWidth('die ') + 10, 75);
								this.doc.setFont('Helvetica', 'normal');
								const textWidth =
									this.doc.getTextWidth('die ') +
									15 +
									this.doc.getTextWidth(firstName + ' ' + lastName);
								this.doc.text('mit dem Badge', textWidth, 75);

								this.doc.setFont('Helvetica', 'bold');
								this.doc.text(badgeClass.name, 10, 85);

								this.doc.setFont('Helvetica', 'normal');
								this.doc.text('erworben hat:', this.doc.getTextWidth(badgeClass.name) + 15, 85);

								let studyLoadInMin = competencies[i].studyLoad;
								let studyLoadInHours = studyLoadInMin / 60;

								const y = 110 + (i % competenciesPerPage) * 16;

								this.doc.roundedRect(15, y - 7.5, 42.5, 11, 5, 5);
								this.doc.setFontSize(14);
								this.doc.addImage(dataUriClockPng, 20, y - 6, 12.5, 14);
								if (studyLoadInMin > 60) {
									this.doc.text(studyLoadInHours + ' Stunden', 30, y) + 2.5;
								} else {
									this.doc.text(studyLoadInMin + ' Minuten', 30, y) + 2.5;
								}

								this.doc.setFontSize(18);

								if (competencies[i].escoID) {
									this.doc.text(competencies[i].name + ' *', 60, y);
								} else {
									this.doc.text(competencies[i].name, 60, y);
								}
							}
						}

						this.doc.setPage(1);
						this.doc.addImage(image, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'NONE');

						//  OEB Logo
						// this.doc.addImage(
						// 	badgeClass.issuer.image,
						// 	'PNG',
						// 	marginXImageLogo,
						// 	yPos,
						// 	logoWidth,
						// 	logoHeight,
						// );
						this.doc.setDrawColor('#492E98');
						this.doc.line(pageWidth / 2 - 50, 25, pageWidth / 2 + 100, 25);

						// Name
						yPos += 60;
						this.doc.setFontSize(32);
						this.doc.setFont('Helvetica', 'bold');
						this.doc.setTextColor('#492E98');
						this.doc.text(firstName + ' ' + lastName, pageWidth / 2, yPos - 15, { align: 'center' });
						this.doc.setFontSize(18);
						this.doc.setFont('Helvetica', '');
						this.doc.setTextColor('#black');

						this.doc.text('hat am ' + badge.issueDate.toLocaleDateString('de-DE'), pageWidth / 2, yPos, {
							align: 'center',
						});
						this.doc.text('den folgenden Badge erworben: ', pageWidth / 2, yPos + 10, { align: 'center' });

						// Badge Image
						const imageWidth = 75;
						const imageHeight = 75;
						yPos = (pageHeight - imageHeight) / 2 - 20;
						const marginXImg = (pageWidth - imageWidth) / 2;
						this.doc.addImage(badge_image, 'PNG', marginXImg, yPos, imageWidth, imageHeight);

						// title
						yPos += 75;
						this.doc.setFontSize(32);
						this.doc.setFont('Helvetica', 'bold');
						this.doc.setTextColor('#492E98');

						let title = this.doc.splitTextToSize(badgeClass.name, cutoff - this.doc.getTextWidth('...'));
						let titlePadding = 0;
						let maxTitleRows = 2;
						if (title.length > maxTitleRows) {
							title[maxTitleRows - 1] = title[maxTitleRows - 1] + '...';
						} else if (title.length < maxTitleRows) {
							titlePadding = (15 / 2) * (maxTitleRows - title.length);
							yPos += titlePadding;
						}
						for (let i = 0; i < maxTitleRows; i = i + 1) {
							if (title[i]) {
								yPos += 15;
								this.doc.text(title[i], pageWidth / 2, yPos, {
									align: 'center',
								});
							}
						}
						yPos += titlePadding;

						// description
						this.doc.setFontSize(14);
						this.doc.setFont('Helvetica', 'normal');
						this.doc.setTextColor('black');

						let subtitle = this.doc.splitTextToSize(
							badgeClass.description,
							cutoff - this.doc.getTextWidth('...'),
						);
						let subtitlePadding = 0;
						let maxSubtitleRows = 4;
						if (subtitle.length > maxSubtitleRows) {
							subtitle[maxSubtitleRows - 1] = subtitle[maxSubtitleRows - 1] + '...';
						} else if (subtitle.length < maxSubtitleRows) {
							subtitlePadding = (10 / 2) * (maxSubtitleRows - subtitle.length);
							yPos += subtitlePadding;
						}
						for (let i = 0; i < maxSubtitleRows; i = i + 1) {
							if (subtitle[i]) {
								yPos += 10;
								this.doc.text(subtitle[i], pageWidth / 2, yPos, {
									align: 'center',
								});
							}
						}
						yPos += subtitlePadding;

						// this.doc.text(badgeClass.description, xMargin + 10, yPos, {
						// 	align: 'justify',
						// });

						// issued by
						yPos += 15;
						let issuedBy = badgeClass.issuer.name;
						this.doc.setFontSize(18);
						this.doc.setFont('Helvetica', 'normal');
						let issuedByLength = this.doc.getTextWidth('Vergeben von: ..');
						this.doc.setFontSize(20);
						this.doc.setFont('Helvetica', 'bold');
						let issuedByContentLength = this.doc.getTextWidth(issuedBy);
						let awardedToLength = this.doc.getTextWidth('Erlangt von: ');

						if (issuedByContentLength + issuedByLength > cutoff) {
							issuedBy =
								this.doc.splitTextToSize(
									name,
									cutoff - awardedToLength - this.doc.getTextWidth('...'),
								)[0] + '...';
							this.doc.setFontSize(20);
							this.doc.setFont('Helvetica', 'bold');
							issuedByContentLength = this.doc.getTextWidth(issuedBy);
						}
						this.doc.setFontSize(18);
						this.doc.setFont('Helvetica', 'normal');
						this.doc.setTextColor('#492E98');
						const combinedIssuedByLength = issuedByContentLength + issuedByLength;
						const lineLength = 2.5;

						this.doc.line(
							pageWidth / 2 - combinedIssuedByLength / 2 - lineLength,
							yPos - 2,
							pageWidth / 2 - combinedIssuedByLength / 2 - 5,
							yPos - 2,
						);

						this.doc.line(
							pageWidth / 2 + combinedIssuedByLength / 2 + 5,
							yPos - 2,
							pageWidth / 2 + combinedIssuedByLength / 2 + lineLength,
							yPos - 2,
						);
						this.doc.text('Vergeben von: ', pageWidth / 2 - combinedIssuedByLength / 2, yPos, {});
						this.doc.setFontSize(20);
						this.doc.setFont('Helvetica', 'bold');
						this.doc.text(
							issuedBy,
							pageWidth / 2 + (issuedByLength + issuedByContentLength) / 2 - issuedByContentLength,
							yPos,
							{},
						);

						// issuer logo
						yPos += 5;
						this.doc.setFillColor('#cfcece');
						this.doc.rect(pageWidth / 4, yPos, pageWidth / 2, 25, 'F');
						// this.doc.addImage(badgeClass.issuer.image, 'PNG', pageWidth / 2 - 25, yPos - 12.5, 50, 50);

						//footer
						const pageCount = (this.doc as any).internal.getNumberOfPages(); //was doc.internal.getNumberOfPages();
						for (let i = 1; i <= pageCount; i++) {
							this.doc.setFontSize(10);
							// Go to page i
							this.doc.setPage(i);

							var pageSize = this.doc.internal.pageSize;
							var pWidth = pageSize.getWidth();
							var pHeight = pageSize.getHeight();

							this.doc.line(20, pHeight - 8, pWidth / 2 - 10, pHeight - 8);
							this.doc.line(pWidth / 2 + 10, pHeight - 8, pWidth - 20, pHeight - 8);

							this.doc.text(String(i) + ' / ' + String(pageCount), pWidth / 2, pHeight - 8, {
								align: 'center',
							});
						}

						return this.doc;
					})
					.then((doc) => {
						this.badgePdf = doc.output('datauristring');
						this.outputElement.nativeElement.src = this.badgePdf;
						this.outputElement.nativeElement.setAttribute('style', 'overflow: auto');
					});
			});
		} catch (e) {
			this.pdfError = e;
			console.log(e);
		}
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
				let datum = dateToString(this.badge.issueDate, '.');
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
		this.doc.save(this.badge.badgeClass.name + ' - ' + dateToString(this.badge.issueDate, '') + '.pdf');
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

function dateToString(date: Date, seperator: string) {
	return (
		('0' + date.getDate()).slice(-2) +
		seperator +
		('0' + (date.getMonth() + 1)).slice(-2) +
		seperator +
		date.getFullYear()
	);
}

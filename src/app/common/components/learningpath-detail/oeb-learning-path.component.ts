import { Component, inject, input, Input, OnInit } from '@angular/core';
import { animate, animateChild, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { LearningPathApiService } from '../../services/learningpath-api.service';
import { HlmDialogService } from '../../../components/spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { DangerDialogComponentTemplate } from '../../dialogs/oeb-dialogs/danger-dialog-template.component';
import { BadgeClassManager } from '../../../issuer/services/badgeclass-manager.service';
import { BadgeClass } from '../../../issuer/models/badgeclass.model';
import { BadgeInstanceManager } from '../../../issuer/services/badgeinstance-manager.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from '../../services/message.service';
import { BadgrApiFailure } from '../../services/api-failure';
import { SuccessDialogComponent } from '../../dialogs/oeb-dialogs/success-dialog.component';
import { BadgeInstance } from '../../../issuer/models/badgeinstance.model';
import { CommonDialogsService } from '../../services/common-dialogs.service';
import { BaseRoutableComponent } from '../../pages/base-routable.component';
import { BadgeInstanceApiService } from '../../../issuer/services/badgeinstance-api.service';
import { PdfService } from '../../services/pdf.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'oeb-learning-path',
	templateUrl: './oeb-learning-path.component.html',
	styleUrl: './oeb-learning-path.component.scss',
	animations: [
		trigger('inOutAnimation', [
			transition(':enter', [
				style({ transform: 'translateX(-120px)', opacity: '0' }),
				animate('.5s ease-out', style({ transform: 'translateX(0px)', opacity: '1' })),
			]),
			// transition(':leave', [style({ opacity: '1' }), animate('.5s ease-out', style({ opacity: '0' }))]),
		]),
		trigger('stagger', [transition(':enter', [query(':enter', stagger('.3s', [animateChild()]))])]),
	],
	standalone: false,
})
export class OebLearningPathDetailComponent extends BaseRoutableComponent implements OnInit {
	@Input() learningPath;
	@Input() issuer;
	@Input() badges;
	@Input() participants;
	loading: any;
	pdfSrc: SafeResourceUrl;

	learningPathEditLink;

	constructor(
		private learningPathApiService: LearningPathApiService,
		private badgeClassManager: BadgeClassManager,
		private badgeInstanceManager: BadgeInstanceManager,
		private messageService: MessageService,
		private dialogService: CommonDialogsService,
		private badgeInstanceApiservice: BadgeInstanceApiService,
		private pdfService: PdfService,
		public router: Router,
		route: ActivatedRoute,
		private translate: TranslateService,
	) {
		super(router, route);
	}
	private readonly _hlmDialogService = inject(HlmDialogService);

	filterFunction(t): boolean {
		return t.completed_at;
	}
	filterFunctionOngoing(t): boolean {
		return !t.completed_at;
	}

	ngOnInit(): void {
		this.learningPathEditLink = [
			'/issuer/issuers',
			this.issuer.slug,
			'learningpaths',
			this.learningPath.slug,
			'edit',
		];
	}

	public deleteLearningPath(learningPathSlug, issuer) {
		const dialogRef = this._hlmDialogService.open(DangerDialogComponentTemplate, {
			context: {
				delete: () => this.deleteLearningPathApi(learningPathSlug, issuer),
				// qrCodeRequested: () => {},
				variant: 'danger',
				text: this.translate.instant('LearningPath.deleteWarning'),
				title: this.translate.instant('General.delete'),
			},
		});
	}

	deleteLearningPathApi(learningPathSlug, issuer) {
		this.learningPathApiService.deleteLearningPath(issuer.slug, learningPathSlug).then(() => {
			this.router.navigate(['issuer/issuers']);
		});
	}

	public openSuccessDialog(recipient) {
		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
			context: {
				recipient: recipient,
				variant: 'success',
			},
		});
	}

	get lpSlug() {
		return this.route.snapshot.params['learningPathSlug'];
	}

	get confirmDialog() {
		return this.dialogService.confirmDialog;
	}

	async revokeLpParticipationBadge(participant: any) {
		const participationBadgeInstance: BadgeInstance = participant.participationBadgeAssertion;

		this.confirmDialog
			.openResolveRejectDialog({
				dialogTitle: this.translate.instant('General.warning'),
				dialogBody: this.translate.instant('Issuer.revokeBadgeWarning', {
					badge: this.learningPath.name,
					recipient: participationBadgeInstance.recipientIdentifier,
				}),
				resolveButtonLabel: this.translate.instant('General.revoke'),
				rejectButtonLabel: this.translate.instant('General.cancel'),
			})
			.then(async () => {
				try {
					const revokeResult = await Promise.all([
						this.badgeInstanceApiservice.revokeBadgeInstance(
							this.issuer.slug,
							this.learningPath.participationBadge_id,
							participationBadgeInstance.slug,
							'revoked',
						),
					]);

					const response = await this.learningPathApiService.getLearningPathParticipants(
						this.learningPath.slug,
					);
					this.participants = response.body;
				} catch (error) {
					console.error(error);
					throw error;
				}
			});
	}

	downloadCertificate(participant: any) {
		const instance = participant.participationBadgeAssertion;
		this.pdfService
			.getPdf(instance.slug)
			.then((url) => {
				this.pdfSrc = url;
				this.pdfService.downloadPdf(this.pdfSrc, this.learningPath.name, new Date(instance.json.issuedOn));
			})
			.catch((error) => {
				console.log(error);
			});
	}

	get learningPathReverseBadges() {
		return [...this.learningPath.badges].reverse();
	}
}

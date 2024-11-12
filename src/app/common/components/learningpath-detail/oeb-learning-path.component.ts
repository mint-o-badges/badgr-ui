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
import { ApiLearningPathParticipant, ApiLearningPathRequest } from '../../model/learningpath-api.model';
import { toDataURL } from 'qrcode';

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
})
export class OebLearningPathDetailComponent extends BaseRoutableComponent implements OnInit {
	@Input() learningPath;
	@Input() issuer;
	@Input() badges;
	@Input() participants;
	@Input() requests: ApiLearningPathRequest[];
	loading: any;
	pdfSrc: SafeResourceUrl;

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

	ngOnInit(): void {}

	public deleteLearningPath(learningPathSlug, issuer) {
		const dialogRef = this._hlmDialogService.open(DangerDialogComponentTemplate, {
			context: {
				delete: () => this.deleteLearningPathApi(learningPathSlug, issuer),
				// qrCodeRequested: () => {},
				variant: 'danger',
				text: 'Möchtest du diesen Lernpfad wirklich löschen?',
				title: 'Lernpfad löschen',
			},
		});
	}

	deleteLearningPathApi(learningPathSlug, issuer) {
		this.learningPathApiService.deleteLearningPath(issuer.slug, learningPathSlug).then(() => {
			this.router.navigate(['issuer/issuers']);
		});
	}

	public giveBadge(req) {
		this.loading = true;
		let recipientProfileContextUrl = 'https://openbadgespec.org/extensions/recipientProfile/context.json';

		this.badgeClassManager
			.badgeByIssuerSlugAndSlug(this.issuer.slug, this.learningPath.participationBadge_id)
			.then((badgeClass: BadgeClass) => {
				this.loading = this.badgeInstanceManager
					.createBadgeInstance(this.issuer.slug, this.learningPath.participationBadge_id, {
						issuer: this.issuer.slug,
						badge_class: this.learningPath.participationBadge_id,
						recipient_type: 'email',
						recipient_identifier: req.user.email,
						narrative: '',
						create_notification: true,
						evidence_items: [],
						extensions: {
							...badgeClass.extension,
							'extensions:recipientProfile': {
								'@context': recipientProfileContextUrl,
								type: ['Extension', 'extensions:RecipientProfile'],
								name: req.user.name,
							},
						},
					})
					.then(
						() => {
							this.router.navigate([
								'issuer/issuers',
								this.issuer.slug,
								'badges',
								this.learningPath.participationBadge_id,
							]);
							this.openSuccessDialog(req.user.email);

							this.requests = this.requests.filter((request) => request.entity_id != req.entity_id);
							this.learningPathApiService.deleteLearningPathRequest(req.entity_id);
						},
						(error) => {
							this.messageService.setMessage(
								'Unable to award badge: ' + BadgrApiFailure.from(error).firstMessage,
								'error',
							);
						},
					)
					.then(() => {
						this.loading = null;
						this.learningPathApiService
							.getLearningPathParticipants(this.learningPath.slug)
							.then((participants) => {
								// @ts-ignore
								const participant = participants.body.filter((p) => p.user.slug === req.user.slug);
								this.learningPathApiService.updateLearningPathParticipant(participant[0].entity_id, {
									...participant[0],
									completed_at: new Date(),
								});
							});
					});
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
				dialogTitle: 'Warnung',
				dialogBody: `Bist du sicher, dass du <strong>${this.learningPath.name}</strong> von <strong>${participationBadgeInstance.recipientIdentifier}</strong> zurücknehmen möchtest?`,
				resolveButtonLabel: 'Zurücknehmen',
				rejectButtonLabel: 'Abbrechen',
			})
			.then(async () => {
				try {
					const [revokeResult, deleteResult] = await Promise.all([
						this.badgeInstanceApiservice.revokeBadgeInstance(
							this.issuer.slug,
							this.learningPath.participationBadge_id,
							participationBadgeInstance.slug,
							'revoked',
						),
						this.learningPathApiService.deleteLearningPathParticipant(participant.entity_id),
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
			.getCertificatePdf(instance.slug)
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

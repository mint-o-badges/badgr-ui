import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { Router, RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { OebButtonComponent } from './oeb-button.component';
import { BadgeRequestApiService } from '../issuer/services/badgerequest-api.service';
import { BadgeInstanceManager } from '../issuer/services/badgeinstance-manager.service';
import { BadgeClassManager } from '../issuer/services/badgeclass-manager.service';
import { BadgeClass } from '../issuer/models/badgeclass.model';
import { MessageService } from '../common/services/message.service';
import { BadgrApiFailure } from '../common/services/api-failure';
import { HlmDialogService } from './spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { SuccessDialogComponent } from '../common/dialogs/oeb-dialogs/success-dialog.component';
import striptags from 'striptags';

@Component({
	selector: 'qrcodes-datatable',
	standalone: true,
	imports: [
		HlmTableModule,
		HlmIconModule,
		CommonModule,
		OebButtonComponent,
		TranslateModule,
		RouterModule,
		SuccessDialogComponent,
	],
	providers: [BadgeRequestApiService, BadgeInstanceManager, BadgeClassManager, HlmDialogService],
	template: ` <hlm-table
		class="tw-rounded-t-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-[var(--color-darkgray)] tw-border-darkgrey tw-border-[1px] tw-border-solid"
	>
		<hlm-trow class="tw-bg-[var(--color-darkgray)] hover:!tw-bg-[var(--color-darkgray)] tw-text-white tw-flex-wrap">
			<hlm-th class="!tw-text-white tw-w-36 md:tw-w-48 !tw-px-2 tw-flex tw-justify-center tw-items-center"
				>ID</hlm-th
			>
			<hlm-th class="!tw-text-white tw-justify-center !tw-flex-1">{{ 'Badge.requestedOn' | translate }}</hlm-th>
			<hlm-th class="!tw-text-white tw-justify-end lg:tw-w-48 tw-w-0 !tw-p-0"></hlm-th>
		</hlm-trow>
		<hlm-trow
			*ngFor="let badge of requestedBadges"
			class="tw-bg-[var(--color-lightgray)] hover:!tw-bg-[var(--color-lightgray)] tw-border-[var(--color-darkgray)] tw-flex tw-flex-wrap tw-py-2"
		>
			<hlm-th class="!tw-px-2 tw-w-36 md:tw-w-48 tw-justify-center !tw-text-oebblack"
				><span class="tw-inline-block tw-truncate tw-text-ellipsis">{{ badge.email }}</span></hlm-th
			>
			<hlm-th class="!tw-flex-1 tw-justify-center"
				><p class="u-text tw-text-purple">{{ badge.requestedOn | date: 'dd.MM.yyyy' }}</p></hlm-th
			>
			<hlm-th class="tw-justify-center sm:tw-justify-end tw-w-full lg:tw-w-48 !tw-text-oebblack">
				<oeb-button
					class="tw-w-full"
					size="xs"
					width="full_width"
					(click)="issueBadge(badge)"
					[disabled]="!!loading"
					text="Login"
					[loading-promises]="[loading]"
					loading-message="Loading..."
					[text]="actionElementText"
				></oeb-button>
			</hlm-th>
		</hlm-trow>
	</hlm-table>`,
})
export class QrCodeDatatableComponent implements OnInit {
	@Input() caption: string = '';
	@Input() qrCodeId: string = '';
	@Input() badgeSlug: string = '';
	@Input() issuerSlug: string = '';
	@Input() badgeIssueLink: string[] = [];
	@Input() requestedBadges: any;
	@Input() actionElementText: string = 'Badge vergeben';
	@Output() actionElement = new EventEmitter();
	@Output() redirectToBadgeDetail = new EventEmitter();
	@Output() deletedQRAward = new EventEmitter();
	@Output() qrBadgeAward = new EventEmitter<void>();
	loading: Promise<unknown>;

	constructor(
		private badgeRequestApiService: BadgeRequestApiService,
		private badgeInstanceManager: BadgeInstanceManager,
		private badgeClassManager: BadgeClassManager,
		private messageService: MessageService,
		public router: Router,
	) {}

	ngOnInit(): void {
		this.badgeRequestApiService.getBadgeRequestsByQrCode(this.qrCodeId).then((requestedBadges: any) => {
			this.requestedBadges = requestedBadges.body.requested_badges;
		});
	}

	recipientProfileContextUrl = 'https://openbadgespec.org/extensions/recipientProfile/context.json';

	private readonly _hlmDialogService = inject(HlmDialogService);
	public openSuccessDialog(recipient) {
		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
			context: {
				recipient: recipient,
				variant: 'success',
			},
		});
	}

	issueBadge(badge: any) {
		this.badgeClassManager
			.badgeByIssuerSlugAndSlug(this.issuerSlug, this.badgeSlug)
			.then((badgeClass: BadgeClass) => {
				const cleanedName = striptags(badge.firstName + ' ' + badge.lastName);

				this.loading = this.badgeInstanceManager
					.createBadgeInstance(this.issuerSlug, this.badgeSlug, {
						issuer: this.issuerSlug,
						badge_class: this.badgeSlug,
						recipient_type: 'email',
						recipient_identifier: badge.email,
						narrative: '',
						create_notification: true,
						evidence_items: [],
						extensions: {
							...badgeClass.extension,
							'extensions:recipientProfile': {
								'@context': this.recipientProfileContextUrl,
								type: ['Extension', 'extensions:RecipientProfile'],
								name: cleanedName,
							},
						},
					})
					.then(
						() => {
							this.router.navigate(['issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug]);
							this.openSuccessDialog(badge.email);
							this.requestedBadges = this.requestedBadges.filter(
								(awardBadge) => awardBadge.id != badge.id,
							);
							this.deletedQRAward.emit({
								id: badge.id,
								slug: this.qrCodeId,
								badgeclass: badge.badgeclass,
							});
							this.badgeRequestApiService.deleteRequest(badge.id);
							this.qrBadgeAward.emit();
						},
						(error) => {
							this.messageService.setMessage(
								'Unable to award badge: ' + BadgrApiFailure.from(error).firstMessage,
								'error',
							);
						},
					)
					.then(() => (this.loading = null));
			});
	}
}

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { BadgeClass } from '../issuer/models/badgeclass.model';
import { OebButtonComponent } from './oeb-button.component';
import { HlmPDirective } from '../components/spartan/ui-typography-helm/src/lib/hlm-p.directive';

@Component({
	selector: 'badges-datatable',
	imports: [
		HlmTableModule,
		CommonModule,
		OebButtonComponent,
		TranslateModule,
		RouterModule,
		HlmPDirective,
	],
	template: ` <hlm-table
		class="tw-rounded-t-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-lightpurple tw-border-purple tw-border"
	>
		<hlm-caption>{{ caption }}</hlm-caption>
		<hlm-trow class="tw-bg-purple tw-text-white tw-flex-wrap hover:tw-bg-purple">
			<!-- Badge -->
			<hlm-th class="!tw-text-white tw-w-28 sm:tw-w-20 md:tw-w-40">Badge</hlm-th>
			<!-- Created on -->
			<hlm-th
				class="!tw-text-white tw-justify-center !tw-flex-1 tw-w-24 sm:tw-w-28  md:tw-w-48 !tw-px-3 sm:!tw-px-4"
				>{{ 'Badge.createdOn' | translate }}</hlm-th
			>
			<!-- Recipients -->
			<hlm-th class="!tw-text-white tw-w-36 md:tw-w-40 sm:tw-grid sm:tw-pl-0">{{
				'Badge.multiRecipients' | translate | titlecase
			}}</hlm-th>
			<!-- Badge/QR-code award -->
			<hlm-th class="!tw-text-white tw-justify-end sm:tw-w-48 tw-w-0 !tw-p-0"></hlm-th>
		</hlm-trow>
		<hlm-trow *ngFor="let badge of badges" class="tw-border-purple tw-flex-wrap tw-py-2">
			<hlm-th
				class="tw-w-28 md:tw-w-48 tw-cursor-pointer tw-flex-col tw-items-baseline tw-gap-1 md:tw-gap-2 md:tw-items-center md:tw-flex-row"
				(click)="redirectToBadgeDetail.emit({ badge: badge.badge, focusRequests: false })"
			>
				<img
					class="l-flex-x-shrink0 badgeimage badgeimage-small"
					src="{{ badge.badge.image }}"
					alt="{{ badge.badge.description }}"
					width="40"
				/>
				<div
					class="md:tw-grid md:tw-grid-cols-[150px] lg:tw-grid-cols-[250px] xl:tw-grid-cols-[350px] tw-my-1 md:tw-my-0"
				>
					<div
						class="tw-text-nowrap md:tw-text-wrap md:tw-line-clamp-3 tw-break-word  tw-max-w-36 md:tw-max-w-none tw-absolute md:tw-relative"
					>
						<span
							class="tw-text-oebblack tw-cursor-pointer"
							(click)="redirectToBadgeDetail.emit({ badge: badge.badge, focusRequests: false })"
							>{{ badge.badge.name }}</span
						>
					</div>
				</div>
			</hlm-th>
			<hlm-th
				class="!tw-flex-1 tw-justify-center !tw-text-oebblack tw-w-24 sm:tw-w-28 md:tw-w-48 sm:tw-px-3 tw-px-4"
				><p hlmP class="tw-font-normal sm:!tw-text-[16px]">
					{{ badge.badge.createdAt | date: 'dd.MM.yyyy' }}
				</p></hlm-th
			>
			<hlm-th class="tw-w-36 md:tw-w-40 tw-justify-center !tw-text-oebblack sm:tw-grid"
				><p hlmP class="tw-font-normal sm:!tw-text-[16px]">{{ badge.badge.recipientCount }}</p></hlm-th
			>
			<hlm-th
				class="tw-justify-center sm:tw-justify-end !tw-text-oebblack tw-flex-col tw-h-fit sm:tw-w-max tw-w-full tw-gap-2 tw-my-2 tw-mt-7 sm:tw-mt-2"
			>
				<div
					class="sm:tw-w-[186px] sm:tw-min-h-[50px]"
					*ngIf="badge.badge.extension['extensions:CategoryExtension']?.Category === 'learningpath'"
				></div>
				<oeb-button
					variant="secondary"
					size="xs"
					width="full_width"
					class="tw-w-full"
					(click)="directBadgeAward.emit(badge.badge)"
					[text]="directBadgeAwardText | translate"
					*ngIf="badge.badge.extension['extensions:CategoryExtension']?.Category !== 'learningpath'"
				>
				</oeb-button>
				<oeb-button
					variant="secondary"
					size="xs"
					width="full_width"
					class="tw-w-full"
					(click)="qrCodeAward.emit(badge.badge)"
					[text]="qrCodeAwardText | translate"
					*ngIf="badge.badge.extension['extensions:CategoryExtension']?.Category !== 'learningpath'"
				>
				</oeb-button>
				<oeb-button
					*ngIf="
						badge.requestCount > 0 &&
						badge.badge.extension['extensions:CategoryExtension']?.Category !== 'learningpath'
					"
					variant="green"
					size="xs"
					width="full_width"
					class="tw-w-full"
					(click)="redirectToBadgeDetail.emit({ badge: badge.badge, focusRequests: true })"
					[text]="
						badge.requestCount == 1
							? badge.requestCount + ' ' +  ('Badge.openRequestsOne' | translate)
							: badge.requestCount + ' '  +('Badge.openRequests' | translate)
					"
				>
				</oeb-button>
			</hlm-th>
		</hlm-trow>
	</hlm-table>`,
})
export class DatatableComponent {
	@Input() caption: string = '';
	@Input() badges: DatatableBadgeResult[];
	@Input() directBadgeAwardText: string = 'Badge.award';
	@Input() qrCodeAwardText: string = 'QrCode.qrAward';
	@Output() directBadgeAward = new EventEmitter();
	@Output() qrCodeAward = new EventEmitter();
	@Output() redirectToBadgeDetail = new EventEmitter<{ badge: BadgeClass; focusRequests: boolean }>();
}

export interface DatatableBadgeResult {
	badge: BadgeClass;
	requestCount: number;
}

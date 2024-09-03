import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { BadgeClass } from '../issuer/models/badgeclass.model';
import { OebButtonComponent } from './oeb-button.component';

@Component({
	selector: 'badges-datatable',
	standalone: true,
	imports: [
		HlmTableModule,
		HlmIconModule,
		CommonModule,
        OebButtonComponent,
		TranslateModule,
		RouterModule
        ],
	template: `
        <hlm-table class="tw-rounded-t-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-lightpurple tw-border-purple tw-border">
            <hlm-caption>{{caption}}</hlm-caption>
            <hlm-trow class="tw-bg-purple tw-text-white tw-flex-wrap hover:tw-bg-purple">
                <hlm-th class="!tw-text-white tw-w-28 sm:tw-w-20 md:tw-w-40">Badge</hlm-th>
                <hlm-th class="!tw-text-white tw-justify-center !tw-flex-1 tw-w-28 md:tw-w-48">{{'Badge.createdOn' | translate}}</hlm-th>
                <hlm-th class="!tw-text-white tw-w-36 md:tw-w-40 tw-hidden sm:tw-grid">{{'Badge.multiRecipients' | translate}}</hlm-th>
                <hlm-th class="!tw-text-white tw-justify-end sm:tw-w-48 tw-w-0 !tw-p-0"></hlm-th>
            </hlm-trow>
            <hlm-trow *ngFor="let badge of badges" class="tw-border-purple tw-flex-wrap tw-py-2">
                <hlm-th class="tw-w-28 md:tw-w-48 tw-cursor-pointer tw-flex-col tw-items-baseline tw-gap-1 md:tw-gap-2 md:tw-items-center md:tw-flex-row" (click)="redirectToBadgeDetail.emit(badge.badge)">
                    <img
                        class="l-flex-x-shrink0 badgeimage badgeimage-small"
                        src="{{ badge.badge.image }}"
                        alt="{{ badge.badge.description }}"
                        width="40"
                    />
                    <div class="md:tw-grid md:tw-grid-cols-[150px] ">
                      <div class="tw-line-clamp-2 tw-break-all">
                        <span class="tw-text-oebblack tw-cursor-pointer" (click)="redirectToBadgeDetail.emit(badge.badge)">{{badge.badge.name}}</span>
                      </div>  
                    </div>    
                </hlm-th>
                <hlm-th class="!tw-flex-1 tw-justify-center !tw-text-oebblack tw-w-28 md:tw-w-48"><p class="u-text">{{badge.badge.createdAt | date:"dd.MM.yyyy"}}</p></hlm-th>
                <hlm-th class="tw-w-36 md:tw-w-40 tw-justify-center !tw-text-oebblack tw-hidden sm:tw-grid">{{badge.badge.recipientCount}}</hlm-th>
                <hlm-th
				class="tw-justify-center sm:tw-justify-end !tw-text-oebblack tw-flex-col tw-h-fit sm:tw-w-max tw-w-full tw-gap-2 tw-my-2 tw-mt-6 sm:tw-mt-0"
                >
                    <oeb-button
                        variant="secondary"
                        size="xs"
                        width="full_width"
                        class="tw-w-full"
                        (click)="directBadgeAward.emit(badge.badge)"
                        [text]="directBadgeAwardText"
                    >
                    </oeb-button>
                    <oeb-button
                        variant="secondary"
                        size="xs"
                        width="full_width"
                        class="tw-w-full"
                        (click)="qrCodeAward.emit(badge.badge)"
                        [text]="qrCodeAwardText"
                    >
                    </oeb-button>
                </hlm-th>
            </hlm-trow>
        </hlm-table>`,
})
export class DatatableComponent {
	@Input() caption: string = "";
    @Input() badges: BadgeResult[];
    @Input() directBadgeAwardText: string = "Badge direkt vergeben"
    @Input() qrCodeAwardText: string = "QR-Code-Vergabe"
    @Output() directBadgeAward = new EventEmitter();
    @Output() qrCodeAward = new EventEmitter();
    @Output() redirectToBadgeDetail = new EventEmitter();
}

class BadgeResult {
	constructor(
		public badge: BadgeClass,
		public issuerName: string,
	) {}
}
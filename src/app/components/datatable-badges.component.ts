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
        <hlm-table class="tw-rounded-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-lightpurple tw-border-purple tw-border">
            <hlm-caption>{{caption}}</hlm-caption>
            <hlm-trow class="tw-bg-purple tw-text-white tw-flex-wrap hover:tw-bg-purple">
                <hlm-th class="!tw-text-white tw-w-28 md:tw-w-48">Badge</hlm-th>
                <hlm-th class="!tw-text-white tw-justify-center !tw-flex-1">{{'Badge.createdOn' | translate}}</hlm-th>
                <hlm-th class="!tw-text-white tw-w-36 md:tw-w-40">{{'Badge.multiRecipients' | translate}}</hlm-th>
                <hlm-th class="!tw-text-white tw-justify-end sm:tw-w-48 tw-w-0 !tw-p-0"></hlm-th>
            </hlm-trow>
            <hlm-trow *ngFor="let badge of badges" class="tw-border-purple tw-flex-wrap tw-py-2">
                <hlm-th class="tw-w-28 md:tw-w-48 tw-cursor-pointer" (click)="redirectToBadgeDetail.emit(badge.badge)">
                    <img
                        class="l-flex-x-shrink0 badgeimage badgeimage-small"
                        src="{{ badge.badge.image }}"
                        alt="{{ badge.badge.description }}"
                        width="40"
                    />
                    <div class="tw-ml-2 tw-hidden md:tw-grid md:tw-grid-cols-[150px] md:gap-4">
                      <div class="tw-line-clamp-2 tw-breakall">
                        <span class="tw-text-oebblack tw-cursor-pointer" (click)="redirectToBadgeDetail.emit(badge.badge)">{{badge.badge.name}}</span>
                      </div>  
                    </div>    
                </hlm-th>
                <hlm-th class="!tw-flex-1 tw-justify-center !tw-text-oebblack"><p class="u-text">{{badge.badge.createdAt | date:"dd.MM.yyyy"}}</p></hlm-th>
                <hlm-th class="tw-w-36 md:tw-w-40 tw-justify-center !tw-text-oebblack">{{badge.badge.recipientCount}}</hlm-th>
                <hlm-th class="tw-justify-center sm:tw-justify-end sm:tw-w-48 tw-w-full !tw-text-oebblack">
                    <oeb-button class="tw-w-full" variant="secondary" size="xs" width="full_width" (click)="actionElement.emit(badge.badge)" [text]="actionElementText"></oeb-button>
                </hlm-th>
            </hlm-trow>
        </hlm-table>`,
})
export class DatatableComponent {
	@Input() caption: string = "";
    @Input() badges: BadgeResult[];
    @Input() actionElementText: string = "Badge vergeben"
    @Output() actionElement = new EventEmitter();
    @Output() redirectToBadgeDetail = new EventEmitter();
}

class BadgeResult {
	constructor(
		public badge: BadgeClass,
		public issuerName: string,
	) {}
}
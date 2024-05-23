import { CommonModule } from '@angular/common';
import { BadgrCommonModule } from '../common/badgr-common.module';
import { TranslateModule } from '@ngx-translate/core';
import { BrnAccordionContentComponent } from '@spartan-ng/ui-accordion-brain';
import { HlmAccordionModule } from '../../../components/ui-accordion-helm/src';
import { HlmIconModule } from '../../../components/ui-icon-helm/src';
import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmTableModule } from '../../../components/ui-table-helm/src';
import { BadgeClass } from '../issuer/models/badgeclass.model';

@Component({
	selector: 'badges-datatable',
	standalone: true,
	imports: [
		HlmTableModule,
		HlmIconModule,
		CommonModule,
		BadgrCommonModule,
		TranslateModule,
		BrnAccordionContentComponent,
		RouterModule
        ],
	template: `
        <hlm-table class="tw-rounded-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-lightpurple tw-border-purple tw-border">
            <hlm-caption>{{caption}}</hlm-caption>
            <hlm-trow class="tw-bg-purple tw-text-white tw-flex-wrap hover:tw-bg-purple">
                <hlm-th class="!tw-text-white tw-w-24">Badge</hlm-th>
                <hlm-th class="!tw-text-white tw-justify-center !tw-flex-1">{{'Badge.createdOn' | translate}}</hlm-th>
                <hlm-th class="!tw-text-white tw-w-40">{{'Badge.multiRecipients' | translate}}</hlm-th>
                <hlm-th class="!tw-text-white tw-justify-end sm:tw-w-48 tw-w-0 !tw-p-0"></hlm-th>
            </hlm-trow>
            <hlm-trow *ngFor="let badge of badges" class="tw-border-purple tw-flex-wrap tw-py-2">
                <hlm-th class="tw-w-24 tw-cursor-pointer" (click)="redirectToBadgeDetail.emit(badge)">
                    <img
                        class="l-flex-x-shrink0 badgeimage badgeimage-small"
                        src="{{ badge.image }}"
                        alt="{{ badge.description }}"
                        width="40"
                    />
                </hlm-th>
                <hlm-th class="!tw-flex-1 tw-justify-center !tw-text-oebblack"><p class="u-text"><time [date]="badge.createdAt" format="dd.mm.yyyy"></time></p></hlm-th>
                <hlm-th class="tw-w-40 tw-justify-center !tw-text-oebblack">{{badge.recipientCount}}</hlm-th>
                <hlm-th class="tw-justify-center sm:tw-justify-end sm:tw-w-48 tw-w-full !tw-text-oebblack">
                    <button class="oeb-label-button tw-w-full" (click)="actionElement.emit(badge)">{{actionElementText}}</button>
                </hlm-th>
            </hlm-trow>
        </hlm-table>`,
})
export class DatatableComponent {
	@Input() caption: string = "";
    @Input() badges: BadgeClass[];
    @Input() actionElementText: string = "Badge vergeben"
    @Output() actionElement = new EventEmitter();
    @Output() redirectToBadgeDetail = new EventEmitter();
}

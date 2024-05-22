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
	selector: 'issuer-detail-datatable',
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
                <hlm-th class="!tw-text-white tw-w-40">ID</hlm-th>
                <hlm-th class="!tw-text-white tw-justify-center !tw-flex-1">Vergeben am </hlm-th>
            </hlm-trow>
            <hlm-trow *ngFor="let recipient of recipients" class="tw-border-purple tw-flex-wrap tw-py-2">
                <hlm-th class="tw-w-40">
                    <span>{{recipient.recipientIdentifier}}</span>
                </hlm-th>
                <hlm-th class="!tw-flex-1 tw-justify-center !tw-text-oebblack"><p class="u-text"><time [date]="recipient.issuedOn" format="dd.mm.yyyy"></time></p></hlm-th>

            </hlm-trow>
        </hlm-table>`,
})
export class IssuerDetailDatatableComponent {
	@Input() caption: string = "";
    @Input() recipients: any[];
    @Input() actionElementText: string = "Öffnen"
    @Output() actionElement = new EventEmitter();
}

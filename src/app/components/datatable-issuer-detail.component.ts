import { CommonModule } from '@angular/common';
import { BadgrCommonModule } from '../common/badgr-common.module';
import { TranslateModule } from '@ngx-translate/core';
import { BrnAccordionContentComponent } from '@spartan-ng/ui-accordion-brain';
import { HlmAccordionModule } from '../../../components/ui-accordion-helm/src';
import { HlmIconModule } from '../../../components/ui-icon-helm/src';
import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, Output, computed, effect, signal } from '@angular/core';
import { HlmTableModule } from '../../../components/ui-table-helm/src';
import { BadgeClass } from '../issuer/models/badgeclass.model';
import { HlmInputDirective } from '../../../components/ui-input-helm/src';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime} from 'rxjs';
import { BadgeInstance } from '../issuer/models/badgeinstance.model';

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
		RouterModule,
        HlmInputDirective,
        ],
	template: `
        <hlm-table class="tw-rounded-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-lightpurple tw-border-purple tw-border tw-mt-8">
            <hlm-caption>{{caption}}</hlm-caption>
            <hlm-trow class="tw-bg-purple tw-text-white tw-flex-wrap hover:tw-bg-purple">
                <hlm-th class="!tw-text-white tw-w-40">ID</hlm-th>
                <hlm-th class="!tw-text-white tw-justify-center !tw-flex-1">Vergeben am </hlm-th>
            </hlm-trow>
            <hlm-trow *ngFor="let recipient of recipients" class="tw-border-purple tw-flex-wrap tw-py-2">
                <hlm-th class="tw-w-40">
                    <span class="!tw-text-oebblack !tw-font-normal">{{recipient.recipientIdentifier}}</span>
                </hlm-th>
                <hlm-th class="!tw-flex-1 tw-justify-center !tw-text-oebblack"><p class="u-text"><time [date]="recipient.issuedOn" format="dd/MM/y"></time></p></hlm-th>

            </hlm-trow>
        </hlm-table>`,
})

export class IssuerDetailDatatableComponent {
    // protected readonly _rawFilterInput = signal('');
    // protected readonly _emailFilter = signal('');
    // private readonly _debouncedFilter = toSignal(toObservable(this._rawFilterInput).pipe(debounceTime(300)));

    // private readonly _filteredRecipients = computed(() => {
    //     const emailFilter = this._emailFilter()?.trim()?.toLowerCase();
    //     if (emailFilter && emailFilter.length > 0) {
    //       return this.recipients().filter((u) => u.email.toLowerCase().includes(emailFilter));
    //     }
    //     return this.recipients();
    //   });
    // constructor() {
    // // needed to sync the debounced filter to the name filter, but being able to override the
    // // filter when loading new users without debounce
    // effect(() => this._emailFilter.set(this._debouncedFilter() ?? ''), { allowSignalWrites: true });
    // }
	@Input() caption: string = "";
    @Input() recipients: BadgeInstance[] = [];
    @Output() actionElement = new EventEmitter();

}

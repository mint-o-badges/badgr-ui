import { CommonModule } from '@angular/common';
import { BadgrCommonModule } from '../common/badgr-common.module';
import { TranslateModule } from '@ngx-translate/core';
import { BrnAccordionContentComponent } from '@spartan-ng/ui-accordion-brain';
import { HlmIconModule } from './spartan/ui-icon-helm/src';
import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, Output, computed, effect, input, signal } from '@angular/core';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { HlmInputDirective } from './spartan/ui-input-helm/src';
import { HlmLabelDirective } from './spartan/ui-label-helm/src';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime} from 'rxjs';
import { BadgeInstance } from '../issuer/models/badgeinstance.model';
import { FormsModule } from '@angular/forms';
import { HlmIconComponent, provideIcons } from './spartan/ui-icon-helm/src';
import { lucideSearch } from '@ng-icons/lucide';
import { HlmCommandInputWrapperComponent } from './spartan/ui-command-helm/src';


@Component({
	selector: 'issuer-detail-datatable',
	standalone: true,
	imports: [
    FormsModule,
		HlmTableModule,
		HlmIconModule,
		CommonModule,
		BadgrCommonModule,
		TranslateModule,
		BrnAccordionContentComponent,
		RouterModule,
    HlmInputDirective,
    HlmLabelDirective,
    HlmIconComponent,
    HlmCommandInputWrapperComponent
    ],
    providers: [provideIcons({ lucideSearch })],    
	template: `
  <div class="tw-p-[calc(var(--gridspacing)*2)] tw-mt-8 tw-max-w-[596px]">
    <div class="tw-flex tw-items-center tw-justify-between tw-gap-4 sm:flex-col">
      <div class="l-stack u-margin-bottom2x u-margin-top4x">
            <h3 class="md:tw-text-xl tw-text-sm tw-font-semibold tw-font-[rubik] tw-text-oebblack">
              {{ recipientCount }} Badge {{ recipientCount == 1 ? 'Empfänger:in' : 'Empfänger:innen' }}
            </h3>
      </div>
      <label hlmLabel class="tw-font-semibold tw-text-[0.5rem] tw-w-full"> 
        <span class="tw-px-3">Nach Email Adresse suchen</span>
        <hlm-cmd-input-wrapper class="tw-relative tw-px-0 tw-mt-1">
                <input
                hlmInput
                class="tw-w-full tw-border-solid tw-ml-auto tw-border-purple tw-py-1 tw-rounded-[20px]"
                [ngModel]="_emailFilter()"
                (ngModelChange)="_rawFilterInput.set($event)"
                />
                <hlm-icon size="lg" class="tw-absolute  tw-right-6 tw-text-purple" name="lucideSearch" />
        </hlm-cmd-input-wrapper>
      
        </label>
      </div>
        <hlm-table class="tw-rounded-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-lightpurple tw-border-purple tw-border tw-mt-8">
            <hlm-caption>{{caption}}</hlm-caption>
            <hlm-trow class="tw-bg-purple tw-text-white tw-flex-wrap hover:tw-bg-purple">
                <hlm-th class="!tw-text-white tw-w-40">ID</hlm-th>
                <hlm-th class="!tw-text-white tw-justify-center !tw-flex-1">Vergeben am </hlm-th>
            </hlm-trow>
            <hlm-trow *ngFor="let recipient of _filteredEmails()" class="tw-border-purple tw-flex-wrap tw-py-2">
                <hlm-th class="tw-w-40">
                    <span class="!tw-text-oebblack !tw-font-normal">{{recipient.recipientIdentifier}}</span>
                </hlm-th>
                <hlm-th class="!tw-flex-1 tw-justify-center !tw-text-oebblack"><p class="u-text"><time [date]="recipient.issuedOn" format="dd.MM.y"></time></p></hlm-th>

            </hlm-trow>
        </hlm-table>
      </div>  
        `,
})



export class IssuerDetailDatatableComponent {

    @Input() caption: string = "";
    @Input() recipientCount: number = 0;
    @Output() actionElement = new EventEmitter();

    _recipients = input.required<BadgeInstance[]>();

    protected readonly _rawFilterInput = signal('');
    protected readonly _emailFilter = signal('');
    private readonly _debouncedFilter = toSignal(toObservable(this._rawFilterInput).pipe(debounceTime(300)));

    constructor() {
    // needed to sync the debounced filter to the name filter, but being able to override the
    // filter when loading new users without debounce
    effect(() => this._emailFilter.set(this._debouncedFilter() ?? ''), { allowSignalWrites: true });
    }

    _filteredEmails = computed(() => {
      if (this._recipients().length) {
        const emailFilter = this._emailFilter()?.trim()?.toLowerCase();
        return this._recipients().filter((u) => u.recipientIdentifier.toLowerCase().includes(emailFilter));
      }
      return this._recipients();
    });

    protected readonly _totalElements = computed(() => this._filteredEmails().length);
}

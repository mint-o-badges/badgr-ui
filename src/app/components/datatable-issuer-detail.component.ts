import { NgIcon } from '@ng-icons/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { Component, EventEmitter, Input, Output, computed, effect, input, signal } from '@angular/core';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { HlmInput } from './spartan/ui-input-helm/src';
import { HlmLabel } from './spartan/ui-label-helm/src';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { BadgeInstance } from '../issuer/models/badgeinstance.model';
import { FormsModule } from '@angular/forms';
import { HlmIcon } from './spartan/ui-icon-helm/src';
import { lucideSearch } from '@ng-icons/lucide';
import { OebButtonComponent } from './oeb-button.component';
import { provideIcons } from '@ng-icons/core';
import { OebSpinnerComponent } from './oeb-spinner.component';
import { HlmCommandInputWrapper } from './spartan/ui-command-helm/src/lib/hlm-command-input-wrapper.component';
import { LoadingDotsComponent } from '../common/components/loading-dots.component';
import { TimeComponent } from '~/common/components/time.component';

@Component({
	selector: 'issuer-detail-datatable',
	imports: [
		FormsModule,
		HlmTableModule,
		CommonModule,
		TranslateModule,
		RouterModule,
		HlmInput,
		HlmLabel,
		NgIcon,
		HlmIcon,
		HlmCommandInputWrapper,
		OebButtonComponent,
		OebSpinnerComponent,
		LoadingDotsComponent,
		TimeComponent,
	],
	providers: [provideIcons({ lucideSearch })],
	template: `
		<div class="tw-p-[calc(var(--gridspacing)*2)] tw-mt-8">
			<div class="tw-flex tw-items-center tw-justify-between tw-gap-4 sm:flex-col">
				<div class="l-stack u-margin-bottom2x u-margin-top4x">
					<h3
						class="md:tw-text-xl md:tw-text-nowrap tw-text-sm tw-font-semibold tw-font-[rubik] tw-text-oebblack"
					>
						{{ recipientCount }} Badge
						{{ recipientCount == 1 ? ('Issuer.recipient' | translate) : ('Issuer.recipients' | translate) }}
					</h3>
				</div>
				<label hlmLabel class="tw-font-semibold tw-text-[0.5rem] tw-w-full">
					<span class="tw-px-3">{{ 'General.searchByEmail' | translate }}</span>
					<hlm-cmd-input-wrapper class="tw-relative tw-px-0 tw-mt-1 tw-border-b-0">
						<input
							hlmInput
							class="tw-w-full tw-border-solid tw-ml-auto tw-border-purple tw-py-1 tw-rounded-[20px]"
							[ngModel]="_emailFilter()"
							(ngModelChange)="_rawFilterInput.set($event)"
						/>
						<ng-icon hlm size="lg" class="tw-absolute  tw-right-6 tw-text-purple" name="lucideSearch" />
					</hlm-cmd-input-wrapper>
				</label>
			</div>
			@if (awardInProgress) {
				<div
					class="tw-border-green tw-p-2 tw-border-solid tw-border-4 tw-rounded-[10px] tw-w-full tw-flex md:tw-gap-6 tw-gap-2 tw-items-center"
				>
					<oeb-spinner size="lg"></oeb-spinner>
					<div class="tw-text-oebblack tw-text-lg tw-flex tw-flex-col tw-gap-1">
						<span class="tw-text-lg tw-font-bold tw-uppercase">{{
							'Badge.awardingInProgress' | translate
						}}</span>
						<span>{{ 'Badge.willBeAwardedSoon' | translate }}</span>
					</div>
				</div>
			}
			<table
				hlmTable
				class="tw-rounded-t-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-lightpurple tw-border-purple tw-border-[1px] tw-border-solid tw-mt-8"
			>
				@if (caption) {
					<caption hlmCaption>
						{{
							caption
						}}
					</caption>
				}
				<tr hlmTr class="tw-bg-purple tw-text-white tw-flex-wrap hover:tw-bg-purple">
					<th hlmTh class="!tw-text-white tw-w-40">ID</th>
					<th hlmTh class="!tw-text-white tw-justify-center xl:tw-pr-12 !tw-flex-1">
						{{ 'RecBadgeDetail.issuedOn' | translate }}
					</th>
					<th hlmTh class="!tw-text-white tw-justify-end xl:tw-w-40 tw-w-0 !tw-p-0"></th>
				</tr>
				@for (recipient of _filteredEmails(); track recipient; let i = $index) {
					<tr
						hlmTr
						class="tw-border-purple tw-border-0 tw-border-solid tw-flex-wrap tw-items-center tw-py-2 tw-relative"
					>
						<!-- loading spinner -->
						@if (downloadStates[i]) {
							<loading-dots
								[showLoading]="false"
								class="tw-absolute tw-right-0 tw-left-0 tw-z-50"
							></loading-dots>
						}
						<th hlmTh class="tw-w-40">
							<span class="!tw-text-oebblack !tw-font-normal">{{ recipient.recipientIdentifier }}</span>
						</th>
						<th hlmTh class="!tw-flex-1 tw-justify-center !tw-text-oebblack">
							<p class="u-text">
								<time [date]="recipient.issuedOn" format="dd.MM.y"></time>
							</p>
						</th>
						<th
							hlmTh
							class="tw-justify-center tw-gap-[25px] xl:tw-gap-[5px] xl:tw-w-max xl:tw-h-fit xl:tw-flex-col xl:tw-justify-end tw-w-full !tw-text-oebblack"
						>
							<oeb-button
								variant="secondary"
								size="xs"
								width="full_width"
								class="tw-w-full"
								(click)="actionElement.emit(recipient)"
								[text]="actionElementText | translate | titlecase"
							></oeb-button>
							<oeb-button
								size="xs"
								width="full_width"
								class="tw-w-full tw-font-semibold"
								(click)="downloadCertificate.emit({ instance: recipient, badgeIndex: i })"
								text="{{ 'Issuer.pdfCertificate' | translate }}"
								[disabled]="downloadStates[i]"
							></oeb-button>
						</th>
					</tr>
				}
			</table>
		</div>
	`,
})
export class IssuerDetailDatatableComponent {
	@Input() caption: string = '';
	@Input() recipientCount: number = 0;
	@Input() actionElementText: string = 'General.revoke';
	@Input() downloadStates;
	@Output() actionElement = new EventEmitter();
	@Output() downloadCertificate = new EventEmitter<object>();
	@Input() awardInProgress: boolean = false;

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

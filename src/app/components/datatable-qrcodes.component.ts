// import { CommonModule } from '@angular/common';
// import { TranslateModule } from '@ngx-translate/core';
// import { HlmIconModule } from './spartan/ui-icon-helm/src';
// import { Router, RouterModule } from '@angular/router';
// import { Component, EventEmitter, Input, OnInit, Output, computed, inject, signal } from '@angular/core';
// import { HlmTableModule } from './spartan/ui-table-helm/src';
// import { OebButtonComponent } from './oeb-button.component';
// import { BadgeRequestApiService } from '../issuer/services/badgerequest-api.service';
// import { BadgeInstanceManager } from '../issuer/services/badgeinstance-manager.service';
// import { BadgeClassManager } from '../issuer/services/badgeclass-manager.service';
// import { BadgeClass } from '../issuer/models/badgeclass.model';
// import { MessageService } from '../common/services/message.service';
// import { BadgrApiFailure } from '../common/services/api-failure';
// import { HlmDialogService } from './spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
// import { SuccessDialogComponent } from '../common/dialogs/oeb-dialogs/success-dialog.component';
// import striptags from 'striptags';
// import { OebCheckboxComponent } from './oeb-checkbox.component';
// import { toSignal } from '@angular/core/rxjs-interop';
// import { map } from 'rxjs';
// import { SelectionModel } from '@angular/cdk/collections';
// import { HlmCheckboxComponent } from './spartan/ui-checkbox-helm/src/lib/hlm-checkbox.component';

// @Component({
// 	selector: 'qrcodes-datatable',
// 	standalone: true,
// 	imports: [
// 		HlmTableModule,
// 		HlmIconModule,
// 		CommonModule,
// 		OebButtonComponent,
// 		TranslateModule,
// 		RouterModule,
// 		SuccessDialogComponent,
// 		OebCheckboxComponent,
// 		HlmCheckboxComponent
// 	],
// 	providers: [BadgeRequestApiService, BadgeInstanceManager, BadgeClassManager, HlmDialogService],
// 	template: ` <hlm-table
// 		class="tw-rounded-t-[20px] tw-overflow-hidden tw-w-full tw-max-w-[100%] tw-bg-[var(--color-darkgray)] tw-border-darkgrey tw-border-[1px] tw-border-solid"
// 	>
// 		<hlm-trow class="tw-bg-[var(--color-darkgray)] hover:!tw-bg-[var(--color-darkgray)] tw-text-white tw-flex-wrap">
// 			<hlm-th class="!tw-text-white tw-w-36 md:tw-w-48 !tw-px-2 tw-flex tw-justify-center tw-items-center"
// 				>ID</hlm-th
// 			>
// 			<hlm-th class="!tw-text-white tw-justify-center !tw-flex-1">{{ 'Badge.requestedOn' | translate }}</hlm-th>
// 			<hlm-th class="!tw-text-white tw-underline tw-justify-end lg:tw-w-48 tw-w-0 !tw-p-0">
// 				<oeb-checkbox
// 					class=""
// 					id="remember-me"
// 					name="remember-me"
// 					type="checkbox"
// 					text="Alle auswählen"
// 					textLeft="true"
// 					[textStyle]="'!tw-text-white tw-text-sm'"
// 				>
// 				</oeb-checkbox>
// 				<hlm-checkbox [checked]="_checkboxState()" (changed)="handleHeaderCheckboxChange()" />
// 			</hlm-th>
// 		</hlm-trow>
// 		<hlm-trow
// 			*ngFor="let badge of requestedBadges"
// 			class="tw-bg-[var(--color-lightgray)] hover:!tw-bg-[var(--color-lightgray)] tw-border-[var(--color-darkgray)] tw-flex tw-flex-wrap tw-py-2"
// 		>
// 			<hlm-th class="!tw-px-2 tw-w-36 md:tw-w-48 tw-justify-center !tw-text-oebblack"
// 				><span class="tw-inline-block tw-truncate tw-text-ellipsis">{{ badge.email }}</span></hlm-th
// 			>
// 			<hlm-th class="!tw-flex-1 tw-justify-center"
// 				><p class="u-text tw-text-purple">{{ badge.requestedOn | date: 'dd.MM.yyyy' }}</p></hlm-th
// 			>
// 			<hlm-th class="tw-justify-center sm:tw-justify-end tw-w-full lg:tw-w-48 !tw-text-oebblack">
// 				<hlm-icon name="lucideTrash2" class="mr-2" size="sm" />
// 				<hlm-checkbox [checked]="_isPaymentSelected(element)" (changed)="togglePayment(element)" />
// 			</hlm-th>
// 		</hlm-trow>
// 	</hlm-table>
// 	<oeb-button
// 		class="tw-mt-2 tw-float-right"
// 		size="xs"
// 		[disabled]="!!loading"
// 		text="Login"
// 		[loading-promises]="[loading]"
// 		loading-message="Loading..."
// 		[text]="actionElementText"
// 	></oeb-button>`,
// })
// export class QrCodeDatatableComponent implements OnInit {
// 	@Input() caption: string = '';
// 	@Input() qrCodeId: string = '';
// 	@Input() badgeSlug: string = '';
// 	@Input() issuerSlug: string = '';
// 	@Input() badgeIssueLink: string[] = [];
// 	@Input() requestedBadges: any;
// 	@Input() actionElementText: string = 'Badge vergeben';
// 	@Output() actionElement = new EventEmitter();
// 	@Output() redirectToBadgeDetail = new EventEmitter();
// 	@Output() deletedQRAward = new EventEmitter();
// 	@Output() qrBadgeAward = new EventEmitter<void>();
// 	loading: Promise<unknown>;

// 	constructor(
// 		private badgeRequestApiService: BadgeRequestApiService,
// 		private badgeInstanceManager: BadgeInstanceManager,
// 		private badgeClassManager: BadgeClassManager,
// 		private messageService: MessageService,
// 		public router: Router,
// 	) {}

// 	ngOnInit(): void {
// 		this.badgeRequestApiService.getBadgeRequestsByQrCode(this.qrCodeId).then((requestedBadges: any) => {
// 			this.requestedBadges = requestedBadges.body.requested_badges;
// 		});
// 	}

// 	private readonly _selectionModel = new SelectionModel<unknown>(true);

// 	protected readonly _selected = toSignal(this._selectionModel.changed.pipe(map((change) => change.source.selected)), {
// 		initialValue: [],
// 	  });
// 	private readonly _payments = signal([]);
// 	private readonly _emailSort = signal<'ASC' | 'DESC' | null>(null);
// 	private readonly _displayedIndices = signal({ start: 0, end: 0 });
// 	protected readonly _emailFilter = signal('');
// 	protected readonly _isPaymentSelected = (payment: any) => this._selectionModel.isSelected(payment);

// 	private readonly _filteredPayments = computed(() => {
// 		const emailFilter = this._emailFilter()?.trim()?.toLowerCase();
// 		if (emailFilter && emailFilter.length > 0) {
// 		  return this._payments().filter((u) => u.email.toLowerCase().includes(emailFilter));
// 		}
// 		return this._payments();
// 	});

// 	protected togglePayment(payment: any) {
// 		this._selectionModel.toggle(payment);
// 	  }
	
// 	protected readonly _filteredSortedPaginatedPayments = computed(() => {
// 	const sort = this._emailSort();
// 	const start = this._displayedIndices().start;
// 	const end = this._displayedIndices().end + 1;
// 	const payments = this._filteredPayments();
// 	if (!sort) {
// 		return payments.slice(start, end);
// 	}
// 	return [...payments]
// 		.sort((p1, p2) => (sort === 'ASC' ? 1 : -1) * p1.email.localeCompare(p2.email))
// 		.slice(start, end);
// 	});

// 	protected readonly _allFilteredPaginatedPaymentsSelected = computed(() =>
// 	  this._filteredSortedPaginatedPayments().every((payment) => this._selected().includes(payment)),
// 	);	  

// 	protected readonly _checkboxState = computed(() => {
// 		const noneSelected = this._selected().length === 0;
// 		const allSelectedOrIndeterminate = this._allFilteredPaginatedPaymentsSelected() ? true : 'indeterminate';
// 		return noneSelected ? false : allSelectedOrIndeterminate;
// 	  });

// 	protected handleHeaderCheckboxChange() {
// 		console.log(this._checkboxState)
// 		const previousCbState = this._checkboxState();
// 		if (previousCbState === 'indeterminate' || !previousCbState) {
// 		  this._selectionModel.select(...this._filteredSortedPaginatedPayments());
// 		} else {
// 		  this._selectionModel.deselect(...this._filteredSortedPaginatedPayments());
// 		}
// 	  }

// 	recipientProfileContextUrl = 'https://openbadgespec.org/extensions/recipientProfile/context.json';

// 	private readonly _hlmDialogService = inject(HlmDialogService);
// 	public openSuccessDialog(recipient) {
// 		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
// 			context: {
// 				recipient: recipient,
// 				variant: 'success',
// 			},
// 		});
// 	}

// 	issueBadge(badge: any) {
// 		this.badgeClassManager
// 			.badgeByIssuerSlugAndSlug(this.issuerSlug, this.badgeSlug)
// 			.then((badgeClass: BadgeClass) => {
// 				const cleanedName = striptags(badge.firstName + ' ' + badge.lastName);

// 				this.loading = this.badgeInstanceManager
// 					.createBadgeInstance(this.issuerSlug, this.badgeSlug, {
// 						issuer: this.issuerSlug,
// 						badge_class: this.badgeSlug,
// 						recipient_type: 'email',
// 						recipient_identifier: badge.email,
// 						narrative: '',
// 						create_notification: true,
// 						evidence_items: [],
// 						extensions: {
// 							...badgeClass.extension,
// 							'extensions:recipientProfile': {
// 								'@context': this.recipientProfileContextUrl,
// 								type: ['Extension', 'extensions:RecipientProfile'],
// 								name: cleanedName,
// 							},
// 						},
// 					})
// 					.then(
// 						() => {
// 							this.router.navigate(['issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug]);
// 							this.openSuccessDialog(badge.email);
// 							this.requestedBadges = this.requestedBadges.filter(
// 								(awardBadge) => awardBadge.id != badge.id,
// 							);
// 							this.deletedQRAward.emit({
// 								id: badge.id,
// 								slug: this.qrCodeId,
// 								badgeclass: badge.badgeclass,
// 							});
// 							this.badgeRequestApiService.deleteRequest(badge.id);
// 							this.qrBadgeAward.emit();
// 						},
// 						(error) => {
// 							this.messageService.setMessage(
// 								'Unable to award badge: ' + BadgrApiFailure.from(error).firstMessage,
// 								'error',
// 							);
// 						},
// 					)
// 					.then(() => (this.loading = null));
// 			});
// 	}
// }


import { SelectionModel } from '@angular/cdk/collections';
import { DecimalPipe, TitleCasePipe, DatePipe } from '@angular/common';
import { Component, TrackByFunction, computed, effect, signal, inject, Input, Output, EventEmitter, } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { lucideArrowUpDown, lucideChevronDown, lucideEllipsis } from '@ng-icons/lucide';
import { HlmButtonModule } from './spartan/ui-button-helm/src';
import { HlmCheckboxCheckIconComponent, HlmCheckboxComponent } from './spartan/ui-checkbox-helm/src';
import { HlmIconComponent, provideIcons } from './spartan/ui-icon-helm/src';
import { HlmInputDirective } from './spartan/ui-input-helm/src';
import { BrnMenuTriggerDirective } from '@spartan-ng/ui-menu-brain';
import { HlmMenuModule } from './spartan/ui-menu-helm/src';
import { BrnTableModule, PaginatorState, useBrnColumnManager } from '@spartan-ng/ui-table-brain';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { BrnSelectModule } from '@spartan-ng/ui-select-brain';
import { HlmSelectModule } from './spartan/ui-select-helm/src';
import { hlmMuted } from './spartan/ui-typography-helm/src';
import { debounceTime, map } from 'rxjs';
import { HlmDialogService } from './spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { SuccessDialogComponent } from '../common/dialogs/oeb-dialogs/success-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { BadgeRequestApiService } from '../issuer/services/badgerequest-api.service';
import { BadgeInstanceManager } from '../issuer/services/badgeinstance-manager.service';
import { BadgeClassManager } from '../issuer/services/badgeclass-manager.service';
import { BadgeClass } from '../issuer/models/badgeclass.model';
import { MessageService } from '../common/services/message.service';
import { BadgrApiFailure } from '../common/services/api-failure';
import { Router } from '@angular/router';
import { DangerDialogComponent } from '../common/dialogs/oeb-dialogs/danger-dialog.component';
import { TranslateService } from "@ngx-translate/core";
import { ApiRequestedBadge } from '../issuer/models/badgerequest-api.model';
import { I18nPluralPipe } from '@angular/common';
import { HlmCommandInputWrapperComponent } from './spartan/ui-command-helm/src/lib/hlm-command-input-wrapper.component';
import { OebButtonComponent } from './oeb-button.component';
import striptags from 'striptags';
import { OebSpinnerComponent } from './oeb-spinner.component';
import { BadgeInstanceBatchAssertion } from '../issuer/models/badgeinstance-api.model';


export type Payment = {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  email: string;
};

export type RequestedBadge = {
	email: string; 
	status: string;
	firstName: string; 
	lastName: string; 
	requestedOn: Date;
	entity_id: string; 
}

@Component({
  selector: 'qrcodes-datatable',
  standalone: true,
  imports: [
    FormsModule,

    BrnMenuTriggerDirective,
    HlmMenuModule,

    BrnTableModule,
    HlmTableModule,

    HlmButtonModule,

    DecimalPipe,
    TitleCasePipe,
	  I18nPluralPipe,
	  DatePipe,
    HlmIconComponent,
    HlmInputDirective,

    HlmCheckboxCheckIconComponent,
    HlmCheckboxComponent,

    BrnSelectModule,
    HlmSelectModule,
    TranslateModule,
    HlmCommandInputWrapperComponent,
    OebButtonComponent,
    OebSpinnerComponent,

  ],
  styleUrl: './datatable-qrcodes.component.scss',
  providers: [provideIcons({ lucideChevronDown, lucideEllipsis, lucideArrowUpDown }), TranslateService],
  host: {
    class: 'tw-w-full',
  },
  template: ` 
    <div class="tw-flex tw-flex-col tw-justify-between tw-gap-4 sm:tw-flex-row">
		<label hlmLabel class="tw-font-semibold tw-text-[0.5rem] tw-w-full md:tw-w-80">
			<span class="tw-px-3 tw-text-muted-foreground tw-text-sm">Nach E-Mail-Adresse suchen</span>
			<hlm-cmd-input-wrapper class="tw-relative tw-px-0 tw-mt-1 tw-border-b-0">
				<input
					hlmInput
					class="tw-w-full tw-border-solid tw-border-purple tw-py-1 tw-rounded-[20px] tw-text-oebblack"
					[ngModel]="_emailFilter()"
					(ngModelChange)="_rawFilterInput.set($event)"
				/>
				<hlm-icon size="lg" class="tw-absolute  tw-right-6 tw-text-purple" name="lucideSearch" />
			</hlm-cmd-input-wrapper>
		</label>
		<!--
      <input
        hlmInput
        class="tw-w-full md:tw-w-80"
        placeholder="Filter emails..."
        [ngModel]="_emailFilter()"
        (ngModelChange)="_rawFilterInput.set($event)"
      />
	  -->

     <!-- 
	  <button hlmBtn variant="outline" align="end" [brnMenuTriggerFor]="menu">
        Columns
        <hlm-icon name="lucideChevronDown" class="tw-ml-2" size="sm" />
      </button>
      <ng-template #menu>
        <hlm-menu class="tw-w-32">
          @for (column of _brnColumnManager.allColumns; track column.name) {
            <button
              hlmMenuItemCheckbox
              [disabled]="_brnColumnManager.isColumnDisabled(column.name)"
              [checked]="_brnColumnManager.isColumnVisible(column.name)"
              (triggered)="_brnColumnManager.toggleVisibility(column.name)"
            >
              <hlm-menu-item-check />
              <span>{{ column.label }}</span>
            </button>
          }
        </hlm-menu>
      </ng-template>
	  -->
    </div>

    @if(loading){
      <oeb-spinner [text]="'General.pleaseWait' | translate" /> 
    } @else {
      <brn-table
        hlm
        stickyHeader
        class="tw-mt-4 tw-block tw-min-h-[335px] tw-max-h-[680px] tw-overflow-x-hidden tw-overflow-y-auto tw-rounded-md"
        [dataSource]="_filteredSortedPayments()"
        [displayedColumns]="_allDisplayedColumns()"
        [trackBy]="_trackBy"
      [headerRowClasses]="headerRowStyle"
      [bodyRowClasses]="bodyRowStyle"
      >
        <brn-column-def name="select" class="tw-w-12">
          <hlm-th *brnHeaderDef>
            <hlm-checkbox [checked]="_checkboxState()" (changed)="handleHeaderCheckboxChange()" />
          </hlm-th>
          <hlm-td *brnCellDef="let element">
            <hlm-checkbox [checked]="_isPaymentSelected(element)" (changed)="togglePayment(element)" />
          </hlm-td>
        </brn-column-def>
        <brn-column-def name="email" class="tw-w-40">
          <hlm-th class="tw-text-white" truncate *brnHeaderDef>ID</hlm-th>
          <hlm-td class="tw-text-white" *brnCellDef="let element">
            <span class="tw-text-oebblack">{{ element.email }}</span>
          </hlm-td>
        </brn-column-def>
        <brn-column-def name="requestedOn" class="!tw-flex-1 tw-justify-center">
          <hlm-th *brnHeaderDef>
            <button hlmBtn size="sm" variant="ghost" (click)="handleEmailSortChange()">
              <span class="tw-text-white tw-text-sm">{{'Badge.requestedOn' | translate}}</span>
              <hlm-icon class="tw-ml-3 tw-text-white" size="sm" name="lucideArrowUpDown" />
            </button>
          </hlm-th>
          <hlm-td class="!tw-flex-1 tw-justify-center" *brnCellDef="let element">
            <span class="tw-text-oebblack">{{ element.requestedOn | date: 'dd.MM.yyyy' }}</span>
          </hlm-td>
        </brn-column-def>
        <brn-column-def name="amount" class="tw-justify-end tw-w-20">
          <hlm-th class="tw-text-white" *brnHeaderDef></hlm-th>
          <hlm-td class="tw-font-medium tw-tabular-nums" *brnCellDef="let element">
      <button (click)="openDangerDialog(element)">
        <hlm-icon class="tw-ml-3 tw-text-oebblack" size="sm" name="lucideTrash2" />
          </button>
        </hlm-td>
        </brn-column-def>
        <brn-column-def name="actions" class="tw-w-16">
          <hlm-th *brnHeaderDef></hlm-th>
          <hlm-td *brnCellDef="let element">
            <button hlmBtn variant="ghost" class="tw-h-6 tw-w-6 tw-p-0.5" align="end" [brnMenuTriggerFor]="menu">
              <hlm-icon class="tw-w-4 tw-h-4" name="lucideEllipsis" />
            </button>
  
            <ng-template #menu>
              <hlm-menu>
                <hlm-menu-label>Actions</hlm-menu-label>
                <hlm-menu-separator />
                <hlm-menu-group>
                  <button hlmMenuItem>Copy payment ID</button>
                </hlm-menu-group>
                <hlm-menu-separator />
                <hlm-menu-group>
                  <button hlmMenuItem>View customer</button>
                  <button hlmMenuItem>View payment details</button>
                </hlm-menu-group>
              </hlm-menu>
            </ng-template>
          </hlm-td>
        </brn-column-def>
        <div class="tw-flex tw-items-center tw-justify-center tw-p-20 tw-text-muted-foreground" brnNoDataRow>No data</div>
      </brn-table>
    }

      <oeb-button 
        size="sm"
        class="tw-float-right tw-mt-4"
        (click)="issueBadges()"
        [disabled]="_selected().length === 0"
        [text]="_selected().length > 1 ? 
          ('Issuer.giveBadges' | translate)
          : ('Issuer.giveBadge' | translate)">
      </oeb-button>
  `,
})
export class QrCodeDatatableComponent {
	@Input() caption: string = '';
	@Input() qrCodeId: string = '';
	@Input() badgeSlug: string = '';
	@Input() issuerSlug: string = '';
	@Input() badgeIssueLink: string[] = [];
	@Input() actionElementText: string = 'Badge vergeben';
	@Input() requestCount: number;
	@Output() requestCountChange=new EventEmitter();
	@Output() actionElement = new EventEmitter();
	@Output() redirectToBadgeDetail = new EventEmitter();
	@Output() deletedQRAward = new EventEmitter();
	@Output() qrBadgeAward = new EventEmitter<void>();
	requestedBadges: RequestedBadge[] = []
	loading: Promise<unknown>;
  public headerRowStyle = 'tw-flex tw-min-w-[100%] tw-w-fit tw-rounded-t-[20px] tw-border-b tw-border-darkgrey [&.cdk-table-sticky]:tw-bg-darkgrey ' +
  '[&.cdk-table-sticky>*]:tw-z-[101] [&.cdk-table-sticky]:before:tw-z-0 [&.cdk-table-sticky]:before:tw-block [&.cdk-table-sticky]:hover:before:tw-bg-muted/50 [&.cdk-table-sticky]:before:tw-absolute [&.cdk-table-sticky]:before:tw-inset-0'

  public bodyRowStyle = 'tw-bg-lightgrey tw-flex tw-min-w-[100%] tw-w-fit !tw-border-x !tw-border-b tw-border-solid tw-border-darkgrey tw-transition-[background-color] hover:tw-bg-muted/50 [&:has([role=checkbox][aria-checked=true])]:tw-bg-muted'
  protected readonly _rawFilterInput = signal('');
  protected readonly _emailFilter = signal('');
  private readonly _debouncedFilter = toSignal(toObservable(this._rawFilterInput).pipe(debounceTime(300)));

  private readonly _selectionModel = new SelectionModel<RequestedBadge>(true);
  protected readonly _isPaymentSelected = (payment: RequestedBadge) => this._selectionModel.isSelected(payment);
  protected readonly _selected = toSignal(this._selectionModel.changed.pipe(map((change) => change.source.selected)), {
    initialValue: [],
  });

  protected readonly _brnColumnManager = useBrnColumnManager({
    email: { visible: true, label: 'Email' },
    requestedOn: { visible: true, label: 'RequestedOn' },
    amount: { visible: true, label: 'Amount ($)' },
  });
  protected readonly _allDisplayedColumns = computed(() => [
    'select',
    ...this._brnColumnManager.displayedColumns(),
    'actions',
  ]);

  private readonly _requestedBadges = signal(this.requestedBadges);
  private readonly _filteredPayments = computed(() => {
    const emailFilter = this._emailFilter()?.trim()?.toLowerCase();
    if (emailFilter && emailFilter.length > 0) {
      return this._requestedBadges().filter((u) => u.email.toLowerCase().includes(emailFilter));
    }
    return this._requestedBadges();
  });
  private readonly _requestedOnSort = signal<'ASC' | 'DESC' | null>(null);
  private readonly _emailSort = signal<'ASC' | 'DESC'>('ASC');
  protected readonly _filteredSortedPayments = computed(() => {
    const sort = this._emailSort();
    const payments = this._filteredPayments();
    if (!sort) {
      return payments;
    }
    return [...payments].sort((p1, p2) => {
      const date1 = new Date(p1.requestedOn);
		  const date2 = new Date(p2.requestedOn);
      return (sort === 'ASC' ? 1 : -1) * (date1.getTime() - date2.getTime());
    }
    );
  });
  // protected readonly _filteredSortedPaginatedPayments = computed(() => {
  //   const sort = this._emailSort();
  //   const start = this._displayedIndices().start;
  //   const end = this._displayedIndices().end + 1;
  //   const payments = this._filteredPayments();
  //   if (!sort) {
  //     return payments.slice(start, end);
  //   }
  //   return [...payments]
	//   .sort((p1, p2) => {
	// 	const date1 = new Date(p1.requestedOn);
	// 	const date2 = new Date(p2.requestedOn);
	// 	return (sort === 'ASC' ? 1 : -1) * (date1.getTime() - date2.getTime());
	//   })
  //     .slice(start, end);
  // });
  protected readonly _allFilteredPaginatedPaymentsSelected = computed(() =>
    this._filteredSortedPayments().every((payment) => this._selected().includes(payment)),
  );
  protected readonly _checkboxState = computed(() => {
    const noneSelected = this._selected().length === 0;
    const allSelectedOrIndeterminate = this._allFilteredPaginatedPaymentsSelected() ? true : 'indeterminate';
    return noneSelected ? false : allSelectedOrIndeterminate;
  });

  protected readonly _trackBy: TrackByFunction<RequestedBadge> = (_: number, p: RequestedBadge) => p.entity_id;
  protected readonly _totalElements = computed(() => this._filteredPayments().length);

  constructor(
	private badgeRequestApiService: BadgeRequestApiService,
	private badgeInstanceManager: BadgeInstanceManager,
	private badgeClassManager: BadgeClassManager,
	private messageService: MessageService,
	private translate: TranslateService,
	public router: Router,
  ) {
    // needed to sync the debounced filter to the name filter, but being able to override the
    // filter when loading new users without debounce
    effect(() => this._emailFilter.set(this._debouncedFilter() ?? ''), { allowSignalWrites: true });
  }

  transformRequestedBadge = (apiBadge: ApiRequestedBadge): RequestedBadge => {
	return {
	  email: apiBadge.email,
	  status: apiBadge.status,
	  firstName: apiBadge.firstName,
	  lastName: apiBadge.lastName,
	  requestedOn: new Date(apiBadge.requestedOn),
	  entity_id: apiBadge.entity_id,
	};
  };

  plural = {
    award: {
      '=0': this.translate.instant('Badge.requests'),
      '=1': this.translate.instant('Badge.request'),
      other: this.translate.instant('Badge.requests'),
    }
	};

  prepareTexts(){
	  this.plural = {
      award: {
        '=0': this.translate.instant('Badge.requests'),
        '=1': this.translate.instant('Badge.request'),
        other: this.translate.instant('Badge.requests'),
      }
	};
  }

	ngOnInit(): void {
    this.badgeRequestApiService.getBadgeRequestsByQrCode(this.qrCodeId).then((response: any) => {
			this.requestedBadges = response.body.requested_badges.map((badge: ApiRequestedBadge) =>
				this.transformRequestedBadge(badge),
			);
			this._requestedBadges.set(this.requestedBadges);
		});
		this.prepareTexts();
		// Translate: to update predefined text when language is changed
		this.translate.onLangChange.subscribe((event) => {
			this.prepareTexts();
		});
	}

  protected togglePayment(payment: RequestedBadge) {
    this._selectionModel.toggle(payment);
  }

  protected handleHeaderCheckboxChange() {
    const previousCbState = this._checkboxState();
    if (previousCbState === 'indeterminate' || !previousCbState) {
      this._selectionModel.select(...this._filteredSortedPayments());
    } else {
      this._selectionModel.deselect(...this._filteredSortedPayments());
    }
  }

  protected handleEmailSortChange() {
    const sort = this._emailSort();
    if (sort === 'ASC') {
      this._emailSort.set('DESC');
    } else {
      this._emailSort.set('ASC');
    }
  }

  protected handleRequestedOnSortChange() {
    const sort = this._requestedOnSort();
    if (sort === 'ASC') {
      this._requestedOnSort.set('DESC');
    } else if (sort === 'DESC') {
      this._requestedOnSort.set(null);
    } else {
      this._requestedOnSort.set('ASC');
    }
  }

	private readonly _hlmDialogService = inject(HlmDialogService);
	public openSuccessDialog(recipient=null, text=null) {
		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
			context: {
				recipient: recipient,
        text: text,
				variant: 'success',
			},
		});
	}

	public openDangerDialog(request: RequestedBadge){
		const dialogRef = this._hlmDialogService.open(DangerDialogComponent, {
			context: {
				caption: this.translate.instant('Badge.deleteRequest'),
				variant: 'danger',
				text: `${this.translate.instant('Badge.confirmDeleteRequest1')} <span class="tw-font-bold">${request.email}</span>  ${this.translate.instant('Badge.confirmDeleteRequest2')}`,
				delete: () => {
					this.badgeRequestApiService
						.deleteRequest(request.entity_id)
						.then(() => {
              this._requestedBadges.set(this._requestedBadges().filter((r) => r.entity_id != request.entity_id))
              this.requestCountChange.emit(this._requestedBadges().length)  
              this._selectionModel.clear();
						})
						.catch((e) =>
							this.messageService.reportAndThrowError('Ausgewählte Ausweisanforderung konnte nicht gelöscht werden', e),
						);
				},
			},
		});
	}

  issueBadges() {
    const assertions: BadgeInstanceBatchAssertion[] = [];
		const recipientProfileContextUrl = 'https://openbadgespec.org/extensions/recipientProfile/context.json';
    let assertion: BadgeInstanceBatchAssertion;
    let ids: string[] = []
    this._selected().forEach((b) => {
      ids.push(b.entity_id)
      const name = b.firstName + ' ' + b.lastName

			const extensions = name
				? {
						'extensions:recipientProfile': {
							'@context': recipientProfileContextUrl,
							type: ['Extension', 'extensions:RecipientProfile'],
							name: striptags(name),
						},
					}
				: undefined;

				assertion = {
					recipient_identifier: b.email,
					extensions: extensions,
				};
			assertions.push(assertion);
    })

    this.loading = this.badgeInstanceManager.createBadgeInstanceBatched(this.issuerSlug, this.badgeSlug, {
      issuer: this.issuerSlug,
      badge_class: this.badgeSlug,
      create_notification: true,
      assertions,
    }).then(
          () => {
            this.router.navigate(['issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug]);
            if(this._selected().length === 1){
              const email = this._selected().map((b) => b.email)
              this.openSuccessDialog(email)
            }
            else{
              this.openSuccessDialog(null, this._selected().length + ' Badges erfolgreich vergeben')
            }
            // this.requestedBadges = this.requestedBadges.filter(
            //   (awardBadge) => awardBadge.entity_id != b.entity_id,
            // );
            // this._requestedBadges.set(this._requestedBadges().filter(
            //   (awardBadge) => awardBadge.entity_id != b.entity_id,
            // ))
            // this.deletedQRAward.emit({
            //   id: b.entity_id,
            //   slug: this.qrCodeId,
            //   // badgeclass: b,
            // });
            // this.badgeRequestApiService.deleteRequest(b.entity_id);
            this.badgeRequestApiService.deleteRequests(this.issuerSlug, this.badgeSlug, ids).then((res) => {
              this._requestedBadges.set(this._requestedBadges().filter((r) => !ids.includes(r.entity_id)))
              this.requestCountChange.emit(this._requestedBadges().length)  
              this._selectionModel.clear();
            })
            this.qrBadgeAward.emit();
          },
          (error) => {
            this.messageService.setMessage(
              'Fast geschafft! Deine Badges werden gerade vergeben – das kann ein paar Minuten dauern. Schau gleich auf der Badge-Detail-Seite nach, ob alles geklappt hat: Badge-Detail-Seite',
              'error',
            );
          },
        )
        .then(() => (this.loading = null));
  }

  //   this.badgeClassManager
  //       .badgeByIssuerSlugAndSlug(this.issuerSlug, this.badgeSlug)
  //       .then((badgeClass: BadgeClass) => {
  //         const cleanedName = striptags(b.firstName + ' ' + b.lastName);
  
  //         this.loading = this.badgeInstanceManager
  //           .createBadgeInstance(this.issuerSlug, this.badgeSlug, {
  //             issuer: this.issuerSlug,
  //             badge_class: this.badgeSlug,
  //             recipient_type: 'email',
  //             recipient_identifier: b.email,
  //             narrative: '',
  //             create_notification: true,
  //             evidence_items: [],
  //             extensions: {
  //               ...badgeClass.extension,
  //               'extensions:recipientProfile': {
  //                 '@context': recipientProfileContextUrl,
  //                 type: ['Extension', 'extensions:RecipientProfile'],
  //                 name: cleanedName,
  //               },
  //             },
  //           })
  //           .then(
  //             () => {
  //               // this.router.navigate(['issuer/issuers', this.issuerSlug, 'badges', this.badgeSlug]);
  //               // this.openSuccessDialog(b.email);
  //               // this.requestedBadges = this.requestedBadges.filter(
  //               //   (awardBadge) => awardBadge.entity_id != b.entity_id,
  //               // );
  //               this.awardedBadges.update(count => count + 1);
  //               this._requestedBadges.set(this._requestedBadges().filter(
  //                 (awardBadge) => awardBadge.entity_id != b.entity_id,
  //               ))
  //               this.deletedQRAward.emit({
  //                 id: b.entity_id,
  //                 slug: this.qrCodeId,
  //                 // badgeclass: b,
  //               });
  //               // this.badgeRequestApiService.deleteRequest(b.entity_id);
  //               this.qrBadgeAward.emit();
  //             },
  //             (error) => {
  //               this.messageService.setMessage(
  //                 'Unable to award badge: ' + BadgrApiFailure.from(error).firstMessage,
  //                 'error',
  //               );
  //             },
  //           )
  //           .then(() => (this.loading = null));
  //       });
	// }
}

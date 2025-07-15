import { NgIcon } from '@ng-icons/core';
import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import {
	Component,
	TrackByFunction,
	computed,
	effect,
	signal,
	inject,
	Input,
	Output,
	EventEmitter,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { lucideArrowUpDown, lucideChevronDown, lucideEllipsis } from '@ng-icons/lucide';

import { HlmCheckboxComponent } from './spartan/ui-checkbox-helm/src';
import { HlmIconDirective } from './spartan/ui-icon-helm/src';
import { HlmInputDirective } from './spartan/ui-input-helm/src';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import { HlmMenuModule } from './spartan/ui-menu-helm/src';
import { BrnTableModule, PaginatorState, useBrnColumnManager } from '@spartan-ng/brain/table';
import { HlmTableModule } from './spartan/ui-table-helm/src';
import { BrnSelectModule } from '@spartan-ng/brain/select';
import { HlmSelectModule } from './spartan/ui-select-helm/src';
import { hlmMuted } from './spartan/ui-typography-helm/src';
import { debounceTime, map, Subscription } from 'rxjs';
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
import { TranslateService } from '@ngx-translate/core';
import { ApiRequestedBadge } from '../issuer/models/badgerequest-api.model';

import { HlmCommandInputWrapperComponent } from './spartan/ui-command-helm/src/lib/hlm-command-input-wrapper.component';
import { OebButtonComponent } from './oeb-button.component';
import striptags from 'striptags';
import { OebSpinnerComponent } from './oeb-spinner.component';
import { BadgeInstanceBatchAssertion } from '../issuer/models/badgeinstance-api.model';
import { provideIcons } from '@ng-icons/core';
import { BadgeInstanceApiService } from '../issuer/services/badgeinstance-api.service';
import { TaskPollingManagerService, TaskResult, TaskStatus } from '../common/task-manager.service';
import { HlmButtonDirective } from './spartan/ui-button-helm/src/lib/hlm-button.directive';

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
};

@Component({
	selector: 'qrcodes-datatable',
	imports: [
		FormsModule,
		HlmMenuModule,
		BrnTableModule,
		HlmTableModule,
		HlmButtonDirective,
		DatePipe,
		NgIcon,
		HlmIconDirective,
		HlmInputDirective,
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
				<span class="tw-px-3 tw-text-muted-foreground tw-text-sm">{{
					'General.searchByEmail' | translate
				}}</span>
				<hlm-cmd-input-wrapper class="tw-relative tw-px-0 tw-mt-1 tw-border-b-0">
					<input
						hlmInput
						class="!tw-bg-background tw-w-full tw-border-solid tw-border-purple tw-py-1 tw-rounded-[20px] tw-text-oebblack"
						[ngModel]="_emailFilter()"
						(ngModelChange)="_rawFilterInput.set($event)"
					/>
					<ng-icon hlm size="lg" class="tw-absolute  tw-right-6 tw-text-purple" name="lucideSearch" />
				</hlm-cmd-input-wrapper>
			</label>
		</div>

		@if (isTaskProcessing || isTaskPending) {
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
						<button hlmBtn size="sm" variant="inherit" (click)="handleEmailSortChange()">
							<span class="tw-text-white tw-text-sm tw-font-medium">{{
								'Badge.requestedOn' | translate
							}}</span>
							<ng-icon hlm class="tw-ml-3 tw-text-white" size="sm" name="lucideArrowUpDown" />
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
							<ng-icon hlm class="tw-ml-3 tw-text-oebblack" size="sm" name="lucideTrash2" />
						</button>
					</hlm-td>
				</brn-column-def>
				<brn-column-def name="actions" class="tw-w-16">
					<hlm-th *brnHeaderDef></hlm-th>
					<hlm-td *brnCellDef="let element"> </hlm-td>
				</brn-column-def>
				<div class="tw-flex tw-items-center tw-justify-center tw-p-20 tw-text-muted-foreground" brnNoDataRow>
					No data
				</div>
			</brn-table>
		}

		<oeb-button
			size="sm"
			class="tw-float-right tw-mt-4"
			(click)="issueBadges()"
			[disabled]="_selected().length === 0"
			[text]="_selected().length > 1 ? ('Issuer.giveBadges' | translate) : ('Issuer.giveBadge' | translate)"
		>
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
	@Output() requestCountChange = new EventEmitter();
	@Output() actionElement = new EventEmitter();
	@Output() redirectToBadgeDetail = new EventEmitter();
	@Output() deletedQRAward = new EventEmitter();
	@Output() qrBadgeAward = new EventEmitter<number>();
	requestedBadges: RequestedBadge[] = [];
	public headerRowStyle =
		'tw-flex tw-min-w-[100%] tw-w-fit tw-rounded-t-[20px] tw-border-b tw-border-darkgrey [&.cdk-table-sticky]:tw-bg-darkgrey ' +
		'[&.cdk-table-sticky>*]:tw-z-[101] [&.cdk-table-sticky]:before:tw-z-0 [&.cdk-table-sticky]:before:tw-block [&.cdk-table-sticky]:hover:before:tw-bg-muted/50 [&.cdk-table-sticky]:before:tw-absolute [&.cdk-table-sticky]:before:tw-inset-0';

	public bodyRowStyle =
		'tw-bg-lightgrey tw-flex tw-min-w-[100%] tw-w-fit !tw-border-x !tw-border-b tw-border-solid tw-border-darkgrey tw-transition-[background-color] hover:tw-bg-muted/50 [&:has([role=checkbox][aria-checked=true])]:tw-bg-muted';
	protected readonly _rawFilterInput = signal('');
	protected readonly _emailFilter = signal('');
	private readonly _debouncedFilter = toSignal(toObservable(this._rawFilterInput).pipe(debounceTime(300)));

	private readonly _selectionModel = new SelectionModel<RequestedBadge>(true);
	protected readonly _isPaymentSelected = (payment: RequestedBadge) => this._selectionModel.isSelected(payment);
	protected readonly _selected = toSignal(
		this._selectionModel.changed.pipe(map((change) => change.source.selected)),
		{
			initialValue: [],
		},
	);

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
		});
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

	private taskSubscription: Subscription | null = null;
	currentTaskStatus: TaskResult | null = null;

	constructor(
		private badgeRequestApiService: BadgeRequestApiService,
		private badgeInstanceManager: BadgeInstanceManager,
		private badgeInstanceApiService: BadgeInstanceApiService,
		private badgeClassManager: BadgeClassManager,
		private taskService: TaskPollingManagerService,
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
		},
	};

	prepareTexts() {
		this.plural = {
			award: {
				'=0': this.translate.instant('Badge.requests'),
				'=1': this.translate.instant('Badge.request'),
				other: this.translate.instant('Badge.requests'),
			},
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
	public openSuccessDialog(recipient = null, text = null) {
		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
			context: {
				recipient: recipient,
				text: text,
				variant: 'success',
			},
		});
	}

	public openDangerDialog(request: RequestedBadge) {
		const dialogRef = this._hlmDialogService.open(DangerDialogComponent, {
			context: {
				caption: this.translate.instant('Badge.deleteRequest'),
				variant: 'danger',
				text: `${this.translate.instant('Badge.confirmDeleteRequest1')} <span class="tw-font-bold">${
					request.email
				}</span>  ${this.translate.instant('Badge.confirmDeleteRequest2')}`,
				delete: () => {
					this.badgeRequestApiService
						.deleteRequest(request.entity_id)
						.then(() => {
							this._requestedBadges.set(
								this._requestedBadges().filter((r) => r.entity_id != request.entity_id),
							);
							this.requestCountChange.emit(this._requestedBadges().length);
							this._selectionModel.clear();
						})
						.catch((e) =>
							this.messageService.reportAndThrowError(
								'Ausgewählte Ausweisanforderung konnte nicht gelöscht werden',
								e,
							),
						);
				},
			},
		});
	}

	issueBadges() {
		const assertions: BadgeInstanceBatchAssertion[] = [];
		const recipientProfileContextUrl = 'https://openbadgespec.org/extensions/recipientProfile/context.json';
		let assertion: BadgeInstanceBatchAssertion;
		this._selected().forEach((b) => {
			const name = b.firstName + ' ' + b.lastName;

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
		});

		this.badgeInstanceApiService
			.createBadgeInstanceBatchedAsync(this.issuerSlug, this.badgeSlug, {
				issuer: this.issuerSlug,
				badge_class: this.badgeSlug,
				create_notification: true,
				assertions,
			})
			.then(
				(response) => {
					const taskId = response.body.task_id;
					this.startTaskPolling(taskId);
				},
				(error) => {
					this.messageService.setMessage(
						'Fast geschafft! Deine Badges werden gerade vergeben – das kann ein paar Minuten dauern. Schau gleich auf der Badge-Detail-Seite nach, ob alles geklappt hat.',
						'error',
					);
				},
			);
	}

	private startTaskPolling(taskId: string) {
		// Clean up any existing subscription
		if (this.taskSubscription) {
			this.taskSubscription.unsubscribe();
		}

		this.taskSubscription = this.taskService.startTaskPolling(taskId, this.issuerSlug, this.badgeSlug).subscribe(
			(taskResult: TaskResult) => {
				this.currentTaskStatus = taskResult;

				if (taskResult.status === TaskStatus.FAILURE) {
					this.handleTaskFailure(taskResult);
				} else if (taskResult.status === TaskStatus.SUCCESS) {
					this.handleTaskSuccess();
				}
			},
			(error) => {
				console.error('Error polling batch award task status:', error);
				this.handleTaskError(error);
			},
		);
	}

	private handleTaskSuccess() {
		const ids = this._selected().map((b) => b.entity_id);
		if (this._selected().length === 1) {
			const email = this._selected().map((b) => b.email);
			this.openSuccessDialog(email);
		} else {
			this.openSuccessDialog(
				null,
				this._selected().length + ' ' + this.translate.instant('QrCode.badgesAwardedSuccessfully'),
			);
		}
		this.badgeRequestApiService.deleteRequests(this.issuerSlug, this.badgeSlug, ids).then((res) => {
			this._requestedBadges.set(this._requestedBadges().filter((r) => !ids.includes(r.entity_id)));
			this.requestCountChange.emit(this._requestedBadges().length);
			this.qrBadgeAward.emit(this._selected().length);
			this._selectionModel.clear();
		});
	}

	private handleTaskFailure(taskResult: TaskResult) {
		const errorMessage = taskResult.result?.error || 'An error occurred during the batch award process.';
		this.messageService.reportHandledError(this.translate.instant('Issuer.batchAwardFailed'), errorMessage);
	}

	private handleTaskError(error: any) {
		this.messageService.reportHandledError(this.translate.instant('Issuer.failedBatchMonitoring'), error);
	}

	get isTaskPending(): boolean {
		return this.currentTaskStatus?.status === TaskStatus.PENDING;
	}

	get isTaskProcessing(): boolean {
		return (
			this.currentTaskStatus?.status === TaskStatus.STARTED || this.currentTaskStatus?.status === TaskStatus.RETRY
		);
	}

	get isTaskCompleted(): boolean {
		return (
			this.currentTaskStatus?.status === TaskStatus.SUCCESS ||
			this.currentTaskStatus?.status === TaskStatus.FAILURE
		);
	}

	get isTaskSuccessful(): boolean {
		return this.currentTaskStatus?.status === TaskStatus.SUCCESS;
	}

	get isTaskFailed(): boolean {
		return this.currentTaskStatus?.status === TaskStatus.FAILURE;
	}
}

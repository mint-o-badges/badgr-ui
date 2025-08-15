import { NgIcon } from '@ng-icons/core';
import { SelectionModel } from '@angular/cdk/collections';
import {
	Component,
	computed,
	effect,
	signal,
	inject,
	Input,
	Output,
	EventEmitter,
	TemplateRef,
	ViewChild,
	viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { lucideArrowUpDown, lucideChevronDown, lucideEllipsis } from '@ng-icons/lucide';
import { HlmIcon } from './spartan/ui-icon-helm/src';
import { HlmInput } from './spartan/ui-input-helm/src';
import { HlmMenuModule } from './spartan/ui-menu-helm/src';
import { HlmTableImports } from './spartan/ui-table-helm/src';
import { BrnSelectModule } from '@spartan-ng/brain/select';
import { HlmSelectModule } from './spartan/ui-select-helm/src';
import { debounceTime, map, Subscription } from 'rxjs';
import { HlmDialogService } from './spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { SuccessDialogComponent } from '../common/dialogs/oeb-dialogs/success-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { BadgeRequestApiService } from '../issuer/services/badgerequest-api.service';
import { MessageService } from '../common/services/message.service';
import { DangerDialogComponent } from '../common/dialogs/oeb-dialogs/danger-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { ApiRequestedBadge } from '../issuer/models/badgerequest-api.model';
import { HlmCommandInputWrapper } from './spartan/ui-command-helm/src/lib/hlm-command-input-wrapper.component';
import { OebButtonComponent } from './oeb-button.component';
import striptags from 'striptags';
import { OebSpinnerComponent } from './oeb-spinner.component';
import { BadgeInstanceBatchAssertion } from '../issuer/models/badgeinstance-api.model';
import { provideIcons } from '@ng-icons/core';
import { BadgeInstanceApiService } from '../issuer/services/badgeinstance-api.service';
import { TaskPollingManagerService, TaskResult, TaskStatus } from '../common/task-manager.service';
import { formatDate } from '@angular/common';
import {
	ColumnDef,
	createAngularTable,
	FlexRenderDirective,
	getCoreRowModel,
	getSortedRowModel,
} from '@tanstack/angular-table';
import { OebCheckboxComponent } from './oeb-checkbox.component';

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
		...HlmTableImports,
		NgIcon,
		HlmIcon,
		HlmInput,
		BrnSelectModule,
		HlmSelectModule,
		TranslateModule,
		HlmCommandInputWrapper,
		OebButtonComponent,
		OebSpinnerComponent,
		OebCheckboxComponent,
		FlexRenderDirective,
		OebCheckboxComponent,
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
			<div
				class="tw-mt-4 tw-block tw-min-h-[335px] tw-max-h-[680px] tw-overflow-x-hidden tw-overflow-y-auto tw-rounded-md"
			>
				<table hlmTable class="tw-w-full tw-border tw-border-solid tw-border-gray-800 tw-border-collapse">
					<thead hlmTHead class="tw-bg-gray-800">
						@for (headerGroup of table.getHeaderGroups(); track headerGroup.id) {
							<tr hlmTr class="tw-border-gray-800">
								@for (header of headerGroup.headers; track header.id) {
									<th hlmTh [class]="header.column.columnDef.meta['class'] || ''">
										<ng-container
											*flexRender="
												header.column.columnDef.header;
												props: header.getContext();
												let rendered
											"
										>
											<span [innerHTML]="rendered"></span>
										</ng-container>
									</th>
								}
							</tr>
						}
					</thead>
					<tbody class="tw-bg-background">
						@for (row of table.getRowModel().rows; track row.id) {
							<tr hlmTr class="tw-border-gray-800">
								@for (cell of row.getVisibleCells(); track cell.id) {
									<td hlmTd [class]="cell.column.columnDef.meta['class'] || ''">
										<ng-container
											*flexRender="
												cell.column.columnDef.cell;
												props: cell.getContext();
												let rendered
											"
										>
											<span [innerHTML]="rendered" class="tw-text-oebblack"></span>
										</ng-container>
									</td>
								}
							</tr>
						}
						@if (!table.getRowModel().rows.length) {
							<tr hlmTr class="tw-border-gray-800">
								<td
									hlmTd
									[attr.colspan]="columns.length"
									class="tw-text-center tw-p-20 tw-text-muted-foreground"
								>
									No data
								</td>
							</tr>
						}
					</tbody>
				</table>

				<!-- Custom templates for complex cells -->
				<ng-template #requestedOnHeaderCell>
					{{ 'Badge.requestedOn' | translate }}
					<ng-icon hlm class="tw-ml-3 tw-text-white" size="sm" name="lucideArrowUpDown" />
				</ng-template>
				<ng-template #headerCheckbox>
					<oeb-checkbox [checked]="allSelected()" (checkedChange)="toggleAll()" />
				</ng-template>
				<ng-template #rowCheckbox let-row="row">
					<oeb-checkbox />
				</ng-template>
				<ng-template #deleteButton let-row="row">
					<button>
						<svg class="tw-ml-3 tw-text-oebblack" height="16" width="16">
							<ng-icon hlm class="tw-ml-3 tw-text-oebblack" size="sm" name="lucideTrash2" />
						</svg>
					</button>
				</ng-template>
			</div>
		}

		<oeb-button
			size="sm"
			class="tw-float-right tw-mt-4"
			(click)="issueBadges()"
			[disabled]="_selected().length === 0 || isTaskProcessing || isTaskPending"
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
	protected readonly _selected = toSignal(
		this._selectionModel.changed.pipe(map((change) => change.source.selected)),
		{
			initialValue: [],
		},
	);

	private readonly _requestedBadges = signal(this.requestedBadges);
	private readonly _filteredPayments = computed(() => {
		const emailFilter = this._emailFilter()?.trim()?.toLowerCase();
		if (emailFilter && emailFilter.length > 0) {
			return this._requestedBadges().filter((u) => u.email.toLowerCase().includes(emailFilter));
		}
		return this._requestedBadges();
	});
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
	protected readonly _allFilteredPaginatedPaymentsSelected = computed(() =>
		this._filteredSortedPayments().every((payment) => this._selected().includes(payment)),
	);
	private taskSubscription: Subscription | null = null;
	currentTaskStatus: TaskResult | null = null;

	constructor(
		private badgeRequestApiService: BadgeRequestApiService,
		private badgeInstanceApiService: BadgeInstanceApiService,
		private taskService: TaskPollingManagerService,
		private messageService: MessageService,
		private translate: TranslateService,
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
		if (this._selected().length === 0 || this.isTaskProcessing || this.isTaskPending) return;

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

	selected = signal<Set<string>>(new Set());

	requestedOnHeaderCell = viewChild.required<TemplateRef<any>>('requestedOnHeaderCell');
	headerCheckbox = viewChild.required<TemplateRef<any>>('headerCheckbox');
	rowCheckbox = viewChild.required<TemplateRef<any>>('rowCheckbox');
	deleteButton = viewChild.required<TemplateRef<any>>('deleteButton');

	columns: ColumnDef<RequestedBadge>[] = [
		{
			id: 'select',
			header: () => this.headerCheckbox(),
			cell: () => this.rowCheckbox(),
			meta: { class: '' },
		},
		{
			accessorKey: 'email',
			header: 'ID',
			cell: (info) => info.row.original.email,
			meta: { class: 'tw-text-white' },
		},
		{
			accessorKey: 'requestedOn',
			header: () => this.requestedOnHeaderCell(),
			cell: (info) => formatDate(info.row.original.requestedOn, 'dd.MM.yyyy', 'en'),
			meta: { class: 'tw-text-white tw-text-sm tw-flex-1' },
		},
		{
			accessorKey: 'actions',
			header: '',
			cell: () => this.deleteButton(),
			meta: { class: '' },
		},
	];

	table = createAngularTable(() => ({
		data: this._requestedBadges(),
		columns: this.columns,
		getCoreRowModel: getCoreRowModel(),
	}));

	toggleRow(row: RequestedBadge) {
		const sel = new Set(this.selected());
		sel.has(row.entity_id) ? sel.delete(row.entity_id) : sel.add(row.entity_id);
		this.selected.set(sel);
	}

	isSelected(row: RequestedBadge) {
		return this.selected().has(row.entity_id);
	}

	toggleAll() {
		this.allSelected()
			? this.selected.set(new Set())
			: this.selected.set(new Set(this._requestedBadges().map((p) => p.entity_id)));
	}

	allSelected() {
		return this.selected().size === this._requestedBadges().length && this._requestedBadges().length > 0;
	}

	toggleSort() {
		this.table.setSorting([{ id: 'requestedOn', desc: false }]);
	}
}

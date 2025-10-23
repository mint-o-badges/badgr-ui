import { NgIcon } from '@ng-icons/core';
import { Component, signal, inject, TemplateRef, viewChild, computed, input, output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmIcon } from './spartan/ui-icon-helm/src';
import { HlmMenuModule } from './spartan/ui-menu-helm/src';
import { HlmTableImports } from './spartan/ui-table-helm/src';
import { BrnSelectModule } from '@spartan-ng/brain/select';
import { HlmSelectModule } from './spartan/ui-select-helm/src';
import { Subscription } from 'rxjs';
import { HlmDialogService } from './spartan/ui-dialog-helm/src/lib/hlm-dialog.service';
import { SuccessDialogComponent } from '../common/dialogs/oeb-dialogs/success-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { BadgeRequestApiService } from '../issuer/services/badgerequest-api.service';
import { MessageService } from '../common/services/message.service';
import { DangerDialogComponent } from '../common/dialogs/oeb-dialogs/danger-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { ApiRequestedBadge } from '../issuer/models/badgerequest-api.model';
import { OebButtonComponent } from './oeb-button.component';
import striptags from 'striptags';
import { OebSpinnerComponent } from './oeb-spinner.component';
import { BadgeInstanceBatchAssertion } from '../issuer/models/badgeinstance-api.model';
import { BadgeInstanceApiService } from '../issuer/services/badgeinstance-api.service';
import { TaskPollingManagerService, TaskResult, TaskStatus } from '../common/task-manager.service';
import { formatDate, TitleCasePipe } from '@angular/common';
import {
	ColumnDef,
	createAngularTable,
	FlexRenderDirective,
	getCoreRowModel,
	getSortedRowModel,
	RowSelectionState,
	SortingState,
} from '@tanstack/angular-table';
import { OebCheckboxComponent } from './oeb-checkbox.component';
import { OebTableImports } from './oeb-table';
import { HlmButtonModule } from './spartan/ui-button-helm/src';

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
		...OebTableImports,
		NgIcon,
		HlmIcon,
		BrnSelectModule,
		HlmSelectModule,
		HlmButtonModule,
		TranslateModule,
		OebButtonComponent,
		OebSpinnerComponent,
		OebCheckboxComponent,
		FlexRenderDirective,
		OebCheckboxComponent,
		TitleCasePipe,
	],
	template: `
		@if (this.isTaskProcessing() || this.isTaskPending()) {
			<div
				class="tw-border-mint tw-p-2 tw-border-solid tw-border-4 tw-rounded-[10px] tw-w-full tw-flex md:tw-gap-6 tw-gap-2 tw-items-center"
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
			<div class="tw-overflow-x-auto">
				<table hlmTable oeb-table-secondary>
					<thead hlmTHead>
						@for (headerRow of badgeTable.getHeaderGroups(); track headerRow.id) {
							<tr hlmTr>
								@for (headerCell of headerRow.headers; track headerCell.id) {
									@if (!headerCell.isPlaceholder) {
										<th hlmTh>
											<div
												class="tw-flex tw-flex-row tw-items-center tw-gap-2 [&[data-sortable='true']]:tw-cursor-pointer"
												(click)="
													headerCell.column.getCanSort()
														? headerCell.column.toggleSorting()
														: undefined
												"
												[attr.data-sortable]="headerCell.column.getCanSort()"
											>
												<div>
													<ng-container
														*flexRender="
															headerCell.column.columnDef.header;
															props: headerCell.getContext();
															let header
														"
													>
														<div [innerHTML]="header"></div>
													</ng-container>
												</div>

												@if (headerCell.column.getIsSorted()) {
													@let order =
														headerCell.column.getNextSortingOrder() === 'asc'
															? 'desc'
															: 'asc';
													@if (order === 'asc') {
														<ng-icon hlm size="base" name="lucideChevronUp" />
													} @else {
														<ng-icon hlm size="base" name="lucideChevronDown" />
													}
												} @else if (headerCell.column.getCanSort()) {
													<ng-icon hlm size="base" name="lucideChevronsUpDown" />
												}
											</div>
										</th>
									}
								}
							</tr>
						}
					</thead>
					<tbody hlmTBody>
						@for (row of badgeTable.getRowModel().rows; track row.id) {
							<tr hlmTr>
								@for (cell of row.getVisibleCells(); track cell.id) {
									<td hlmTd class="tw-align-middle">
										<ng-container
											*flexRender="cell.column.columnDef.cell; props: cell.getContext(); let cell"
										>
											<div [innerHTML]="cell"></div>
										</ng-container>
									</td>
								}
							</tr>
						}
					</tbody>
				</table>
			</div>

			<ng-template #translateHeaderIDCellTemplate let-context>
				{{ context.header.id | translate }}
			</ng-template>
			<ng-template #headerCheckbox let-context>
				<oeb-checkbox
					[checked]="context.table.getIsAllRowsSelected()"
					(ngModelChange)="context.table.toggleAllRowsSelected()"
				/>
			</ng-template>
			<ng-template #rowCheckbox let-context>
				<oeb-checkbox
					[checked]="context.row.getIsSelected()"
					(ngModelChange)="context.row.getToggleSelectedHandler()($event)"
				/>
			</ng-template>
			<ng-template #deleteButton let-context>
				<button
					(click)="this.openDeleteDialog(context.row.original)"
					class="tw-h-10 tw-w-10 hover:tw-opacity-60 tw-inline-flex tw-items-center tw-justify-center"
				>
					<ng-icon hlm size="base" name="lucideTrash2" />
				</button>
			</ng-template>
		}

		<oeb-button
			size="sm"
			class="tw-float-right"
			variant="blackborder"
			(click)="issueBadges()"
			[disabled]="this.rowSelectionCount() === 0 || this.isTaskProcessing() || this.isTaskPending()"
			[text]="this.rowSelectionCount() > 1 ? ('Issuer.giveBadges' | translate) : ('Issuer.giveBadge' | translate)"
		>
		</oeb-button>
	`,
})
export class QrCodeDatatableComponent implements OnInit {
	private badgeRequestApiService = inject(BadgeRequestApiService);
	private badgeInstanceApiService = inject(BadgeInstanceApiService);
	private taskService = inject(TaskPollingManagerService);
	private messageService = inject(MessageService);
	private translate = inject(TranslateService);

	qrCodeId = input.required<string>();
	badgeSlug = input.required<string>();
	issuerSlug = input.required<string>();
	qrBadgeAward = output<number>();

	translateHeaderIDCellTemplate = viewChild.required<TemplateRef<any>>('translateHeaderIDCellTemplate');
	headerCheckbox = viewChild.required<TemplateRef<any>>('headerCheckbox');
	rowCheckbox = viewChild.required<TemplateRef<any>>('rowCheckbox');
	deleteButton = viewChild.required<TemplateRef<any>>('deleteButton');

	rowSelectionCount = computed(() => Object.keys(this.rowSelection()).length);
	isTaskPending = computed(() => this.currentTaskStatus()?.status === TaskStatus.PENDING);
	isTaskProcessing = computed(
		() =>
			this.currentTaskStatus()?.status === TaskStatus.STARTED ||
			this.currentTaskStatus()?.status === TaskStatus.RETRY,
	);

	badgeTable = createAngularTable(() => ({
		data: this.requestedBadges(),
		columns: this.badgeTableColumnDefinition,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting: this.tableSorting(),
			rowSelection: this.rowSelection(),
		},
		onSortingChange: (updater) =>
			updater instanceof Function ? this.tableSorting.update(updater) : this.tableSorting.set(updater),
		enableSortingRemoval: false, // ensures at least one column is sorted
		enableRowSelection: true,
		onRowSelectionChange: (updaterOrValue) => {
			this.rowSelection.set(
				typeof updaterOrValue === 'function' ? updaterOrValue(this.rowSelection()) : updaterOrValue,
			);
		},
	}));

	private taskSubscription: Subscription | null = null;
	private currentTaskStatus = signal<TaskResult | null>(null);
	private readonly requestedBadges = signal<RequestedBadge[]>([]);
	private readonly tableSorting = signal<SortingState>([
		{
			id: 'email',
			desc: false,
		},
	]);
	private readonly rowSelection = signal<RowSelectionState>({});
	private readonly badgeTableColumnDefinition: ColumnDef<RequestedBadge>[] = [
		{
			id: 'select',
			header: () => this.headerCheckbox(),
			cell: () => this.rowCheckbox(),
			enableSorting: false,
		},
		{
			accessorKey: 'email',
			header: 'ID',
			cell: (info) => info.row.original.email,
		},
		{
			id: 'Badge.requestedOn',
			accessorKey: 'requestedOn',
			header: () => this.translateHeaderIDCellTemplate(),
			cell: (info) => formatDate(info.row.original.requestedOn, 'dd.MM.yyyy', 'en'),
		},
		{
			id: 'actions',
			cell: () => this.deleteButton(),
			enableSorting: false,
		},
	];
	private readonly _hlmDialogService = inject(HlmDialogService);

	/** Inserted by Angular inject() migration for backwards compatibility */
	constructor(...args: unknown[]);

	constructor() {}

	ngOnInit(): void {
		this.badgeRequestApiService.getBadgeRequestsByQrCode(this.qrCodeId()).then((response: any) => {
			this.requestedBadges.set(
				response.body.requested_badges.map((badge: ApiRequestedBadge) => this.transformRequestedBadge(badge)),
			);
		});
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

	async issueBadges() {
		if (this.rowSelectionCount() === 0 || this.isTaskProcessing() || this.isTaskPending()) return;

		const assertions: BadgeInstanceBatchAssertion[] = [];
		const recipientProfileContextUrl =
			'https://api.openbadges.education/static/extensions/recipientProfile/context.json';
		Object.keys(this.rowSelection()).forEach((idx) => {
			const b = this.requestedBadges().at(Number(idx));
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
			assertions.push({
				recipient_identifier: b.email,
				extensions: extensions,
			} satisfies BadgeInstanceBatchAssertion);
		});

		try {
			const response = await this.badgeInstanceApiService.createBadgeInstanceBatchedAsync(
				this.issuerSlug(),
				this.badgeSlug(),
				{
					issuer: this.issuerSlug(),
					badge_class: this.badgeSlug(),
					create_notification: true,
					assertions,
				},
			);

			const taskId = response.body.task_id;
			this.startTaskPolling(taskId);
		} catch (e) {
			this.messageService.setMessage(
				'Fast geschafft! Deine Badges werden gerade vergeben – das kann ein paar Minuten dauern. Schau gleich auf der Badge-Detail-Seite nach, ob alles geklappt hat.',
				'error',
			);
		}
	}

	private startTaskPolling(taskId: string) {
		// Clean up any existing subscription
		if (this.taskSubscription) {
			this.taskSubscription.unsubscribe();
		}

		this.taskSubscription = this.taskService
			.startTaskPolling(taskId, this.issuerSlug(), this.badgeSlug())
			.subscribe({
				next: (taskResult: TaskResult) => {
					this.currentTaskStatus.set(taskResult);

					if (taskResult.status === TaskStatus.FAILURE) {
						this.handleTaskFailure(taskResult);
					} else if (taskResult.status === TaskStatus.SUCCESS) {
						this.handleTaskSuccess();
					}
				},
				error: (error) => {
					console.error('Error polling batch award task status:', error);
					this.handleTaskError(error);
				},
			});
	}

	private handleTaskSuccess() {
		if (this.rowSelectionCount() === 1) {
			const email = Object.keys(this.rowSelection()).map((idx) => {
				const id = Number(idx);
				return this.requestedBadges().at(id).email;
			});
			this.openSuccessDialog(email);
		} else {
			this.openSuccessDialog(
				null,
				this.rowSelectionCount() + ' ' + this.translate.instant('QrCode.badgesAwardedSuccessfully'),
			);
		}

		const ids = Object.keys(this.rowSelection()).map((idx) => {
			const id = Number(idx);
			return this.requestedBadges().at(id).entity_id;
		});
		this.badgeRequestApiService.deleteRequests(this.issuerSlug(), this.badgeSlug(), ids).then((res) => {
			this.qrBadgeAward.emit(this.rowSelectionCount());
			this.requestedBadges.update((current) => current.filter((r) => !ids.includes(r.entity_id)));
		});
	}

	private handleTaskFailure(taskResult: TaskResult) {
		const errorMessage = taskResult.result?.error || 'An error occurred during the batch award process.';
		this.messageService.reportHandledError(this.translate.instant('Issuer.batchAwardFailed'), errorMessage);
	}

	private handleTaskError(error: any) {
		this.messageService.reportHandledError(this.translate.instant('Issuer.failedBatchMonitoring'), error);
	}

	public openSuccessDialog(recipient = null, text = null) {
		const dialogRef = this._hlmDialogService.open(SuccessDialogComponent, {
			context: {
				recipient: recipient,
				text: text,
				variant: 'success',
			},
		});
	}

	public openDeleteDialog(request: RequestedBadge) {
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
							this.requestedBadges.update((current) =>
								current.filter((r) => r.entity_id != request.entity_id),
							);
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
}

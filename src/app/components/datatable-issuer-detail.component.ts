import { CommonModule, formatDate } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { Component, computed, effect, input, output, signal, TemplateRef, viewChild } from '@angular/core';
import { HlmTableImports } from './spartan/ui-table-helm/src';
import { BadgeInstance } from '../issuer/models/badgeinstance.model';
import { FormsModule } from '@angular/forms';
import { lucideSearch } from '@ng-icons/lucide';
import { OebButtonComponent } from './oeb-button.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { OebSpinnerComponent } from './oeb-spinner.component';
import { LoadingDotsComponent } from '../common/components/loading-dots.component';
import { OebTableImports } from './oeb-table';
import {
	ColumnDef,
	createAngularTable,
	FlexRenderDirective,
	getCoreRowModel,
	getSortedRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	SortingState,
	PaginationState,
	RowSelectionState,
} from '@tanstack/angular-table';
import { HlmIconModule } from '@spartan-ng/helm/icon';
import { Issuer } from '~/issuer/models/issuer.model';

@Component({
	selector: 'issuer-detail-datatable',
	imports: [
		FormsModule,
		...HlmTableImports,
		...OebTableImports,
		CommonModule,
		TranslateModule,
		RouterModule,
		OebButtonComponent,
		OebSpinnerComponent,
		LoadingDotsComponent,
		FlexRenderDirective,
		NgIcon,
		HlmIconModule,
	],
	providers: [provideIcons({ lucideSearch })],
	template: `
		<div class="tw-p-[calc(var(--gridspacing)*2)] tw-mt-8">
			<div class="tw-flex tw-items-center tw-justify-between tw-gap-4 sm:flex-col">
				<div class="l-stack u-margin-bottom2x u-margin-top4x tw-w-full tw-flex tw-justify-between">
					<h3
						class="md:tw-text-nowrap tw-text-lg tw-font-semibold tw-font-[rubik] tw-text-purple tw-uppercase"
					>
						{{ recipientCount() }} Badge -
						{{
							recipientCount() == 1 ? ('Issuer.recipient' | translate) : ('Issuer.recipients' | translate)
						}}
					</h3>

					<div class="tw-relative">
						<ng-icon
							hlm
							size="sm"
							name="lucideSearch"
							class="tw-absolute tw-left-3 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-text-purple"
						/>
						<input
							type="text"
							placeholder="{{ 'General.searchByNameOrEmail' | translate }}"
							[value]="searchValue()"
							(input)="onSearchChange($event)"
							class="tw-w-full tw-pl-10 tw-pr-4 tw-py-2 tw-border-solid tw-border-2 tw-border-purple tw-rounded-lg tw-text-sm focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-purple-900 focus:tw-border-transparent"
						/>
						@if (searchValue()) {
							<button
								(click)="clearSearch()"
								class="tw-absolute tw-right-3 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-text-gray-400 hover:tw-text-gray-600"
							>
								<ng-icon hlm size="sm" name="lucideX" />
							</button>
						}
					</div>
				</div>
			</div>

			@if (awardInProgress()) {
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
			<div class="tw-overflow-x-auto">
				<table hlmTable oeb-table>
					<thead hlmTHead>
						@for (headerRow of table.getHeaderGroups(); track headerRow.id) {
							<tr hlmTr>
								@for (headerCell of headerRow.headers; track headerCell.id) {
									@if (!headerCell.isPlaceholder) {
										<th hlmTh>
											<div
												class="tw-flex tw-flex-row tw-items-center tw-gap-2 [&[data-sortable='true']]:tw-cursor-pointer"
												(click)="headerCell.column.toggleSorting()"
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
						@for (row of table.getRowModel().rows; track row.id; let i = $index) {
							<tr hlmTr>
								@if (downloadStates()[i]) {
									<td hlmTd [colSpan]="3">
										<loading-dots [showLoading]="false" />
									</td>
								} @else {
									@for (cell of row.getVisibleCells(); track cell.id) {
										<td hlmTd>
											<ng-container
												*flexRender="
													cell.column.columnDef.cell;
													props: cell.getContext();
													let cell
												"
											>
												<div [innerHTML]="cell"></div>
											</ng-container>
										</td>
									}
								}
							</tr>
						}
					</tbody>
				</table>

				@if (shouldShowPagination()) {
					<div class="tw-flex tw-items-center tw-justify-center tw-px-2 tw-py-4">
						<div class="tw-flex tw-items-center tw-space-x-1">
							<!-- First page button -->
							<button
								hlmBtn
								size="sm"
								[disabled]="!table.getCanPreviousPage()"
								(click)="table.setPageIndex(0)"
								class="tw-px-2 tw-flex tw-items-center tw-text-oebblack"
							>
								<ng-icon hlm name="lucideChevronsLeft" />
							</button>

							<!-- Previous page button -->
							<button
								hlmBtn
								size="sm"
								[disabled]="!table.getCanPreviousPage()"
								(click)="table.previousPage()"
								class="tw-px-2 tw-flex tw-items-center tw-text-oebblack"
							>
								<ng-icon hlm name="lucideChevronLeft" />
							</button>

							<!-- Numbered page buttons -->
							@for (page of getVisiblePageNumbers(); track page) {
								@if (page === '...') {
									<span class="tw-px-3 tw-py-2 tw-text-lg tw-text-purple">...</span>
								} @else {
									<button
										hlmBtn
										size="sm"
										(click)="table.setPageIndex($any(page) - 1)"
										class="tw-min-w-[2.5rem] tw-px-3"
									>
										<span
											[ngClass]="
												table.getState().pagination.pageIndex + 1 == page
													? 'tw-text-white tw-font-bold tw-text-lg tw-bg-purple tw-py-2 tw-px-4 tw-rounded-full'
													: 'tw-text-purple tw-text-lg'
											"
										>
											{{ page }}</span
										>
									</button>
								}
							}

							<!-- Next page button -->
							<button
								hlmBtn
								size="sm"
								[disabled]="!table.getCanNextPage()"
								(click)="table.nextPage()"
								class="tw-px-2 tw-items-center tw-flex tw-text-oebblack"
							>
								<ng-icon hlm name="lucideChevronRight" />
							</button>

							<!-- Last page button -->
							<button
								hlmBtn
								size="sm"
								[disabled]="!table.getCanNextPage()"
								(click)="table.setPageIndex(table.getPageCount() - 1)"
								class="tw-px-2 tw-flex tw-items-center tw-text-oebblack"
							>
								<ng-icon hlm name="lucideChevronsRight" />
							</button>
						</div>
					</div>
				}

				<ng-template #translateHeaderIDCellTemplate let-context>
					{{ context.header.id | translate }}
				</ng-template>

				<ng-template #badgeActionsCellTemplate let-context>
					<div class="tw-flex tw-flex-col tw-gap-1 md:tw-gap-2 tw-leading-relaxed">
						<oeb-button
							size="xs"
							width="full_width"
							(click)="
								downloadCertificate.emit({
									instance: context.row.original,
									badgeIndex: context.row.index,
								})
							"
							text="{{ 'Issuer.pdfCertificate' | translate }}"
							[disabled]="downloadStates()[context.row.index]"
						/>
						@if (issuer().canEditBadge) {
							<oeb-button
								variant="secondary"
								size="xs"
								width="full_width"
								(click)="actionElement.emit(context.row.original)"
								[text]="'General.revoke' | translate | titlecase"
							/>
						}
					</div>
				</ng-template>
			</div>
		</div>
	`,
})
export class IssuerDetailDatatableComponent {
	issuer = input<Issuer>();
	recipientCount = input<number>(0);
	downloadStates = input<boolean[]>([]);
	awardInProgress = input<boolean>(false);
	recipients = input.required<BadgeInstance[]>();
	actionElement = output<BadgeInstance>();
	downloadCertificate = output<{ instance: BadgeInstance; badgeIndex: number }>();

	translateHeaderIDCellTemplate = viewChild.required<TemplateRef<any>>('translateHeaderIDCellTemplate');
	badgeActionsTemplate = viewChild.required<TemplateRef<any>>('badgeActionsCellTemplate');

	rowSelectionCount = computed(() => Object.keys(this.rowSelection()).length);

	readonly tableSorting = signal<SortingState>([
		{
			id: 'RecBadgeDetail.issuedOn',
			desc: true,
		},
	]);

	private readonly pagination = signal<PaginationState>({
		pageIndex: 0,
		pageSize: 15,
	});

	private readonly rowSelection = signal<RowSelectionState>({});

	searchValue = signal<string>('');

	private readonly tableColumnDefinition: ColumnDef<BadgeInstance>[] = [
		{
			id: 'General.name',
			header: () => this.translateHeaderIDCellTemplate(),
			accessorFn: (row) => row.getExtension('extensions:recipientProfile', row.recipientIdentifier).name,
			cell: (ctx) => ctx.getValue(),
			sortDescFirst: false,
		},
		{
			id: 'RecBadgeDetail.issuedOn',
			header: () => this.translateHeaderIDCellTemplate(),
			accessorFn: (row) => row.issuedOn,
			cell: (info) => formatDate(info.getValue() as Date, 'dd.MM.yyyy', 'de-DE'),
		},
		{
			id: 'actions',
			cell: (info) => this.badgeActionsTemplate(),
			enableSorting: false,
		},
	];

	shouldShowPagination = computed(() => this.recipients().length > 15);

	table = createAngularTable(() => ({
		data: this.recipients(),
		columns: this.tableColumnDefinition,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting: this.tableSorting(),
			pagination: this.pagination(),
			rowSelection: this.rowSelection(),
			globalFilter: this.searchValue(),
		},
		onSortingChange: (updater) =>
			updater instanceof Function ? this.tableSorting.update(updater) : this.tableSorting.set(updater),
		onPaginationChange: (updater) =>
			updater instanceof Function ? this.pagination.update(updater) : this.pagination.set(updater),
		onGlobalFilterChange: (value) => this.searchValue.set(value),
		globalFilterFn: (row, columnId, filterValue) => {
			if (!filterValue) return true;

			const searchTerm = filterValue.toLowerCase();
			const badgeInstance = row.original;

			const name =
				badgeInstance
					.getExtension('extensions:recipientProfile', badgeInstance.recipientIdentifier)
					.name?.toLowerCase() || '';

			const email = badgeInstance.recipientIdentifier?.toLowerCase() || '';

			return name.includes(searchTerm) || email.includes(searchTerm);
		},
		enableSortingRemoval: false, // ensures at least one column is sorted
		enableRowSelection: true,
		onRowSelectionChange: (updaterOrValue) => {
			this.rowSelection.set(
				typeof updaterOrValue === 'function' ? updaterOrValue(this.rowSelection()) : updaterOrValue,
			);
		},
		initialState: {
			pagination: {
				pageSize: 15,
			},
		},
	}));

	onPageSizeChange(event: Event): void {
		const target = event.target as HTMLSelectElement;
		this.table.setPageSize(Number(target.value));
	}

	getVisiblePageNumbers(): (number | string)[] {
		const currentPage = this.table.getState().pagination.pageIndex + 1;
		const totalPages = this.table.getPageCount();

		const delta = 2; // Number of pages to show on each side of current page

		if (totalPages <= 7) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const left = Math.max(2, currentPage - delta);
		const right = Math.min(totalPages - 1, currentPage + delta);
		const pages: (number | string)[] = [];

		pages.push(1);

		if (left > 2) {
			pages.push('...');
		}

		for (let i = left; i <= right; i++) {
			if (i !== 1 && i !== totalPages) {
				pages.push(i);
			}
		}

		if (right < totalPages - 1) {
			pages.push('...');
		}

		if (totalPages > 1) {
			pages.push(totalPages);
		}

		return pages;
	}

	onSearchChange(event: Event): void {
		const target = event.target as HTMLInputElement;
		this.searchValue.set(target.value);
		this.table.setPageIndex(0);
	}

	clearSearch(): void {
		this.searchValue.set('');
		this.table.setPageIndex(0);
	}
}
